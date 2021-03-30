from django.http import HttpResponse
from django.http import JsonResponse
from .searchs import kr_searchs
from utils import get_redis_key
import json

from classes import IpVisual

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

def get_visual(request):
    _, _, params, subParams = get_redis_key(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'
    mode = subParams.get('mode',None) or 'None'
    command = { 'KR': kr_visual, 'US': us_visual, 'JP' : jp_visual, 'CN' : cn_visual, 'EP' : ep_visual, 'PCT' : pct_visual}
    result = command[patentOffice](request, mode)
    return JsonResponse(result, safe=False)

def kr_visual(request, mode):
    foo = IpVisual(request)
    if mode == 'indicator':
        foo.indicator()
    return getattr(foo, '_%s' % mode)        

def us_visual(request, mode):
    foo = IpVisual(request)
    if mode == 'indicator':
        foo.indicator()
    return getattr(foo, '_%s' % mode)   

def jp_visual(request, mode):
    foo = IpVisual(request)
    if mode == 'indicator':
        foo.indicator()
    return getattr(foo, '_%s' % mode)   
def cn_visual(request, mode):
    foo = IpVisual(request)
    if mode == 'indicator':
        foo.indicator()
    return getattr(foo, '_%s' % mode)   
def ep_visual(request, mode):
    foo = IpVisual(request)
    if mode == 'indicator':
        foo.indicator()
    return getattr(foo, '_%s' % mode)   
def pct_visual(request, mode):
    foo = IpVisual(request)
    if mode == 'indicator':
        foo.indicator()
    return getattr(foo, '_%s' % mode)   
