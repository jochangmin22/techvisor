# Just disables the warning, doesn't take advantage of AVX/FMA to run faster
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from utils import request_data, table_redis_key, sampling, unescape, remove_duplicates, tokenizer, tokenizer_sa, remove_punc, remove_tags

import re
import json
import urllib.request
from datetime import datetime

from search.models import Listed_corp

from tensorflow.keras import models
import numpy as np

from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
EXCLUDE_COMPANY_NAME = settings.TERMS['EXCLUDE_COMPANY_NAME']

class IpNews:

    def __init__(self, request, mode):
        self._request = request
        self._mode = mode
        self._empty = { 'stockCode': [], 'corpName': [], 'commonCorpName': [], 'error': 'Not Found' } 

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)

        self._newsKey = table_redis_key(self._request, 'news')        
        self._naverKey = f'{self._newsKey}¶naver'
        self._nlpKey = f'{self._newsKey}¶nlp'
        self._saNlpKey = f'{self._newsKey}¶saNlp'
        self._naverNlpKey = f'{self._newsKey}¶naverNlp'
        self._saKey = f'{self._newsKey}¶sa'
        self._corpKey = f'{self._newsKey}¶corp'

        self.table_options()

        command = {'news' : 'news', 'naver': 'naver_news', 'nlp': 'news_nlp', 'sa_nlp': 'news_sa_nlp', 'naverNlp': 'naver_news_nlp', 'sa': 'sa', 'corp': 'related_company'}

        for k, v in command.items():
            self.load_redis(k, v)

    def load_redis(self, key, name):
        try:
            result = cache.get(f'{self._newsKey}¶{key}')            
            if result:
                print(f'load {self.__class__.__name__} {name} redis')
                setattr(self, '_%s' % name, result)
        except (KeyError, NameError, UnboundLocalError, AttributeError):
            pass         

    def table_options(self):
        foo = self._subParams["menuOptions"]["tableOptions"]["newsTable"]
        pageIndex = foo.get('pageIndex', 0)
        pageSize = foo.get('pageSize', 10)
        self._sortBy = foo.get('sortBy', [])    

        # Add offset limit
        self._offset = pageIndex * pageSize
        self._limit = pageSize        
        return

    def load_instance_variable_first(self, name):
        try:
            getattr(self, '_%s' % name)
        except AttributeError:
            print(f'❤ run def {name} because _{name} not exist', self._mode)           
            return getattr(self, name)()
        else:
            print(f'❤ _{name} exist', self._mode)
            return getattr(self, '_%s' % name)  

    def make_paging_rows(self, result):
        try:
            rowsCount = result["rowsCount"]
        except (KeyError, IndexError):        
            rowsCount = 0

        return { 'status': 200, 'rowsCount': rowsCount, 'rows': sampling(result['rows'], self._offset, self._limit)}

    def news(self):
        res = self.load_instance_variable_first('naver_news')

        if res['status'] != 200:
            return { "rowsCount": 0, "rows": [], "status": res['status']}

        result = self.make_paging_rows(res)
        self._news = result
        
        foo = self.related_company_single()
        result['rows'] = [dict(a, **b) for a,b in zip(result['rows'], foo)]
        # TODO
        # bar = self.sensitive_analysis_single()
        # result['rows'] = [dict(a, **b) for a,b in zip(result['rows'], bar)]

        cache.set(self._newsKey, result, CACHE_TTL)
        self._news = result

        return result

    def related_company_single(self):
        ''' search news_nlp list in discloure db '''
        def related_company_name(corpList):
            unique_news_nlp= remove_duplicates(corpList)
            try:
                isExist = Listed_corp.objects.filter(회사명__in=unique_news_nlp).exists()
                if not isExist:
                    return []
                listedCorp = Listed_corp.objects.filter(회사명__in=unique_news_nlp).exclude(회사명__in=EXCLUDE_COMPANY_NAME)
                return list(listedCorp.values_list('정보__기업명', flat=True).order_by('-종목코드','회사명'))[:10]
            except:
                return []        

        self._news_nlp = self.load_instance_variable_first('news_nlp')
        result = []
        for val in self._news_nlp:
            result.append({ 'company' : related_company_name(val)})
        return result        

    def sensitive_analysis_single(self):
        def sa_score(value):        
            def term_frequency(doc):
                return [doc.count(word) for word in selected_words] 

            tr_path = str(settings.BASE_DIR) + '/search/training/'

            with open(tr_path + "mostcommon.json", 'r') as f:
                selected_words = json.load(f)
                
            model = models.load_model(tr_path + 'model.h5')
            model.summary()
            tf = term_frequency(value)

            data = np.expand_dims(np.asarray(tf).astype('float32'), axis=0)
            # score = float(model.predict(data))
            return round(float(model.predict(data)*100),1)
            
        self._news_sa_nlp = self.load_instance_variable_first('news_sa_nlp')
        result = []  
        for val in self._news_sa_nlp:
            result.append({ 'score' : sa_score(val)})
        return result  
                                      
    def news_sa(self): 
        """ sensitive analysis whether news articles are positive or negative """
        """ ./trainning/mostcommon.txt, model.json, model.h5 """

        self.load_instance_variable_first('news_nlp')

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
    
        
        result = self.sensitive_analysis()            
        # result = _sensitive_analysis(tokenize('셀트리온이 항체치료제 선택한 이유 안전성·변이대응 탁월'))            

        cache.set(self._saKey, result, CACHE_TTL)
        return result

    def news_nlp(self):
        result = self.company_nlp(self.load_instance_variable_first('news'))
        cache.set(self._nlpKey, result, CACHE_TTL)
        self._news_nlp = result
        return result   

    def news_sa_nlp(self):
        result = self.sa_nlp(self.load_instance_variable_first('news'))
        cache.set(self._saNlpKey, result, CACHE_TTL)
        self._news_sa_nlp = result
        return result   

    def naver_news_nlp(self):
        def flat_list():
            return [item for sublist in foo for item in sublist]        
        foo = self.company_nlp(self.load_instance_variable_first('naver_news'))        
        result = flat_list()
        cache.set(self._naverNlpKey, result, CACHE_TTL)
        self._naver_news_nlp = result
        return result

    def company_nlp(self, news):
        # ※ Depending on the NNP nouns dictionary of mecab, the company name may not be recognized.
        def company_token(nlp):
            try:
                res = [tokenizer(value) for value in nlp]
            except:
                res = []
            return sorted(res, key = nlp.count, reverse = True)        
        return company_token(self.nlp(news))          

    def sa_nlp(self, news):
        def sa_token(nlp):
            try:
                res = [tokenizer_sa(value) for value in nlp]
            except:
                res = []
            return sorted(res, key = nlp.count, reverse = True)         
        return sa_token(self.nlp(news))          

    def nlp(self, news):
        def remove_redundant(value):
            return remove_punc(remove_tags(value)).strip()     

        if not news:
            return []
        result = ""
        result = [remove_redundant(k['title'] + ' ' + k['description']) for k in news['rows']]
        return result

 
    def related_company(self):
        ''' search news_nlp list in discloure db '''

        self._naver_news_nlp = self.load_instance_variable_first('naver_news_nlp')
        unique_news_nlp= remove_duplicates(self._naver_news_nlp)
        try:
            isExist = Listed_corp.objects.filter(회사명__in=unique_news_nlp).exists()
            if not isExist:
                return self._empty

            listedCorp = Listed_corp.objects.filter(회사명__in=unique_news_nlp).exclude(회사명__in=EXCLUDE_COMPANY_NAME)
            myCorpName = list(listedCorp.values_list('회사명', flat=True).order_by('-종목코드','회사명'))[:10]
            myCommonCorpName = list(listedCorp.values_list('정보__기업명', flat=True).order_by('-종목코드','회사명'))[:10]
            myStockCode = list(listedCorp.values_list('종목코드', flat=True).order_by('-종목코드','회사명'))[:10]

            result = { 'stockCode': myStockCode, 'corpName': myCorpName, 'commonCorpName': myCommonCorpName }
            cache.set(self._corpKey, result, CACHE_TTL)
            return result
        except:
            return self._empty    

    def sensitive_analysis(self):
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
        tf = term_frequency(self._news_nlp)

        data = np.expand_dims(np.asarray(tf).astype('float32'), axis=0)
        # score = float(model.predict(data))

        result = round(float(model.predict(data)*100),1)
        return result # score    

    def naver_news(self):

        def clean_keyword(keyword):
            COMPANY = settings.TERMS['APPLICANT_CLASSIFY']['COMPANY']
            pattern = '|'.join(COMPANY)
            # result= re.sub(r' and | adj | adj\d+ | near | near\d+ |\(\@AD.*\d{8}\)|\([ -!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+\).AP|\([ -!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+\).INV', ' ', keyword, flags=re.IGNORECASE)
            result= re.sub(r' and | or | adj | adj\d+ | near | near\d+ |\(\@[PRD|AD|RD|FD].*\d{8}\)|.AP|.INV', ' ', keyword, flags=re.IGNORECASE)
            result = re.sub(pattern, '', result, flags=re.IGNORECASE)
            result = re.sub('[\(\)]|["]', '', result, flags=re.IGNORECASE)
            return result

        def strip_tag(aStr):
            return re.sub('<[^<]+?>', '', unescape(aStr))

        def change_date_format(aDate):
            result = datetime.strptime(aDate, '%a, %d %b %Y %H:%M:%S +0900')
            return result.strftime('%y-%m-%d %H:%M')         

        min_name = clean_keyword(self._params['searchText'])
        # min_name = tokenizer(min_name)
        print('searchText is ...', min_name)
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
        
        rowsCount = response_body['total']

        for i in range(0, len(foo)):
            foo[i]['title'] = strip_tag(foo[i]['title'])
            foo[i]['description'] = strip_tag(foo[i]['description'])
            foo[i]['pubDate'] = change_date_format(foo[i]['pubDate'])

        result = {"status" : 200, "rowsCount" : rowsCount,  "rows" : sorted(foo, key=lambda k: k['pubDate'], reverse=True)}
        self._naver_news = result
        cache.set(self._naverKey, result, CACHE_TTL)
        return result                                