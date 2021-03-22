from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
import re
from itertools import permutations
import operator
import json
from collections import defaultdict, Counter

from utils import get_redis_key, dictfetchall, remove_duplicates, tokenizer, tokenizer_phrase, remove_punc, remove_brackets, remove_tags, remove_tail, frequency_count, sampling

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

    mainKey, subKey, params, subParams = get_redis_key(request)

    context = cache.get(mainKey)
    context_paging = cache.get(subKey)

    redis_map = { 
        'begin' : 'raw',
        'nlp' : 'nlp_raw',
        'matrix' : 'mtx_raw',
        'indicator' : 'ind_raw',
        'visualNum' : 'visualNum',
        'visualClassify' : 'visualClassify',
        'visualIpc' : 'visualIpc',
        'visualPerson' : 'visualPerson',
    }

    try: 
        if context and context[redis_map[mode]]:
            return context[redis_map[mode]]
        if context_paging and context_paging[redis_map[mode]]:
            return context_paging[redis_map[mode]]                    
    except (KeyError, NameError, UnboundLocalError):
        pass

    def make_paging_rows():
        try:
            rowsCount = rows[0]["cnt"]
        except IndexError:        
            rowsCount = 0

        # foo = [dict() for x in range(len(data))]
        for i in range(len(rows)):
            result[i]['id'] = rows[i]['출원번호'] # add id key for FE's ids
            for key in ['출원번호','출원일','등록사항','발명의명칭','출원인1','발명자1','ipc코드']:
                result[i][key] = rows[i][key]

        # Add offset limit
        offset = pageIndex * pageSize
        limit = pageSize

        return { 'rowsCount': rowsCount, 'rows': sampling(result, offset, limit)}

    def make_orderby_clause():
        if not sortBy:
            return ''

        result =' order by '
        for s in sortBy:
            result += s['_id']
            result += ' ASC, ' if s['desc'] else ' DESC, '
        result = remove_tail(result,", ")
        return result

    def make_vis_num():
        ''' visual application number '''
        if not rows:
            return { 'mode' : 'visualNum', 'entities' : [{ 'data' : [], 'labels' : []}]}        
        # rows = [dict() for x in range(len(data))]
        for i in range(len(rows)):
            result[i]['출원일'] = str(rows[i]['출원일'])[:-4]
            result[i]['등록일'] = str(rows[i]['등록일'])[:-4]
            result[i]['구분'] = str(rows[i]['출원번호'])[0]

        def make_each_category_dict(flag):
            if flag:
                foo = [i[key] for i in result if i[key] and i['구분'] == flag]
            else:            
                foo = [i[key] for i in result if i[key]]
            bar = frequency_count(foo)        
            labels = [key for key in sorted(bar)]
            data = [bar[key] for key in sorted(bar)]  
            return { 'labels': labels, 'data' : data }         

        key = '출원일'
        PU = make_each_category_dict(flag=None)
        PP = make_each_category_dict(flag='1')
        UP = make_each_category_dict(flag='2')
        key = '등록일'
        PR = make_each_category_dict(flag='1')
        UR = make_each_category_dict(flag='2')    

        entities = [ PU, PP, UP, PR, UR ]
        res = { 'mode' : 'visualNum', 'entities' : entities }
        return res


    # { A01K 13/00: 1, A01K 67/027: 9, A01K 67/033: 1, ...}
    #  [{ name: '', value: 0 }],
    # {data: [11, 1, 7, …], labels: ["A01K", …}

    def make_vis_ipc():
        ''' visual ipc '''
        def make_dic_to_list_of_dic(baz):
            try:
                return { 'name' : list(baz.keys()), 'value' : list(baz.values())}
            except AttributeError:
                return { 'name' : [], 'value' : []}

        foo = [i['ipc코드'][0:4] for i in rows if i['ipc코드']]
        bar = frequency_count(foo,20)
        entities = [make_dic_to_list_of_dic(bar)]
        result = { 'mode' : 'visualIpc', 'entities' : entities }
        return result    

    # [{출원인명: "바이랄테크놀로지스인코포레이티드", 건수: 1},{}]

    def make_vis_cla():
        ''' visual applicant classify '''

        visualClassify = subParams["menuOptions"]["tableOptions"]["visualClassify"]
        pageIndex = visualClassify.get('pageIndex', 0)
        pageSize = visualClassify.get('pageSize', 10)
        sortBy = visualClassify.get('sortBy', [])

        GOVERNMENT = settings.TERMS['APPLICANT_CLASSIFY']['GOVERNMENT']

        def classify_swap(x,c):
            if c == '4':
                return '개인'        
            if any(s in x for s in GOVERNMENT):    
                return '공공'        
            else:
                return '기업'

        def make_dic_to_list_of_dict_cla(bar):
            return [{ '출원인명' : k, '건수' : v} for k,v in bar.items()]          

        def make_each_table_rows(flag):
            foo = [i['이름'] for i in result if i['이름'] and i['구분'] == flag]
            bar = frequency_count(foo)
            baz = make_dic_to_list_of_dict_cla(bar)

            # Add sort by
            if sortBy:
                for s in sortBy:
                    reverse = True if s['desc'] else False
                    baz.sort(key=operator.itemgetter(s['_id']), reverse=reverse)

            # Add offset limit
            offset = pageIndex * pageSize
            limit = pageSize

            
            result_paging = sampling(baz, offset, limit)       

            return { 'rowsCount': len(bar), 'rows' : result_paging }                  
    
        # rows = [dict() for x in range(len(data))]
        for i in range(len(rows)):        
            name = str(rows[i]['출원인1'])
            code = str(rows[i]['출원인코드1'])[0]

            result[i]['이름'] = name
            result[i]['구분'] = classify_swap(name, code)

        G = make_each_table_rows(flag='공공')
        C = make_each_table_rows(flag='기업')
        P = make_each_table_rows(flag='개인')

        entities = [ G, C, P ]
        res = { 'mode' : 'visualClassify', 'entities' : entities }
        return res

    # {	출원인: { A: [{ name: '', value: '' }], B: [{ name: '', value: '' }] },
    #	발명자: { A: [{ name: '', value: '' }], B: [{ name: '', value: '' }] },
    # }

    def make_vis_per():
        ''' visual related person '''
        # relatedperson는 ['출원인1','출원인국가코드1','발명자1','발명자국가코드1] 만 사용
        
        NATIONALITY = settings.TERMS['NATIONALITY']

        entities = []
        def nat_swap(x):
            return NATIONALITY.get(x,x)

        def make_dic_to_list_of_dic(baz):
            try:
                return { 'name' : list(baz.keys()), 'value' : list(baz.values())}
            except AttributeError:
                return { 'name' : [], 'value' : []}

        # caller
        for key in ['출원인1','발명자1']:
            foo = [i[key] for i in rows if i[key]]
            bar = frequency_count(foo,20)
            entities.append(make_dic_to_list_of_dic(bar))        

        for key in ['출원인국가코드1','발명자국가코드1']:
            foo = [nat_swap(i[key]) for i in rows if i[key]]
            bar = frequency_count(foo,20)
            entities.append(make_dic_to_list_of_dic(bar))        

        result = { 'mode' : 'visualPerson', 'entities': entities }
        return result    

    def make_nlp_raw():
        # nlp는 요약, 청구항 만 사용
        for i in range(len(rows)):
            abstract = str(rows[i]['요약'])
            claim = str(rows[i]['청구항'])
            result[i]['요약'] = abstract
            result[i]['청구항'] = claim
            result[i]['요약·청구항'] = abstract + ' ' + claim
        return result        

    def make_mtx_raw():
        # matrix는 출원번호, 출원일, 출원인1, ipc코드, 요약, 청구항만 사용
        # result = [dict() for x in range(len(rows))]
        for i in range(len(rows)):
            result[i]['출원번호'] = rows[i]['출원번호']
            result[i]['출원일'] =  str(rows[i]['출원일'])[:-4]
            result[i]['출원인1'] = rows[i]['출원인1']
            result[i]['ipc코드'] = rows[i]['ipc코드']
            abstract = str(rows[i]['요약'])
            claim = str(rows[i]['청구항'])
            result[i]['요약'] = abstract
            result[i]['청구항'] = claim
            result[i]['요약·청구항'] = abstract + ' ' + claim      
        return result

    def make_ind_raw():
        # indicater는 ['출원번호','출원인코드1','출원인1','등록일'] 만 사용
        # result = [dict() for x in range(len(rows))]
        for i in range(len(rows)):
            for key in ['출원번호','출원인코드1','출원인1','등록일']:
                result[i][key] = rows[i][key]
        
        return [i for i in result if not (i['등록일'] == None)] # 등록건만
            



    # TODO: 검색범위 선택
    # try:
    #     if params['searchVolume'] == 'ALL':
    #         searchVolume = 'search'
    #     elif params['searchVolume'] == 'SUMA':
    #         searchVolume = 'search'
    #     elif params['searchVolume'] == 'SUM':
    #         searchVolume = 'search'
    # except:
    searchVolume = 'search'

    # 번호검색
    if 'searchNum' in params and params['searchNum']:
        # whereAll = ""
        whereAll = "num_search like '%" + \
            params['searchNum'].replace("-","") + "%'"

    
    # 키워드 검색
    else: 
        # to_tsquery 형태로 parse
    # result = f'"{fieldName}" @@ to_tsquery(\'{strKeyword}\')'
    # result += f' order by ts_rank("{fieldName}",to_tsquery(\'{strKeyword}\') desc'

        queryTextTerms = tsquery_keywords(params["searchText"], None, 'terms')
        whereTermsTerm = f'"{searchVolume}" @@ to_tsquery(\'{queryTextTerms}\')' if queryTextTerms else ""

        # orderClause = f' order by ts_rank("{searchVolume}",to_tsquery(\'{queryTextTerms}\')) desc '

        queryTextInventor = tsquery_keywords(params["inventor"], None, 'person')
        whereInventor = f'"발명자tsv" @@ to_tsquery(\'{queryTextInventor}\')' if queryTextInventor else ""

        queryTextAssignee = tsquery_keywords(params["assignee"], None, 'person')
        whereAssignee = f'"출원인tsv" @@ to_tsquery(\'{queryTextAssignee}\')' if queryTextAssignee else ""

        whereOther = get_Others(
            params["dateType"],
            params["startDate"],
            params["endDate"],
            params["status"],
            params["ipType"],
        )
        whereAll = whereTermsTerm + ("(" + whereInventor + ") and " if whereInventor else "") + (
            "(" + whereAssignee + ") and " if whereAssignee else "") + whereOther

        whereAll = remove_tail(whereAll," and ")

    # select count(*) over () as cnt, ts_rank(search,to_tsquery('예방&치료&진단')) AS rank, 등록사항, 발명의명칭, 출원번호, 출원일, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일, 공개일, ipc코드, 요약, 청구항 FROM kr_text_view WHERE (("search" @@ to_tsquery('예방&치료&진단')) and ("발명자tsv" @@ to_tsquery('조'))) order by ts_rank("search",to_tsquery('예방&치료&진단')) desc;-- offset 0 limit 10000;
    query = f'select count(*) over () as cnt, ts_rank("{searchVolume}",to_tsquery(\'{queryTextTerms}\')) AS rank, 등록사항, 발명의명칭, 출원번호, 출원일, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일, 공개일, ipc코드, 요약, 청구항 FROM kr_text_view WHERE ({whereAll})'
    if mode == "query":  # mode가 query면 여기서 분기
        return query

    mainTable = subParams["menuOptions"]["tableOptions"]["mainTable"]
    pageIndex = mainTable.get('pageIndex', 0)
    pageSize = mainTable.get('pageSize', 10)
    sortBy = mainTable.get('sortBy', [])

    # Add sort by
    query += make_orderby_clause()
                            
    with connection.cursor() as cursor:
        cursor.execute(
            "SET work_mem to '100MB';"
            + query
        )

        rows = dictfetchall(cursor)

    res = {}
    res_sub = {}

    result = [dict() for x in range(len(rows))]
    # if rows:
    res['nlp_raw'] = make_nlp_raw()
    res['mtx_raw'] = make_mtx_raw()
    res['ind_raw'] = make_ind_raw()
    res['visualNum'] = make_vis_num()
    res['visualIpc'] = make_vis_ipc()
    res['visualPerson'] = make_vis_per()

    result_paging = make_paging_rows()
    res_sub['raw'] = result_paging
    res_sub['visualClassify'] = make_vis_cla()
    # else:
    #     res['nlp_raw'] = []
    #     res['mtx_raw'] = []
    #     res['ind_raw'] = []
    #     res['visualNum'] = []
    #     res['visualIpc'] = []
    #     res['visualPerson'] = []

    #     result = { 'rowsCount': 0, 'rows': []} 
    #     res_sub['raw'] = result
    #     res_sub['visualClassify'] = { 'mode' : 'visualClassify', 'entities' : {} }
        
    # ''' 유사도 처리 '''
    # result=similarity(row)
    # return JsonResponse(result, safe=False)

    # redis 저장 {
    cache.set(mainKey, res, CACHE_TTL)
    cache.set(subKey, res_sub, CACHE_TTL)    

    # redis 저장 }

    if mode == "begin":
        return JsonResponse(result_paging, safe=False)
    if mode == "visualClassify":
        return res_sub[redis_map[mode]]
    return res[redis_map[mode]]


def get_nlp(request, analType):
    """ 쿼리 실행 및 결과 저장
        analType : wordCloud, matrix, keywords
        option : volume, unit, emergence 개별적용
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

    nlp_raw = get_searchs(request, mode="nlp")

    result = []

    # option
    foo = subParams['menuOptions'][analType + 'Options']
    volume = foo.get('volume','')
    unit = foo.get('unit','')
    emergence = foo.get('emergence','빈도수')

    nlp_list = [d[volume] for d in nlp_raw] # '요약·청구항', '요약', '청구항', 

    nlp_str = ' '.join(nlp_list) if nlp_list else None

    def phrase_frequncy_tokenizer():
        return tokenizer_phrase(nlp_str)

    def phrase_individual_tokenizer():
        for foo in nlp_list:
            bar = remove_duplicates(tokenizer_phrase(foo))
            result.extend(bar)
        return result            

    def word_frequncy_tokenizer():
        return tokenizer(nlp_str)

    def word_individual_tokenizer():
        for foo in nlp_list:
            bar = remove_duplicates(tokenizer(foo))
            result.extend(bar)
        return result            

    command = { '구문': { '빈도수':phrase_frequncy_tokenizer, '건수':phrase_individual_tokenizer }, '워드': { '빈도수' :word_frequncy_tokenizer, '건수':word_individual_tokenizer } }
    
    result = command[unit][emergence]()    

    # tokenizer
    # if unit == '구문':
    #     if emergence == '빈도수':            
    #         result = tokenizer_phrase(nlp_str)
    #     elif emergence =='건수':  
    #         for foo in nlp_list:
    #             bar = remove_duplicates(tokenizer_phrase(foo))
    #             result.extend(bar) 
    # elif unit == '워드':            
    #     if emergence == '빈도수':
    #         result = tokenizer(nlp_str)
    #     elif emergence =='건수':
    #         for foo in nlp_list:
    #             bar = remove_duplicates(tokenizer(foo))
    #             result.extend(bar)

    cache.set(newSubKey, { 'nlp_token' : result } , CACHE_TTL)

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

    result = remove_tail(result, " or ")

    # append collect negative word
    result2 = ""
    # if not notItems:
    temp2 = list(map("%".join, permutations(notItems, mylength)))

    for k in temp2:
        result2 += '"' + fieldName + "\" not like '%" + k + "%' and "

    result2 = remove_tail(result2, " and ")

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

            temp = remove_tail(temp, " or ")
            
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

            temp = remove_tail(temp, " or ")

            result += temp + ") and "

    return remove_tail(result, " and ")

def tsquery_keywords(keyword="", fieldName="", mode="terms"):

    if not keyword:
        return None    

    adjHaveOnlyZero='( adj[0]\d* )'
    adjOnly = '( adj )'
    adjZeroGroup = r'|'.join((adjHaveOnlyZero,adjOnly))
    adjHaveNumberExecptZero=r' adj([1-9]\d*) '
    adjSpace = r'(\([-!:*ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+) ([-!:*ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+\))'

    nearHaveNumberExecptZero = '([-!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+) near([1-9]\d*) ([-!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+)'
    nearHaveOnlyZero='([-!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+) near[0]\d* ([-!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+)'
    nearOnly='([-!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+) near ([-!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+)' 

    removeDate = r'( and \(\@AD.*\d{8}\))'
    removeAP = r'( and \([ -!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+\).AP)'
    removeINV = r'( and \([ -!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+\).INV)'
    removeGroup = r'|'.join((removeDate,removeAP,removeINV)) 

    def convert_symbols(v):
        result = v
        if v.startswith("-") or ' or -' in v:
            result = v.replace("-", "!")
        # convert nagative not to !
        if v.startswith("not ") or ' or not ' in v:
            result = v.replace("not ", "!")
        # convert wildcard * to :*
        if v.endswith("*") or '*' in v:
            result = v.replace("*", ":*")
        return result

    def re_sub(reg, to, val):
        return re.sub(reg, to, val, flags=re.IGNORECASE)

    def removeOuterParentheses(S: str) -> str:
        stack = []
        res = ''
        for i in range(len(S)):
            stack.append(S[i])
            if stack.count('(') == stack.count(')'):
                res+=''.join(stack[1:-1])
                stack = []
        if res == '':
            return S               
        return res

    def keepParantheses(v):
        pattern = re.compile("\||\<[\d+|-]\>")
        return re.search(pattern, v)

    if mode == 'terms':
        keyword = re_sub(removeGroup, r"", keyword)
    elif mode == 'person':
        keyword = re_sub(removeDate, r"", keyword)

    strKeyword = ''
    
    for v in re.split(" and ", keyword, flags=re.IGNORECASE):
        v = convert_symbols(v)
        v = re_sub(' or ', r"|", v)
        if '|' in v:
            v = removeOuterParentheses(v)
            strOr = '('
            for _v in re.split("\|", v):
                _v = re_sub(adjZeroGroup, r"<->", _v)
                _v = re_sub(adjHaveNumberExecptZero, r"<\1>", _v)
                _v = re_sub(nearHaveNumberExecptZero, r"(\1<\2>\3|\3<\2>\1)", _v)
                _v = re_sub(nearHaveOnlyZero, r"(\1<->\2|\2<->\1)", _v)
                _v = re_sub(nearOnly, r"(\1<->\2|\2<->\1)", _v)
                _v = re_sub(adjSpace, r"\1<->\2", _v)
                _v = removeOuterParentheses(_v) if not keepParantheses(_v) else _v
                _v = re_sub(' ', r"&", _v)
                strOr += ("".join(str(_v)) + "|")
            strOr = remove_tail(strOr,"|")
            strKeyword += ("".join(str(strOr)) + ")&")
        else:
            v = re_sub(adjZeroGroup, r"<->", v)
            v = re_sub(adjHaveNumberExecptZero, r"<\1>", v)
            v = re_sub(nearHaveNumberExecptZero, r"(\1<\2>\3|\3<\2>\1)", v)
            v = re_sub(nearHaveOnlyZero, r"(\1<->\2|\2<->\1)", v)
            v = re_sub(nearOnly, r"(\1<->\2|\2<->\1)", v)                            
    
            v = re_sub(adjSpace, r"\1<->\2", v)
            v = removeOuterParentheses(v) if not keepParantheses(v) else v
            v = re_sub(' ', r"&", v)
            strKeyword += ("".join(str(v)) + "&")

    strKeyword = remove_tail(strKeyword,"&")

    if not strKeyword:
        return None

    return strKeyword        

    # result = f'"{fieldName}" @@ to_tsquery(\'{strKeyword}\')'
    # result += f' order by ts_rank("{fieldName}",to_tsquery(\'{strKeyword}\') desc'
    # return result

def get_query(request):
    """ 쿼리 확인용 """
    return HttpResponse(get_searchs(request, mode="query"), content_type="text/plain; charset=utf-8")

# def sampling(selection, offset=0, limit=None):
#     """ apply offset limit """
#     return selection[offset:(limit + offset if limit is not None else None)]


