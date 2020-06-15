import pandas as pd
import numpy as np
import re
import pickle
from konlpy.tag import Mecab #, Kkma, Okt, Komoran
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from django.http import JsonResponse
from django.http import HttpResponse

# 형태소 분석기 선언
mecab = Mecab()

lam = lambda x: ['/'.join(t) for t in mecab.pos(x)
                  if 'NN' in t
                  or 'NP' in t
                  or 'SL' in t
                 ]

TAG_RE = re.compile(r'<[^>]+>')


def remove_tags(text):
    return TAG_RE.sub('', text)


def remove_brackets(text):
    return re.sub("[\(\[].*?[\)\]]", "", text)


def remove_punc(text):
    return re.sub("[!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~]", ' ', text)


def pos(text):
    return [token for token, tag in mecab.pos(text) if tag[:2] == 'NN' or tag[:2] == 'NP' or tag[:2] == 'SL']


def similarity(df_sim):
    # for i in range(len(row)):

    #     row[i]['유사도'] = mtx_raw[i]['출원일자'][:-4]
    # df_sim = pd.read_excel('./data/COMPA_바이러스_치료검색_4천여건.xlsx')
    sents_sim = [remove_punc(remove_brackets(remove_tags(sent))) for sent in df_sim['초록'] if type(sent) == str] # 제거 수행
    sents_sim = [sent for sent in sents_sim if '내용 없음' not in sent and '내용없음' not in sent] # 내용 없는 초록 제거
    newSents_sim = [pos(s) for s in sents_sim]      # 문장에서 명사와 외국어만 추출하여 리스트로
    newSentsRaw_sim = [s.split() for s in sents_sim]

    documents = [TaggedDocument(doc, [i]) for i, doc in enumerate(newSents_sim)]
    # documentsRaw = [TaggedDocument(doc, [i]) for i, doc in enumerate(newSentsRaw_sim)]


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

    # modelDocRaw = Doc2Vec(documentsRaw,
    #                     workers=num_workers,
    #                     vector_size=num_features,
    #                     min_count=min_word_count,
    #                     window=context)


    # 가장 비슷한 문서 프린팅 (명사 모델)
    i=100
    new_vector = modelDoc.infer_vector(newSents_sim[i])
    sims = modelDoc.docvecs.most_similar([new_vector])

    # print(sents_sim[i])
    for s, w in sims:
        print(sents_sim[s])


    # # 가장 비슷한 문서 프린팅
    # new_vectorRaw = modelDocRaw.infer_vector(newSentsRaw_sim[0])
    # simsRaw = modelDocRaw.docvecs.most_similar([new_vectorRaw])
    # return sents_sim[0]
    # print(sents_sim[0])
    # for s, w in simsRaw:
    #     print(sents_sim[s])



    '''cosine simility'''

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



    '''cosine simility'''

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