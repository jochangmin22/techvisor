from utils import get_redis_key 
from django.core.cache import cache

from classes import IpSearchs

class IpVisual:
    
    def __init__(self, request):
        self._request = request
        self._visualNumEmpty = { 'mode' : 'visualNum', 'entities' : [] }
        self._visualIpcEmpty = { 'mode' : 'visualIpc', 'entities' : [] }
        self._visualPersonEmpty = { 'mode' : 'visualPerson', 'entities': [] }
        self._visualClassifyEmpty = { 'mode' : 'visualClassify', 'entities' : [] }

        self.set_up()

    def set_up(self):
        mainKey, subKey, params, subParams = get_redis_key(self._request)

        self._mode = subParams.get('mode',None)

        self._newMainKey = f'{mainKey}¶{self._mode}'
        self._newSubKey = f'{subKey}¶{self._mode}'

        try:
            context = cache.get(self._newMainKey)
            if context:
                print('load main visual redis', self._mode)
                return context
            _context = cache.get(self._newSubKey)
            if _context:
                print('load sub visual redis', self._mode)
                return _context
        except (KeyError, NameError, UnboundLocalError):
            pass        

        if not params.get('searchText',None):
            return getattr(self, '_%sEmpty' % self._mode)

    def visual(self):            
        foo = IpSearchs(self._request, mode=self._mode)
       
        command = { 
            'visualNum' : foo.vis_num,
            'visualClassify' : foo.vis_cla,
            'visualIpc' : foo.vis_ipc,
            'visualPerson' : foo.vis_per
        }   

        return command[self._mode]()
