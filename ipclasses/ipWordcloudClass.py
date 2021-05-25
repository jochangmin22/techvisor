from utils import request_data, menu_redis_key, frequency_count
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from ipclasses import NlpToken

class IpWordcloud:
    
    def __init__(self, request, nlpRows):
        self._request = request
        self._nlpRows = nlpRows
        self._wordcloudEmpty = [{ 'name' : [], 'value' : []}]

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)

        self._menuKey = menu_redis_key(self._request, 'wordcloud')

        self.menu_option()

        try:
            result = cache.get(self._menuKey)
            if result:
                print('load wordcloud redis')
                self._wordcloud = result
        except (KeyError, NameError, UnboundLocalError):
            pass

    def menu_option(self):
        foo = self._subParams['menuOptions']['wordcloudOptions']
        self._output = foo.get('output',50)  
        return
     

    def wordcloud_extract(self):
        foo = NlpToken(self._request, menu='wordcloud')
        bar = foo.nlp_token(self._nlpRows)

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
        cache.set(self._menuKey, result , CACHE_TTL)
        return result
