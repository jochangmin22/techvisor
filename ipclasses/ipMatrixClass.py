from utils import request_data, redis_key, frequency_count
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
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

        try:
            result = cache.get(self._subKey)
            if result:
                print('load matrix redis')
                return result
        except (KeyError, NameError, UnboundLocalError):
            pass

    def menu_option(self):
        foo = self._subParams['menuOptions']['matrixOptions']
        self._category = foo.get('category','')
        self._volume = foo.get('volume','')
        self._output = foo.get('output','')     
        return          

    def matrix_extract(self):
        def dict_keys_as_a_list():
            result = []
            for key in topics.keys():
                result.append(key)        
            return result

        foo = NlpToken(self._request, menu='matrix')
        bar = foo.nlp_token(self._mtxRows)        

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
        
        foo = { '연도별':'출원일', '기술별':'ipc코드', '기업별':'출원인1'}
        category = foo[self._category]  

        topics = self.matrix_extract()

        try:
            for j in range(len(topics)):  # topic 20
                topic = topics[j].replace("_"," ")
                temp = [d for d in self._mtxRows if topic in d[self._volume]]
                temp2 = Counter(c[category] for c in temp)
                max_value = max(list(temp2.values()), default=0)
                matrixMax = max_value if matrixMax < max_value else matrixMax
                mlist.append(temp2)
                _yData = list(set().union(*mlist))
                yData = list(set(yData + _yData))
                all_list[topic] = mlist
                mlist = []
        except:
            pass

        xData = list(set().union(all_list.keys()))
        yData.sort(reverse=True)
        yData = yData[:15]

        res =  {"entities": all_list, "max": matrixMax, "xData": xData, "yData" : yData}

        cache.set(self._subKey, res , CACHE_TTL)
        return res
    
