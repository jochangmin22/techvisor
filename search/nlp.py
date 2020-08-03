from collections import Counter
from django.http import JsonResponse
from django.http import HttpResponse
import json
import operator
from operator import itemgetter
from gensim.models import Word2Vec
from gensim.models import FastText
from .searchs import parse_nlp
from .utils import get_redis_key
# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

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
        _modelType = subParams['analysisOptions']['subjectRelationOptions']['modelType']
    except:
        _modelType = None

    try:
        _keywordvec = subParams['analysisOptions']['subjectRelationOptions']['keywordvec']
    except:
        _keywordvec = None

    try:
        unitNumber = subParams['analysisOptions']['subjectRelationOptions']['output']
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
        taged_docs = parse_nlp(request, analType="subjectRelation")
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
