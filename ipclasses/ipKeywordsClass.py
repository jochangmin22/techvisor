from utils import get_redis_key, frequency_count
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from gensim.models import Word2Vec
from gensim.models import FastText

from ipclasses import NlpToken

class IpKeywords:
    
    def __init__(self, request):
        self._request = request
        self._keywordsEmpty = {'topic': [], 'vec': []}

        self.set_up()

    def set_up(self):
        _, subKey, params, subParams = get_redis_key(self._request)
        
        self._newSubKey = f'{subKey}keywords'
        self._subParams = subParams

        try:
            context = cache.get(self._newSubKey)
            if context:
                return context
        except (KeyError, NameError, UnboundLocalError):
            pass

        if not params.get('searchText',None):
            return self._keywordsEmpty           

    def keywords_extract(self):
        foo = NlpToken(self._request, menu='keywords')
        nlpRows = foo.load_nlp_rows()
        self._nlpToken = foo.nlp_token(nlpRows)

        # if not self._nlpToken:
        #     return self._keywordsEmpty
        
        bar = self._subParams['menuOptions']['keywordsOptions']

        self._modelType = bar.get('modelType',"word2vec")
        self._keywordsvec = bar.get('keywordsVec',None)
        self._output = bar.get('output',50)   

        return frequency_count(self._nlpToken, self._output)

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

        ###### self._nlpToken가 너무 작으면 1로 조정
        min_word_count = 1  if len(self._nlpToken) < 30 else min_word_count

        # word2vec 모델 학습
        if self._modelType == 'word2vec':
            model = Word2Vec(sentences=[self._nlpToken],
                            workers=num_workers,
                            size=num_features,
                            min_count=min_word_count,
                            # iter=100,
                            window=window_context, sg=0)
                    

        # fasttext 모델 학습
        elif self._modelType == 'fasttext':
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
            word_to_vec_result = model.wv.most_similar(selectedTopic, topn=self._output)
        except:
            return self._keywordsEmpty

        # convert list of lists (word_to_vec_result) to list of dictionaries
        keys = ["label", "value"]
        d = [dict(zip(keys, l)) for l in word_to_vec_result] if word_to_vec_result != [] else [{"label": "", "value": 0}]

        newTopics = dict_keys_as_a_list()

        res = {"topic": newTopics, "vec": d}

        cache.set(self._newSubKey, res , CACHE_TTL)
        return res
        