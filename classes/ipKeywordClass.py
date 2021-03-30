from utils import get_redis_key, frequency_count
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from gensim.models import Word2Vec
from gensim.models import FastText

from classes import NlpToken

class IpKeyword:
    
    def __init__(self, request):
        self._request = request
        self._wordCloudEmpty = [{ 'name' : [], 'value' : []}]
        self._keywordsEmpty = {'topic': [], 'vec': []}
        self._wordCloudExtract = []
        self._keywordExtract = []
        self._nlpToken = []
        self._textrank = {}
        self.set_up()

    def set_up(self):
        _, subKey, _, subParams = get_redis_key(self._request)
        
        context = cache.get(subKey)
        self._subKey = subKey
        self._subParams = subParams

        try:
            if context and context['textrank']:
                self._textrank = context['textrank']
                return
        except (KeyError, NameError, UnboundLocalError):
            pass

    def wordcloud_extract(self):
        foo = NlpToken(self._request, mode='wordCloud')
        self._nlpToken = foo.nlpToken()
        
        foo = self._subParams['menuOptions']['wordCloudOptions']
        self._unitNumber = foo.get('unitNumber',50)   

        if not self._nlpToken:
            self._wordcloudExtract = self._wordCloudEmpty
            return

        myTuple = tuple(self._nlpToken)
        self._wordcloudExtract = frequency_count(myTuple, self._unitNumber)


    def keyword_extract(self):
        foo = NlpToken(self._request, mode='keyword')
        self._nlpToken = foo.nlpToken()
        
        foo = self._subParams['menuOptions']['keywordOptions']
        self._modelType = foo.get('modelType',None)
        self._keywordsvec = foo.get('keywordsVec',None)
        self._unitNumber = foo.get('unitNumber',50)   

        if not self._nlpToken:
            self._keywordExtract = self._keywordEmpty
            return

        myTuple = tuple(self._nlpToken)
        self._keywordExtract = frequency_count(myTuple, self._unitNumber)

    def wordcloud_output(self):
        def make_dic_to_list_of_dic():
            try:
                return { 'name' : list(foo.keys()), 'value' : list(foo.values())}
            except AttributeError:
                return self._emptyKE    
        result = []
        foo = self._wordcloudExtract
        result.append(make_dic_to_list_of_dic())
        self._wordcloud = result 
        cache.set(self._subKey, { 'wordcloud' : result } , CACHE_TTL)

    def sentence_similarity(self):

        # select first topic word if no related word is specified
        keywordsvec = self._keywordsvec or list(self._keywordExtract.keys())[0]
        modelType = self._modelType or "word2vec"

        # 옵션 설정
        num_features = 300  # 문자 벡터 차원 수
        min_word_count = 3  # 최소 문자 수
        num_workers = 4  # 병렬 처리 스레드 수
        window_context = 5  # 문자열 창 크기
        # downsampling = 1e-3  # 문자 빈도수 Downsample

        ###### self._nlpToken가 너무 작으면 1로 조정
        min_word_count = 1  if len(self._nlpToken) < 30 else min_word_count

        # word2vec 모델 학습
        if modelType == 'word2vec':
            model = Word2Vec(sentences=[self._nlpToken],
                            workers=num_workers,
                            size=num_features,
                            min_count=min_word_count,
                            # iter=100,
                            window=window_context, sg=0)
                    

        # fasttext 모델 학습
        elif modelType == 'fasttext':
            model = FastText(sentences=[self._nlpToken],
                            workers=num_workers,
                            size=num_features-200,
                            min_count=min_word_count,
                            # iter=100,
                            window=window_context, sg=0)

        # 기존에 처음 설정한 word2vec 모델 학습
        else:
            min_word_count = 5 if len(self._nlpToken) > 30 else 1
            model = Word2Vec(sentences=[self._nlpToken],
                            workers=4,
                            size=100,  # 500,
                            min_count=min_word_count,  # 2,
                            iter=100,  # 300,
                            window=3, sg=1
        )                                

        try:
            word_to_vec_result = model.wv.most_similar(self._keywordsvec, topn=self._unitNumber)
        except:
            self._textrank = self._keywordEmpty
            return

        # convert list of lists (word_to_vec_result) to list of dictionaries
        keys = ["label", "value"]
        d = [dict(zip(keys, l)) for l in word_to_vec_result] if word_to_vec_result != [] else [{"label": "없음", "value": 0}]

        newNlpToken = []  # --- remove topic repeat count
        for key in self._nlpToken.keys():
            newNlpToken.append(key)

        self._textrank = {"topic": newNlpToken, "vec": d}

        cache.set(subKey, { 'textrank' : self._textrank} , CACHE_TTL)
