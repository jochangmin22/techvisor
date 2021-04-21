from utils import get_redis_key, frequency_count
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from classes import NlpToken

class IpWordcloud:
    
    def __init__(self, request):
        self._request = request
        self._wordcloudEmpty = [{ 'name' : [], 'value' : []}]

        self.set_up()

    def set_up(self):
        _, subKey, params, subParams = get_redis_key(self._request)
        
        self._newSubKey = f'{subKey}¶wordcloud'
        self._subParams = subParams

        try:
            context = cache.get(self._newSubKey)
            if context:
                print('load wordcloud redis')
                return context
        except (KeyError, NameError, UnboundLocalError):
            pass

        if not params.get('searchText',None):
            return self._wordcloudEmpty        

    def wordcloud_extract(self):
        foo = NlpToken(self._request, menu='wordcloud')
        nlpRows = foo.load_nlp_rows()
        bar = foo.nlp_token(nlpRows)

        baz = self._subParams['menuOptions']['wordcloudOptions']
        self._output = baz.get('output',50)   

        return frequency_count(bar, self._output)

    def wordcloud(self):
        def make_dic_to_list_of_dic():
            try:
                return { 'name' : list(foo.keys()), 'value' : list(foo.values())}
            except AttributeError:
                return self._wordcloudEmpty    
        foo = self.wordcloud_extract()
        result = []
        result.append(make_dic_to_list_of_dic())
        cache.set(self._newSubKey, result , CACHE_TTL)
        return result
