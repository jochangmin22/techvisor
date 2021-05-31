from django.http import JsonResponse

from utils import request_data
from ipclasses import IpSearchs
from usclasses import UsSearchs

def get_searchs(request, mode="searchs"):
    params, _ = request_data(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_searchs, 'US': us_searchs, 'JP' : jp_searchs, 'CN' : cn_searchs, 'EP' : ep_searchs, 'PCT' : pct_searchs}
    result = command[patentOffice](request, mode)
    return JsonResponse(result, safe=False)

def kr_searchs(request, mode="searchs"):
    foo = IpSearchs(request, mode)
    return foo.searchs()

def us_searchs(request, mode="searchs"):
    foo = UsSearchs(request, mode)
    return foo.searchs()
    
def jp_searchs(request, mode="searchs"):
    return
def cn_searchs(request, mode="searchs"):
    return
def ep_searchs(request, mode="searchs"):
    return
def pct_searchs(request, mode="searchs"):
    return
