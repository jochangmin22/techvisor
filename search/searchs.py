from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
import re
from itertools import permutations
from konlpy.tag import Mecab

from copy import deepcopy
import json


from .utils import get_redis_key, dictfetchall, remove_tags, remove_brackets, remove_punc
# from .similarity import similarity

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

# from urllib.parse import unquote
# TODO: pynori 성능 확인필요
# from pynori.korean_analyzer import KoreanAnalyzer

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

def parse_searchs(request, mode="begin"):
    """ 쿼리 실행 및 결과 저장
        mode : begin, nlp, query, matrix, indicator
    """

    mainKey, _, params, _ = get_redis_key(request)

    context = cache.get(mainKey)

    if mode == "begin":
        try:
            if context['raw']:
                return JsonResponse(context['raw'], safe=False)
        except:
            pass

    elif mode == "nlp":
        try:
            if context['raw_abstract'] and context['raw_claims']:
                return context['raw_abstract'], context['raw_claims']
        except:
            pass

    elif mode == "matrix":
        try:
            if context['mtx_raw']:
                return context['mtx_raw']
        except:
            pass

    elif mode == "indicator":
        try:
            if context['ind_raw']:
                return context['ind_raw']
        except:
            pass


    with connection.cursor() as cursor:
        # 검색범위 선택
        try:
            if params['searchVolume'] == 'ALL':
                searchVolume = '대'
            elif params['searchVolume'] == 'SUMA':
                searchVolume = '중'
            elif params['searchVolume'] == 'SUM':
                searchVolume = '소'
        except:
            searchVolume = '소'

        # 번호검색
        if 'searchNum' in params and params['searchNum']:
            whereAll = ""
            # fields without "-"
            for value in ["출원번호", "공개번호", "등록번호"]:
                whereAll += value + "::text like '%" + \
                    params["searchNum"].replace("-","") + "%' or "

            # TODO : hyphen refine
            # fields with "-"
            for value in ["우선권주장출원번호1", "우선권주장출원번호2", "우선권주장출원번호3", "우선권주장출원번호4", "우선권주장출원번호5", "우선권주장출원번호6", "우선권주장출원번호7", "우선권주장출원번호8", "우선권주장출원번호9", "우선권주장출원번호10"]:
                whereAll += value + "::text like '%" + \
                    params["searchNum"] + "%' or "
            if whereAll.endswith(" or "):
                whereAll = whereAll[:-4]            
        # 키워드 검색
        else: 
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
            whereAll = whereTermsAll + ("(" + whereInventor + ") and " if whereInventor else "") + (
                "(" + whereAssignee + ") and " if whereAssignee else "") + whereOther
            if whereAll.endswith(" and "):
                whereAll = whereAll[:-5]                  

        query = 'SELECT 등록사항, "발명의명칭(국문)", "발명의명칭(영문)", 출원번호, 출원일자, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일자, 공개일자, ipc요약, 요약token, 전체항token FROM 공개공보 WHERE (' + \
            whereAll + ")"

        if mode == "query":  # mode가 query면 여기서 분기
            return query

        cursor.execute(
            "SET work_mem to '100MB';"
            + query
        )
        row = dictfetchall(cursor)

    

    raw_abstract = ''
    raw_claims = ''
    mtx_raw = []
    ind_raw = []
    dropKeysMatrix = ('등록사항', '발명의명칭(국문)', '발명의명칭(영문)', '출원인코드1', '출원인국가코드1', '발명자1', '발명자국가코드1', '등록일자', '공개일자')
    dropKeysIndicater = ('등록사항', '발명의명칭(국문)', '발명의명칭(영문)', '출원인국가코드1', '발명자1', '발명자국가코드1', '공개일자','ipc요약', '요약token', '전체항token')

    if row:
        # copy
        mtx_raw = deepcopy(row)
        ind_raw = deepcopy(row)

        # npl and mtx parse
        for i in range(len(row)):
<<<<<<< HEAD
            row[i]['id'] = row[i]['출원번호'] # add id key for FE's ids
=======
            row[i]['id'] = row[i]['출원번호'] # add id for FE's ids
>>>>>>> 23aec19... Modify the crawler to work in crontab
            raw_abstract += row[i]["요약token"] if row[i]["요약token"] else "" + " "
            raw_claims += row[i]["전체항token"] if row[i]["전체항token"] else "" + " "                

            # 전체항token과 요약token은 raw_abstract,raw_claims에 넘겨줬으므로 바로 제거 - row는 list of dictionaries 형태임
            del row[i]["요약token"]
            del row[i]["전체항token"]

            # matrix는 출원번호, 출원일자, 출원인1, ipc요약, 요약token, 전체항token만 사용
            for k in dropKeysMatrix:
                mtx_raw[i].pop(k, None)

            # 출원년만 사용
            mtx_raw[i]['출원일자'] = mtx_raw[i]['출원일자'][:-4]

            # indicater는 ['출원번호','출원인코드1','등록일자','출원인1'] 만 사용
            for k in dropKeysIndicater:
                ind_raw[i].pop(k, None)

    else:  # 결과값 없을 때 처리
        row = []

    # if mtx_raw:
    #    for i in mtx_raw:
    #        mtx_raw[i]['출원일자'] = mtx_raw[i]['출원일자'][:-4]
        
    if ind_raw:
        ind_raw = [i for i in ind_raw if not (i['등록일자'] == None)] # 등록건만

    # sampling_row =sampling(row, subParams['analysisOptions']['tableOptions']['pageIndex'], subParams['analysisOptions']['tableOptions']['pageSize'])
    # res = { 'entities' : sampling_row, 'dataCount' : len(row)}

    # ''' 유사도 처리 '''
    # result=similarity(row)
    # return JsonResponse(result, safe=False)


    # redis 저장 {
    new_context = {}
    new_context['mtx_raw'] = mtx_raw
    new_context['ind_raw'] = ind_raw
    new_context['raw'] = row
    # new_context['raw_fetch'] = res
    new_context['raw_abstract'] = raw_abstract
    new_context['raw_claims'] = raw_claims
    cache.set(mainKey, new_context, CACHE_TTL)
    # redis 저장 }

    if mode == "begin":
        return JsonResponse(row, safe=False)
    elif mode == "nlp":
        return raw_abstract, raw_claims
    elif mode == "matrix":
        return mtx_raw          
    elif mode == "indicator":
        return ind_raw

def parse_nlp(request, analType):
    """ 쿼리 실행 및 결과 저장
        analType : wordCloud, matrix, keywords
    """

    _, subKey, _, subParams = get_redis_key(request)

    #### Create a new SubKey to distinguish each analysis type 
    newSubKey = subKey + '¶' + analType

    sub_context = cache.get(newSubKey)

    try:
        if sub_context['nlp_token']:
            return sub_context['nlp_token']
    except:
        pass

    raw_abstract, raw_claims = parse_searchs(request, mode="nlp")

    nlp_raw = ''
    nlp_token = ''

    analType = analType + 'Options'

    if subParams['analysisOptions'][analType]['volume'] == '요약':
        nlp_raw = raw_abstract
    elif subParams['analysisOptions'][analType]['volume'] == '청구항':
        nlp_raw = raw_claims        

    # tokenizer
    if subParams['analysisOptions'][analType]['unit'] == '구문':
        try:
            nlp_token = tokenizer_phrase(nlp_raw)
        except:
            nlp_token = []
    elif subParams['analysisOptions'][analType]['unit'] == '워드':            
        try:
            nlp_token = tokenizer(nlp_raw)
        except:
            nlp_token = []        

    new_sub_context = {}
    new_sub_context['nlp_token'] = nlp_token
    cache.set(newSubKey, new_sub_context, CACHE_TTL)

    return nlp_token

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

def parse_query(request):
    """ 쿼리 확인용 """
    return HttpResponse(parse_searchs(request, mode="query"), content_type="text/plain; charset=utf-8")

raw_len_limit = 20000

# NNG,NNP명사, SY기호, SL외국어, SH한자, UNKNOW (외래어일 가능성있음)
def tokenizer(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
    ''' raw token화 (raw_len_limit 단어 길이로 제한; 넘으면 mecab error)'''    
    raw = remove_punc(remove_brackets(remove_tags(raw)))    
    mecab = Mecab()
    STOPWORDS = settings.TERMS['STOPWORDS']
    try:
        return [
            word
            for word, tag in mecab.pos(raw[:raw_len_limit]) if tag in pos and word not in STOPWORDS # and len(word) > 1
            # if len(word) > 1 and tag in pos and word not in stopword
            # if tag in pos
            # and not type(word) == float
        ]
    except:
        return []

def tokenizer_phrase(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
    ''' raw token화 (raw_len_limit 단어 길이로 제한; 넘으면 mecab error)'''
    raw = remove_punc(remove_brackets(remove_tags(raw)))
    mecab = Mecab()

    STOPWORDS = settings.TERMS['STOPWORDS']
    STOPWORDS_PHRASE = settings.TERMS['STOPWORDS_PHRASE']

    saving = ''
    close = None
    raw_list = []
    for word, tag in mecab.pos(raw[:raw_len_limit]):
        if tag in pos:
            if word not in STOPWORDS: # and len(word) > 1:
                saving = saving + '_' + word if saving and close else word
                close=True
        else:
            close= False
            if saving:
                if '_' in saving and saving not in STOPWORDS_PHRASE:
                    raw_list.append(saving)            
                saving = ''
    return raw_list      

def tokenizer_pos(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
    mecab = Mecab()
    STOPWORDS = settings.TERMS['STOPWORDS']
    try:
        return [
            word
            for word, tag in mecab.pos(raw) if len(word) > 1 and word not in STOPWORDS
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
