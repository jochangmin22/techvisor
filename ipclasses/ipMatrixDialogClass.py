from utils import request_data, redis_key, dictfetchall, add_orderby
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from ipclasses import IpSearchs 

class IpMatrixDialog:
    
    def __init__(self, request):
        self._request = request
        self._matrixDialogEmpty = { 'rows': [], 'rowsCount': 0 }

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)
        _, subKey = redis_key(self._request)

        self._subKey = f'{subKey}matrix_dialog'

        self.menu_option()

        self.table_options()

        self.dialog_options()

        try:
            result = cache.get(self._subKey)
            if result:
                print('load matrixDialog redis')
                return result
        except (KeyError, NameError, UnboundLocalError):
            pass

        if not self._params.get('searchText',None):
            return self._matrixEmpty            

    def menu_option(self):
        foo = self._subParams['menuOptions']['matrixOptions']
        self._categoryX = foo.get('categoryX','')
        self._categoryY = foo.get('categoryY','')
        self._volume = foo.get('volume','')
        self._unit = foo.get('unit','')
        self._output = foo.get('output','')     
        return

    def table_options(self):
        foo = self._subParams["menuOptions"]["tableOptions"]['matrixDialog']
        pageIndex = foo.get('pageIndex', 0)
        pageSize = foo.get('pageSize', 10)
        self._sortBy = foo.get('sortBy', [])            

        self._offset = pageIndex * pageSize
        self._limit = pageSize
        return 

    def dialog_options(self):
        foo = self._subParams['menuOptions']['matrixDialogOptions']
        self._topic = foo.get('topic', [])  
        self._categoryValue = foo.get('categoryValue', [])
        return      


    def load_query(self):
        foo = IpSearchs(self._request, mode='query')
        return foo.query_chioce() 

    def matrix_dialog(self):
        foo = { '연도별':'출원일', '기술별':'ipc코드', '기업별':'출원인1'}
        categoryY = foo[self._categoryY]  

        query = self.load_query()
        # add rest where
        query += ' and ' + categoryY + '= \'' + self._categoryValue + '\''
        # add sort
        query += add_orderby(self._sortBy)  
        # add offset limit
        query += f' offset {self._offset} limit {self._limit}'    

        with connection.cursor() as cursor:    
            cursor.execute(query)
            rows = dictfetchall(cursor)
        try:
            rowsCount = rows[0]["cnt"]
        except IndexError:        
            rowsCount = 0        

        result = { 'rowsCount': rowsCount, 'rows': rows}   
        cache.set(self._subKey, {'matrix_dialog' : result}, CACHE_TTL)
        return result
