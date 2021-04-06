from django.http import HttpResponse
from django.http import JsonResponse
from .searchs import kr_searchs
from utils import get_redis_key
import json

from classes import IpVisual, IpIndicator

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

def get_visual(request):
    _, _, params, subParams = get_redis_key(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_visual, 'US': us_visual, 'JP' : jp_visual, 'CN' : cn_visual, 'EP' : ep_visual, 'PCT' : pct_visual}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_visual(request):
    foo = IpVisual(request)
    return foo.visual()

def us_visual(request):
    return

def jp_visual(request):
    return

def cn_visual(request):
    return

def ep_visual(request):
    return

def pct_visual(request):
    return

def get_indicator(request):
    _, _, params, subParams = get_redis_key(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_indicator, 'US': us_indicator, 'JP' : jp_indicator, 'CN' : cn_indicator, 'EP' : ep_indicator, 'PCT' : pct_indicator}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)   
   
def kr_indicator(request):
    foo = IpIndicator(request)
    return foo.indicator()

def us_indicator(request):
    return    

def jp_indicator(request):
    return 

def cn_indicator(request):
    return 

def ep_indicator(request):
    return 

def pct_indicator(request):
    return 