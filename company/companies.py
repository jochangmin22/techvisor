from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
import re
from itertools import permutations
from konlpy.tag import Mecab

from bs4 import BeautifulSoup
from lxml import etree as ET
import os

from copy import deepcopy
import json

from .utils import get_redis_key, dictfetchall, remove_tags, remove_brackets, remove_punc

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

def parse_companies(request, mode="begin"): # mode : begin, nlp, query
    """ 쿼리 실행 및 결과 저장 """

    mainKey, _, params, _ = get_redis_key(request)

    context = cache.get(mainKey)

    if mode == "begin":
        try:
            if context['raw']:
                return JsonResponse(context['raw'], safe=False)
        except:
            pass  

    with connection.cursor() as cursor:

        # 번호검색
        if 'searchNum' in params and params['searchNum']:
            whereAll = ""
            # fields without "-"
            for value in ["종목코드"]:
                whereAll += value + "::text like '%" + \
                    params["searchNum"].replace("-","") + "%' or "

            if whereAll.endswith(" or "):
                whereAll = whereAll[:-4]            
        # 키워드 검색
        else:
            whereAll = like_parse(
                params["searchText"]) if params["searchText"] else ""

        query = 'SELECT * FROM listed_corp WHERE (' + \
            whereAll + ")"

        if mode == "query": # mode가 query면 여기서 분기
            return query

        cursor.execute(
            "SET work_mem to '100MB';"
            + query
        )
        row = dictfetchall(cursor)

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
    # new_context['nlp_raw'] = nlp_raw
    # new_context['mtx_raw'] = mtx_raw
    new_context['raw'] = row

    cache.set(mainKey, new_context, CACHE_TTL)
    # redis 저장 }

    if mode == "begin":
        return JsonResponse(row, safe=False)
    # elif mode == "nlp":
    #     return nlp_raw
    # elif mode =="matrix":
    #     return mtx_raw        



def parse_query(request):
    """ 쿼리 확인용 """
    return HttpResponse(parse_companies(request, mode="query"), content_type="text/plain; charset=utf-8")

def like_parse(keyword=""):
    """ like query 생성 """
    """ keyword 변환 => and, or, _, -, not, near, adj 를 tsquery 형식의 | & ! <1> 로 변경 """

    # (기업이름).CN and (주소).CA and (사업영역).BD and (관련키워드).RK and (사용자).CC and (@MC>=1111<=2222) and (@FD>=33333333<=44444444) and (@EM>=55<=66) and (@RA>=77<=88)
    if keyword and keyword != "":

        res = ""  # unquote(keyword) # ; issue fix
        # for val in keyword.split(" AND "):
        for val in re.split(" and ", keyword, flags=re.IGNORECASE):  # case insentitive
            # continue they were not implemented
            if val.startswith("(@") or val.endswith(").RK") or val.endswith(").CC"):
                continue
            res += "("  # not add paranthesis when above terms
            # select fieldName and remove initial symbol
            if val.endswith(".CN"):
                val = val.replace(".CN", "")
                res += '회사명'
            if val.endswith(".CA"):
                val = val.replace(".CA", "")
                res += '지역'                
            if val.endswith(".BD"):
                val = val.replace(".BD", "")
                res += '업종'                
            if val.endswith(".IN"):
                val = val.replace(".IN", "")
                res += '주요제품'                
           
            # convert nagative - to None
            if val.startswith("-") or ' or -' in val:
                val = val.replace("-", "")
                res += " not"
            # convert nagative not to None
            if val.startswith("not ") or ' or not ' in val:
                val = val.replace("not ", "")
                res += " not"
            val = re.sub('[()]', '', val)
            res += " like '%" + val + "%' and " 
            # if " OR " in val:
            # if " or ".upper() in map(str.upper, val):
            #     needPlainto = "\""

            # # add paranthesis every terms block

            # res += (
            #     needPlainto + "".join(str(val)) + needPlainto + ") & "
            # )
        # res = res.replace(" AND ", needPlainto + " & ").replace(" OR ", needPlainto + " | ").replace(
        #     " and ", needPlainto + " & ").replace(" or ", needPlainto + " | ")  # .replace("_", " ")

        if res.endswith(" and "):
            res = res[:-5]
        res += ")"
    else:
        res = None
    return res     

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

def tsquery_keywords(keyword="", fieldName=""):
    """ keyword 변환 => and, or, _, -, not, near, adj 를 tsquery 형식의 | & ! <1> 로 변경 """
    # A+B;C_D => '("A" | "B") & "C D"'
    # A or -B and C_D and not E => '(A !B) & "C D" & !E'
    if keyword and keyword != "":
        needPlainto = ""
        strKeyword = ""  # unquote(keyword) # ; issue fix

        # for val in keyword.split(" AND "):
        for val in re.split(" and ", keyword, flags=re.IGNORECASE):  # case insentitive
            # continue if not terms
            if val.startswith("(@") or val.endswith(".CA") or val.endswith(".BD") or val.endswith(".RK") or val.endswith(").CC") or val.endswith(").IN"):
                continue
            strKeyword += "("  # not add paranthesis when above terms
            # convert .CN to None
            if val.endswith(".CN"):
                val = val.replace(".CN", "")
            # convert nagative - to !
            if val.startswith("-") or ' or -' in val:
                val = val.replace("-", "!")
            # convert nagative not to !
            if val.startswith("not ") or ' or not ' in val:
                val = val.replace("not ", "!")
            # convert wildcard * to :*
            if val.endswith("*") or '*' in val:
                val = val.replace("*", ":*")
            # handle Proximity Search
            if ' adj' in val.lower():
                s = val.lower()[val.lower().find("adj")+3:].split()[0]
                if s.isnumeric():
                    delimiter = "<" + s + ">"
                    val = val.replace(s, "")
                else:
                    delimiter = "<1>"

                val = re.sub(re.escape('adj'), delimiter, val, flags=re.IGNORECASE)                    
                # val = val.replace("adj", delimiter)
            # A or B near C
            # A near B or C
            # A or B near C or D near E or F
            strNear = ""
            if ' near' in val.lower():
                for v in re.split(" or ", val, flags=re.IGNORECASE):
                    # remove possible parenthesis
                    v = re.sub('[()]', '', v)
                    if ' near' in v.lower():
                        s = v.lower()[v.lower().find("near")+4:].split()[0]
                        if s.isnumeric():
                            delimiter = "<" + s + ">"
                            v = v.replace(s, "")
                        else:
                            delimiter = "<1>"

                        v = re.sub(re.escape('near'), delimiter, v, flags=re.IGNORECASE) 
                        temp = v.partition(" " + delimiter + " ")

                        # switch position between words and add it
                        strNear += "(" + v + " | " + \
                            temp[2] + " " + delimiter + " " + temp[0] + ") | "
                    else:
                        strNear += "".join(str(v)) + " | "
                if strNear.endswith(" | "):
                    strNear = strNear[:-3]
                strKeyword += strNear
                val = ""  # val clear

            # if " OR " in val:
            if " or ".upper() in map(str.upper, val):
                needPlainto = "\""

            # add paranthesis every terms block

            strKeyword += (
                needPlainto + "".join(str(val)) + needPlainto + ") & "
            )
        strKeyword = strKeyword.replace(" AND ", needPlainto + " & ").replace(" OR ", needPlainto + " | ").replace(
            " and ", needPlainto + " & ").replace(" or ", needPlainto + " | ")  # .replace("_", " ")

        if strKeyword.endswith(" & "):
            strKeyword = strKeyword[:-3]

        #  전문소 @@ plainto_tsquery('(A | B) & C')
        tsqueryType = "plainto_tsquery" if needPlainto else "to_tsquery"
        res = '"' + fieldName + "\" @@ " + \
            tsqueryType + "('" + strKeyword + "')"
    else:
        res = None
    return res




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
