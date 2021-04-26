from utils import request_data, redis_key, enrich_common_corp_name, frequency_count 
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from cpclasses import NlpToken

class CpWordcloud:
    
    def __init__(self, request, nlpRows):
        self._request = request
        self._nlpRows = nlpRows
        self._wordcloudEmpty = [{ 'name' : [], 'value' : []}]

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)        
        foo = self._params.get('commonCorpName','')  
        self._commonCorpName = enrich_common_corp_name(foo)

        if not self._commonCorpName:
            return self._wordcloudEmpty          
       
        _, subKey = redis_key(self._request)        
        self._subKey = f'{subKey}¶wordcloud'

        try:
            context = cache.get(self._subKey)
            if context:
                print('load wordcloud redis')
                self._wordcloud = context
        except (KeyError, NameError, UnboundLocalError):
            pass

    def wordcloud_extract(self):
        foo = NlpToken(self._request, menu='wordcloud')
        bar = foo.nlp_token(self._nlpRows)

        baz = self._subParams['menuOptions']['wordcloudOptions']
        self._output = baz.get('output',50)   

        return frequency_count(bar, self._output)

    def wordcloud(self):
        def make_dic_to_list_of_dic():
            try:
                return { 'name' : list(foo.keys()), 'value' : list(foo.values())}
            except AttributeError:
                return self._wordcloudEmpty    
        try:
            getattr(self, '_wordcloud')                
        except AttributeError:
            pass
        else:
            return self._wordcloud
        foo = self.wordcloud_extract()
        result = []
        result.append(make_dic_to_list_of_dic())
        cache.set(self._subKey, result , CACHE_TTL)
        return result
