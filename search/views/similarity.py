from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
import pandas as pd
import numpy as np
import json
import re
import pickle
from konlpy.tag import Mecab #, Kkma, Okt, Komoran
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import random

from ..utils import dictfetchall, remove_tags, remove_brackets, remove_punc


# from .utils import get_redis_key, dictfetchall
from django.conf import settings

# 형태소 분석기 선언
mecab = Mecab()

lam = lambda x: ['/'.join(t) for t in mecab.pos(x)
                  if 'NN' in t
                  or 'NP' in t
                  or 'SL' in t
                 ]




# def pos(text):
#     return [token for token, tag in mecab.pos(text) if tag[:2] == 'NN' or tag[:2] == 'NP' or tag[:2] == 'SL']

def pos(text):
    STOPWORDS = settings.TERMS['STOPWORDS']
    return [token for token, tag in mecab.pos(text) if tag[:2] == 'NN' or tag[:2] == 'NP' or tag[:2] == 'SL' or tag[:2] == 'SH' and token not in STOPWORDS]


# def similarity(raw, modelType):

#     wherePharse = ' WHERE (("전문소" @@ to_tsquery(\''
#     # 바이러스 & 치료 & 단백질 & 감염 & 항원\')))'
#     wherePharse += ' & '.join(str(v) for v in raw)
#     wherePharse += '\')))'

#     query = 'SELECT 등록사항, "발명의명칭(국문)", "발명의명칭(영문)", 출원번호, 출원일자, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일자, 공개일자, ipc요약, 요약token FROM 공개공보 ' + \
#         wherePharse        
    
#     with connection.cursor() as cursor:
#         cursor.execute(query)
#         row = dictfetchall(cursor)

#     for j in range(len(row)):
#         newSents_sim = [pos(row[j]['요약token'])] 
#         # documents = [TaggedDocument(doc, [i]) for i, doc in enumerate(newSents_sim)]

#         # sims = w2b_value(documents, newSents_sim)
#         sims=0.838434
#         row[j]['유사도'] = round(sims,3)
   
#     return row

# def similarity(abstract, modelType, absList = []):
#     with connection.cursor() as cursor:
#         query = 'SELECT similarity("요약token", $${}$$) similarity, "등록사항", "발명의명칭(국문)", "발명의명칭(영문)", "출원번호", "출원일자", "출원인1", "출원인코드1", "출원인국가코드1", "발명자1", "발명자국가코드1", "등록일자", "공개일자", "ipc요약", "요약token" FROM "공개공보" WHERE "요약token" % $${}$$ ORDER BY similarity DESC limit 100;'.format(abstract, abstract, abstract) 

#         cursor.execute(
#             "SET work_mem to '100MB';"
#             + query
#         )
#         row = dictfetchall(cursor)

#     if not row:
#         return JsonResponse(row, safe=False)

#     sents_sim = [remove_punc(remove_brackets(remove_tags(sent))) for sent in row['요약token'] if type(sent) == str] # 제거 수행        
#     newSents_sim = [pos(s) for s in sents_sim]      # 문장에서 명사와 외국어만 추출하여 리스트로

#     documents = [TaggedDocument(doc, [i]) for i, doc in enumerate(newSents_sim)]

#     topn = len(newSents_sim)

#     if modelType == 'doc2vec':
#         sims = w2b_value(documents, topn, absList)
#         # return w2b_value(documents, newSents_sim, abstract, sents_sim)
#     else:
#         return cosine_value(documents, topn, sents_sim, absList)
    
#     row['유사도'] = sims    

#     return JsonResponse(row, safe=False)

def similarity(abstract, modelType, absList = []):
    ''' Consists of df query based on the original Hanyang University '''

    # query = 'SELECT 등록사항, "발명의명칭(국문)", "발명의명칭(영문)", 출원번호, 출원일자, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일자, 공개일자, ipc요약, 요약token FROM 공개공보 WHERE ipc요약 = \'' + ipc + '\' limit 100'

    # psql pg_trgm similarity로 1차 유사도 측정 , 유사도 기본값 0.3
    # query = 'select set_limit(0.2);'
    # query = 'SELECT case when similarity("요약token", $${}$$) = 1 then 0.981 else round(similarity("요약token", $${}$$)::numeric, 3) end AS similarity, 등록사항, "발명의명칭(국문)", "발명의명칭(영문)", 출원번호, 출원일자, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일자, 공개일자, ipc요약, 요약token FROM 공개공보 WHERE 요약token % $${}$$ ORDER BY similarity DESC;'.format(abstract, abstract, abstract)  
    # query = 'SELECT case when similarity(convert("요약token",\'UTF8\',\'EUC_KR\')::text, convert($${}$$,\'UTF8\',\'EUC_KR\')::text) = 1 then 0.981 else round(similarity(convert("요약token",\'UTF8\',\'EUC_KR\')::text, convert($${}$$,\'UTF8\',\'EUC_KR\')::text)::numeric, 3) end AS similarity, 등록사항, "발명의명칭(국문)", "발명의명칭(영문)", 출원번호, 출원일자, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일자, 공개일자, ipc요약, 요약token FROM 공개공보 WHERE 요약token % $${}$$ ORDER BY similarity DESC;'.format(abstract, abstract, abstract)  

    # query = 'SELECT similarity(text(textsend("요약token")), text(textsend($${}$$))) similarity, "등록사항", "발명의명칭(국문)", "발명의명칭(영문)", "출원번호", "출원일자", "출원인1", "출원인코드1", "출원인국가코드1", "발명자1", "발명자국가코드1", "등록일자", "공개일자", "ipc요약", "요약token" FROM "공개공보" WHERE "요약token" is not null and text(textsend("요약token")) % text(textsend($${}$$)) ORDER BY similarity DESC limit 100;'.format(abstract, abstract, abstract)  

    query = 'SELECT similarity("요약token", $${}$$) similarity, "등록사항", "발명의명칭(국문)", "발명의명칭(영문)", "출원번호", "출원일자", "출원인1", "출원인코드1", "출원인국가코드1", "발명자1", "발명자국가코드1", "등록일자", "공개일자", "ipc요약", "요약token" FROM "공개공보" WHERE "요약token" % $${}$$ ORDER BY similarity DESC limit 100;'.format(abstract, abstract, abstract)  

    # query = 'SELECT case when similarity(convert(unaccent(regexp_replace(lower("요약token"), \'[.,\'\'׳`"-]\', \'\', \'g\'))::bytea,\'UTF8\',\'ISO_8859_8\')::text, convert(unaccent(regexp_replace(lower($${}$$), \'[.,\'\'׳`"-]\', \'\', \'g\'))::bytea,\'UTF8\',\'ISO_8859_8\')::text) = 1 then 0.981 else round(similarity(convert(unaccent(regexp_replace(lower("요약token"), \'[.,\'\'׳`"-]\', \'\', \'g\'))::bytea,\'UTF8\',\'ISO_8859_8\')::text, convert(unaccent(regexp_replace(lower($${}$$), \'[.,\'\'׳`"-]\', \'\', \'g\'))::bytea,\'UTF8\',\'ISO_8859_8\')::text))::numeric, 3) end AS similarity, 등록사항, "발명의명칭(국문)", "발명의명칭(영문)", 출원번호, 출원일자, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일자, 공개일자, ipc요약, 요약token FROM 공개공보 WHERE 요약token % $${}$$ ORDER BY similarity DESC;'.format(abstract, abstract, abstract)  

    # return query
    df_sim = pd.read_sql_query(query, connection)

    if df_sim.empty:
        return json.dumps([], indent=4) 

    # sents_sim = [sent for sent in df_sim['요약token']]
    sents_sim = [remove_punc(remove_brackets(remove_tags(sent))) for sent in df_sim['요약token'] if type(sent) == str] # 제거 수행
    # sents_sim = [sent for sent in sents_sim if '내용 없음' not in sent and '내용없음' not in sent] # 내용 없는 초록 제거
    # 0: "본 발명 은 탈모 의 예방 또는 치료 용   또는 발모 또는 육모 촉진 용 약학 조성물 또는 화장료 조성물 에 관한 것 으로서   본 발명 에 따른 조성물 은 우수 한 탈모 의 예방 또는 치료 및 발모 또는 육모 촉진 효과 를 나타내 며   성별 및 연령 에 관계없이 안 전하 게 사용 될 수 있 다  "

    newSents_sim = [pos(s) for s in sents_sim]      # 문장에서 명사와 외국어만 추출하여 리스트로
    #    0: ["발명", "항암", "바이러스", "간동맥", "투여", "이용", "간암", "치료", "방법", "것", "발명", "항암", "바이러스", "간동맥", "투여", "이용",…]

    documents = [TaggedDocument(doc, [i]) for i, doc in enumerate(newSents_sim)]

    topn = len(newSents_sim)

    if modelType == 'doc2vec':
        sims = w2b_value(documents, topn, absList)
        # return w2b_value(documents, newSents_sim, abstract, sents_sim)
    else:
        return cosine_value(documents, topn, sents_sim, absList)
    
    df_sim['유사도'] = sims

    # new_df = df_sim.sort_values(by=['유사도'], axis=0, ascending=False)
    # df_row = new_df.to_json(orient="records")


    # result = df_sim.to_json(orient="records")
    result = df_sim.to_json("records")
    parsed = json.loads(result)
    res = json.dumps(parsed, indent=4) 
    return res

    # old
    # with connection.cursor() as cursor:
    #     cursor.execute(query)
    #     row = dictfetchall(cursor)

    # for j in range(len(row)):
    #     newSents_sim = [pos(row[j]['요약token'])] 
    #     # documents = [TaggedDocument(doc, [i]) for i, doc in enumerate(newSents_sim)]

    #     # sims = w2b_value(documents, newSents_sim)
    #     sims=0.838434 - (random.randint(1, 50) / 100)
    #     row[j]['유사도'] = round(sims,3)
    #return row

def w2b_value(documents, topn, abstract):
    '''단순 doc2vec'''
    # 옵션 설정
    num_features = 300  # 문자 벡터 차원 수
    min_word_count = 3  # 최소 문자 수
    num_workers = 4  # 병렬 처리 스레드 수
    context = 5  # 문자열 창 크기
    # downsampling = 1e-3  # 문자 빈도수 Downsample

    modelDoc = Doc2Vec(documents,
                    workers=num_workers,
                    vector_size=num_features,
                    min_count=min_word_count,
                    window=context)

    # 가장 비슷한 문서 프린팅 (명사 모델)
    # i=100
    new_vector = modelDoc.infer_vector(abstract)
    sims = modelDoc.docvecs.most_similar([new_vector], topn=topn)

    # sort a list of tuples by 1st item
    sorted_sims = sorted(sims, key=lambda x: x[0])
    return [w for s, w in sorted_sims]

def cosine_value(documents, topn, sents_sim, abstract):
    '''cosine similarity'''

    vectorizer = CountVectorizer(min_df=1, tokenizer=lam)
    sparse_docs = vectorizer.fit_transform(sents_sim)

    doc_term_matrix = sparse_docs.todense()
    df2 = pd.DataFrame(doc_term_matrix,
                    columns=vectorizer.get_feature_names())

    # similarity matrix
    cos_sims = (cosine_similarity(df2, df2))

    def most_similar(cos_sims, idx, topn=10):
        sort_index = np.argsort(cos_sims[idx])
        return sort_index[-topn:][::-1]

    # 가장 비슷한 문서 프린팅
    # i=100
    # print(sents_sim[i])
    for idx in most_similar(cos_sims, i, topn):
        print(sents_sim[idx])

    return sents_sim[idx]



def similarity_original(df_sim):
    # df_sim = pd.read_excel('./data/COMPA_바이러스_치료검색_4천여건.xlsx')
    sents_sim = [remove_punc(remove_brackets(remove_tags(sent))) for sent in df_sim['초록'] if type(sent) == str] # 제거 수행
    sents_sim = [sent for sent in sents_sim if '내용 없음' not in sent and '내용없음' not in sent] # 내용 없는 초록 제거
    newSents_sim = [pos(s) for s in sents_sim]      # 문장에서 명사와 외국어만 추출하여 리스트로
    newSentsRaw_sim = [s.split() for s in sents_sim]

    documents = [TaggedDocument(doc, [i]) for i, doc in enumerate(newSents_sim)]
    documentsRaw = [TaggedDocument(doc, [i]) for i, doc in enumerate(newSentsRaw_sim)]


    '''단순 doc2vec'''
    # 옵션 설정
    num_features = 300  # 문자 벡터 차원 수
    min_word_count = 3  # 최소 문자 수
    num_workers = 4  # 병렬 처리 스레드 수
    context = 5  # 문자열 창 크기
    # downsampling = 1e-3  # 문자 빈도수 Downsample

    modelDoc = Doc2Vec(documents,
                    workers=num_workers,
                    vector_size=num_features,
                    min_count=min_word_count,
                    window=context)

    modelDocRaw = Doc2Vec(documentsRaw,
                        workers=num_workers,
                        vector_size=num_features,
                        min_count=min_word_count,
                        window=context)


    # 가장 비슷한 문서 프린팅 (명사 모델)
    i=100
    new_vector = modelDoc.infer_vector(newSents_sim[i])
    sims = modelDoc.docvecs.most_similar([new_vector])

    # print(sents_sim[i])
    for s, w in sims:
        print(sents_sim[s])


    # 가장 비슷한 문서 프린팅
    new_vectorRaw = modelDocRaw.infer_vector(newSentsRaw_sim[0])
    simsRaw = modelDocRaw.docvecs.most_similar([new_vectorRaw])
    return sents_sim[0]
    print(sents_sim[0])
    for s, w in simsRaw:
        print(sents_sim[s])



    '''cosine similarity'''

    vectorizer = CountVectorizer(min_df=1, tokenizer=lam)
    sparse_docs = vectorizer.fit_transform(sents_sim)

    doc_term_matrix = sparse_docs.todense()
    df2 = pd.DataFrame(doc_term_matrix,
                    columns=vectorizer.get_feature_names())

    # similarity matrix
    cos_sims = (cosine_similarity(df2, df2))

    def most_similar(cos_sims, idx, topn=10):
        sort_index = np.argsort(cos_sims[idx])
        return sort_index[-topn:][::-1]

    # 가장 비슷한 문서 프린팅
    i=100
    print(sents_sim[i])
    for idx in most_similar(cos_sims, i, 20):
        print(sents_sim[idx])


    '''topic model'''
    return

