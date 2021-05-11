from django.conf import settings
from django.core.cache import cache
from django.core.cache.backends.base import DEFAULT_TIMEOUT
from utils import frequency_count, redis_key, request_data, sampling

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
from collections import Counter

from ipclasses import NlpToken

class IpMatrix:
    
    def __init__(self, request, mtxRows):
        self._request = request
        self._mtxRows = mtxRows
        self._matrixEmpty = {'entities': {}, 'max': 0, 'xData': [], 'yData': []}

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)
        _, subKey = redis_key(self._request)

        if not self._params.get('searchText',None):
            self.matrix = self._matrixEmpty           
            return

        self._subKey = f'{subKey}¶matrix'

        self.menu_option()

        self.table_options()        

        try:
            result = cache.get(self._subKey)
            if result:
                print('load matrix redis')
                return result
        except (KeyError, NameError, UnboundLocalError):
            pass

    def menu_option(self):
        foo = self._subParams['menuOptions']['matrixOptions']
        self._categoryX = foo.get('categoryX','')
        self._categoryY = foo.get('categoryY','')
        self._volume = foo.get('volume','')
        self._unit = foo.get('unit','')
        self._output = foo.get('output','')     
        return

    def table_options(self):
        foo = self._subParams["menuOptions"]["tableOptions"]['matrixTable']
        self._sortBy = foo.get('sortBy', [])            

        pageIndex = foo.get('pageIndex', 0)
        pageSize = foo.get('pageSize', 10)
        self._offset = pageIndex * pageSize
        self._limit = pageSize
        return                   

    def matrix_extract(self):
        def dict_keys_as_a_list():
            result = []
            for key in topics.keys():
                result.append(key)        
            return result

        foo = NlpToken(self._request, menu='matrix')
        bar = foo.nlp_token(self._mtxRowsNew)        

        # if not bar:
        #     return self._matrixEmpty

        topics = frequency_count(bar, self._output)
        return dict_keys_as_a_list()

    def matrix(self):
        mlist = []  # list of dic
        all_list = {}  # dic of list of dic
        matrixMax = 0
        xData = []
        yData = []

        def max_val():
            baz = max(list(bar.values()), default=0)
            return baz if matrixMax < baz else matrixMax

        def applicantExcludePerson():
            return [d for d in self._mtxRows if d['출원인주체']]

        def groupBy():
            keys = xData
            result = {}
            acc = {}
            for k in keys:
                for item in all_list[k]:
                    for yearKey in item.keys():
                        try:
                            acc[yearKey]
                        except KeyError:
                            acc[yearKey] = { self._categoryY : yearKey }

                        try:
                            acc[yearKey][k]
                        except KeyError:
                            acc[yearKey][k] = 0 + item[yearKey]
                        else:
                            acc[yearKey][k] = acc[yearKey][k] + item[yearKey]
                result.update(acc)
            return result.values()            
        
        foo = { '연도별':'출원일', '기술별':'ipc코드', '기업별':'출원인1'}
        categoryY = foo[self._categoryY]

        self._mtxRowsNew = applicantExcludePerson() if categoryY == '출원인1' else self._mtxRows 

        topics = self.matrix_extract()

        try:
            for j in range(len(topics)):
                topic = topics[j].replace("_"," ")
                foo = [d for d in self._mtxRowsNew if topic in d[self._volume]]
                bar = Counter(c[categoryY] for c in foo)
                matrixMax = max_val()
                mlist.append(bar)
                _yData = list(set().union(*mlist))
                yData = list(set(yData + _yData))
                all_list[topic] = mlist
                mlist = []
        except:
            pass

        xData = list(set().union(all_list.keys()))
        yData.sort(reverse=True)
        yData = yData[0:30]

        res =  {"entities": all_list, "max": matrixMax, "xData": xData, "yData" : yData} # "table" : {rowsCount : 0 , rows : []}}
        
        rows = groupBy()

        try:
            rowsCount = len(rows)
        except IndexError:        
            rowsCount = 0  

        tableData = { 'rowsCount': rowsCount, 'rows': sampling(rows, self._offset, self._limit)}           

        res.update({ 'table' : tableData})

        cache.set(self._subKey, res , CACHE_TTL)
        return res
