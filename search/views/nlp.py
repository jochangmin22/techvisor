from collections import Counter
from django.http import JsonResponse
from django.http import HttpResponse
import json
import operator
from operator import itemgetter
from gensim.models import Word2Vec
from gensim.models import FastText
from .searchs import get_searchs, get_nlp
from utils import get_redis_key, dictfetchall, remove_tail, frequency_count
import pandas as pd
from bs4 import BeautifulSoup
import requests
from django.db import connection

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

KIPRIS = settings.KIPRIS

def get_wordcloud(request):
    """ wordcloud 관련 기능 """

    _, subKey, _, subParams = get_redis_key(request)

    # Redis {
    sub_context = cache.get(subKey)    

    try:
        if sub_context['wordcloud']:
            return JsonResponse(sub_context['wordcloud'], safe=False)
    except:
        pass        
    # Redis }

    #///////////////////////////////////
    try:
        unitNumber = subParams['menuOptions']['wordCloudOptions']['output']
    except:
        unitNumber = 50        

    try:  # handle NoneType error
        taged_docs = get_nlp(request, analType="wordCloud")
        taged_docs = [w.replace('_', ' ') for w in taged_docs]
        if taged_docs == [] or taged_docs == [[]]:  # result is empty
            return JsonResponse([{ 'name' : [], 'value' : []}], safe=False)
    except Exception as e:
        return JsonResponse([{ 'name' : [], 'value' : []}], safe=False)

    #///////////////////////////////////

    def make_dic_to_list_of_dic(baz):
        try:
            return { 'name' : list(baz.keys()), 'value' : list(baz.values())}
        except AttributeError:
            return { 'name' : [], 'value' : []}    
    result = []
    foo = frequency_count(taged_docs, unitNumber)
    result.append(make_dic_to_list_of_dic(foo))

    # return JsonResponse(result, safe=False)
    # sublist = dict()

    # for word in taged_docs:
    #     if word in sublist:
    #         sublist[word] += 1
    #     else:
    #         sublist[word] = 1

    # sublist = sorted(
    #     sublist.items(), key=operator.itemgetter(1), reverse=True)[:unitNumber]

    # fields = ["name", "value"]
    # result = [dict(zip(fields, d)) for d in sublist]

    # json 형태로 출력
    # result = json.dumps(result, ensure_ascii=False, indent="\t")
    # if not result:
    #     return HttpResponse("[]", content_type="text/plain; charset=utf-8")

    # Redis {
    try:
        sub_context['wordcloud'] = result
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }
    return JsonResponse(result, safe=False)


def get_wordcloud_dialog(request):

    _, subKey, params, subParams = get_redis_key(request)


    # Redis {
    sub_context = cache.get(subKey)    

    try:
        if sub_context['wordcloud_dialog']:
            return JsonResponse(sub_context['wordcloud_dialog'], safe=False)
    except:
        pass        
    # Redis }

    
    # pageIndex = subParams['menuOptions']['tableOptions']['wordCloud']['pageIndex']
    # pageSize = subParams['menuOptions']['tableOptions']['wordCloud']['pageSize']
    pageIndex = subParams.get('pageIndex', 0)
    pageSize = subParams.get('pageSize', 10)
    sortBy = subParams.get('sortBy', [])

    # 3가지 필터된 목록 구하기 
    query = get_searchs(request, mode="query")

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
        sub_context['wordcloud_dialog'] = result
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }

    return JsonResponse(result, safe=False)    

def get_vec(request):
    """ 빈도수 단어로 연관 단어 추출 (처음은 맨 앞단어로) """
    _, subKey, _, subParams = get_redis_key(request)

    #///////////////////////////////////
    try:
        _modelType = subParams['menuOptions']['keywordsOptions']['modelType']
    except:
        _modelType = None

    try:
        _keywordsvec = subParams['menuOptions']['keywordsOptions']['keywordsVec']
    except:
        _keywordsvec = None

    try:
        unitNumber = subParams['menuOptions']['keywordsOptions']['output']
    except:
        unitNumber = 20            

    # Redis {
    sub_context = cache.get(subKey)

    try:
        if sub_context['vec']:        
            return HttpResponse(json.dumps(sub_context['vec'], ensure_ascii=False))
    except:
        pass

    # Redis }

    #///////////////////////////////////
    try:  # handle NoneType error
        taged_docs = get_nlp(request, analType="keywords")
        taged_docs = [w.replace('_', ' ') for w in taged_docs]
        tuple_taged_docs = tuple(taged_docs)  # list to tuble
        if taged_docs == [] or taged_docs == [[]]:  # result is empty
            return HttpResponse("{topic: [], vec: []}" , content_type="text/plain; charset=utf-8")
    except:
        return HttpResponse("{topic: [], vec: []}", content_type="text/plain; charset=utf-8")    
    #///////////////////////////////////

    # 빈도수 단어 
    count = Counter(tuple_taged_docs)
    _sublist = count.most_common(unitNumber)
    sublist = dict(_sublist)

    # select first topic word if no related word is specified
    keywordsvec = _keywordsvec or list(sublist.keys())[0]

    modelType = _modelType or "word2vec"

    # 옵션 설정
    num_features = 300  # 문자 벡터 차원 수
    min_word_count = 3  # 최소 문자 수
    num_workers = 4  # 병렬 처리 스레드 수
    window_context = 5  # 문자열 창 크기
    # downsampling = 1e-3  # 문자 빈도수 Downsample

    ###### taged_docs가 너무 작으면 1로 조정
    min_word_count = min_word_count if len(taged_docs) > 30 else 1

    # word2vec 모델 학습
    if modelType == 'word2vec':
        model = Word2Vec(sentences=[taged_docs],
                        workers=num_workers,
                        size=num_features,
                        min_count=min_word_count,
                        # iter=100,
                        window=window_context, sg=0)
                   

    # fasttext 모델 학습
    elif modelType == 'fasttext':
        model = FastText(sentences=[taged_docs],
                        workers=num_workers,
                        size=num_features-200,
                        min_count=min_word_count,
                        # iter=100,
                        window=window_context, sg=0)

    # 기존에 처음 설정한 word2vec 모델 학습
    else:
        min_word_count = 5 if len(taged_docs) > 30 else 1
        model = Word2Vec(sentences=[taged_docs],
                        workers=4,
                        size=100,  # 500,
                        min_count=min_word_count,  # 2,
                        iter=100,  # 300,
                        window=3, sg=1
    )                                

    try:
        wordtovec_result = model.wv.most_similar(keywordsvec, topn=unitNumber)  # most_similar: 가장 유사한 단어를 출력
    except:
        # error handle "word '...' not in vocabulary"
        return JsonResponse('sorry, halt at model most_similar', safe=False)

    # convert list of lists (wordtovec_result) to list of dictionaries
    keys = ["label", "value"]
    # handle wordtovec_result is empty
    d = [dict(zip(keys, l)) for l in wordtovec_result] if wordtovec_result != [] else [{"label": "없음", "value": 0}]

    sublist_result_remove = []  # --- topic 반복 횟수는 여기서 불필요하므로 제거
    for key in sublist.keys():
        sublist_result_remove.append(key)

    # 연관 단어 추출 }

    # multiple result를 위해 json사용
    result = {"topic": sublist_result_remove, "vec": d}

    # Redis {
    try:
        sub_context['vec'] = result
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }

    return HttpResponse(json.dumps(result, ensure_ascii=False))

def get_sum_query(query):
    try:
        with connection.cursor() as cursor:
            cursor.execute(query)
            row = dictfetchall(cursor)
        result = row[0]['cnt']
        if not result:
            return 0
        return result                
    except:
        return 0     

def get_indicator(request):
    """ 지표분석, 출원인 CPP, PFS 추출 """

    _, subKey, _, _ = get_redis_key(request)

    # Redis {
    sub_context = cache.get(subKey)

    try:
        if sub_context['indicator']:
            return JsonResponse(sub_context['indicator'], safe=False)      
    except:
        pass
    # Redis }    

    d = get_searchs(request, mode="indicator")

    # Use fields : ['출원번호','출원인코드1','출원인1','등록일']
    if not d:
        return JsonResponse({"error": 'error'}, status=202, safe=False)

    def get_granted_list():
        # 개별 등록건수 count
        df = pd.DataFrame(d).reindex(columns=['출원인코드1','등록일'])
        df['출원인코드1'] = df['출원인코드1'].astype(str)
        return (df
            .value_counts(['출원인코드1'])
            .reset_index(name='value')
            .rename(columns={'출원인코드1':'code'})
            .to_dict('r'))

    def get_total_granted_appno_list():
        # 전체 row 등록건수 · 출원번호 list
        df = pd.DataFrame(d).reindex(columns=['출원번호','등록일'])
        df = df.reindex(columns=['출원번호']).출원번호.astype(str).tolist()      
        cnt = len(df)
        alist = ', '.join(df)
        return cnt, alist

    def get_total_citing():
        # 전체 등록특허의 피인용수
        query= 'SELECT sum(피인용수) cnt from 특허실용심사피인용수패밀리수 where 출원번호 IN (' + appNoList + ')'
        return get_sum_query(query)

    def get_appno_list_of_applicant():
        # 출원인 groupby 출원번호 concat
        df = pd.DataFrame(d).reindex(columns=['출원인1','출원인코드1','출원번호'])
        df['출원인코드1'] = df['출원인코드1'].astype(str)
        df['출원번호'] = df['출원번호'].astype(str)
        df = (df
            .groupby(['출원인1','출원인코드1'])
            .출원번호
            .agg(list)
            .reset_index()
            .to_dict('r')
            )
        # TODO : list of dict 출원번호 sort desc로 자르기
        return [{'name' : dic['출원인1'], 'code' : dic['출원인코드1'], 'appNo' : dic['출원번호']} for dic in df][:companyLimit]   

    def count_citing():
        # citing count (using appNo)
        query= 'SELECT sum(피인용수) cnt from 특허실용심사피인용수패밀리수 where 출원번호 IN (' + appNos + ')'
        return get_sum_query(query)

    def count_granted():            
        # granted count (using grantedList, code)            
        try:
            return [item['value'] for item in grantedList if item["code"] == code][0]
        except:
            return 0
    def get_cpp():
        try:
            return citing / granted
        except:
            return 0              
    def get_pii():
        try:
            return  cpp / total_citing / total_granted
        except:
            return 0             

    def count_family():                                                 
        # family count (using appNo)
        query= 'SELECT sum(패밀리수) cnt from 특허실용심사피인용수패밀리수 where 출원번호 IN (' + appNos + ')'                
        return get_sum_query(query)   

    def get_pfs():
        try:
            return family / total_family             
        except:
            return 0

    def count_total_family():                                                 
        # total family count (using appNo)
        query= 'SELECT sum(패밀리수) cnt from 특허실용심사피인용수패밀리수 where 출원번호 IN (' + appNoList + ')'                                
        return get_sum_query(query)        
         
 
    # Caller start            
    grantedList = get_granted_list()
    total_granted, appNoList = get_total_granted_appno_list()
    total_citing = get_total_citing()

    companyLimit = 1000 
    dataList = get_appno_list_of_applicant()
        

    dataLen = companyLimit if len(dataList) >= companyLimit else len(dataList)
    l = []
    for i in range(dataLen):

        # 출원인1이 1000개 이상인 경우 출원건 1개인 출원인 제외 - 속도
        if dataLen == 1000:
            if len(dataList[i]['appNo']) == 1:
                continue

        appNos = ', '.join(dataList[i]['appNo'])
        code = dataList[i]['code']
        name = dataList[i]['name']

        # CPP = 특정 주체의 등록특허의 피인용 횟수 / 해당 주체의 등록특허 수

        citing = count_citing()               
        granted = count_granted()
        cpp = get_cpp()
       

        # PII = 특정 주체의 등록특허의 피인용도[CPP] / 전체 등록특허의 피인용도
        pii = get_pii()

        # TS = 특정 주체의 영향력지수[PII] × 해당 주체의 등록특허 건수              
        ts = pii * granted

        # PFS = 특정 주체의 평균 패밀리 국가 수 / 전체 평균 패밀리 국가 수            

        family = count_family()
        total_family = count_total_family()              
        pfs = get_pfs()

        cpp = round(cpp,2)
        pii = round(pii,2)
        ts = round(ts,2)
        pfs = round(pfs,2)
        # citing = int(citing)
                        
        l.append({ 'name': name, 'citing' : citing, 'cnt': granted, 'cpp' : cpp, 'pii' : pii, 'ts' : ts, 'pfs' : pfs })

    result = sorted(l, key=itemgetter('cnt'), reverse=True)

    # Redis {
    try:
        sub_context['indicator'] = result
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }

    return JsonResponse(result, safe=False)
