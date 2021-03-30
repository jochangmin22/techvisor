from utils import get_redis_key, tokenizer_phrase, remove_duplicates, tokenizer
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from classes import IpSearchs

class NlpToken:
    
    def __init__(self, request, mode):
        self._request = request
        self._mode = mode
        self._nlpToken = []
        self._nlpRows = []
        self.set_up()

    def set_up(self):
        mainKey, subKey, params, subParams = get_redis_key(self._request)
        
        #### Create a new SubKey to distinguish each analysis type 
        newSubKey = subKey + '¶' + self._mode        

        self._newSubKey = newSubKey

        foo = IpSearchs(self._request, mode='nlp')
        foo.query_execute()
        foo.create_empty_rows()
        bar = foo._emptyRows            
        self._nlpRows = foo.make_nlp_rows(bar)

        foo = subParams['menuOptions'][self._mode + 'Options']
        self._volume = foo.get('volume','')
        self._unit = foo.get('unit','')
        self._emergence = foo.get('emergence','빈도수')          

        context = cache.get(newSubKey)
        try:
            if context and context['nlpToken']:
                self._nlpToken = context['nlpToken']
                return
        except (KeyError, NameError, UnboundLocalError):
            pass

      

    def nlpToken(self):

        result = []
        nlp_list = [d[self._volume] for d in self._nlpRows] # '요약·청구항', '요약', '청구항', 

        nlp_str = ' '.join(nlp_list) if nlp_list else None

        def phrase_frequncy_tokenizer():
            return tokenizer_phrase(nlp_str)

        def phrase_individual_tokenizer():
            for foo in nlp_list:
                bar = remove_duplicates(tokenizer_phrase(foo))
                result.extend(bar)
            return result            

        def word_frequncy_tokenizer():
            return tokenizer(nlp_str)

        def word_individual_tokenizer():
            for foo in nlp_list:
                bar = remove_duplicates(tokenizer(foo))
                result.extend(bar)
            return result            

        command = { '구문': { '빈도수':phrase_frequncy_tokenizer, '건수':phrase_individual_tokenizer }, '워드': { '빈도수' :word_frequncy_tokenizer, '건수':word_individual_tokenizer } }
        result = command[self._unit][self._emergence]()    
        result = [w.replace('_', ' ') for w in result]

        cache.set(self._newSubKey, { 'nlpToken' : result } , CACHE_TTL)

        self._nlpToken = result
        return result

