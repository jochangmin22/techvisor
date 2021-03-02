from django.db import connection
from collections import Counter
from django.http import JsonResponse, HttpResponse
from ..utils import get_redis_key, dictfetchall
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
    2. mtx_row [요약token] 에 각 topic이 포함되는 [연도별, 기술별, 기업별] 횟수 list
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


    # nlp_token, mtx_raw 가져오기
    nlp_token = get_nlp(request, analType="matrix")

    mtx_raw = get_searchs(request, mode="matrix")

    # topic 가져오기
    try:
        unitNumber = subParams['analysisOptions']['matrixOptions']['output']
    except:
        unitNumber = 20   

    topic = get_topic(nlp_token, unitNumber)
        
    if subParams['analysisOptions']['matrixOptions']['category'] == '연도별':
        countField = '출원일자'
    elif subParams['analysisOptions']['matrixOptions']['category'] == '기술별':
        countField = 'ipc요약'
    elif subParams['analysisOptions']['matrixOptions']['category'] == '기업별':
        countField = '출원인1'

    if subParams['analysisOptions']['matrixOptions']['volume'] == '요약':
        targetField = '요약token'
    elif subParams['analysisOptions']['matrixOptions']['volume'] == '청구항':
        targetField = '전체항token'        

    # mtx_raw의 요약token에서 topic N (unitNumber) 이 포함되는 [출원일자, ipc요약, 출원인1] count 
    # (mtx_raw는 출원번호, 출원일자(년), 출원인1, ipc요약, 요약token 로 구성)
    mlist = []  # list of dic
    all_list = {}  # dic of list of dic
    matrixMax = 0
    xData = []
    yData = []
    try:
        for j in range(len(topic)):  # topic 20
            temp = [d for d in mtx_raw if topic[j].replace("_"," ") in d[targetField]]
            temp2 = Counter(c[countField] for c in temp)
            max_value = max(list(temp2.values()), default=0)
            matrixMax = max_value if matrixMax < max_value else matrixMax
            mlist.append(temp2)
            _yData = list(set().union(*mlist))
            yData = list(set(yData + _yData))
            all_list[topic[j].replace("_"," ")] = mlist
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


    if subParams['analysisOptions']['matrixOptions']['category'] == '연도별':
        countField = 'left(출원일자,4)'
    elif subParams['analysisOptions']['matrixOptions']['category'] == '기술별':
        countField = 'ipc요약'
    elif subParams['analysisOptions']['matrixOptions']['category'] == '기업별':
        countField = '출원인1'

    if subParams['analysisOptions']['matrixOptions']['volume'] == '요약':
        targetField = '요약token'
    elif subParams['analysisOptions']['matrixOptions']['volume'] == '청구항':
        targetField = '전체항token'          

    if subParams['analysisOptions']['matrixOptions']['category'] == params['topic']:
       whereTopic = '' # prevent from click on the category itself
    else:    
        if ' ' in params['topic']:
            val = re.sub(re.escape(' '), ' <1> ', params['topic'], flags=re.IGNORECASE)
            whereTopic = ' and '+ targetField +' @@ to_tsquery(\'(' + val + ')\')'
        else:
            whereTopic = ' and '+ targetField +' like \'%' + params['topic'] + '%\'' 

    whereAll = whereTopic + ' and ' + countField + '= \'' + params['categoryValue'] + '\''

    # 3가지 필터된 목록 구하기 
    query = get_searchs(request, mode="query")

    with connection.cursor() as cursor:    
        query += whereAll
        cursor.execute(query)
        row = dictfetchall(cursor)

    # Redis {
    try:
        sub_context['matrix_dialog'] = row
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }

    return JsonResponse(row, safe=False)


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

