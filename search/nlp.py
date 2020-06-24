from collections import Counter
from django.http import JsonResponse
from django.http import HttpResponse
import json
from operator import itemgetter
from gensim.models import Word2Vec
from gensim.models import FastText

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
        params[value] = request.GET.get(
            value) if request.GET.get(value) else ""
    apiParams = "¶".join(
        params.values()) if params['searchNum'] == '' else params['searchNum']

    # Redis {
    context = cache.get(apiParams)

    if context:
        _keywordvec = request.GET.get(
            "keywordvec") if request.GET.get("keywordvec") else None
        if context['modelType'] and request.GET.get("modelType"):
            _modelType = request.GET.get("modelType") if context['modelType'] != request.GET.get("modelType") else None
        else:
            _modelType = None            

        if category == "topic" and context['topic']:
            return HttpResponse(context['topic'], content_type="text/plain; charset=utf-8")
        elif category == "wordcloud" and context['wordcloud']:
            return HttpResponse(context['wordcloud'])
        elif category == "vec" and context['vec'] and not _keywordvec and not _modelType:
            return HttpResponse(json.dumps(context['vec'], ensure_ascii=False))
    # Redis }

    taged_docs = []

    nlp_raw = []

    nlp_raw = parse_searchs(
        request, mode="nlp") if params['searchNum'] == '' else parse_searchs_num(request, mode="nlp")

    try:  # handle NoneType error
        taged_docs = nlp_raw.split()
        tuple_taged_docs = tuple(taged_docs)  # list to tuble
    except:
        if category == "vec":
            res = '{"topic":[], "vec":[]}'
        elif category == "wordcloud":
            res = "[]"
        # break
        return HttpResponse(res, content_type="text/plain; charset=utf-8")

    res = ""
    if taged_docs == [] or taged_docs == [[]]:  # result is empty
        if category == "vec":
            res = '{"topic":[], "vec":[]}'
        elif category == "wordcloud":
            res = "[]"
        # break
        return HttpResponse(res, content_type="text/plain; charset=utf-8")

    elif category == "wordcloud":
        """ 워드 클라우드 """
        if context and context['wordcloud']:  # redis ?
            return HttpResponse(context['wordcloud'])
        else:
            import operator
            # off_list = []
            # for a in tuple_taged_docs:  # 리트스풀기
            #     for b in a:
            #         off_list.append(b)

            sublist = dict()

            for word in taged_docs:
                if word in sublist:
                    sublist[word] += 1
                else:
                    sublist[word] = 1

            sublist = sorted(
                sublist.items(), key=operator.itemgetter(1), reverse=True)[:50]

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
        """ 빈도수 단어로 연관 단어 추출 (처음은 맨 앞단어로) """

        # 빈도수 단어 
        count = Counter(tuple_taged_docs)
        _sublist = count.most_common(20)
        sublist = dict(_sublist)

        # select first topic word if no related word is specified
        keywordvec = (
            request.GET.get("keywordvec")
            if request.GET.get("keywordvec")
            else list(sublist.keys())[0]
        )

        modelType = (
            request.GET.get("modelType")
            if request.GET.get("modelType")
            else "word2vec"
        )

        # 연관 단어 추출
        # 기존 방법 {        
        # topic_num = 20  # 단어수 설정
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

        # model = Word2Vec(
        #     sentences=[taged_docs],
        #     size=100,  # 500,
        #     window=3,
        #     min_count=5,  # 2,
        #     workers=4,
        #     iter=100,  # 300,
        #     sg=1,
        # )

        # 기존 방법 }

        # 옵션 설정
        num_features = 300  # 문자 벡터 차원 수
        min_word_count = 3  # 최소 문자 수
        num_workers = 4  # 병렬 처리 스레드 수
        window_context = 5  # 문자열 창 크기
        # downsampling = 1e-3  # 문자 빈도수 Downsample


        # word2vec 모델 학습
        if modelType == 'word2vec':
            model = Word2Vec(sentences=[taged_docs],
                            workers=num_workers,
                            size=num_features,
                            min_count=min_word_count,
                            iter=100,
                            window=window_context, sg=0)

        # modelRaw = Word2Vec(sentences=[taged_docs],
        #                             workers=num_workers,
        #                             size=num_features,
        #                             min_count=min_word_count,
        #                             window=window_context, sg=0)

        # fasttext 모델 학습
        elif modelType == 'fasttext':
            model = FastText(sentences=[taged_docs],
                                workers=num_workers,
                                size=num_features,
                                min_count=min_word_count,
                                iter=100,
                                window=window_context, sg=0)

        # 기존에 처음 설정한 word2vec 모델 학습
        else:
            model = Word2Vec(
            sentences=[taged_docs],
            size=100,  # 500,
            window=3,
            min_count=5,  # 2,
            workers=4,
            iter=100,  # 300,
            sg=1,
        )                                

        # modelRaw_ft = FastText(newSentsRaw,
        #                     workers=num_workers,
        #                     size=num_features,
        #                     min_count=min_word_count,
        #                     window=window_context, sg=0)          

        # wordtovec_result = model.wv.similarity('actor', 'actress') #similarity: 두 단어의 유사도를 계산
        try:
            wordtovec_result = model.wv.most_similar(keywordvec, topn=20)  # most_similar: 가장 유사한 단어를 출력
        except:
            # handle "word 'brabra' not in vocabulary"
            return JsonResponse('{"vec":[{"label":"없음","value":0}]}', safe=False)
            # return HttpResponse('{"vec":[{"label":"없음","value":0}]}', content_type="text/plain; charset=utf-8")

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
        if context is not None:
            context['vec'] = res
            context['modelType'] = modelType
            cache.set(apiParams, context, CACHE_TTL)
        # Redis }

        return HttpResponse(json.dumps(res, ensure_ascii=False))


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
