from django.http import JsonResponse

from utils import request_data

from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from ipclasses import IpNews
from usclasses import UsNews

def get_news(request):
    params, _ = request_data(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_news, 'US': us_news, 'JP' : jp_news, 'CN' : cn_news, 'EP' : ep_news, 'PCT' : pct_news}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_news(request):
    foo = IpNews(request, mode="news")
    return foo.news() 

def us_news(request):
    foo = UsNews(request, mode="news")
    return foo.news()

def jp_news(request):
    return
def cn_news(request):
    return
def ep_news(request):
    return
def pct_news(request):
    return

def get_news_sa(request):
    params, _ = request_data(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_news_sa, 'US': us_news_sa, 'JP' : jp_news_sa, 'CN' : cn_news_sa, 'EP' : ep_news_sa, 'PCT' : pct_news_sa}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_news_sa(request):
    foo = IpNews(request, mode="news_sa")
    return foo.news_sa() 

def us_news_sa(request):
    foo = UsNews(request, mode="news_sa")
    return foo.news_sa() 

def jp_news_sa(request):
    return
def cn_news_sa(request):
    return
def ep_news_sa(request):
    return
def pct_news_sa(request):
    return

def get_related_company(request):
    params, _ = request_data(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_related_company, 'US': us_related_company, 'JP' : jp_related_company, 'CN' : cn_related_company, 'EP' : ep_related_company, 'PCT' : pct_related_company}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_related_company(request):
    foo = IpNews(request, mode="related_company")
    return foo.related_company() 

def us_related_company(request):
    foo = UsNews(request, mode="related_company")
    return foo.related_company()
    
def jp_related_company(request):
    return
def cn_related_company(request):
    return
def ep_related_company(request):
    return
def pct_related_company(request):
    return          
