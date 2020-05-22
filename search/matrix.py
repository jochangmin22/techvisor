from django.db import connection
from collections import Counter
from django.http import JsonResponse
from django.http import HttpResponse
import os
import json
from konlpy.corpus import kolaw
from konlpy.tag import Mecab
from operator import itemgetter
from gensim import corpora, models
import gensim
import numpy as np
from itertools import permutations
from gensim.models import Word2Vec
from .searchs import parse_searchs, parse_searchs_num

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)


def parse_matrix(request, category="matrix"):
    """ topic에 대한 주변단어, 국가별, 연도별, 기술별, 기업별 매트릭스
    연도별 : topic, mtx_row 가져옴
    * mtx_row [요약token] 에 각 topic이 포함되는 횟수 list
        mtx_row list (출원일) <-> topic count
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

    # Redis {
    context = cache.get(apiParams)
    # Redis }

    taged_docs = []

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
    # return HttpResponse(mtx_raw, content_type=u"application/json; charset=utf-8")
    try:
        topic = context['vec']['topic'] if context and context['vec'] and context['vec']['topic'] else get_topic(
            nlp_raw)
    except:
        topic = []

    # mtx_raw의 요약token에서 topic 20 이 포함되는 출원번호 구하기 (mtx_raw는 출원번호, 출원일자(년), 출원인1, ipc요약, 요약token 로 구성)
    mlist = []  # list of dic
    all_list = {}  # dic of list of dic
    for j in range(len(topic)):  # topic 20
        temp = [d for d in mtx_raw if topic[j] in d['요약token']]
        temp2 = Counter(c['출원일자'] for c in temp)
        mlist.append(temp2)
        all_list[topic[j]] = mlist
        mlist = []
    # return HttpResponse(json.dumps(all_list, ensure_ascii=False))
    return JsonResponse(all_list, safe=False)

    # mtx_raw의 요약token에서 topic 20 <-> 연관단어(10)을 포함하는 raw 생성
    mlist = []
    alist = {}
    for i in range(len(wordtovec_result_remove)):  # 연관단어 10
        for j in range(len(sublist_result_remove)):  # topic 20
            slist = []
            temp = [d for d in mtx_raw if sublist_result_remove[j]
                    in d['요약token'] and wordtovec_result_remove[i] in d['요약token']]
            for k in range(len(temp)):
                slist.append(str(temp[k]['출원번호']))
            mlist.append(slist)
        # alist['value'] = mlist
        alist['value'] = mlist
    return HttpResponse(json.dumps(alist, ensure_ascii=False))


def get_topic(nlp_raw):
    try:  # handle NoneType error
        taged_docs = nlp_raw.split()
        tuple_taged_docs = tuple(taged_docs)  # list to tuble
    except:
        return HttpResponse(json.dumps("{}", ensure_ascii=False))

    if taged_docs == [] or taged_docs == [[]]:  # result is empty
        return HttpResponse(json.dumps("{}", ensure_ascii=False))

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
