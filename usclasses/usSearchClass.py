from utils import request_data, remove_tail, redis_key
from django.core.cache import cache

from ipclasses.ipSearchClass import IpSearch
from ipclasses import IpSearch

class UsSearch(IpSearch):
    def set_up(self):
        self._params, self._subParams = request_data(self._request)

        self._appNo = self._params.get('appNo','')  
        self._whereAppNo = f'WHERE "문헌번호" = $${self._appNo}$$'
        self._regNo = self._params.get('regNo','')

        self._applicantCode = self._params.get('applicantCode','')
        bar = ''
        for foo in self._applicantCode:
            bar += f'출원인코드1 = $${foo}$$ or '
        self._whereApplicantCode = 'WHERE ' + remove_tail(bar, ' or ')

        mainKey, subKey = redis_key(self._request)
        self._searchKey = f'{mainKey}¶search'
        self._mainKey = f'{mainKey}¶{self._mode}'
        self._subKey = f'{subKey}¶{self._mode}'

        try:
            result = cache.get(self._searchKey)
            if result:
                print('load searchKey redis')
                self._rows = result
                return result
            res = cache.get(self._subKey)
            if res:
                print('load subKey redis')
                setattr(self, '_%s' % self._mode, res)
                return res
        except (KeyError, NameError, UnboundLocalError):
            pass