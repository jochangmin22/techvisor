from django.db import connection
from collections import Counter
from django.http import JsonResponse, HttpResponse
from ..utils import get_redis_key, dictfetchall, tokenizer, tokenizer_phrase, remove_tail
import json
import re

from .searchs import get_searchs, get_nlp

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)


def get_matrix(request):
    """ 
    토픽에 대한 국가별, 연도별, 기술별, 기업별 매트릭스
    1. topic, mtx_row 가져옴
    2. mtx_row [요약·청구항] 에 각 topic이 포함되는 [연도별, 기술별, 기업별] 횟수 list
    """

    _, subKey, _, subParams = get_redis_key(request)

    # Redis {
    sub_context = cache.get(subKey)    

    try:
        if sub_context['matrix']:
            return JsonResponse(sub_context['matrix'], safe=False)
    except:
        pass        
    # Redis }
    foo = subParams['menuOptions']['matrixOptions']
    category = foo.get('category','') # 연도별, 기술별, 기업별
    targetField = foo.get('volume','') # '요약', '청구항'
    # unit = foo.get('unit','') # '구분', '워드'
    output = foo.get('output','') # 20, 50, ...

    nlp_token = get_nlp(request, analType="matrix")

    # topic 가져오기
    topics = get_topic(nlp_token, output)

    if category == '연도별':
        countField = '출원일'
    elif category == '기술별':
        countField = 'ipc코드'
    elif category == '기업별':
        countField = '출원인1'


    mtx_raw = get_searchs(request, mode="matrix")

    ### mtx_raw의 [요약/청구항/요약·청구항]에서 topics N (output) 이 포함되는 [출원일, ipc코드, 출원인1] count 
    # 참고: mtx_raw는 출원번호, 출원일(년), 출원인1, ipc코드, 요약, 청구항, 요약·청구항 로 구성

    mlist = []  # list of dic
    all_list = {}  # dic of list of dic
    matrixMax = 0
    xData = []
    yData = []
    try:
        for j in range(len(topics)):  # topic 20
            topic = topics[j].replace("_"," ")
            temp = [d for d in mtx_raw if topic in d[targetField]]
            temp2 = Counter(c[countField] for c in temp)
            max_value = max(list(temp2.values()), default=0)
            matrixMax = max_value if matrixMax < max_value else matrixMax
            mlist.append(temp2)
            _yData = list(set().union(*mlist))
            yData = list(set(yData + _yData))
            all_list[topic] = mlist
            mlist = []
    except:
        pass

    xData = list(set().union(all_list.keys()))
    yData.sort(reverse=True)
    yData = yData[:15]

    res =  {"entities": all_list, "max": matrixMax, "xData": xData, "yData" : yData}

    # Redis {
    try:
        sub_context['matrix'] = res
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }

    return JsonResponse(res, safe=False)

def get_matrix_dialog(request):
    """ 
    전체목록에서 3가지 필터 (topic, category, category value)
    """

    _, subKey, params, subParams = get_redis_key(request)

    # Redis {
    sub_context = cache.get(subKey)    

    try:
        if sub_context['matrix_dialog']:
            return JsonResponse(sub_context['matrix_dialog'], safe=False)
    except:
        pass        
    # Redis }

    foo = subParams['menuOptions']['matrixOptions']
    category = foo.get('category','') # 연도별, 기술별, 기업별
    targetField = foo.get('volume','') # '요약', '청구항'

    bar = subParams['menuOptions']['tableOptions']['matrixDialog']
    sortBy = bar.get('sortBy', [])  
    pageIndex = bar.get('pageIndex', 0)
    pageSize = bar.get('pageSize', 10)

    baz = subParams['menuOptions']['matrixDialogOptions']
    topic = baz.get('topic', [])  
    categoryValue = baz.get('categoryValue', [])  

    # pageIndex = subParams.get('pageIndex', 0)
    # pageSize = subParams.get('pageSize', 10)
    # sortBy = subParams.get('sortBy', [])    
    # category = subParams.get('category', '')    
    # targetField = subParams.get('volume', '')


    if category == '연도별':
        countField = 'left(출원일,4)'
    elif category == '기술별':
        countField = 'ipc코드'
    elif category == '기업별':
        countField = '출원인1'

    # if category == topic:
    #    whereTopic = '' # prevent from click on the category itself at table mode
    # else:    
    #     if ' ' in topic:
    #         val = re.sub(re.escape(' '), ' <1> ', topic, flags=re.IGNORECASE)
    #         whereTopic = ' and '+ targetField +' @@ to_tsquery(\'(' + val + ')\')'
    #     else:
    #         whereTopic = ' and '+ targetField +' like \'%' + topic + '%\'' 

    # whereAll = whereTopic + ' and ' + countField + '= \'' + categoryValue + '\''
    whereAll = ' and ' + countField + '= \'' + categoryValue + '\''

    # 3가지 필터된 목록 구하기 
    query = get_searchs(request, mode="query")

    # Add additional where phrase
    query += whereAll

    # Add sort by
    if sortBy:
        foo =' '
        for s in sortBy:
            foo += s['_id']
            foo += ' ASC, ' if s['desc'] else ' DESC, '

        foo = remove_tail(foo, ", ")
        query += f' order by {foo}'

    # Add offset limit
    query += f' offset {pageIndex * pageSize} limit {pageSize}'    

    with connection.cursor() as cursor:    
        cursor.execute(query)
        rows = dictfetchall(cursor)
    try:
        rowsCount = rows[0]["cnt"]
    except IndexError:        
        rowsCount = 0        

    result = { 'rowsCount': rowsCount, 'rows': rows}   
    # Redis {
    try:
        sub_context['matrix_dialog'] = result
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }

    return JsonResponse(result, safe=False)


def get_topic(nlp_token, unitNumber):
    # taged_docs = []
    try:  # handle NoneType error
        # taged_docs = nlp_token.split()
        taged_docs = nlp_token
        tuple_taged_docs = tuple(taged_docs)  # list to tuble
    except:
        return JsonResponse("{}", safe=False)

    if taged_docs == [] or taged_docs == [[]]:  # result is empty
        return JsonResponse("{}", safe=False)

    count = Counter(tuple_taged_docs)
    _sublist = count.most_common(unitNumber)
    sublist = dict(_sublist)

    topic = []  # --- topic 반복 횟수는 제거
    for key in sublist.keys():
        topic.append(key)

    return topic

