
import urllib.request
import json
import re
from konlpy.tag import Mecab

from django.http import JsonResponse
from django.http import HttpResponse
from django.db.models import Q
import operator

from .models import disclosure, listed_corp
from .searchs import parse_searchs, parse_searchs_num
from .nlp import kr_nlp

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

client_id = settings.NAVER_NEWS_CLIENT_ID
client_secret = settings.NAVER_NEWS_CLIENT_SECRET
API_URL = settings.NAVER_NEWS_API_URL

display = 100 # 각 키워드 당 검색해서 저장할 기사 수


def clean_keyword(keyword):
    """ 불필요한 단어 제거 """
    res = keyword.replace(" and","").replace( " or","")
    return res 

def parse_news(request, mode="needJson"): # mode : needJson, noJson
    """ 쿼리 실행 및 결과 저장 """
    # redis key
    params = {}
    for value in [
        "searchText",
        "searchNum",
        # "dateType",
        # "startDate",
        # "endDate",
        # "inventor",
        # "assignee",
        # "patentOffice",
        # "language",
        # "status",
        # "ipType",
    ]:
        params[value] = request.GET.get(value) if request.GET.get(value) else ""
    apiParams = "news¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']


    context = cache.get(apiParams)    
    # is there data in redis?
    # yes
    if context and context['news']:
       return JsonResponse(context['news'], safe=False)

    # No     
    min_name = clean_keyword(params['searchText'])
    # min_name = "하이브리드 자동차"
    encText = urllib.parse.quote(min_name)
    url = API_URL + encText + \
        "&display=" + str(display) + "&sort=sim"
    request = urllib.request.Request(url)
    request.add_header("X-Naver-Client-Id", client_id)
    request.add_header("X-Naver-Client-Secret",client_secret)        

    response = urllib.request.urlopen(request)
    rescode = response.getcode()
    if(rescode==200):
        response_body_str = response.read().decode('utf-8')
        json_acceptable_string = response_body_str.replace("'", "\"")
        response_body = json.loads(response_body_str)
        title_link = {}
        link_description = {}
        for i in range(0, len(response_body['items'])):
            # strip b tag
            response_body['items'][i]['title'] = re.sub('<[^<]+?>', '', response_body['items'][i]['title'].replace('&quot;', '\"'))
            response_body['items'][i]['description'] = re.sub('<[^<]+?>', '', response_body['items'][i]['description'].replace('&quot;', '\"'))
            # link_description[response_body['items'][i]['link']] = response_body['items'][i]['description']
            # title_link[response_body['items'][i]['title']] = \
            #     response_body['items'][i]['link']
        # return HttpResponse(title_link, content_type="text/plain; charset=utf-8")                
        # return HttpResponse(link_description, content_type="text/plain; charset=utf-8")                
        # return JsonResponse(title_link, safe=False)                
        # return JsonResponse(link_description, safe=False)                

        # redis save {
        new_context = {}
        new_context['news'] = response_body['items']
        new_context['news_nlp'] = []
        new_context['company'] = {}
        cache.set(apiParams, new_context, CACHE_TTL)
        # redis save }
        if mode == "needJson":
            return JsonResponse(response_body['items'], safe=False)
        elif mode == "noJson":
            return response_body['items']
        # return title_link

    else:
        return JsonResponse("Error Code:" + rescode, safe=False)
        # print("Error Code:" + rescode)    

def parse_news_nlp(request, mode="needJson"):
    """ 
    news title description tokenization 
    returns a list of NNP nouns
    """

    # redis key
    params = {}
    for value in [
        "searchText",
        "searchNum",
    ]:
        params[value] = request.GET.get(value) if request.GET.get(value) else ""
    apiParams = "news¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']

    # is there data in Redis
    context = cache.get(apiParams)
    # yes
    if context and context['news_nlp']:
        return JsonResponse(context['news_nlp'], safe=False)
    
    # no
    news = context['news'] if  context and context['news'] else parse_news(request, mode="noJson")

    news_nlp = ""
    if news:
        for i in range(len(news)):
            news_nlp += news[i]['title'] + " " if news[i]['title'] else ""
            news_nlp += news[i]['description'] + " " if news[i]['description'] else ""
        # news_nlp = ' '.join(tokenizer(news_nlp) if news_nlp else '')
        news_nlp = tokenizer(news_nlp) if news_nlp else ''
    else:
        news_nlp = []

    # sorting on bais of frequency of elements 
    news_nlp = sorted(news_nlp, key = news_nlp.count, reverse = True) 

    # redis save {
    new_context = {}
    new_context['news'] = news
    new_context['news_nlp'] = news_nlp
    new_context['company'] = {}
    cache.set(apiParams, new_context, CACHE_TTL)
    # redis save }      
         
    if mode == "needJson":
        return JsonResponse(news_nlp, safe=False)
    elif mode == "noJson":
        return news_nlp        

def parse_related_company(request, mode="needJson"):
    ''' search news_nlp list in discloure db '''

    # redis key
    params = {}
    for value in [
        "searchText",
        "searchNum",
    ]:
        params[value] = request.GET.get(value) if request.GET.get(value) else ""
    apiParams = "news¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']

    # is there data in Redis
    context = cache.get(apiParams)
    # yes
    if context and context['company']:
        return JsonResponse(context['company'], safe=False)
    
    # no
    news = context['news'] if context and context['news'] else parse_news(request, mode="noJson")
    news_nlp = context['news_nlp'] if context and context['news_nlp'] else parse_news_nlp(request, mode="noJson")
    # return JsonResponse(news, safe=False)

    # redis save {
    new_context = {}
    new_context['news'] = news
    new_context['news_nlp'] = news_nlp
    new_context['company'] = {}
    cache.set(apiParams, new_context, CACHE_TTL)
    # redis save }       
    
    unique_news_nlp= remove_duplicate(news_nlp)
    
    try:
        isExist = disclosure.objects.filter(corp_name__in=unique_news_nlp).exists()
        if not isExist:
            return HttpResponse('Not Found', status=404)

        disClosure = disclosure.objects.filter(corp_name__in=unique_news_nlp)
        myCorpName = list(disClosure.values_list('corp_name', flat=True).order_by('-stock_code','corp_name'))
        myCorpCode = list(disClosure.values_list('corp_code', flat=True).order_by('-stock_code','corp_name'))
        myStockCode = list(disClosure.values_list('stock_code', flat=True).order_by('-stock_code','corp_name'))

        response = { 'corpName': myCorpName, 'corpCode' : myCorpCode, 'stockCode': myStockCode}

        # redis update before leave {
        new_context['company'] = response
        cache.set(apiParams, new_context, CACHE_TTL)
        # redis update before leave }  

        return JsonResponse(response, status=200, safe=False)
    except:
        return HttpResponse() # 500        
    # select * from table where value ~* 'foo|bar|baz';

    # ob_list = data.objects.filter(name__in=my_list)

    # redis save {
    new_context = {}
    new_context['news'] = news
    new_context['news_nlp'] = news_nlp
    cache.set(apiParams, new_context, CACHE_TTL)
    # redis save }            
    return JsonResponse(news_nlp, safe=False)    

def parse_news_sa(request): 
    """ sensitive analysis whether news articles are positive or negative """
    """ ./trainning/mostcommon.txt, model.json, model.h5 """

    # redis key
    params = {}
    for value in [
        "searchText",
        "searchNum",
    ]:
        params[value] = request.GET.get(value) if request.GET.get(value) else ""
    apiParams = "news¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']

    # is there data in Redis
    context = cache.get(apiParams)
    news = context['news'] if context and context['news'] else parse_news(request, mode="noJson")

    token = ''
    if news:
        for i in range(len(news)):
            token += news[i]['title'] + " " if news[i]['title'] else ""
            token += news[i]['description'] + " " if news[i]['description'] else ""
        news_token = tokenizer(token) if token else ''
    else:
        news_token = []        

    result = _sensitive_analysis(news_token)            

    return JsonResponse(result, status=200, safe=False)
    # except:
    #     return HttpResponse() # 500     

def _sensitive_analysis(news_token):
    tr_path = settings.BASE_DIR + '/search/training/'

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
    tf = term_frequency(news_token)
    data = np.expand_dims(np.asarray(tf).astype('float32'), axis=0)
    score = round(float(model.predict(data))*100,2)
    return score
    # return score

   


# NNG일반명사 ,NNP고유명사, SY기호, SL외국어, SH한자, UNKNOW (외래어일 가능성있음)
# def tokenizer(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
def tokenizer(raw, pos=["NNP","UNKNOWN"]):
    mecab = Mecab()
    STOPWORDS = getattr(settings, 'STOPWORDS', DEFAULT_TIMEOUT)
    try:
        return [
            word
            for word, tag in mecab.pos(raw) if len(word) > 1 and tag in pos and word not in STOPWORDS
            # if len(word) > 1 and tag in pos and word not in stopword
            # if tag in pos
            # and not type(word) == float
        ]
    except:
        return []       

def tokenize(doc):
    mecab = Mecab()
    # norm은 정규화, stem은 근어로 표시하기를 나타냄
    return ['/'.join(t) for t in mecab.pos(doc)] #, norm=True, stem=True)]         

def term_frequency(doc, selected_words):
    return [doc.count(word) for word in selected_words]    

def remove_duplicate(seq):
    seen = set()
    seen_add = seen.add
    return [x for x in seq if not (x in seen or seen_add(x))]