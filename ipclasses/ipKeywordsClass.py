from utils import request_data, redis_key, frequency_count
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from gensim.models import Word2Vec
from gensim.models import FastText

from ipclasses import NlpToken

class IpKeywords:
    
    def __init__(self, request, nlpRows):
        self._request = request
        self._nlpRows = nlpRows
        self._keywordsEmpty = {'topic': [], 'vec': []}

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)
        _, subKey = redis_key(self._request)

        if not self._params.get('searchText',None):
            self._keywords = self._keywordsEmpty           
            return       
        
        self._subKey = f'{subKey}keywords'

        self.menu_option()

        try:
            result = cache.get(self._subKey)
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
    
    def keywords_extract(self):
        foo = NlpToken(self._request, menu='keywords')
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
            return result         

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
                            size=num_features,
                            min_count=min_word_count,
                            # iter=100,
                            window=window_context, sg=0)
                    

        # fasttext 모델 학습
        elif self._modelType == 'fasttext':
            model = FastText(sentences=[self._nlp_token],
                            workers=num_workers,
                            size=num_features-200,
                            min_count=min_word_count,
                            # iter=100,
                            window=window_context, sg=0)

        # 기존에 처음 설정한 word2vec 모델 학습
        else:
            min_word_count = 5 if len(self._nlp_token) > 30 else 1
            model = Word2Vec(sentences=[self._nlp_token],
                            workers=4,
                            size=100,  # 500,
                            min_count=min_word_count,  # 2,
                            iter=100,  # 300,
                            window=3, sg=1
        )                                

        try:
            word_to_vec_result = model.wv.most_similar(selectedTopic, topn=self._output)
        except:
            return self._keywordsEmpty

        # convert list of lists (word_to_vec_result) to list of dictionaries
        keys = ["label", "value"]
        d = [dict(zip(keys, l)) for l in word_to_vec_result] if word_to_vec_result != [] else [{"label": "", "value": 0}]

        newTopics = dict_keys_as_a_list()

        res = {"topic": newTopics, "vec": d}

        cache.set(self._subKey, res , CACHE_TTL)
        return res
        