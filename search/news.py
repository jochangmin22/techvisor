import os
import sys
import urllib.request
import requests
from bs4 import BeautifulSoup
import json
import re

from django.http import JsonResponse
from django.http import HttpResponse

from .searchs import parse_searchs, parse_searchs_num
from .nlp import kr_nlp

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

client_id = settings.NAVER_NEWS_CLIENT_ID
client_secret = settings.NAVER_NEWS_CLIENT_SECRET
API_URL = settings.NAVER_NEWS_API_URL


keyword_1 = ['강아지', '고양이']
keyword_2 = ['토끼', '공원']


display = 100 # 각 키워드 당 검색해서 저장할 기사 수


def clean_keyword(keyword):
    """ 불필요한 단어 제거 """
    res = keyword.replace(" and","").replace( " or","")
    return res 

def parse_news(request, mode="begin"): # mode : begin, query
    """ 쿼리 실행 및 결과 저장 """
    # redis 저장용 key
    params = {}
    for value in [
        "searchText",
        "searchNum",
        # "dateType",
        # "startDate",
        # "endDate",
        # "inventor",
        # "assignee",
        # "patentOffice",
        # "language",
        # "status",
        # "ipType",
    ]:
        params[value] = request.GET.get(value) if request.GET.get(value) else ""
    apiParams = "¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']

    if params['searchNum']:
        kr_nlp(request, "wordcloud")


    # if apiParams == '¶¶¶¶¶¶¶¶¶':
    #     return "[]"
    # return HttpResponse(params["assignee"], content_type="text/plain; charset=utf-8")

    # context = cache.get(apiParams)    
    # if context and context['raw'] and mode == "begin":
    #     return JsonResponse(context['raw'], safe=False)

    # if context and context['nlp_raw'] and mode == 'nlp':
    #     return context['nlp_raw']
    min_name = clean_keyword(params['searchText'])
    # min_name = "하이브리드 자동차"
    encText = urllib.parse.quote(min_name)
    url = API_URL + encText + \
        "&dispay=" + str(display) + "&sort=sim"

    request = urllib.request.Request(url)
    request.add_header("X-Naver-Client-Id", client_id)
    request.add_header("X-Naver-Client-Secret",client_secret)        

    response = urllib.request.urlopen(request)
    rescode = response.getcode()
    if(rescode==200):
        #response_body_str = response.read().decode('utf-8')
        response_body_str = response.read().decode('utf-8')
        json_acceptable_string = response_body_str.replace("'", "\"")
        response_body = json.loads(response_body_str)
        title_link = {}
        link_description = {}
        for i in range(0, len(response_body['items'])):
            # strip b tag
            response_body['items'][i]['title'] = re.sub('<[^<]+?>', '', response_body['items'][i]['title'].replace('&quot;', '\"'))
            response_body['items'][i]['description'] = re.sub('<[^<]+?>', '', response_body['items'][i]['description'].replace('&quot;', '\"'))
            # link_description[response_body['items'][i]['link']] = response_body['items'][i]['description']
            # title_link[response_body['items'][i]['title']] = \
            #     response_body['items'][i]['link']
        # return HttpResponse(title_link, content_type="text/plain; charset=utf-8")                
        # return HttpResponse(link_description, content_type="text/plain; charset=utf-8")                
        # return JsonResponse(title_link, safe=False)                
        # return JsonResponse(link_description, safe=False)                
        return JsonResponse(response_body['items'], safe=False)                
        # return title_link

    else:
        return JsonResponse("Error Code:" + rescode, safe=False)
        # print("Error Code:" + rescode)    
