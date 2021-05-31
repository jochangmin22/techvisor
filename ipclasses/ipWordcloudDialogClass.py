from utils import request_data, redis_key, dictfetchall, add_orderby
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)


class IpWordcloudDialog:
    
    def __init__(self, request, query):
        self._request = request
        self._query = query
        self._wordcloudDialogEmpty = { 'rows': [], 'rowsCount': 0 }

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)
        _, subKey = redis_key(self._request)

        if not self._params.get('searchText',None):
            return self._wordcloudDialogEmpty          

        self._subKey = f'{subKey}¶wordcloud_dialog'

        self.menu_option()

        try:
            result = cache.get(self._subKey)
            if result:
                print('load wordcloudDialog redis')
                return result
        except (KeyError, NameError, UnboundLocalError):
            pass

   
    def menu_option(self):
        foo = self._subParams['menuOptions']['wordcloudOptions']
        self._category = foo.get('category','')
        self._volume = foo.get('volume','')
        self._output = foo.get('output','') 

        bar = self._subParams['menuOptions']['tableOptions']['wordcloudDialog']
        self._sortBy = bar.get('sortBy', [])  
        self._pageIndex = bar.get('pageIndex', 0)
        self._pageSize = bar.get('pageSize', 10)               

    def wordcloud_dialog(self):

        # add sort
        self._query += add_orderby(self._sortBy)  
        # add offset limit
        self._query += f' offset {self._pageIndex * self._pageSize} limit {self._pageSize}'    


        with connection.cursor() as cursor:    
            cursor.execute(self._query)
            rows = dictfetchall(cursor)
        try:
            rowsCount = rows[0]["cnt"]
        except IndexError:        
            rowsCount = 0        

        result = { 'rowsCount': rowsCount, 'rows': rows}   
        cache.set(self._subKey, {'wordcloud_dialog' : result}, CACHE_TTL)
        return result
