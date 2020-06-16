from django.db import connection
from collections import Counter
from django.http import JsonResponse
from .searchs import parse_searchs, parse_searchs_num

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)


def parse_matrix(request):
    """ 
    토픽에 대한 국가별, 연도별, 기술별, 기업별 매트릭스
    1. topic, mtx_row 가져옴
    2. mtx_row [요약token] 에 각 topic이 포함되는 [연도별, 기술별, 기업별] 횟수 list
    """

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

    category = request.GET.get('category') if request.GET.get('category') else "연도별"

    # Redis {
    context = cache.get(apiParams)
    # Redis }

    # nlp_raw, mtx_raw 가져오기
    try:
        nlp_raw = parse_searchs(
            request, mode="nlp") if params['searchNum'] == '' else parse_searchs_num(request, mode="nlp")
    except:
        nlp_raw = []
    try:
        mtx_raw = parse_searchs(request, mode="matrix") if params['searchNum'] == '' else parse_searchs_num(
            request, mode="matrix")
    except:
        mtx_raw = []

    # topic 가져오기
    try:
        topic = context['vec']['topic'] if context and context['vec'] and context['vec']['topic'] else get_topic(
            nlp_raw)
    except:
        topic = []

    if category == '연도별':
        countField = '출원일자'
    elif category == '기술별':
        countField = 'ipc요약'
    elif category == '기업별':
        countField = '출원인1'

    # mtx_raw의 요약token에서 topic 20 이 포함되는 [출원년, ipc요약, 출원인1] count 
    # (mtx_raw는 출원번호, 출원일자(년), 출원인1, ipc요약, 요약token 로 구성)
    mlist = []  # list of dic
    all_list = {}  # dic of list of dic
    matrixMax = 0
    try:
        for j in range(len(topic)):  # topic 20
            temp = [d for d in mtx_raw if topic[j] in d['요약token']]
            temp2 = Counter(c[countField] for c in temp)
            max_value = max(list(temp2.values()))
            matrixMax = max_value if matrixMax < max_value else matrixMax
            mlist.append(temp2)
            all_list[topic[j]] = mlist
            mlist = []
        res =  {"entities": all_list, "max": matrixMax}
        return JsonResponse(res, safe=False)
    except:
        pass

def parse_matrix_dialog(request):
    """ 
    전체목록에서 3가지 필터 (topic, category, category value)
    """
    # TODO : apply redis if necessary
    category = request.GET.get('category') if request.GET.get('category') else "연도별"
    selectedTopic = request.GET.get('topic') if request.GET.get('topic') else ""
    selectedCategoryValue = request.GET.get('categoryValue') if request.GET.get('categoryValue') else ""


    if category == '연도별':
        countField = 'left(출원일자,4)'
    elif category == '기술별':
        countField = 'ipc요약'
    elif category == '기업별':
        countField = '출원인1'

    whereTopic =  ' and 요약token like \'%' + selectedTopic + '%\'' if category != selectedTopic else '' # click on the category itself?

    # 3가지 필터된 목록 구하기 
    query = parse_searchs(request, mode="query")
    with connection.cursor() as cursor:    
        query += whereTopic + ' and ' + countField + '= \'' + selectedCategoryValue + '\''
        cursor.execute(query)
        row = dictfetchall(cursor)

    return JsonResponse(row, safe=False)


def get_topic(nlp_raw):
    taged_docs = []
    try:  # handle NoneType error
        taged_docs = nlp_raw.split()
        tuple_taged_docs = tuple(taged_docs)  # list to tuble
    except:
        return JsonResponse("{}", safe=False)

    if taged_docs == [] or taged_docs == [[]]:  # result is empty
        return JsonResponse("{}", safe=False)

    topic_num = 20
    count = Counter(tuple_taged_docs)
    _sublist = count.most_common(topic_num)
    sublist = dict(_sublist)

    topic = []  # --- topic 반복 횟수는 제거
    for key in sublist.keys():
        topic.append(key)

    return topic


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
