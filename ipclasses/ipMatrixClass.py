from utils import get_redis_key, frequency_count
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
from collections import Counter

from ipclasses import IpSearchs, NlpToken

class IpMatrix:
    
    def __init__(self, request):
        self._request = request
        self._matrixEmpty = {'entities': {}, 'max': 0, 'xData': [], 'yData': []}

        self.set_up()

    def set_up(self):
        _, subKey, params, subParams = get_redis_key(self._request)
        
        self._newSubKey = r'{subKey}¶matrix'

        foo = subParams['menuOptions']['matrixOptions']
        self._category = foo.get('category','')
        self._volume = foo.get('volume','')
        self._output = foo.get('output','')           

        try:
            context = cache.get(self._newSubKey)
            if context:
                print('load matrix redis')
                return context
        except (KeyError, NameError, UnboundLocalError):
            pass

        if not params.get('searchText',None):
            return self._matrixEmpty            

    def load_mtx_rows(self):
        foo = IpSearchs(self._request, mode='matrix')
        return foo.mtx_rows() 

    def matrix_extract(self):
        def dict_keys_as_a_list():
            result = []
            for key in topics.keys():
                result.append(key)        
            return result        
        foo = NlpToken(self._request, menu='matrix')
        nlpRows = foo.load_nlp_rows()
        bar = foo.nlp_token(nlpRows)        

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

        mtx_rows = self.load_mtx_rows()
        topics = self.matrix_extract()

        try:
            for j in range(len(topics)):  # topic 20
                topic = topics[j].replace("_"," ")
                temp = [d for d in mtx_rows if topic in d[self._volume]]
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

        cache.set(self._newSubKey, res , CACHE_TTL)
        return res
    
