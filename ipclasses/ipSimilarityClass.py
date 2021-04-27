from utils import request_data, redis_key, remove_tail, dictfetchall,  sampling, tokenizer, tokenizer_phrase, remove_punc, remove_brackets, remove_tags, frequency_count
from django.core.cache import cache
from django.db import connection
from django.conf import settings
from django.http import JsonResponse
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
import re
import operator

from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import json

class IpSimilarity:

    def __init__(self, request, mode):
        self._request = request
        self._mode = mode
        self._emptyRows = {"기술분야": "", "배경기술": "", "해결과제": "",
                     "해결수단": "", "발명효과": "", "도면설명": "", "발명의실시예": ""}

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)
        self._appNo = self._params.get('appNo','')  
        self._whereAppNo = f'WHERE "출원번호" = $${self._appNo}$$'

        mainKey, subKey = redis_key(self._request)
        self._mainKey = f'{mainKey}¶{self._mode}'

        try:
            result = cache.get(self._mainKey)
            if result:
                print('load mainKey redis', self._mode)
                self._rows = result
                return result
        except (KeyError, NameError, UnboundLocalError):
            pass

    def query_execute(self, key):
        command = { 'abstract': self.abstract_query, 'similar': self.similarity_query}
        query = command[key]()
        with connection.cursor() as cursor:
            cursor.execute(
                "SET work_mem to '100MB';"
                + query
            )
            rows = dictfetchall(cursor)
        if key == 'abstract':
            try:
                result = rows[0]
            except IndexError:
                result = rows    
        else:
            result = rows
        # setattr(self, '_%s' % key, result)
        print('query execute: ', key)
        return result

    def setup_similarity(self):
        rows = self.query_execute(key = 'abstract')

        try:
            foo = tokenizer_phrase(rows['요약']) or []
            bar = frequency_count(foo, 15)
            baz = [w.replace('_', '&') for w in bar]
            self._abstract = '|'.join(baz)
        except IndexError:        
            self._abstract = None

        print('abstract is ...',self._abstract)

        rows = self.query_execute(key = 'similar')

        try:
            rowsCount = rows[0]["cnt"]
        except IndexError:        
            rowsCount = 0         

        result = { 'rowsCount': rowsCount, 'rows': rows}   
        return result

    def calcuate_similarity(self, rows):
        # sents_sim = [remove_punc(remove_brackets(remove_tags(sent))) for sent in self._abstract['요약'] if type(sent) == str]
        
        # new_sents_sim = tokenizer(sents_sim) or []

        documents = [TaggedDocument(doc, [i]) for i, doc in enumerate(sents_sim)]
        
        topn = len(sents_sim)

        foo = self._subParams["menuOptions"]["similarOptions"]
        self._modelType = foo.get('modelType', 'doc2vec')
          
        if self._modelType == 'doc2vec':
            sims = self.w2b_value(documents, topn, sents_sim)
            df_sim['유사도'] = sims
            result = df_sim.to_json("records")
            res = json.dumps(json.loads(result), indent=4) 
            return res
        else:
            return self.cosine_value(documents, topn, sents_sim, absList)        
       
    def abstract_query(self):
        return f"""select COALESCE(trim(regexp_replace(regexp_replace(regexp_replace(regexp_replace(초록, '<[^>]+>', '', 'g'), '[\(\[].*?[\)\]]','', 'g'), '[^[:alnum:],/.;:]',' ','g'),'\s+',' ','g')),'') AS 요약 from 공개초록 {self._whereAppNo}"""

    def similarity_query(self):
        result = f"""
        SELECT count(*) over () as cnt, ts_rank( 요약tsv, to_tsquery('korean', $${self._abstract}$$ ) ) AS rank, "등록사항", "발명의명칭", "출원번호", "출원일", "출원인1", "출원인코드1", "출원인국가코드1", "발명자1", "발명자국가코드1", "등록일", "공개일", "ipc코드", "요약" FROM "kr_tsv_view" WHERE 요약tsv @@ to_tsquery('korean', $${self._abstract}$$) order by ts_rank( 요약tsv, to_tsquery('korean', $${self._abstract}$$ ) ) DESC  LIMIT 10;        
        """
        # SELECT set_limit(0.8);
        # SELECT count(*) over () as cnt, similarity("요약", $${self._abstract}$$) AS similarity, "등록사항", "발명의명칭", "출원번호", "출원일", "출원인1", "출원인코드1", "출원인국가코드1", "발명자1", "발명자국가코드1", "등록일", "공개일", "ipc코드", "요약" FROM "kr_tsv_view" WHERE "요약" % $${self._abstract}$$ limit 100  
        return result


        

    def w2b_value(self, documents, topn, abstract):
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

    def cosine_value(self, documents, topn, sents_sim, abstract):
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