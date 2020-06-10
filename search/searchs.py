from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
from bs4 import BeautifulSoup
from lxml import etree as ET
import re
from itertools import permutations, islice
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

# for api {
# import requests
# import urllib.parse
# from collections import OrderedDict
# from itertools import repeat
# for api }

# 사용 연산기호 - 추후
# 명칭*요약*대표청구항(KEY)
# 발명의 명칭 (TI)
# 요약 (AB)
# 대표청구항 (CL)
# 전체청구항 (CLA)
# 출원인 (AP)
# 발명자 (INV)
# IPC요약(IPCM)
# 출원인 대표명화 코드(WAP)

def parse_searchs(request, mode="begin"):  # mode : begin, nlp, query
    """ 쿼리 실행 및 결과 저장 """
    # redis key define
    params = {}
    for value in [
        "searchText",
        "searchNum",
        "searchVolume",
        "dateType",
        "startDate",
        "endDate",
        "inventor",
        "assignee",
        "patentOffice",
        "language",
        "status",
        "ipType",
    ]:
        params[value] = request.GET.get(
            value) if request.GET.get(value) else ""
    apiParams = "¶".join(
        params.values()) if params['searchNum'] == '' else params['searchNum']

    # if apiParams == '¶¶¶¶¶¶¶¶¶':
    #     return "[]"
    # return HttpResponse(params["assignee"], content_type="text/plain; charset=utf-8")

    context = cache.get(apiParams)

    if context and context['raw'] and mode == "begin":
        return JsonResponse(context['raw'], safe=False)

    if context and context['nlp_raw'] and mode == 'nlp':
        return context['nlp_raw']

    if context and context['mtx_raw'] and mode == 'matrix':
        return context['mtx_raw']

    if context and context['raw'] and mode == 'matrix_dialog':
        return context['raw']

    with connection.cursor() as cursor:

        # 검색범위 선택
        if params['searchVolume'] == 'SUMA':
            searchVolume = '중'
        elif params['searchVolume'] == 'ALL':
            searchVolume = '대'
        else:
            searchVolume = '소'
        # to_tsquery 형태로 parse
        whereTermsA = tsquery_keywords(
            params["searchText"], '전문' + searchVolume)
        # whereTermsB = like_keywords(params["searchText"], "출원인1")
        # 출원인 포함은 db 성능 개선하고 나중에
        # whereTermsAll = ("((" + whereTermsA + ") or " if whereTermsA else "") + ("("+ whereTermsB + ")) and " if whereTermsB else "")
        whereTermsAll = ("((" + whereTermsA + ")) and " if whereTermsA else "")

        whereInventor = (
            like_keywords(params["inventor"],
                          "발명자1") if params["inventor"] else ""
        )
        whereAssignee = (
            like_keywords(params["assignee"],
                          "출원인1") if params["assignee"] else ""
        )
        whereOther = parse_Others(
            params["dateType"],
            params["startDate"],
            params["endDate"],
            params["status"],
            params["ipType"],
        )

        query = 'SELECT 등록사항, "발명의명칭(국문)", "발명의명칭(영문)", 출원번호, 출원일자, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일자, 공개일자, ipc요약, 요약token FROM 공개공보 WHERE ' + \
            whereTermsAll + ("(" + whereInventor + ") and " if whereInventor else "") + (
                "(" + whereAssignee + ") and " if whereAssignee else "") + whereOther

        if query.endswith(" and "):
            query = query[:-5]

        if mode == "query":  # mode가 query면 여기서 분기
            return query

        cursor.execute(
            "SET work_mem to '100MB';"
            # + "SET statement_timeout TO 20000;"
            + query
            # + ' and (등록사항 <> ALL (\'{"소멸","거절","취하"}\'::varchar[]))'
            # + " GROUP BY 특허고객대표번호"
            # + " order by 출원번호 DESC"
            # + " limit 1000"
        )
        row = dictfetchall(cursor)
    # return HttpResponse(query, content_type="text/plain; charset=utf-8")

    nlp_raw = ""
    mtx_raw = []
    # tsv_content = ""
    # x = []
    if row:
        # 사용안함 { 아래로 대체
        # 초록부분만 DB 저장 - token처리 ; 시간걸림
        # ids = [y["초록"] for y in row]
        # nlp_raw = kr_taged(HttpResponse(ids))
        # nlp_raw = json.dumps(nlp_raw, ensure_ascii=False)
        # memory 절약을 위해 10번째 초록부분만 제외 - row는 list of dictionaries 형태임
        # for i in range(len(row)):
        #     del row[i]["요약token"]
        # 사용안함 }
        # matrix list 생성
        mtx_raw = deepcopy(row)

        # npl and mtx parse
        for i in range(len(row)):
            # x += row[i]["요약token"].split()
            nlp_raw += row[i]["요약token"] if row[i]["요약token"] else "" + " "
            # grid에는 초록 안쓰므로 nlp_raw에 저장하고 바로 제거 - row는 list of dictionaries 형태임
            del row[i]["요약token"]

            # matrix는 출원번호, 출원일자, 출원인1, ipc요약, 요약token만 사용
            mtx_raw[i]['출원일자'] = mtx_raw[i]['출원일자'][:-4]
            # del mtx_raw[i]["rows_count"]
            del mtx_raw[i]["등록사항"]
            del mtx_raw[i]["발명의명칭(국문)"]
            del mtx_raw[i]["발명의명칭(영문)"]
            del mtx_raw[i]["출원인코드1"]
            del mtx_raw[i]["출원인국가코드1"]
            del mtx_raw[i]["발명자1"]
            del mtx_raw[i]["발명자국가코드1"]
            del mtx_raw[i]["등록일자"]
            del mtx_raw[i]["공개일자"]

            # del mtx_raw[i][:4]
            # del mtx_raw[i][6:12]

        # tsv_content = json.dumps(x, ensure_ascii=False)
        # if nlp_raw.endswith(" "):
        #     nlp_raw = nlp_raw[:-1]

        # 요약token tokenizer
        nlp_raw = ' '.join(tokenizer(nlp_raw) if nlp_raw else '')
    else:  # 결과값 없을 때 처리
        row = []

    # redis 저장 {
    new_context = {}
    new_context['nlp_raw'] = nlp_raw
    new_context['mtx_raw'] = mtx_raw
    new_context['raw'] = row
    new_context['wordcloud'] = []
    new_context['vec'] = []
    new_context['matrix'] = []
    cache.set(apiParams, new_context, CACHE_TTL)
    # redis 저장 }

    if mode == "begin":
        return JsonResponse(row, safe=False)
    elif mode == "nlp":
        return nlp_raw
    elif mode == "matrix":
        return mtx_raw


def parse_searchs_num(request, mode="begin"):  # mode : begin, nlp, query
    """ 쿼리 실행 및 결과 저장 ; 번호검색 """
    # api 저장용 params
    params = {}
    params["searchNum"] = request.GET.get(
        "searchNum") if request.GET.get("searchNum") else ""
    params["searchNumNoHyphens"] = params["searchNum"].replace(
        "-", "") if params["searchNum"] else ""
    apiParams = params["searchNum"]  # apiParams = "¶".join(params.values())

    context = cache.get(apiParams)
    if context and context['raw'] and mode == "begin":
        return JsonResponse(context['raw'], safe=False)

    if context and context['nlp_raw'] and mode == 'nlp':
        return context['nlp_raw']

    if context and context['mtx_raw'] and mode == 'matrix':
        return context['mtx_raw']        

    if context and context['raw'] and mode == 'matrix_dialog':
        return context['raw']

    with connection.cursor() as cursor:
        whereNum = ""
        # fields without "-"
        for value in ["출원번호", "공개번호", "등록번호"]:
            whereNum += value + "::text like '%" + \
                params["searchNumNoHyphens"] + "%' or "

        # TODO : hyphen refine
        # fields with "-"
        for value in ["우선권주장출원번호1", "우선권주장출원번호2", "우선권주장출원번호3", "우선권주장출원번호4", "우선권주장출원번호5", "우선권주장출원번호6", "우선권주장출원번호7", "우선권주장출원번호8", "우선권주장출원번호9", "우선권주장출원번호10"]:
            whereNum += value + "::text like '%" + \
                params["searchNum"] + "%' or "
        if whereNum.endswith(" or "):
            whereNum = whereNum[:-4]

        query = 'SELECT 등록사항, "발명의명칭(국문)", "발명의명칭(영문)", 출원번호, 출원일자, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일자, 공개일자, ipc요약, 요약token FROM 공개공보 WHERE ' + whereNum

        if mode == "query":  # mode가 query면 여기서 분기
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
    if row:

        mtx_raw = deepcopy(row)
        # nlp, mtx parse
        for i in range(len(row)):
            # x += row[i]["요약token"].split()
            nlp_raw += row[i]["요약token"] + " "
            # grid에는 초록 안쓰므로 nlp_raw에 저장하고 바로 제거 - row는 list of dictionaries 형태임
            del row[i]["요약token"]

            # matrix는 출원일자, 출원인1, ipc요약, 요약token만 사용
            mtx_raw[i]['출원일자'] = mtx_raw[i]['출원일자'][:-4]
            del mtx_raw[i]["등록사항"]
            del mtx_raw[i]["발명의명칭(국문)"]
            del mtx_raw[i]["발명의명칭(영문)"]
            del mtx_raw[i]["출원인코드1"]
            del mtx_raw[i]["출원인국가코드1"]
            del mtx_raw[i]["발명자1"]
            del mtx_raw[i]["발명자국가코드1"]
            del mtx_raw[i]["등록일자"]
            del mtx_raw[i]["공개일자"]
            # del mtx_raw[i][:4]
            # del mtx_raw[i][6:12]

        if nlp_raw.endswith(" "):
            nlp_raw = nlp_raw[:-1]
    else:  # 결과값 없을 때 처리
        row = []

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
    elif mode == "nlp":
        return nlp_raw
    elif mode == "matrix":
        return mtx_raw


def parse_keywords(keyword="", fieldName=""):
    """ keyword를 split 해서 순열로 like query 생성 """

    #####################################################
    # and(;)로 split -> split한 값에 or(+)가 있으면 또 split
    #####################################################

    # A;B :
    # "F" like '%A%' and "F" like '%B%' 기본
    # "F like '%A%B%" or F like '%B%A%' 순열형식 - 기본보다 빠름

    # A+B :
    # "F" like '%A%' or "F" like '%B%'

    # A+B;C :
    # "F" like '%A%' or ("F" like '%B%' and "F" like '%C%')

    # A;B+C :
    # "F" like '%A%' and ("F" like '%B%' or "F" like '%C%')

    # 1. keyword 전체 split
    # 2. ;, + 가 아니면 키워드
    # >>> re.split('(\W+)', 'Words, words, words.')
    # ['Words', ', ', 'words', ', ', 'words', '.', '']

    # ['하이', ';', '자전거']

    # 하이;자전거
    # "초록" like '%하이%자전거%' or "초록" like '%자전거%하이%'

    # 하이+자전거
    # "초록" like '%하이%' or "초록" like '%자전거%'

    # (하이+전기);자전거
    # "초록" like '%하이%자전거%' or "초록" like '%자전거%하이%' or "초록" like '%전기%자전거%' or "초록" like '%자전거%전기%'

    if keyword and keyword != "":
        # permutations으로 전체 쿼리 작성
        items = []
        mylength = 1
        for val in re.split("(\\W+)", keyword):  # not a word (\w)
            if "*" in val:
                mylength = mylength + 1
            elif not "+" in val:
                items.append(val)
        result = list(map("%".join, permutations(items, mylength)))

        # 전체 쿼리에서 + operator로 묶인 조합 제외하기
        for val in keyword.split(";"):
            items = []
            omitResult = []
            if "+" in val:
                for v in val.split("+"):
                    if not "+" in v:
                        items.append(v)
                omitResult = list(
                    map("%".join, permutations(items, mylength))
                )  # mylength는 전체 조합 값에서 상속
                result = [item for item in result if item not in omitResult]

        res = ""
        for k in result:
            res += '"' + fieldName + "\" like '%" + k + "%' or "

        if res.endswith(" or "):
            res = res[:-4]
    else:
        res = ""
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
    for val in re.split(r' and | or ', keyword):  # and | or
        val = val.replace("_", " ")
        if "not " in val or "-" in val:  # collect negative word
            val = val.replace("-", "").replace("not ", "")
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


def parse_Others(dateType, startDate, endDate, status, ipType):
    res = ""
    if dateType:
        if dateType == 'PRD':
            dateType = '우선권주장출원일자1'
        elif dateType == 'PD':
            dateType = '공개일자'
        elif dateType == 'FD':
            dateType = '등록일자'
        else:  # AD or else
            dateType = '출원일자'

        if startDate and endDate:
            # res = " and ('["+ startDate+ ","+ endDate+ "]'::daterange @> "+ dateType+ ")"
            res = (
                dateType
                + " >= '"
                + startDate
                + "' and "
                + dateType
                + " <= '"
                + endDate
                + "' and "
            )
        elif startDate:
            res = dateType + " >= '" + startDate + "' and "
        elif endDate:
            res = dateType + " <= '" + endDate + "' and "
        else:
            res = ""
    if status:
        res += " 등록사항 = '" + ("공개" if status == "출원" else status) + "' and "
    if ipType:
        if ipType == "특허":
            res += " cast(출원번호 as text) LIKE '1%' and "
        if ipType == "실용신안":
            res += " cast(출원번호 as text) LIKE '2%' and "
    if res.endswith(" and "):
        res = res[:-5]

    return res


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
            if val.startswith("(@") or val.endswith(".AP") or val.endswith(".INV") or val.endswith(".CRTY") or val.endswith(").LANG") or val.endswith(").STAT") or val.endswith(").TYPE"):
                continue
            strKeyword += "("  # not add paranthesis when above terms
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
            if ' adj' in val:
                s = val[val.find("adj")+3:].split()[0]
                if s.isnumeric():
                    delimiter = "<" + s + ">"
                    val = val.replace(s, "")
                else:
                    delimiter = "<1>"

                val = val.replace("adj", delimiter)
            # A or B near C
            # A near B or C
            # A or B near C or D near E or F
            strNear = ""
            if ' near' in val:
                for v in re.split(" or ", val, flags=re.IGNORECASE):
                    # remove possible parenthesis
                    v = re.sub('[()]', '', v)
                    if ' near' in v:
                        s = v[v.find("near")+4:].split()[0]
                        if s.isnumeric():
                            delimiter = "<" + s + ">"
                            v = v.replace(s, "")
                        else:
                            delimiter = "<1>"

                        v = v.replace("near", delimiter)
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

    # return HttpResponse(strKeyword, content_type="text/plain; charset=utf-8")


def parse_query(request):
    """ 쿼리 확인용 """
    return HttpResponse(parse_searchs(request, mode="query"), content_type="text/plain; charset=utf-8")

# def kr_taged(rawdata=""):
#     """ 형태소 처리 """
#     ####### 불용어 불러오기 {
#     # 불용어 stopwords.txt
#     # my_path = os.path.abspath(os.path.dirname(__file__))
#     # path = os.path.join(my_path, "../extract/stopwords.txt")
#     # text_data = []
#     # with open(path, "r") as f:
#     #     for line in f:
#     #         line = line.split()
#     #         text_data.append(line[0])
#     # stopword1 = json.dumps(text_data, ensure_ascii=False)

#     # 불용어 ko.json
#     # path = os.path.join(my_path, "../extract/ko.json")
#     # text_data = []
#     # with open(path, "r") as f:
#     #     text_data = json.load(f)

#     # stopword2 = json.dumps(text_data, ensure_ascii=False)

#     # merge
#     # stopwords = stopword1 # + stopword2

#     # return HttpResponse(stopwords)

#     ####### 불용어 불러오기 }

#     taged_docs = []
#     # hannanum = Hannanum()
#     # kkma = Kkma()
#     mecab = Mecab()
#     # nori = KoreanAnalyzer(
#     #     decompound_mode="MIXED",
#     #     discard_punctuation=True,
#     #     output_unknown_unigrams=True,
#     #     pos_filter=False,
#     #     stop_tags=["JKS", "JKB", "VV", "EF"],
#     # )

#     for d in rawdata:
#         if d and not type(d) == float:
#             raw = d.lower().decode("utf-8")
#             # noun_docs = raw.split(' ') #어절단위 구분
#             # noun_docs = kkma.morphs(raw)  # 모든품사
#             # noun_docs = mecab.morphs(raw)  # 모든품사
#             noun_docs = mecab.nouns(raw)  # 명사
#             # result = nori.do_analysis(raw)
#             # noun_docs = result["termAtt"]
#             # noun_docs = mecab.nouns(raw)  # 모든품사
#             # noun_docs = kkma.nouns(raw) # 명사
#             ## tuple
#             # taged_docs = (
#             #     i for i in noun_docs if not i in stopwords and not len(i) == 1
#             # )

#             ## dict
#             tuple_taged_docs = [
#                 i for i in noun_docs # if not i in stopwords  # and not len(i) == 0
#             ]
#             taged_docs.append(tuple_taged_docs)
#     return tuple_taged_docs


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


# NNG,NNP명사, SY기호, SL외국어, SH한자, UNKNOW (외래어일 가능성있음)
def tokenizer(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
    mecab = Mecab()
    STOPWORDS = getattr(settings, 'STOPWORDS', DEFAULT_TIMEOUT)
    try:
        return [
            word
            for word, tag in mecab.pos(raw) if len(word) > 1 and tag in pos and word not in STOPWORDS
            # if len(word) > 1 and tag in pos and word not in stopword
            # if tag in pos
            # and not type(word) == float
        ]
    except:
        return []

    # # source = requests.get('http://kpat.kipris.or.kr/kpat/thsrs.do?s_flag=2&thsrs_srch=').text

    # keyword = urllib.parse.quote_plus(urllib.parse.quote_plus(keyword))
    # # source = requests.get('http://kpat.kipris.or.kr/kpat/thsrs.do?thsrs_srch=%25ED%2595%2598%25EC%259D%25B4%25EB%25B8%258C%25EB%25A6%25AC%25EB%2593%259C&s_flag=2').text
    # source = requests.get(
    #     "http://kpat.kipris.or.kr/kpat/thsrs.do?thsrs_srch=" + keyword + "&s_flag=2"
    # ).text

    # soup = BeautifulSoup(source, "lxml")

    # _content = soup.find_all("table")
    # content = str(_content)
    # content = content.replace("<table", "<table id='table-modal'")
    # content = content.replace("tstyle_list txt_left", "table table-sm")
    # content = content.replace("thsrs_str", "e_str")
    # content = content.replace("&amp;", "&")
    # # content = re.sub(r'<caption>(.+?)</caption>', '', content)
    # content = re.sub(r"<caption>[^<]*\s[^<]*</caption>", "", content)
    # return HttpResponse(content)
    # # return content


# def parse_search_arr(request, keyword):
#     keyword = urllib.parse.quote_plus(urllib.parse.quote_plus(keyword))
#     # source = requests.get('http://kpat.kipris.or.kr/kpat/thsrs.do?thsrs_srch=%25ED%2595%2598%25EC%259D%25B4%25EB%25B8%258C%25EB%25A6%25AC%25EB%2593%259C&s_flag=2').text
#     source = requests.get(
#         "http://kpat.kipris.or.kr/kpat/thsrs.do?thsrs_srch=" + keyword + "&s_flag=2"
#     ).text

#     soup = BeautifulSoup(source, "lxml")

#     table = soup.find("table")
#     table_rows = table.find_all("tr")

#     res = []
#     for tr in table_rows:
#         td = tr.find_all("td")
#         row = [
#             tr.text.strip().lower()
#             for tr in td
#             if tr.text.strip() and tr.text.strip() != "&nbsp"
#         ]
#         if row:
#             res.extend(row)
#     # 중복 제거
#     unique_list = list(OrderedDict(zip(res, repeat(None))))

#     # return HttpResponse(res, content_type="application/json")
#     # return JsonResponse(res, safe=False)
#     return JsonResponse(
#         sorted(sorted(unique_list), key=lambda c: 0 if re.search("[ㄱ-힣]", c) else 1),
#         safe=False,
#     )  # 한글 먼저

# def parse_searchs(request, keyword=""):
#     with connection.cursor() as cursor:

#         # keyword를 쿼리 형태로 parse ; like 방식
#         # myWhere = parse_keywords(keyword, "출원인1")
#         # myWhere2 = parse_keywords(keyword, "초록")

#         # to_tsquery 형태로 parse
#         myWhere = tsquery_keywords(keyword, "출원인1")
#         myWhere2 = tsquery_keywords(keyword, "전문소")

#         cursor.execute(
#             "SET work_mem to '100MB';"
#             + "SELECT 등록사항, \"발명의명칭(국문)\", 출원번호, 출원일자, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일자, 공개일자, ipc요약, regexp_replace(초록, E'<[^>]+>', '', 'gi') 초록 FROM 공개공보 WHERE "
#             + myWhere
#             + " or "
#             + myWhere2
#             # + " or "
#             # + whereInventor
#             # + ' and (등록사항 <> ALL (\'{"소멸","거절","취하"}\'::varchar[]))'
#             # + " GROUP BY 특허고객대표번호"
#             # + " order by 출원번호 DESC"
#             # + " limit 1000"
#         )

#         # cursor.execute(
#         #     "SELECT 특허고객대표번호, 출원인대표명, 출원인영문대표명 FROM 출원인대표명 WHERE 출원인명::text like concat('%',%s,'%');",
#         #     [keyword],
#         # )
#         # row = cursor.fetchall()

#         row = dictfetchall(cursor)

#         # rawdata = json.dumps(row, ensure_ascii=False)
#     # return HttpResponse(myWhere, content_type="text/plain; charset=utf-8")

#     # 결과값 없을 때 처리
#     if row:
#         # 초록부분만 DB 저장
#         ids = [y["초록"] for y in row]
#         nlp_raw = kr_taged(HttpResponse(ids))
#         nlp_raw = json.dumps(nlp_raw, ensure_ascii=False)

#         # memory 절약을 위해 10번째 초록부분만 제외 - row는 list of dictionaries 형태임
#         for i in range(len(row)):
#             del row[i]["초록"]
#     else:
#         nlp_raw = ""
#         row = []

#     # "API검색저장"에 기록
#     with connection.cursor() as cursor:
#         cursor.execute(
#             # 'WITH SLELECTED AS (SELECT keyword FROM "API검색저장") INSERT INTO "API검색저장" (keyword, content) SELECT $$' + keyword + '$$, $$' + content + '$$ WHERE NOT EXISTS (SELECT * FROM SELECTED)'
#             'INSERT INTO "API검색저장" (params, content) values ($$'
#             + keyword
#             + "$$, "
#             + ("$$" + nlp_raw + "$$" if nlp_raw else "$$[]$$")
#             + ") ON CONFLICT (params) DO NOTHING;"
#         )

#     # return HttpResponse(row, content_type="text/plain; charset=utf-8")
#     return JsonResponse(row, safe=False)
