from utils import remove_tail, sampling
from django.core.cache import cache
from django.conf import settings
NAVER = settings.NAVER
import requests

from ipclasses import IpSearchs

class UsSearchs(IpSearchs):

    def redis_nlp(self):
        try:
            result = cache.get(f'{self._subKey}_nlp_rows')            
            if result:
                print(f'load {self.__class__.__name__} subKey_nlp_rows redis', self._mode)
                self._nlp_rows = result
        except (KeyError, NameError, UnboundLocalError):
            pass                               

    def wordcloud(self):
        self.load_rows_first()

        self.redis_nlp()

        try:
            getattr(self, '_nlp_rows')
            print('_nlp_rows exist')
        except AttributeError:
            print('nlp_rows execute')
            return self.nlp_rows()           
        else:
            return self._nlp_rows   

    def keywords(self):
        self.load_rows_first()

        self.redis_nlp()

        try:
            getattr(self, '_nlp_rows')
            print('_nlp_rows exist')
        except AttributeError:
            print('nlp_rows execute')
            return self.nlp_rows()           
        else:
            return self._nlp_rows  

    def nlp_rows(self):
        result = self.make_nlp_rows(self.create_empty_rows())
        return self.save_redis_sub_nlp_rows(result)

    def make_mtx_rows(self, result):
        # matrix는 출원번호, 출원일, 출원인1, ipc코드, 요약, 청구항만 사용
        for i in range(len(result)):
            for key in ['출원번호','출원인1','ipc코드']:
                result[i][key] = self._rows[i][key]            

            result[i]['출원일'] =  str(self._rows[i]['출원일'])[:-4]
            result[i]['출원인주체'] = True

            abstract = str(self._rows[i]['요약'])
            claim = str(self._rows[i]['청구항'])
            result[i]['요약'] = abstract
            result[i]['청구항'] = claim
            result[i]['요약·청구항'] = abstract + ' ' + claim      
        return result

    def save_redis_sub_nlp_rows(self, result):
        cache.set(f'{self._subKey}_nlp_rows', result)
        return result

    def generate_num_query(self):
        query = 'select count(*) over () as cnt, ' + self._queryCols + \
        " FROM us_view WHERE num_search like '%" + self._searchNum.replace("-","") + "%'"
        return query

    def generate_text_query(self):
        queryTextTerms = self.tsquery_keywords(self._searchText, 'terms')
        whereTerms = f'"{self._searchVolume}tsv" @@ to_tsquery(\'{queryTextTerms}\') and ' if queryTextTerms else ""

        queryTextInventor = self.tsquery_keywords(self._inventor, 'person')
        whereInventor = f'"발명자tsv" @@ to_tsquery(\'{queryTextInventor}\') and ' if queryTextInventor else ""

        queryTextAssignee = self.tsquery_keywords(self._assignee, 'person')
        whereAssignee = f'"출원인tsv" @@ to_tsquery(\'{queryTextAssignee}\') and ' if queryTextAssignee else ""

        whereDate = self.date_query()
        whereStatus = self.status_query()
        whereIptype = self.iptype_query()

        whereAll = whereTerms
        whereAll += whereDate
        whereAll += whereInventor
        whereAll += whereAssignee
        whereAll += whereStatus
        whereAll += whereIptype

        whereAll = remove_tail(whereAll," and ")

        query = f'select count(*) over () as cnt, US.* FROM ({self.searchs_query(queryTextTerms)}) AS US order by 출원일 DESC'
        print('💙 us query :', query)
        return query

    def make_paging_rows(self, result):
        try:
            rowsCount = self._rows[0]["cnt"]
        except (KeyError, IndexError):        
            rowsCount = 0

        for i in range(len(result)):
            result[i]['id'] = self._rows[i]['출원번호'] # add id key for FE's ids
            for key in ['문헌번호','문헌번호enrich', '문헌일','출원번호','출원일','존속기간만료일','등록사항','발명의명칭','출원인1','ipc코드']:
                result[i][key] = self._rows[i][key]

        rows = sampling(result, self._offset, self._limit)

        # foo = '.¶'.join(d['발명의명칭'] for d in rows)
        # bar = self.list_to_string_with_delimiter(foo)
        # rows.update('발명의명칭', bar.split('.¶'))

        return { 'rowsCount': rowsCount, 'rows': rows}    

    def list_to_string_with_delimiter(self, myList):
        result = ''
        for i in range(len(myList)):
            result += f'''{myList[i]}.¶'''
        return result

    def get_translate(text):
        client_id = NAVER['papago_client_id']
        client_secret = NAVER['papago_client_secret']

        data = {'text' : text,
                'source' : 'en',
                'target': 'ko'}
                
        url = NAVER['papago_url']

        header = {"X-Naver-Client-Id":client_id,
                "X-Naver-Client-Secret":client_secret}

        response = requests.post(url, headers=header, data=data)
        rescode = response.status_code

        if(rescode==200):
            send_data = response.json()
            trans_data = (send_data['message']['result']['translatedText'])
            return trans_data
        else:
            print("Error Code:" , rescode)        

    def searchs_query(self, queryTextTerms):
        ''' 특허문헌코드 B only ; 'Live' '''
        return f"""
        SELECT
        A.출원번호,
        'Live' AS 등록사항,
        A.문헌번호,
        CONCAT('US ', TRIM (
		LEADING '0'
		FROM
			CAST (concat_ws(' ',
                 left(A.문헌번호, 12),
                 right(A.문헌번호,2)
                ) AS TEXT)
	    )) 문헌번호enrich,
        CASE
            WHEN A.등록일 IS NULL
            THEN A.공개일
            ELSE A.등록일
        END 문헌일,
        CASE
            WHEN A.등록일 IS NULL
            THEN NULL
            ELSE to_char(A.출원일::text::date + INTERVAL '20 year', 'yyyymmdd')
        END 존속기간만료일,
        A.출원일,
        A.등록일,
        A.공개일,
        A.발명의명칭,
        K.우번1 AS 우선권주장출원일1,
        trim(regexp_replace(regexp_replace(regexp_replace(regexp_replace(B.요약, '<[^>]+>', '', 'g'), '[\(\[].*?[\)\]]','', 'g'), '[^[:alnum:],/.;:]',' ','g'),'\s+',' ','g')) AS 요약,
        trim(regexp_replace(regexp_replace(regexp_replace(regexp_replace(C.청구항, '<[^>]+>', '', 'g'), '[\(\[].*?[\)\]]','', 'g'), '[^[:alnum:],/.;:]',' ','g'),'\s+',' ','g')) AS 청구항,
        D."출원인1", D."출원인국가코드1", '1' AS "출원인코드1",
        F."발명자1", F."발명자국가코드1", 
        H."ipc코드",
        concat_ws(' ', A.문헌번호, A.공보번호,  A.등록번호, A.공개번호, A.출원번호,  A.국제공개번호, K.우번1, L.우번2) AS NUM_SEARCH
        FROM
           ( select 문헌번호 from us_view WHERE "search" @@ to_tsquery(\'{queryTextTerms}\') and 문헌번호 like '____________B_' GROUP BY 문헌번호) Z 
            LEFT JOIN "US_BIBLIO" A  ON Z.문헌번호 = A.문헌번호
            LEFT JOIN ( SELECT 문헌번호, 요약 FROM "US_ABSTRACT") B ON Z.문헌번호 = B.문헌번호 
            LEFT JOIN ( SELECT 문헌번호, 청구항 FROM "US_CLAIM") C ON Z.문헌번호 = C.문헌번호
            LEFT JOIN ( SELECT 문헌번호, 이름 AS "출원인1", 국적 AS "출원인국가코드1" FROM "US_REL_PSN" WHERE "구분" = '출원인' AND "일련번호" = 1 ) D ON Z.문헌번호 = D.문헌번호
            LEFT JOIN ( SELECT 문헌번호, 이름 AS "발명자1", 국적 AS "발명자국가코드1" FROM "US_REL_PSN" WHERE "구분" = '발명자' AND "일련번호" = 1 ) F ON Z.문헌번호 = F.문헌번호
            LEFT JOIN ( SELECT 문헌번호, ipc코드 FROM "US_IPC" WHERE 일련번호 = 1 ) H ON Z.문헌번호 = H.문헌번호 
            LEFT JOIN ( SELECT 문헌번호, 우선권주장출원번호 AS "우번1" FROM "US_PRIR" WHERE "일련번호" = 1 ) K ON Z.문헌번호 = K.문헌번호
            LEFT JOIN ( SELECT 문헌번호, 우선권주장출원번호 AS "우번2" FROM "US_PRIR" WHERE "일련번호" = 2 ) L ON Z.문헌번호 = L.문헌번호                  
        """
