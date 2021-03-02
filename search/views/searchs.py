from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
import re
from itertools import permutations
from konlpy.tag import Mecab

from copy import deepcopy
import json


from ..utils import get_redis_key, dictfetchall, remove_tags, remove_brackets, remove_punc
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

def get_searchs(request, mode="begin"):
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

    elif mode == "classify":
        try:
            if context['cla_raw']:
                return context['cla_raw']
        except:
            pass


    with connection.cursor() as cursor:
        # 검색범위 선택
        try:
            if params['searchVolume'] == 'ALL':
                searchVolume = 'search'
            elif params['searchVolume'] == 'SUMA':
                searchVolume = 'search'
            elif params['searchVolume'] == 'SUM':
                searchVolume = 'search'
        except:
            searchVolume = 'search'

        # 번호검색
        if 'searchNum' in params and params['searchNum']:
            # whereAll = ""
            whereAll = "num_search like '%" + \
                params['searchNum'].replace("-","") + "%'"

        
        # 키워드 검색
        else: 
            # to_tsquery 형태로 parse
            whereTermsA = tsquery_keywords(
                params["searchText"], searchVolume, 'terms')

            # whereTermsB = like_where(params["searchText"], "출원인1")
            # 출원인 포함은 db 성능 개선하고 나중에
            # whereTermsAll = ("((" + whereTermsA + ") or " if whereTermsA else "") + ("("+ whereTermsB + ")) and " if whereTermsB else "")
            whereTermsAll = ("((" + whereTermsA + ")) and " if whereTermsA else "")

            # whereInventor = (
            #     like_where(params["inventor"],
            #                 "발명자tsv") if params["inventor"] else ""
            # )
            # whereAssignee = (
            #     like_where(params["assignee"],
            #                 "출원인tsv") if params["assignee"] else ""
            # )
            whereInventor = (
                tsquery_keywords(params["inventor"],
                            "발명자tsv", "person") if params["inventor"] else ""
            )
            whereAssignee = (
                tsquery_keywords(params["assignee"],
                            "출원인tsv", "person") if params["assignee"] else ""
            )
            whereOther = get_Others(
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
        query = 'select 등록사항, 발명의명칭, 출원번호, 출원일, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일, 공개일, ipc코드, 초록, 청구항 FROM kr_text_view WHERE (' + \
            whereAll + ")"
            
        # return HttpResponse(json.dumps(query, ensure_ascii=False))
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
    cla_raw = []
    dropKeysMatrix = ('등록사항', '발명의명칭', '출원인코드1', '출원인국가코드1', '발명자1', '발명자국가코드1', '등록일', '공개일')
    dropKeysIndicater = ('등록사항', '발명의명칭', '출원인국가코드1', '발명자1', '발명자국가코드1', '공개일자','ipc코드', '초록', '청구항')

    if row:
        # copy
        mtx_raw = deepcopy(row)
        ind_raw = deepcopy(row)

        # row and npl
        for i in range(len(row)):
            row[i]['id'] = row[i]['출원번호'] # add id key for FE's ids
            raw_abstract += row[i]["초록"] if row[i]["초록"] else "" + " "
            raw_claims += row[i]["청구항"] if row[i]["청구항"] else "" + " "                

            # 청구항과 초록은 raw_abstract,raw_claims에 넘겨줬으므로 바로 제거 - row는 list of dictionaries 형태임
            del row[i]["초록"]
            del row[i]["청구항"]

        # matrix
        for i in range(len(mtx_raw)):
            # matrix는 출원번호, 출원일자, 출원인1, ipc요약, 초록, 청구항만 사용
            for k in dropKeysMatrix:
                mtx_raw[i].pop(k, None)

            # 출원년만 사용
            mtx_raw[i]['출원일'] = mtx_raw[i]['출원일'][:-4]

        # indicator    
        for i in range(len(ind_raw)):
            # indicater는 ['출원번호','출원인코드1','출원인1','등록일자'] 만 사용
            for k in dropKeysIndicater:
                ind_raw[i].pop(k, None)
        ind_raw = [i for i in ind_raw if not (i['등록일'] == None)] # 등록건만

        # classify
        cla_raw = deepcopy(ind_raw)    
        for i in range(len(cla_raw)):
            # classify는 ['출원번호','출원인코드1','출원인1'] 만 사용
            cla_raw[i].pop('등록일', None)

    else:  # 결과값 없을 때 처리
        row = []

        
    # sampling_row =sampling(row, subParams['analysisOptions']['tableOptions']['pageIndex'], subParams['analysisOptions']['tableOptions']['pageSize'])
    # res = { 'entities' : sampling_row, 'dataCount' : len(row)}

    # ''' 유사도 처리 '''
    # result=similarity(row)
    # return JsonResponse(result, safe=False)


    # redis 저장 {
    new_context = {}
    new_context['mtx_raw'] = mtx_raw
    new_context['ind_raw'] = ind_raw
    new_context['cla_raw'] = cla_raw
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
    elif mode == "classify":
        return cla_raw

def get_nlp(request, analType):
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

    raw_abstract, raw_claims = get_searchs(request, mode="nlp")

    nlp_raw = ''
    result = ''

    analType = analType + 'Options'

    if subParams['analysisOptions'][analType]['volume'] == '요약':
        nlp_raw = raw_abstract
    elif subParams['analysisOptions'][analType]['volume'] == '청구항':
        nlp_raw = raw_claims        

    # tokenizer
    if subParams['analysisOptions'][analType]['unit'] == '구문':
        try:
            result = tokenizer_phrase(nlp_raw)
        except:
            result = []
    elif subParams['analysisOptions'][analType]['unit'] == '워드':            
        try:
            result = tokenizer(nlp_raw)
        except:
            result = []        

    new_sub_context = {}
    new_sub_context['nlp_token'] = result
    cache.set(newSubKey, new_sub_context, CACHE_TTL)

    return result

def like_where(keyword="", fieldName=""):
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

    result = ""
    for k in temp:
        result += '"' + fieldName + "\" like '%" + k + "%' or "

    if result.endswith(" or "):
        result = result[:-4]

    # append collect negative word
    result2 = ""
    # if not notItems:
    temp2 = list(map("%".join, permutations(notItems, mylength)))

    for k in temp2:
        result2 += '"' + fieldName + "\" not like '%" + k + "%' and "

    if result2.endswith(" and "):
        result2 = result2[:-5]

    # merge result
    if result:
        return ("(" + result + ") and " + result2) if result2 else result
    else:
        return result2 if result2 else ""

def get_Others(dateType, startDate, endDate, status, ipType):
    result = ""
    if dateType:
        if dateType == 'PRD':
            dateType = '우선권주장출원일1'
        elif dateType == 'PD':
            dateType = '공개일'
        elif dateType == 'FD':
            dateType = '등록일'
        else:  # AD or else
            dateType = '출원일'

        if startDate and endDate:
            # result = " and ('["+ startDate+ ","+ endDate+ "]'::daterange @> "+ dateType+ ")"
            result = (
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
            result = dateType + " >= '" + startDate + "' and "
        elif endDate:
            result = dateType + " <= '" + endDate + "' and "
        else:
            result = ""
    if status:
        if status != '전체':
            temp = " ("
            for k in re.split(r' and | or ', status): # 출원 or 공개 ...
                temp += "등록사항 ='" + k + "' or "
            if temp.endswith(" or "):
                temp = temp[:-4]
            
            # result += " 등록사항 = '" + ("공개" if status == "출원" else status) + "' and "
            result += temp + ") and "
    # if ipType:
    #     if ipType == "특허":
    #         res += " cast(출원번호 as text) LIKE '1%' and "
    #     if ipType == "실용신안":
    #         res += " cast(출원번호 as text) LIKE '2%' and "            
    if ipType:
        if ipType != '전체':
            temp = " ("
            # 등록db가 없으므로 공개로 통일
            if "특허" in ipType:
                temp += "cast(출원번호 as text) LIKE '1%' or "
            if "실용" in ipType:
                temp += "cast(출원번호 as text) LIKE '2%' or "
            if temp.endswith(" or "):
                temp = temp[:-4]

            result += temp + ") and "

    if result.endswith(" and "):
        result = result[:-5]

    return result

def tsquery_keywords(keyword="", fieldName="", mode="terms"):
    """ keyword 변환 => and, or, _, -, not, near, adj 를 tsquery 형식의 | & ! <1> 로 변경 """
    # A+B;C_D => '("A" | "B") & "C D"'
    # A or -B and C_D and not E => '(A !B) & "C D" & !E'
    if keyword and keyword != "":
        needPlainto = ""
        strKeyword = ""  # unquote(keyword) # ; issue fix

        # for val in keyword.split(" AND "):
        for val in re.split(" and ", keyword, flags=re.IGNORECASE):  # case insentitive
            # continue if not terms
            if mode == 'terms':
                if val.startswith("(@") or val.endswith(".AP") or val.endswith(".INV") or val.endswith(".CRTY") or val.endswith(").LANG") or val.endswith(").STAT") or val.endswith(").TYPE"):
                    continue
            elif mode == 'person':
                if val.startswith("(@") or val.endswith(".CRTY") or val.endswith(").LANG") or val.endswith(").STAT") or val.endswith(").TYPE"):
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
        if not strKeyword:
            return None
        #  전문소 @@ plainto_tsquery('(A | B) & C')
        tsqueryType = "plainto_tsquery" if needPlainto else "to_tsquery"
        result = '"' + fieldName + "\" @@ " + \
            tsqueryType + "('" + strKeyword + "')"
        # result = '"' + fieldName + "\" @@ " + \
        #     "to_tsquery('" + strKeyword + "')"
        # result += ' or "' + fieldName + "\" @@ " + \
        #     "plainto_tsquery('" + strKeyword + "')"             
    else:
        result = None
    return result

def get_query(request):
    """ 쿼리 확인용 """
    return HttpResponse(get_searchs(request, mode="query"), content_type="text/plain; charset=utf-8")

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
    result = []
    for word, tag in mecab.pos(raw[:raw_len_limit]):
        if tag in pos:
            if word not in STOPWORDS: # and len(word) > 1:
                saving = saving + '_' + word if saving and close else word
                close=True
        else:
            close= False
            if saving:
                if '_' in saving and saving not in STOPWORDS_PHRASE:
                    result.append(saving)            
                saving = ''
    return result      

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

