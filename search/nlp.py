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

def kr_nlp(request, category=""):
    """ konlpy 관련 기능 """
    
    # keyword 모든 조합 구하기 (permutations) - 참고 https://ourcstory.tistory.com/414

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
        params[value] = request.GET.get(value) if request.GET.get(value) else ""
    apiParams = "¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']

    # Redis {
    context = cache.get(apiParams)

    if context:
        _keywordvec = request.GET.get("keywordvec") if request.GET.get("keywordvec") else None
        if category == "topic" and context['topic']:
            return HttpResponse(context['topic'], content_type="text/plain; charset=utf-8")
        elif category == "wordcloud" and context['wordcloud']:
            return HttpResponse(context['wordcloud'])            
        elif category == "vec" and context['vec'] and not _keywordvec:
            return HttpResponse(json.dumps(context['vec'], ensure_ascii=False))
    # Redis }

    taged_docs = []
    
    nlp_raw = []
  
    nlp_raw = parse_searchs(request, mode="nlp") if params['searchNum'] == '' else parse_searchs_num(request, mode="nlp")        

    try: # handle NoneType error
        taged_docs = nlp_raw.split()
        tuple_taged_docs = tuple(taged_docs) # list to tuble
    except:
        if category == "vec":
            res = '{"topic":[], "vec":[]}'
        elif category == "wordcloud":
            res = "[]"
        return HttpResponse(res, content_type="text/plain; charset=utf-8") # break 

    res = ""
    if taged_docs == [] or taged_docs == [[]]:  # result is empty
        if category == "vec":
            res = '{"topic":[], "vec":[]}'
        elif category == "wordcloud":
            res = "[]"
        return HttpResponse(res, content_type="text/plain; charset=utf-8") # break           

    # if category == "topic":
    #     """ 빈도수 """
    #     if context['topic']: # redis ?
    #         return HttpResponse( context['topic'], content_type="text/plain; charset=utf-8")
    #     else:
    #         topic_num = 15
    #         dictionary = corpora.Dictionary(taged_docs)
    #         corpus = [dictionary.doc2bow(text) for text in taged_docs]
    #         ldamodel = gensim.models.ldamodel.LdaModel(
    #             corpus, num_topics=topic_num, id2word=dictionary
    #         )

    #         dicts = []
    #         ldawords = [[] for i in range(topic_num)]
    #         for i in range(len(taged_docs)):
    #             lda = ldamodel.show_topic(i, topic_num)

    #         # 결과값 list to dict 변환 {
    #         lda.sort(key=lambda element: element[1], reverse=True)

    #         cnt = 0
    #         for i in lda:
    #             ldawords[cnt] = cnt, i[0]
    #             cnt += 1

    #         fields = ["key", "label"]
    #         # 결과값 list to dict 변환 }

    #         # update redis
    #         context['topic'] = [dict(zip(fields, i)) for i in ldawords]
    #         cache.set(apiParams, context, CACHE_TTL)

    #         return HttpResponse( context['topic'], content_type="text/plain; charset=utf-8")

    elif category == "wordcloud":
        """ 워드 클라우드 """
        if context and context['wordcloud']: # redis ?
            return HttpResponse(context['wordcloud'])
        else:        
            # 방법 1. tupe 형식 처리 {
            count = Counter(tuple_taged_docs)  ## Counter를 쓰기 위해 hashable 한 tuple를 가져옴
            _sublist = count.most_common(50)  # 상위 50개
            sublist = dict(_sublist)

            #### react-tagcloud 용 {
            # 폰트 size 12~ 70 이내로 조정하기 - react-tagcloud 만 해당 : 현재 react Wordcloud 사용중이라 필요없음 {
            # OldMin = min(sublist.values())
            # OldMax = max(sublist.values())
            # NewMax = 70
            # NewMin = 12

            # for k, v in sublist.items():
            #     NewValue = (((v - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
            #     sublist[k] = round(NewValue)
            # 폰트 size 12~ 70 이내로 조정하기 - react-tagcloud 만 해당 : 현재 react Wordcloud 사용중이라 필요없음 }
            #### react-tagcloud 용 }

            # sublist = sorted(sublist.items(), key=operator.itemgetter(1), reverse=True)[
            # sublist = sorted(sublist.items(), key=itemgetter(1), reverse=True)[:50]  # 상위 50개
            sublist = sorted(sublist.items(), key=itemgetter(1), reverse=True)

            # field name 넣기
            # https://stackoverflow.com/questions/20540871/python-tuple-to-dict-with-additional-list-of-keys
            fields = ["text", "value"]
            dicts = [dict(zip(fields, d)) for d in sublist]

            # json 형태로 출력
            # sublist = json.dumps(sublist, ensure_ascii=False, indent="\t")
            dicts = json.dumps(dicts, ensure_ascii=False, indent="\t")
            if dicts is None: 
                return HttpResponse("[]", content_type="text/plain; charset=utf-8")

            # Redis {
            if context is not None:
                context['wordcloud'] = dicts
                cache.set(apiParams, context, CACHE_TTL)
            # Redis }

            return HttpResponse(dicts)           

    elif category == "vec":
        """ wordCloud 처리 -> 연관 단어 추출 """
        # _keywordvec = request.GET.get("keywordvec") if request.GET.get("keywordvec") else None
        # if context['vec'] and not _keywordvec: # redis ?
        #     # return HttpResponse(json.dumps(context['vec'], ensure_ascii=False))
        #     return HttpResponse(_keywordvec, ensure_ascii=False)
        # else:     
        # wordCloud 처리 {
        count = Counter(tuple_taged_docs)
        _sublist = count.most_common(20)
        sublist = dict(_sublist)

        # 지정된 연관단어 exist ? 없으면 처음 토픽어 선택
        keywordvec = (
            # list(sublist.keys())[0] if keywordre == "" else keywordre
            request.GET.get("keywordvec")
            if request.GET.get("keywordvec")
            else list(sublist.keys())[0]
        )
        # wordCloud 처리 }

        # 연관 단어 추출 {
        topic_num = 20  # 단어수 설정
        # dictionary = corpora.Dictionary(taged_docs)
        # corpus = [dictionary.doc2bow(text) for text in taged_docs]
        # tfidf = models.TfidfModel(corpus, id2word=dictionary)
        # corpus_tfidf = tfidf[corpus]
        # corpus_tfidf_list = [doc for doc in corpus_tfidf]
        # taged_docs = list(tuple_taged_docs)

        # 워드투벡 수치 조정하기
        # size- 키워드 간 분석벡터 수 조정, window-주변단어 앞 뒤 갯수
        # min_count-코퍼스 내 빈도 ( )개 미만 단어는 분석 제외
        # workers-CPU쿼드 코어 사용, iter-학습 횟수, sg-분석방법론 [0]CBOW / [1]Skip-Gram
        model = Word2Vec(
            sentences=[taged_docs],
            size=100, # 500,
            window=3,
            min_count=5, # 2,
            workers=4,
            iter=100, # 300,
            sg=1,
        )

        # wordtovec_result = model.wv.similarity('actor', 'actress') #similarity: 두 단어의 유사도를 계산
        try: 
            wordtovec_result = model.wv.most_similar(
                keywordvec, topn=10
            )  # most_similar: 가장 유사한 단어를 출력
        except:
            return HttpResponse('{"vec":[{"label":"없음","value":0}]}', content_type="text/plain; charset=utf-8") # break               
        # window_wordtovec_result = "[" + keywordvec + "]", " 연관 단어 : ", wordtovec_result
        # return HttpResponse(window_wordtovec_result)  # 워드투백 결과
        # return HttpResponse(wordtovec_result)  # 워드투백 결과

        # wordtovec_result_remove = []  # ---- 확률값 제거
        # for vec in wordtovec_result:
        #     wordtovec_result_remove.append(vec[0])
        # wordtovec_result_removed = (
        #     "[" + keyword + "]",
        #     "[" + keywordre + "]",
        #     " 연관 단어 : ",
        #     wordtovec_result_remove,
        # )

        # convert list of lists (wordtovec_result) to dictionary
        # d = dict()
        # for k, v in wordtovec_result:
        #     d[k] = str(v)

        # convert list of lists (wordtovec_result) to list of dictionaries
        keys = ["label", "value"]
        # handle wordtovec_result is empty
        d = [dict(zip(keys, l)) for l in wordtovec_result] if wordtovec_result != [] else [{"label":"없음","value":0}]

        sublist_result_remove = []  # --- topic 반복 횟수는 여기서 불필요하므로 제거
        for key in sublist.keys():
            sublist_result_remove.append(key)

        # 연관 단어 추출 }

        # multiple result를 위해 json사용
        res = {"topic": sublist_result_remove, "vec": d}

        # return HttpResponse(json.dumps(res, ensure_ascii=False))

        # Redis {
        if context is not None:
            context['vec'] = res
            cache.set(apiParams, context, CACHE_TTL)
        # Redis }

        return HttpResponse(json.dumps(res, ensure_ascii=False))

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
