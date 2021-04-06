from utils import get_redis_key, frequency_count, dictfetchall, remove_tail
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from classes import IpSearchs

class IpWordcloudDialog:
    
    def __init__(self, request):
        self._request = request
        self._wordcloudDialogEmpty = { 'rows': [], 'rowsCount': 0 }

        self.set_up()

    def set_up(self):
        _, subKey, params, subParams = get_redis_key(self._request)
        
        self._newSubKey = f'{subKey}¶wordcloud_dialog'
        foo = subParams['menuOptions']['wordcloudOptions']
        self._category = foo.get('category','')
        self._volume = foo.get('volume','')
        self._output = foo.get('output','') 

        bar = subParams['menuOptions']['tableOptions']['wordcloudDialog']
        self._sortBy = bar.get('sortBy', [])  
        self._pageIndex = bar.get('pageIndex', 0)
        self._pageSize = bar.get('pageSize', 10)

        try:
            context = cache.get(self._newSubKey)
            if context:
                print('load wordcloudDialog redis')
                return context
        except (KeyError, NameError, UnboundLocalError):
            pass

        if not params.get('searchText',None):
            return self._wordcloudDialogEmpty        

    def load_query(self):
        foo = IpSearchs(self._request, mode='query')
        return foo.query() 

    def wordcloud_dialog(self):
        def add_orderby():
            if not self._sortBy:
                return ''

            result =' order by '
            for s in self._sortBy:
                result += s['_id']
                result += ' ASC, ' if s['desc'] else ' DESC, '
            result = remove_tail(result,", ")
            return result  

        query = self.load_query()

        # add sort
        query += add_orderby()  
        # add offset limit
        query += f' offset {self._pageIndex * self._pageSize} limit {self._pageSize}'    


        with connection.cursor() as cursor:    
            cursor.execute(query)
            rows = dictfetchall(cursor)
        try:
            rowsCount = rows[0]["cnt"]
        except IndexError:        
            rowsCount = 0        

        result = { 'rowsCount': rowsCount, 'rows': rows}   
        cache.set(self._newSubKey, {'wordcloud_dialog' : result}, CACHE_TTL)
        return result
