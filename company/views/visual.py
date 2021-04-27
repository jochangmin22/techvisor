# app
import requests
from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
from copy import deepcopy
import json
import operator
from datetime import datetime, timedelta

from utils import dictfetchall, request_data, tokenizer, tokenizer_phrase, remove_duplicates, sampling, remove_tail, frequency_count, add_orderby
from .crawler import update_today_corp_report, update_today_crawl_mdcline

from ..models import Mdcin_clinc_test_info, Disclosure_report
from search.models import Listed_corp, Disclosure

from cpclasses import CpVisual, CpWordcloud

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
COMPANY_ASSIGNE_MATCHING = settings.TERMS['COMPANY_ASSIGNE_MATCHING']

def get_owned_patent(request):
    result = owned_patent(request)
    return JsonResponse(result, safe=False)

def owned_patent(request):
    foo = CpVisual(request, mode='owned_patent')
    return foo.owned_patent()



def get_wordcloud(request):
    result = wordcloud(request)
    return JsonResponse(result, safe=False)

def wordcloud(request):
    foo = CpVisual(request, mode="wordcloud")
    nlpRows = foo.wordcloud()

    bar = CpWordcloud(request, nlpRows)
    return bar.wordcloud()    



def get_visual(request):
    result = visual(request)
    return JsonResponse(result, safe=False)

def visual(request):
    _, subParams = request_data(request)
    mode = subParams.get('mode','') or ''    
    foo = CpVisual(request, mode)
    return foo.visual()      
         
