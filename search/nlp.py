from collections import Counter
from django.http import JsonResponse
from django.http import HttpResponse
import json
import operator
from operator import itemgetter
from gensim.models import Word2Vec
from gensim.models import FastText
from .searchs import parse_searchs, parse_nlp
from .utils import get_redis_key, dictfetchall
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

def parse_wordcloud(request):
    """ wordcloud 관련 기능 """

    _, subKey, _, subParams = get_redis_key(request)

    # Redis {
    sub_context = cache.get(subKey)    

    try:
        if sub_context['wordcloud']:
            return HttpResponse(sub_context['wordcloud'])
    except:
        pass        
    # Redis }

    #///////////////////////////////////
    try:
        unitNumber = subParams['analysisOptions']['wordCloudOptions']['output']
    except:
        unitNumber = 50        

    try:  # handle NoneType error
        taged_docs = parse_nlp(request, analType="wordCloud")
        taged_docs = [w.replace('_', ' ') for w in taged_docs]
        if taged_docs == [] or taged_docs == [[]]:  # result is empty
            return HttpResponse( "[]", content_type="text/plain; charset=utf-8")
    except:
        return HttpResponse("[]", content_type="text/plain; charset=utf-8")
    #///////////////////////////////////

    sublist = dict()

    for word in taged_docs:
        if word in sublist:
            sublist[word] += 1
        else:
            sublist[word] = 1

    sublist = sorted(
        sublist.items(), key=operator.itemgetter(1), reverse=True)[:unitNumber]

    fields = ["name", "value"]
    dicts = [dict(zip(fields, d)) for d in sublist]

    # json 형태로 출력
    dicts = json.dumps(dicts, ensure_ascii=False, indent="\t")
    if not dicts:
        return HttpResponse("[]", content_type="text/plain; charset=utf-8")

    # Redis {
    try:
        sub_context['wordcloud'] = dicts
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }

    return HttpResponse(dicts)

def parse_vec(request):
    """ 빈도수 단어로 연관 단어 추출 (처음은 맨 앞단어로) """
    _, subKey, _, subParams = get_redis_key(request)

    #///////////////////////////////////
    try:
        _modelType = subParams['analysisOptions']['keywordsOptions']['modelType']
    except:
        _modelType = None

    try:
        _keywordvec = subParams['analysisOptions']['keywordsOptions']['keywordvec']
    except:
        _keywordvec = None

    try:
        unitNumber = subParams['analysisOptions']['keywordsOptions']['output']
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
        taged_docs = parse_nlp(request, analType="keywords")
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
    keywordvec = _keywordvec or list(sublist.keys())[0]

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
                        size=num_features,
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
        wordtovec_result = model.wv.most_similar(keywordvec, topn=unitNumber)  # most_similar: 가장 유사한 단어를 출력
    except:
        # error handle "word '...' not in vocabulary"
        return JsonResponse('{"vec":[{"label":"없음","value":0}]}', safe=False)

    # convert list of lists (wordtovec_result) to list of dictionaries
    keys = ["label", "value"]
    # handle wordtovec_result is empty
    d = [dict(zip(keys, l)) for l in wordtovec_result] if wordtovec_result != [] else [{"label": "없음", "value": 0}]

    sublist_result_remove = []  # --- topic 반복 횟수는 여기서 불필요하므로 제거
    for key in sublist.keys():
        sublist_result_remove.append(key)

    # 연관 단어 추출 }

    # multiple result를 위해 json사용
    res = {"topic": sublist_result_remove, "vec": d}

    # Redis {
    try:
        sub_context['vec'] = res
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }

    return HttpResponse(json.dumps(res, ensure_ascii=False))

def parse_indicator(request):
    """ 지표분석, 출원인 CPP, PFS 추출 """

    _, subKey, _, _ = get_redis_key(request)

    # Redis {
    sub_context = cache.get(subKey)

    try:
        if sub_context['indicator']:        
            return HttpResponse(json.dumps(sub_context['indicator'], ensure_ascii=False))
    except:
        pass
    # Redis }    

    d = parse_searchs(request, mode="indicator")

    # df = (pd.DataFrame(d)
    #     .loc[:,['출원인코드1']]
    #     .value_counts(['출원인코드1'])
    #     .reset_index(name='value')
    #     .rename(columns={'출원인코드1':'code'})
    #     .to_dict('r'))

    # df = (pd.DataFrame(d)
    #     .groupby(['출원인1'])
    #     .출원번호
    #     .agg(list)
    #     .reset_index()
    #     .rename(columns={'출원인1':'name', '출원번호': 'appNo'})
    #     .to_dict('r'))    

    # 개별 등록건수 count
    df = pd.DataFrame(d).loc[:,['출원인코드1','등록일자']]
    df['출원인코드1'] = df['출원인코드1'].astype(str)
    grantedList = (df[df.등록일자.notnull()]
        .value_counts(['출원인코드1'])
        .reset_index(name='value')
        .rename(columns={'출원인코드1':'code'})
        .to_dict('r'))

    # 전체 row 의 등록건 출원번호 list
    df = pd.DataFrame(d).loc[:,['출원번호','등록일자']]
    df = df[df.등록일자.notnull()].loc[:,['출원번호']].출원번호.astype(str).tolist()      
    total_granted = len(df) # get total_granted
    appNoList = ', '.join(df)
       
    # 전체 등록특허의 피인용수
    with connection.cursor() as cursor: 
        query= 'SELECT count(*) cnt from 특허실용심사인용문헌 where 출원번호 IN (' + appNoList + ')'
        cursor.execute(query)
        row = dictfetchall(cursor)
        total_citing = row[0]['cnt']

    # 출원인 groupby 출원번호 concat
    df = pd.DataFrame(d).loc[:,['출원인1','출원인코드1','출원번호']]
    df['출원인코드1'] = df['출원인코드1'].astype(str)
    df['출원번호'] = df['출원번호'].astype(str)

    df = (df
        .groupby(['출원인1','출원인코드1'])
        .출원번호
        .agg(list)
        .reset_index()
        .to_dict('r')
        )

    dataList = [{'name' : dic['출원인1'], 'code' : dic['출원인코드1'], 'appNo' : dic['출원번호']} for dic in df]

    l = []
    for i in range(len(dataList)):
        with connection.cursor() as cursor:

            appNos = ', '.join(dataList[i]['appNo'])
            code = dataList[i]['code']
            name = dataList[i]['name']

            #////// CPP = 특정 주체의 등록특허의 피인용 횟수 / 해당 주체의 등록특허 수

            # citing count (using appNo)
            query= 'SELECT count(*) cnt from 특허실용심사인용문헌 where 출원번호 IN (' + appNos + ')'
            # query = 'SELECT Count(*) cnt from 특허실용심사인용문헌 where 출원번호 IN (SELECT 출원번호 from 공개공보 where 등록일자 is not null and 출원인코드1 = $$' + code + '$$)'
            cursor.execute(query)
            row = dictfetchall(cursor)
            citing = row[0]['cnt']

            # granted count (using grantedList, code)            
            try:
                granted = [item['value'] for item in grantedList if item["code"] == code][0]
            except:
                granted = 0

            # cpp = citing / granted 
            try:
                cpp = citing / granted
            except:
                cpp = 0                
            
            #////// PII = 특정 주체의 등록특허의 피인용도[CPP] / 전체 등록특허의 피인용도
            try:
                pii = cpp / total_citing / total_granted
            except:
                pii = 0  

            #////// TS = 특정 주체의 영향력지수[PII] × 해당 주체의 등록특허 건수              
            try:
                ts = pii * granted
            except:
                ts = 0                

            #////// PFS = 특정 주체의 평균 패밀리 국가 수 / 전체 평균 패밀리 국가 수            

            # family count (using appNo)
            query= 'SELECT count(DISTINCT 패밀리국가코드) cnt from 특허패밀리 where 출원번호 IN (' + appNos + ')'
            cursor.execute(query)
            row = dictfetchall(cursor)
            family = row[0]['cnt']


            # family count total (using appNoList)
            query= 'SELECT count(DISTINCT 패밀리국가코드) cnt from 특허패밀리 where 출원번호 IN (' + appNoList + ')'
            cursor.execute(query)
            row = dictfetchall(cursor)
            total_family = row[0]['cnt']

            # family / total_family
            try:
                pfs = family / total_family
            except:
                pfs = 0

            cpp = "{:.2f}".format(cpp)
            pii = "{:.2f}".format(pii)
            ts = "{:.2f}".format(ts)
            pfs = "{:.2f}".format(pfs)
                                
            l.append({ 'name': name, 'citing' : citing, 'cnt': granted, 'cpp' : cpp, 'pii' : pii, 'ts' : ts, 'pfs' : pfs })

    res = sorted(l, key=itemgetter('cnt'), reverse=True)

    # Redis {
    try:
        sub_context['indicator'] = res
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }

    return HttpResponse(json.dumps(res, ensure_ascii=False))

def get_citingInfo(appNo):
    ''' kipris api에서 출원번호에 대한 피인용수 가져오기 '''

    # 피인용 REST ; 추후 bulk 신청 필요
    serviceParam = 'CitingService/'
    operationKey = 'citingInfo'
    url = KIPRIS['rest_url'] + serviceParam + operationKey + '?standardCitationApplicationNumber=' + appNo + '&accessKey=' + KIPRIS['service_key']
    # url = "http://plus.kipris.or.kr/openapi/rest/CitingService/citingInfo?standardCitationApplicationNumber=1019470000187&accessKey=" + KIPRIS['service_key']
    # return JsonResponse(url, safe=False)
    html = requests.get(url)
    soup = BeautifulSoup(html.content, 'xml')        
    bs = soup.find_all(operationKey)

    res = 0          
    if bs:
        for bs1 in bs:
            if bs1:
                try:
                    bs1.find("ApplicationNumber").get_text()
                    res += 1
                except:
                    pass                    
    return res