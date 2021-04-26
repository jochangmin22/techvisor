from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
import re
from itertools import permutations
import operator
import json

from utils import get_redis_key
from ipclasses import IpSearchs

def get_searchs(request, mode="searchs"):
    _, _, params, _ = get_redis_key(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_searchs, 'US': us_searchs, 'JP' : jp_searchs, 'CN' : cn_searchs, 'EP' : ep_searchs, 'PCT' : pct_searchs}
    result = command[patentOffice](request, mode)
    return JsonResponse(result, safe=False)

def kr_searchs(request, mode="searchs"):
    foo = IpSearchs(request, mode)
    return foo.searchs()

def us_searchs(request, mode="searchs"):
    return
def jp_searchs(request, mode="searchs"):
    return
def cn_searchs(request, mode="searchs"):
    return
def ep_searchs(request, mode="searchs"):
    return
def pct_searchs(request, mode="searchs"):
    return
