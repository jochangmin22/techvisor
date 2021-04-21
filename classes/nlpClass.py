from utils import get_redis_key, tokenizer_phrase, remove_duplicates, tokenizer
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from classes import IpSearchs

class NlpToken:
    
    def __init__(self, request, menu):
        self._request = request
        self._menu = menu
        
        self.set_up()

    def set_up(self):
        mainKey, subKey, params, subParams = get_redis_key(self._request)
        
        #### Create a new SubKey to distinguish each analysis type 
        self._newSubKey = f'{subKey}¶{self._menu}_nlp'        

        foo = subParams['menuOptions'][self._menu + 'Options']
        self._volume = foo.get('volume','')
        self._unit = foo.get('unit','')
        self._emergence = foo.get('emergence','빈도수') # wordcloud only         
        self._output = foo.get('output','')          
  
        try:
            context = cache.get(self._newSubKey)
            if context:
                print('load Nlp redis', self._menu)
                return context
        except (KeyError, NameError, UnboundLocalError):
            pass

    def load_nlp_rows(self):
        foo = IpSearchs(self._request, mode='nlp')
        return foo.nlp_rows()

    def nlp_token(self, nlpRows):

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

        nlp_list = [d[self._volume] for d in nlpRows] # _voloume : '요약·청구항', '요약', '청구항', 
        nlp_str = ' '.join(nlp_list) if nlp_list else None

        result = []
        command = { '구문': { '빈도수':phrase_frequncy_tokenizer, '건수':phrase_individual_tokenizer }, '워드': { '빈도수' :word_frequncy_tokenizer, '건수':word_individual_tokenizer } }
        res = command[self._unit][self._emergence]()    
        res = [w.replace('_', ' ') for w in res]
 
        cache.set(self._newSubKey, res, CACHE_TTL)
        return res

