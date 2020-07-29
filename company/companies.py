from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
from bs4 import BeautifulSoup
from lxml import etree as ET
import re
from itertools import permutations
import json

import os
from konlpy.tag import Mecab

from copy import deepcopy

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

# from urllib.parse import unquote
# pynori python 3.6과 호환되는지 확인해야함
# from pynori.korean_analyzer import KoreanAnalyzer

### for api {
# import requests
# import urllib.parse
# from collections import OrderedDict
# from itertools import repeat
### for api }

# 국민연금 가입 사업장 내역' 데이터셋의 '사업장 정보조회 서비스
URL = "http://apis.data.go.kr/B552015/NpsBplcInfoInqireService/"
SERVICE_KEY = "2vd6KuqxkMvAIit6jtPA4Mz%2BQOmviDM0BqwkTM32%2FWmXeMu94AgrHPsdHDKA3na%2Bm9tnnf%2FEwLOyGlWmD9d6nw%3D%3D"
OPER_LIST = "getBassInfoSearch"
OPER_DETAIL = "getDetailInfoSearch"
OPER_PERIOD = "getPdAcctoSttusInfoSearch"

# list params sample : ?ldong_addr_mgpl_dg_cd=41&ldong_addr_mgpl_sggu_cd=117&ldong_addr_mgpl_sggu_emd_cd=101&wkpl_nm=삼성전자&bzowr_rgst_no=124815&pageNo=10&startPage=10&numOfRows=1&pageSize=1&serviceKey=서비스인증키
# detail params sample : ?seq=22216&serviceKey=서비스인증키
# period params sample : ?seq=784911&data_crt_ym=201510&serviceKey=서비스인증키

def parse_companies_query(request):
    """ 쿼리 확인용 """
    return HttpResponse(parse_companies(request, mode="query"), content_type="text/plain; charset=utf-8")

def like_keywords(keyword="", fieldName=""):
    """ 단순 like query 생성 """
    # A and F LIKE "%A%"
    # A or B_C ; F LIKE '%A%' or F LIKE '%B C%'
    # A and B_C ; F LIKE '%A%' and F LIKE '%B C%'
    # A or B and not C ; F LIKE '%A%' or F LIKE '%B%' and F !'C'

    if not keyword:
        return ""

    # 전체 조합에서 + 기준으로 like query 만들기
    items = []
    notItems = []
    mylength = 1
    # for val in re.split("(\\W+)", keyword): #  not a word (\w)
    for val in re.split(r' and | or ',keyword): # and | or
        val = val.replace("_"," ")
        if "not " in val or "-" in val: # collect negative word
            val = val.replace("-","").replace("not ","")
            notItems.append(val)
        else:                
            items.append(val)

    temp = list(map("%".join, permutations(items, mylength)))        

    res = ""
    for k in temp:
        res += '"' + fieldName + "\" like '%" + k + "%' or "

    if res.endswith(" or "):
        res = res[:-4]

    # append collect negative word
    res2 = ""
    # if not notItems:
    temp2 = list(map("%".join, permutations(notItems, mylength)))        

    for k in temp2:
        res2 += '"' + fieldName + "\" not like '%" + k + "%' and "

    if res2.endswith(" and "):
        res2 = res2[:-5]
                
    # merge result
    if res:
        return ("(" + res + ") and " + res2) if res2 else res
    else:
        return res2 if res2 else ""    


def parse_companies(request, mode="begin"): # mode : begin, nlp, query
    """ 쿼리 실행 및 결과 저장 """
    # redis key define
    params = {}
    for value in [
        "searchText",
        "searchNum",
        "searchVolume",
        "companyName",
        "companyAddress",
        "bizDomain",
        "relatedKeyword",
        "customCriteria",
        "industry",
        "marketCapStart",
        "marketCapStartEnd",
        "foundedStartDate",
        "foundedEndDate",
        "employeeStart",
        "employeeEnd",
        "repAgeStart",
        "repAgeEnd",
    ]:
        params[value] = request.GET.get(value) if request.GET.get(value) else ""
    apiParams = "¶".join(params.values())

    # if apiParams == '¶¶¶¶¶¶¶¶¶':
    #     return "[]"

    context = cache.get(apiParams)

    if context and context['raw'] and mode =="begin":
        return JsonResponse(context['raw'], safe=False)

    if context and context['nlp_raw'] and mode == 'nlp':
        return context['nlp_raw']

    if context and context['mtx_raw'] and mode == 'matrix':
        return context['mtx_raw']    

    # return HttpResponse(apiParams, content_type="text/plain; charset=utf-8")
    with connection.cursor() as cursor:

        wherCompanyName = (
            like_keywords(params["searchText"], "회사명") if params["searchText"] else ""
        )        

        whereTermsA = ""
        whereTermsAll = ""
        whereInventor = ""
        whereAssignee = ""
        whereOther = ""

        query = 'SELECT * FROM 상장법인목록 WHERE ' + wherCompanyName

        if query.endswith(" and "):
            query = query[:-5]

        if mode == "query": # mode가 query면 여기서 분기
            return query

        cursor.execute(
            "SET work_mem to '100MB';"
            # + "SET statement_timeout TO 20000;"
            + query
            # + " limit 1000"
        )
        row = dictfetchall(cursor)

    # return HttpResponse(query, content_type="text/plain; charset=utf-8")

    nlp_raw = ""
    mtx_raw = []

    # if row:

        # # matrix list 생성
        # mtx_raw = deepcopy(row)

        # # npl and mtx parse
        # for i in range(len(row)):
        #     # x += row[i]["요약token"].split()
        #     nlp_raw += row[i]["요약token"] + " "
        #     del row[i]["요약token"]  # grid에는 초록 안쓰므로 nlp_raw에 저장하고 바로 제거 - row는 list of dictionaries 형태임

        #     # matrix는 출원번호, 출원일자, 출원인1, ipc요약, 요약token만 사용
        #     mtx_raw[i]['출원일자'] = mtx_raw[i]['출원일자'][:-4]            
        #     del mtx_raw[i]["rows_count"]
        #     del mtx_raw[i]["등록사항"]
        #     del mtx_raw[i]["발명의명칭(국문)"]
        #     del mtx_raw[i]["발명의명칭(영문)"]
        #     del mtx_raw[i]["출원인코드1"]
        #     del mtx_raw[i]["출원인국가코드1"]
        #     del mtx_raw[i]["발명자1"]
        #     del mtx_raw[i]["발명자국가코드1"]
        #     del mtx_raw[i]["등록일자"]
        #     del mtx_raw[i]["공개일자"]        

        # # 요약token tokenizer
        # nlp_raw = ' '.join(tokenizer(nlp_raw) if nlp_raw else '')
    # else:  # 결과값 없을 때 처리
        # row = []

    # redis 저장 {
    new_context = {}
    new_context['nlp_raw'] = nlp_raw
    new_context['mtx_raw'] = mtx_raw
    new_context['raw'] = row
    # new_context['wordcloud'] = []
    # new_context['vec'] = []
    # new_context['matrix'] = []
    cache.set(apiParams, new_context, CACHE_TTL)
    # redis 저장 }

    if mode == "begin":
        return JsonResponse(row, safe=False)
    elif mode == "nlp":
        return nlp_raw
    elif mode =="matrix":
        return mtx_raw        


def parse_companies_num(request, mode="begin"): # mode : begin, nlp, query
    """ 쿼리 실행 및 결과 저장 ; 번호검색 """
    # api 저장용 params
    params = {}
    params["searchNum"] = request.GET.get("searchNum") if request.GET.get("searchNum") else ""
    params["searchNumNotHyphens"] = params["searchNum"].replace("-","") if params["searchNum"] else ""
    apiParams = params["searchNum"] # apiParams = "¶".join(params.values())

    context = cache.get(apiParams)    
    if context and context['raw'] and mode == "begin":
        return JsonResponse(context['raw'], safe=False)

    if context and context['nlp_raw'] and mode == 'nlp':
        return context['nlp_raw']    

    with connection.cursor() as cursor:
        whereNum = ""
        # fields without "-"
        for value in ["종목코드"]:
            whereNum += value + "::text like '%" + params["searchNumNotHyphens"] + "%' or "

        # TODO : hyphen refine
        # fields with "-"
        # for value in ["우선권주장출원번호1", "우선권주장출원번호2", "우선권주장출원번호3", "우선권주장출원번호4", "우선권주장출원번호5", "우선권주장출원번호6", "우선권주장출원번호7", "우선권주장출원번호8", "우선권주장출원번호9", "우선권주장출원번호10"]:
        #     whereNum += value + "::text like '%" + params["searchNum"] + "%' or "
        if whereNum.endswith(" or "):
            whereNum = whereNum[:-4]          

        query = 'SELECT * FROM 상장법인목록 WHERE ' + whereNum

        if mode == "query": # mode가 query면 여기서 분기
           return query

        cursor.execute(
            "SET work_mem to '100MB';"
            + query
        )
        row = dictfetchall(cursor)

    # return HttpResponse(query, content_type="text/plain; charset=utf-8")

    nlp_raw = ""
    mtx_raw = []
    # x = []
    # if row:

        # mtx_raw = deepcopy(row)
        # # nlp, mtx parse
        # for i in range(len(row)):
        #     # x += row[i]["요약token"].split()
        #     nlp_raw += row[i]["요약token"] + " "
        #     del row[i]["요약token"]  # grid에는 초록 안쓰므로 nlp_raw에 저장하고 바로 제거 - row는 list of dictionaries 형태임

        #     # matrix는 출원일자, 출원인1, ipc요약, 요약token만 사용
        #     mtx_raw[i]['출원일자'] = mtx_raw[i]['출원일자'][:-4]
        #     del mtx_raw[i]["등록사항"]
        #     del mtx_raw[i]["발명의명칭(국문)"]
        #     del mtx_raw[i]["발명의명칭(영문)"]
        #     del mtx_raw[i]["출원인코드1"]
        #     del mtx_raw[i]["출원인국가코드1"]
        #     del mtx_raw[i]["발명자1"]
        #     del mtx_raw[i]["발명자국가코드1"]
        #     del mtx_raw[i]["등록일자"]
        #     del mtx_raw[i]["공개일자"]        
        #     # del mtx_raw[i][:4]
        #     # del mtx_raw[i][6:12]            

        # if nlp_raw.endswith(" "):
        #     nlp_raw = nlp_raw[:-1]
    # else:  # 결과값 없을 때 처리
        # row = []

    # Redis 저장 {
    new_context = {}
    new_context['nlp_raw'] = nlp_raw
    new_context['mtx_raw'] = mtx_raw
    new_context['raw'] = row
    new_context['wordcloud'] = []
    new_context['vec'] = []
    new_context['matrix'] = []
    cache.set(apiParams, new_context, CACHE_TTL)
    # Redis 저장 }

    if mode == "begin":
        return JsonResponse(row, safe=False)
    elif mode =="nlp":
        return nlp_raw
    elif mode =="matrix":
        return mtx_raw

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

def tokenizer( raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]): # NNG,NNP명사, SY기호, SL외국어, SH한자, UNKNOW (외래어일 가능성있음)
    mecab = Mecab()    
    STOPWORDS = getattr(settings, 'STOPWORDS', DEFAULT_TIMEOUT)
    return [
        word
        for word, tag in mecab.pos(raw) if len(word) > 1 and tag in pos and word not in STOPWORDS
        # if len(word) > 1 and tag in pos and word not in stopword
        # if tag in pos
        # and not type(word) == float
]             
