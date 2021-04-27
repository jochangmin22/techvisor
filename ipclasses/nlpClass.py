from utils import request_data, redis_key, tokenizer_phrase, remove_duplicates, tokenizer
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

class NlpToken:
    
    def __init__(self, request, menu):
        self._request = request
        self._menu = menu
        
        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)
        mainKey, subKey = redis_key(self._request)        
        
        #### Create a new SubKey to distinguish each analysis type 
        self._subKey = f'{subKey}¶{self._menu}_nlp'        

        self.menu_option()         
  
        try:
            context = cache.get(self._subKey)
            if context:
                print('load Nlp redis', self._menu)
                setattr(self, '_%s_nlp' % self._menu, context)
        except (KeyError, NameError, UnboundLocalError):
            pass

    def menu_option(self):
        foo = self._subParams['menuOptions']['wordcloudOptions']
        self._volume = foo.get('volume','')
        self._unit = foo.get('unit','')
        self._emergence = foo.get('emergence','빈도수')
        self._output = foo.get('output','')         
        return

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

        try:
            result = getattr(self, '_%s_nlp' % self._menu)
        except AttributeError:
            pass
        else:
            return result            

        nlp_list = [d[self._volume] for d in nlpRows] # _voloume : '요약·청구항', '요약', '청구항', 
        nlp_str = ' '.join(nlp_list) if nlp_list else None

        result = []
        command = { '구문': { '빈도수':phrase_frequncy_tokenizer, '건수':phrase_individual_tokenizer }, '워드': { '빈도수' :word_frequncy_tokenizer, '건수':word_individual_tokenizer } }
        res = command[self._unit][self._emergence]()    
        res = [w.replace('_', ' ') for w in res]
 
        cache.set(self._subKey, res, CACHE_TTL)
        return res

