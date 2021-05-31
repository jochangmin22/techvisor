from utils import request_data, menu_redis_key, frequency_count, sampling 
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from gensim.models import Word2Vec
from gensim.models import FastText

from ipclasses import IpNlpToken

class IpKeywords:
    
    def __init__(self, request, nlpRows):
        self._request = request
        self._nlpRows = nlpRows
        self._keywordsEmpty = {'topic': [], 'vec': [], 'table': { 'rowsCount': 0, 'rows' :[]}}

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)

        self._menuKey = menu_redis_key(self._request, 'keywords')        

        self.menu_option()

        self.table_options()

        try:
            result = cache.get(self._menuKey)
            if result:
                print('load keywords redis')
                self._keywords = result
        except (KeyError, NameError, UnboundLocalError):
            pass

    def menu_option(self):
        foo = self._subParams['menuOptions']['keywordsOptions']
        self._modelType = foo.get('modelType',"word2vec")
        self._keywordsvec = foo.get('keywordsVec',None)
        self._output = foo.get('output',50)          
        return 

    def table_options(self):
        foo = self._subParams["menuOptions"]["tableOptions"]['keywordsTable']
        pageIndex = foo.get('pageIndex', 0)
        pageSize = foo.get('pageSize', 10)
        self._sortBy = foo.get('sortBy', [])            

        self._offset = pageIndex * pageSize
        self._limit = pageSize
        return
         
    
    def keywords_extract(self):
        foo = IpNlpToken(self._request, menu='keywords')
        self._nlp_token = foo.nlp_token(self._nlpRows)

        # if not bar:
        #     return self._keywordsEmpty

        return frequency_count(self._nlp_token, self._output)

    def keywords(self):
        # sentence_similarity

        def dict_keys_as_a_list():

            result = []
            for key in topics.keys():
                result.append(key)        

                keys = ["title", ""]
            return result

        def float_format(value, precision):
            return float("{:.{precision}f}".format(value, precision=precision))         

        topics = self.keywords_extract()

        # select first topic word if no related word is specified
        selectedTopic = self._keywordsvec or list(topics.keys())[0]

        # 옵션 설정
        num_features = 300  # 문자 벡터 차원 수
        min_word_count = 3  # 최소 문자 수
        num_workers = 4  # 병렬 처리 스레드 수
        window_context = 5  # 문자열 창 크기
        # downsampling = 1e-3  # 문자 빈도수 Downsample

        ###### self._nlp_token 가 너무 작으면 1로 조정
        min_word_count = 1  if len(self._nlp_token) < 30 else min_word_count

        # word2vec 모델 학습
        if self._modelType == 'word2vec':
            model = Word2Vec(sentences=[self._nlp_token],
                            workers=num_workers,
                            vector_size=num_features,
                            min_count=min_word_count,
                            # iter=100,
                            window=window_context, sg=0)
                    

        # fasttext 모델 학습
        elif self._modelType == 'fasttext':
            model = FastText(sentences=[self._nlp_token],
                            workers=num_workers,
                            vector_size=num_features-200,
                            min_count=min_word_count,
                            # iter=100,
                            window=window_context, sg=0)

        # 기존에 처음 설정한 word2vec 모델 학습
        else:
            min_word_count = 5 if len(self._nlp_token) > 30 else 1
            model = Word2Vec(sentences=[self._nlp_token],
                            workers=4,
                            vector_size=100,  # 500,
                            min_count=min_word_count,  # 2,
                            iter=100,  # 300,
                            window=3, sg=1
        )                                

        try:
            word_to_vec_result = model.wv.most_similar(selectedTopic, topn=self._output)
        except KeyError:
            return self._keywordsEmpty

        newTopics = dict_keys_as_a_list()

        # convert list of lists (word_to_vec_result) to list of dictionaries
        keys = ["label", "value"]
        chartData = [dict(zip(keys, l)) for l in word_to_vec_result] if word_to_vec_result != [] else [{"label": "", "value": 0}]

        rows = []
        for foo in chartData:
            bar = float_format(foo['value'],3)
            baz = float_format(foo['value']*100,0)
            # quux = [baz, 100 - baz]
            rows.append({ '단어': foo["label"], '수' : bar , '확률' : baz})
        try:
            rowsCount = len(rows)
        except IndexError:        
            rowsCount = 0                  

        tableData = { 'rowsCount': rowsCount, 'rows': sampling(rows, self._offset, self._limit)}              

        res = {"topic": newTopics, "vec": chartData, "table": tableData}

        cache.set(self._menuKey, res , CACHE_TTL)
        return res
        