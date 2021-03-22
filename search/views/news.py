
# app
from datetime import datetime

import urllib.request
import json
import re
from konlpy.tag import Mecab

from django.http import JsonResponse
from django.http import HttpResponse

from ..models import Listed_corp

from ..utils import get_redis_key, remove_duplicates, sampling

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

from tensorflow.keras import models
from tensorflow.keras import layers
from tensorflow.keras import optimizers
from tensorflow.keras import losses
from tensorflow.keras import metrics

import numpy as np

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

def return_type(result, api):
    return JsonResponse(result, safe=False) if api else result    

def get_naver_news(request):

    def clean_keyword(keyword):
        result= re.sub(r' and | adj | adj\d+ | near | near\d+ |\(\@AD.*\d{8}\)|\([ -!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+\).AP|\([ -!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+\).INV', ' ', keyword, flags=re.IGNORECASE)
        result = re.sub('[\(\)]|["]', '', result, flags=re.IGNORECASE)
        return result

    def strip_tag(aStr):
        return re.sub('<[^<]+?>', '', aStr.replace('&quot;', '\"').replace('&amp;', '&'))

    def change_date_format(aDate):
        result = datetime.strptime(aDate, '%a, %d %b %Y %H:%M:%S +0900')
        return result.strftime('%y-%m-%d %H:%M')         

    _, subKey, params, _ = get_redis_key(request)
    subKey += "news"

    min_name = clean_keyword(params['searchText'])

    # 단어 5개 넘으면 네이버 뉴스 검색에서 안먹는듯 - 역순으로 자름
    min_name = remove_duplicates(min_name.split(' '))
    min_name = ' '.join(min_name[-5:])

    client_id = settings.NAVER['news_client_id']
    client_secret = settings.NAVER['news_client_secret']
    api_url = settings.NAVER['news_api_url']

    display = 100 # 각 키워드 당 검색해서 저장할 기사 수
    start = 1 # 검색 시작 위치로 최대 1000까지 가능
    sort = 'sim' # 정렬 옵션: sim (유사도순), date (날짜순)

    encText = urllib.parse.quote(min_name)
    url = f'{api_url}{encText}&display={display}&start={start}&sort={sort}'
    request = urllib.request.Request(url)
    request.add_header("X-Naver-Client-Id", client_id)
    request.add_header("X-Naver-Client-Secret",client_secret)        

    response = urllib.request.urlopen(request)
    rescode = response.getcode()
    if rescode != 200:
        return {"status" : rescode }    

    response_body = json.loads(response.read().decode('utf-8'))
    foo = response_body['items']
    # TODO 100개이상 구현
    # rowsCount = response_body['total']
    rowsCount = 100

    for i in range(0, len(foo)):
        foo[i]['title'] = strip_tag(foo[i]['title'])
        foo[i]['description'] = strip_tag(foo[i]['description'])
        foo[i]['pubDate'] = change_date_format(foo[i]['pubDate'])

    result = {"status" :200 , "rowsCount" : rowsCount,  "rows" : sorted(foo, key=lambda k: k['pubDate'], reverse=True)}
    cache.set(subKey, {'naver_news': result} , CACHE_TTL)
    return result

def get_news(request):

    def make_paging_rows(data):
        # Add offset limit
        offset = pageIndex * pageSize
        limit = pageSize
        return sampling(data, offset, limit)          

    # caller
    _, subKey, _, subParams = get_redis_key(request)
    subKey += "news"
    context_paging = cache.get(subKey) 
    try:
        if context_paging and context_paging['news_nlp']:
            return JsonResponse(context_paging['news'], safe=False)
    except (KeyError, UnboundLocalError):
        pass   

    newsTable = subParams["menuOptions"]["tableOptions"]["newsTable"]
    pageIndex = newsTable.get('pageIndex', 0)
    pageSize = newsTable.get('pageSize', 10)    

    res = get_naver_news(request)

    if res['status'] != 200:
        return JsonResponse("Error Code:" + res['status'], safe=False)    

    result = { 'rowsCount': res['rowsCount'], 'rows': make_paging_rows(res['rows'])}

    cache.set(subKey, {'news': result} , CACHE_TTL)

    return JsonResponse(result, safe=False)    

def get_news_nlp(request):
    """ 
    news title description tokenization 
    returns a list of NNP nouns
    ※ Depending on the NNP nouns dictionary of mecab, the company name may not be recognized.
    """

    # redis key
    mainKey, _, _, _ = get_redis_key(request)
    mainKey += "news"
    context = cache.get(mainKey)
    try:
        if context and context['news_nlp']:
            return news_nlp
    except (KeyError, UnboundLocalError):
        pass            

    
    news = get_naver_news(request)    
    news_nlp = ""
    if not news:
        news_nlp = []
    else:
        news_nlp = ' '.join(d['title'] for d in news['rows'])
        news_nlp += ' '.join(d['description'] for d in news['rows'])
        try:
            news_nlp = tokenizer(news_nlp)
        except:
            news_nlp = []

    # sorting on bais of frequency of elements
    result = sorted(news_nlp, key = news_nlp.count, reverse = True) 

    cache.set(mainKey, {'news_nlp' : result} , CACHE_TTL)
    
    return result


def get_related_company(request):
    ''' search news_nlp list in discloure db '''

    # redis key
    mainKey, _, _, _ = get_redis_key(request)
    mainKey += "news"
    context = cache.get(mainKey)     

    try:
        if context and context['company']:
            return JsonResponse(context['company'], safe=False)
    except (KeyError, UnboundLocalError):
        pass

    def remove_duplicate(seq):
        seen = set()
        seen_add = seen.add
        return [x for x in seq if not (x in seen or seen_add(x))]    
   
    news_nlp = get_news_nlp(request)
    
    unique_news_nlp= remove_duplicate(news_nlp)
    
    try:
        isExist = Listed_corp.objects.filter(회사명__in=unique_news_nlp).exists()
        if not isExist:
            return HttpResponse('Not Found', status=404)

        EXCLUDE_COMPANY_NAME = settings.TERMS['EXCLUDE_COMPANY_NAME']

        listedCorp = Listed_corp.objects.filter(회사명__in=unique_news_nlp).exclude(회사명__in=EXCLUDE_COMPANY_NAME)
        myCorpName = list(listedCorp.values_list('회사명', flat=True).order_by('-종목코드','회사명'))[:10]
        myCommonCorpName = list(listedCorp.values_list('정보__기업명', flat=True).order_by('-종목코드','회사명'))[:10]
        # myCorpCode = list(listedCorp.values_list('corp_code', flat=True).order_by('-종목코드','회사명'))[:10]
        myStockCode = list(listedCorp.values_list('종목코드', flat=True).order_by('-종목코드','회사명'))[:10]

        result = { 'stockCode': myStockCode, 'corpName': myCorpName, 'commonCorpName': myCommonCorpName }
        cache.set(mainKey, { 'company': result }, CACHE_TTL)

        return JsonResponse(result, status=200, safe=False)
    except:
        return HttpResponse() # 500        

def get_news_sa(request): 
    """ sensitive analysis whether news articles are positive or negative """
    """ ./trainning/mostcommon.txt, model.json, model.h5 """

    # redis key
    mainKey, _, _, _ = get_redis_key(request)
    mainKey += "news"
    context = cache.get(mainKey)     

    try:
        if context and context['news_sa']:
            return JsonResponse(context['news_sa'], safe=False)
    except (KeyError, UnboundLocalError):
        pass

    token= get_news_nlp(request)
    # news= get_news_nlp(request, api=False)
    # token = ''
    # if news:
    #     token = ' '.join(d['title'] for idx,d in enumerate(news) if idx < 6)

    #     for i in range(len(news)):
    #         token += news[i]['title'] + " " if news[i]['title'] else ""
    #         if i > 5: break
    #         # token += news[i]['description'] + " " if news[i]['description'] else ""
    #     # news_token = tokenize(token) if token else ''
    # # else:
    #     # news_token = ''
  
     
    result = _sensitive_analysis(token)            
    # result = _sensitive_analysis(tokenize('셀트리온이 항체치료제 선택한 이유 안전성·변이대응 탁월'))            

    cache.set(mainKey, {'news_sa' : result}, CACHE_TTL)
    return JsonResponse(result, safe=False)

def _sensitive_analysis(news_token):
    tr_path = str(settings.BASE_DIR) + '/search/training/'

    # with open(tr_path + 'train_docs.json') as f:
    #     train_docs = json.load(f)
    # with open(tr_path + 'test_docs.json') as f:
    #     test_docs = json.load(f)    

    # {
    # tokens = [t for d in train_docs for t in d[0]]

    # import nltk
    # text = nltk.Text(tokens, name='NMSC')

    # selected_words = [f[0] for f in text.vocab().most_common(10)]
    # }

    # with open(tr_path + 'mostcommon.txt') as f:
    #     selected_words = f.read().splitlines()  

    # selected_words = []
    # with open(tr_path + "mostcommon.txt", "r") as f:
    #     for line in f:
    #         selected_words.append(line.strip())  

    with open(tr_path + "mostcommon.json", 'r') as f:
        selected_words = json.load(f)
        
            
    # with open(tr_path + 'mostcommon.txt') as f:
    #     content = f.readlines()
    # selected_words = [x.strip() for x in content]         



    def term_frequency(doc):
        return [doc.count(word) for word in selected_words]    

    # train_x = [term_frequency(d) for d, _ in train_docs]
    # test_x = [term_frequency(d) for d, _ in test_docs]
    # train_y = [c for _, c in train_docs]
    # test_y = [c for _, c in test_docs]        

    # x_train = np.asarray(train_x).astype('float32')
    # x_test = np.asarray(test_x).astype('float32')

    # y_train = np.asarray(train_y).astype('float32')
    # y_test = np.asarray(test_y).astype('float32')   

    # model = models.Sequential()
    # model.add(layers.Dense(64, activation='relu', input_shape=(5000,)))
    # model.add(layers.Dense(64, activation='relu'))
    # model.add(layers.Dense(1, activation='sigmoid'))

    # model.compile(optimizer=optimizers.RMSprop(lr=0.001),
    #             loss=losses.binary_crossentropy,
    #             metrics=[metrics.binary_accuracy])

    # model.fit(x_train, y_train, epochs=10, batch_size=512)
    # results = model.evaluate(x_test, y_test) 

    # load model
    model = models.load_model(tr_path + 'model.h5')
    # model = models.load_model(tr_path + 'news_model.h5')
    # summarize model.
    model.summary()
    # load dataset
    # dataset = loadtxt("pima-indians-diabetes.csv", delimiter=",")

    # X = dataset[:,0:8]
    # Y = dataset[:,8]
    # evaluate the model
    # score = model.evaluate(X, Y, verbose=0)
    # print("%s: %.2f%%" % (model.metrics_names[1], score[1]*100))


    # def predict_pos_neg(review):
    #     token = tokenize(review)
    #     tf = term_frequency(token)
    #     data = np.expand_dims(np.asarray(tf).astype('float32'), axis=0)
    #     score = float(model.predict(data)) * 100
    #     return score
    # return predict_pos_neg(news_token)

    # token = tokenize(news_token)
    # token = tokenizer(news_token)
    # token = tokenize("믿고 보는 감독이지만 이번에는 아니네요")
    # token = tokenize("셀트리온이 항체치료제 선택한 이유 안전성·변이대응 탁월")
    # token = tokenize(news_token)
    # tf = term_frequency(token)
    tf = term_frequency(news_token)

    data = np.expand_dims(np.asarray(tf).astype('float32'), axis=0)
    # score = float(model.predict(data))

    result = round(float(model.predict(data)*100),1)
    return result # score


# NNG일반명사 ,NNP고유명사, SY기호, SL외국어, SH한자, UNKNOW (외래어일 가능성있음)
# def tokenizer(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
def tokenizer(raw, pos=["NNP","UNKNOWN"]):
    mecab = Mecab()
    STOPWORDS = settings.TERMS['STOPWORDS']
    try:
        return [
            word
            for word, tag in mecab.pos(raw) if len(word) > 1 and tag in pos and word not in STOPWORDS
        ]
    except:
        return []       

def tokenize(doc):
    mecab = Mecab()
    # norm은 정규화, stem은 근어로 표시하기를 나타냄
    return ['/'.join(t) for t in mecab.pos(doc)] #, norm=True, stem=True)]         

