from utils import request_data, remove_tail, dictfetchall,  sampling, NestedDictValues
from django.core.cache import cache
from django.db import connection
from django.conf import settings
from django.http import JsonResponse
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
import re
import operator

import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

import os
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"

class IpSearch:

    def __init__(self, request, mode):
        self._request = request
        self._mode = mode
        self._emptyRows = []
        
        self.set_up()

        # self._executor = ThreadPoolExecutor(1)
        # self.loop = asyncio.new_event_loop()
        # asyncio.set_event_loop(self.loop)
        # result = self.loop.run_until_complete(self.run_query())
        # self.loop.close()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)

        self._appNo = self._params.get('appNo','')  
        self._whereAppNo = f'WHERE "출원번호" = $${self._appNo}$$'
        mainKey, subKey = self.redis_key()
        self._rowsKey = f'{mainKey}¶rows'
        self._mainKey = f'{mainKey}¶{self._mode}'
        self._subKey = f'{subKey}¶{self._mode}'

        foo = self._subParams["menuOptions"]["tableOptions"]["legalStatus"]
        self._pageIndex = foo.get('pageIndex', 0)
        self._pageSize = foo.get('pageSize', 10)
        self._sortBy = foo.get('sortBy', [])        

        try:
            context = cache.get(self._rowsKey)
            if context:
                print('load mainkey redis')
                return context
        except (KeyError, NameError, UnboundLocalError):
            pass

    # async def run_query(self):
    #     try:
    #         getattr(self, '_rows')
    #     except AttributeError:
    #         await self.loop.run_in_executor(self._executor, self.query_execute)
    #         return 
    #     else:
    #         return  
    
    def redis_key(self):
        result = self._appNo
        additional_result = result + "¶".join(list(NestedDictValues(self._subParams)))
        return result, additional_result

    def query_execute(self, key):

        command = { 'search': self.search_query, 'quote': self.quote_query, 'family' : self.family_query, 'legal' : self.legal_query, 'rnd' : self.rnd_query}
        query = command[key]()
        with connection.cursor() as cursor:
            cursor.execute(
                "SET work_mem to '100MB';"
                + query
            )
            rows = dictfetchall(cursor)
        if key == 'search':
            result = rows[0]
        else:
            result = rows            
        setattr(self, '_%s' % key, result)
        redisKey = f'{self._appNo}¶{key}'
        cache.set(redisKey, result, CACHE_TTL)
        print('query execute: ', key)
        return result

    def query_execute_paging(self, key):
        command = { 'legal' : self.legal_query}
        query = command[key]()
        with connection.cursor() as cursor:
            cursor.execute(
                "SET work_mem to '100MB';"
                + query
            )
            rows = dictfetchall(cursor)

        result = self.make_paging_rows(rows)

        cache.set(self._subKey, result, CACHE_TTL)
        print('query execute: ', key)
        return result

    def make_paging_rows(self, result):
        try:
            rowsCount = result[0]["cnt"]
        except IndexError:        
            rowsCount = 0

        # Add offset limit
        offset = self._pageIndex * self._pageSize
        limit = self._pageSize

        return { 'rowsCount': rowsCount, 'rows': sampling(result, offset, limit)}
       

    def add_orderby(self):
  
        if not self._sortBy:
            return ''

        result =' order by '
        for s in self._sortBy:
            result += s['_id']
            result += ' ASC, ' if s['desc'] else ' DESC, '
        result = remove_tail(result,", ")
        return result        

    def search_query(self):
        result = f"""SELECT A.*,
	    B."발명자", B."발명자국적",
        D.요약, F."청구항"::JSON, G."명세서", H."존속기간만료일" AS "존속기간만료일", H."소멸일" AS "소멸일",
        CASE
            WHEN I."IPC코드" IS NULL
            THEN ARRAY[]::text[]
            ELSE I."IPC코드"
        END "IPC코드",
        CASE
            WHEN I."IPC개정" IS NULL
            THEN ARRAY[]::text[]
            ELSE I."IPC개정"
        END "IPC개정",
        CASE
            WHEN J."CPC코드" IS NULL
            THEN ARRAY[]::text[]
            ELSE J."CPC코드"
        END "CPC코드",
        CASE
            WHEN J."CPC개정" IS NULL
            THEN ARRAY[]::text[]
            ELSE J."CPC개정"
        END "CPC개정",
        M."출원인", M."영문출원인", M."출원인코드", M."출원인국적", M."출원인주소" 
        FROM 
	    (
	    SELECT
		    "등록사항",
		    "발명의명칭(국문)" AS 명칭,
		    "발명의명칭(영문)" AS 영문명칭, 출원번호,
		    "출원일자" AS 출원일, 공개번호,
		    "공개일자" AS 공개일, 공고번호,
		    "공고일자" AS 공고일, 등록번호,
		    "등록일자" AS 등록일,
		    청구항수 
	    FROM
		    공개서지정보 {self._whereAppNo} 
	    )
	    A INNER JOIN (
        SELECT 출원번호, array_agg(성명 order by "RN2") 발명자, array_agg(국가코드 order by "RN2") 발명자국적 
	    FROM 공개인명정보 
        WHERE "RN2" is not null
	    GROUP BY 출원번호            
	    ) B ON A.출원번호 = B.출원번호
        INNER JOIN ( SELECT 출원번호, 초록 AS 요약 FROM "공개초록") D ON A.출원번호 = D.출원번호
	    INNER JOIN ( SELECT 출원번호, 청구항 FROM "공개청구항JSON") F ON A.출원번호 = F.출원번호	
	    INNER JOIN ( SELECT 출원번호, 명세서 FROM "공개명세서") G ON A.출원번호 = G.출원번호
	    LEFT JOIN ( SELECT 출원번호, 존속기간만료일자 AS 존속기간만료일, 소멸일자 AS 소멸일	FROM 등록 ) H ON A.출원번호 = H.출원번호
        LEFT JOIN (
            SELECT 출원번호, array_agg(ipc코드 order by "특허분류일련번호") AS "IPC코드",array_agg(substring(ipc개정일자,2,4) order by "특허분류일련번호") AS "IPC개정" FROM "공개IPC" GROUP BY 출원번호 ) I ON A.출원번호 = I.출원번호
        LEFT JOIN ( 
            SELECT 출원번호,array_agg(cpc코드 order by "특허분류일련번호") AS "CPC코드",array_agg(substring(cpc개정일자,2,4) order by "특허분류일련번호") AS "CPC개정" FROM "공개CPC" GROUP BY 출원번호 ) J ON A.출원번호 = J.출원번호
        LEFT JOIN (
            SELECT 출원번호, array_agg(성명 order by "RN1") 출원인, array_agg(영문성명 order by "RN1") 영문출원인, array_agg(관련인코드 order by "RN1") 출원인코드, array_agg(국가코드 order by "RN1") 출원인국적, array_agg(주소 order by "RN1") 출원인주소 
	    FROM 공개인명정보 
        WHERE "RN1" is not null
	    GROUP BY 출원번호 ) M ON A.출원번호 = M.출원번호"""
        return result

    def quote_query(self):
        result = f"""
            SELECT
                B.식별코드,
                B.국가,
                B.인용참증단계,
                A.명칭,
                A.출원인,
            CASE
                WHEN COALESCE ( B.일자, '' ) = '' THEN	format_date_fn(A.문헌일::TEXT) 
                ELSE format_date_fn(B.일자 :: TEXT)
                END 일자,
                A.출원번호,
                A."ipc코드" 
            FROM
                (
                SELECT
                    'B1' 식별코드, 
                    표준인용문헌국가코드 국가,
                    "표준인용문헌번호",
                    string_agg (distinct(case when left(원인용문헌번호,2) = "표준인용문헌국가코드" then substring(원인용문헌번호,3) end), ', ' ) 문헌번호,
                    string_agg ( 인용문헌구분코드명, ', ' ) 인용참증단계,
                    표준인용문헌발행일자::TEXT AS 일자, 출원번호, split_part( "인용문헌출원번호_국내":: TEXT, ',', 1 )  AS "관련출원번호" 
                FROM
                    "특허실용심사인용문헌" {self._whereAppNo} 
                GROUP BY
                    "표준인용문헌번호", 국가, 일자, 출원번호, 관련출원번호 
                UNION ALL
                SELECT
                    'F1' 식별코드,
                    'KR' 국가,
                    split_part( 출원번호:: TEXT, ',', 1 )  AS "출원번호1",
                    string_agg ( 피인용문헌구분코드명, ', ' ) 피인용참증단계,
                    '' 일자, 피인용문헌번호, 출원번호, "피인용문헌번호"::text 관련출원번호
                FROM
                    "특허실용심사피인용문헌" 
                WHERE
                    "피인용문헌번호" = $${self._appNo}$$ 
                GROUP BY
                    "출원번호1", 피인용문헌번호 , 출원번호, 관련출원번호
                ) B LEFT JOIN 
                (
                    SELECT C.*, D.출원인, E.ipc코드
                FROM (
                SELECT
                    출원번호,
                    CASE
                        WHEN COALESCE("발명의명칭(영문)", '') = '' THEN "발명의명칭(국문)"
                        WHEN COALESCE("발명의명칭(국문)", '') = '' AND COALESCE("발명의명칭(영문)", '') <> '' THEN "발명의명칭(영문)"
                        ELSE 
                            CONCAT( "발명의명칭(국문)", ' (', "발명의명칭(영문)", ')')
                    END AS "명칭",		
                CASE
                    WHEN COALESCE ( 등록일자:: TEXT, '' ) = '' THEN  출원일자 
                    ELSE 등록일자 
                    END 문헌일
                FROM
                "공개서지정보" 
                ) C	
                INNER JOIN ( SELECT 출원번호, string_agg(성명, ', 'order by "RN1") 출원인 
                FROM 공개인명정보 WHERE "RN1" is not null GROUP BY 출원번호
                ) D ON C.출원번호 = D.출원번호  
                INNER JOIN ( SELECT 출원번호, ipc코드 
                FROM "공개IPC" WHERE 특허분류일련번호 = 1 
                ) E ON C.출원번호 = E.출원번호 ) A
            ON B."관련출원번호" = A.출원번호::TEXT"""
        return result        

    def family_query(self):
        result = f"""
            SELECT 
                B.국가코드, B.패밀리번호, B.문헌코드, B.문헌번호, A.명칭,
                format_date_fn(A.일자::TEXT) AS 일자,
                A.ipc코드 AS "IPC" 
            FROM
                (
                SELECT
                    출원번호, 패밀리국가코드 AS 국가코드, 패밀리번호, 문헌코드, 문헌번호,
                CASE
                    WHEN 패밀리국가코드 = 'KR' 
                    THEN
                        split_part( 패밀리출원번호, ',', 1 ) :: TEXT ELSE 문헌번호 
                    END "연결출원번호"
                FROM
                    특허패밀리 {self._whereAppNo} 
                ) B 
                LEFT JOIN ( 
                SELECT C.*, D.ipc코드 FROM (SELECT 출원번호::text,
                CASE
                    WHEN COALESCE("발명의명칭(영문)", '') = '' THEN "발명의명칭(국문)"
                    WHEN COALESCE("발명의명칭(국문)", '') = '' AND COALESCE("발명의명칭(영문)", '') <> '' THEN "발명의명칭(영문)"
                    ELSE CONCAT( "발명의명칭(국문)", ' (', "발명의명칭(영문)", ')')
                END AS "명칭",
                등록일자 AS 일자 FROM 공개서지정보) C 
                INNER JOIN ( SELECT 출원번호::text, ipc코드 FROM "공개IPC" WHERE 특허분류일련번호 = 1 ) D ON C.출원번호 = D.출원번호
                ) A ON B."연결출원번호"::text = A.출원번호
        """                
                # UNION ALL
                # SELECT C1.*, D1."IPC코드" FROM (SELECT 문헌번호, "발명의명칭", 등록일자 
                # FROM "CN_BIBLIO") C1 
                # INNER JOIN ( SELECT 문헌번호, "IPC코드" FROM "CN_IPC" WHERE 일련번호 = 1 ) D1 ON C1.문헌번호 = D1.문헌번호
                # UNION ALL
                # SELECT C2.*, D2."IPC코드" FROM (SELECT 문헌번호, "발명의명칭", 등록일자 
                # FROM "JP_BIBLIO") C2 
                # INNER JOIN ( SELECT 문헌번호, "IPC코드" FROM "JP_IPC" WHERE 일련번호 = 1 ) D2 ON C2.문헌번호 = D2.문헌번호
                # UNION ALL
                # SELECT C3.*, D3."IPC코드" FROM (SELECT 문헌번호, "발명의명칭", 등록일자 
                # FROM "EP_BIBLIO") C3 
                # INNER JOIN ( SELECT 문헌번호, "IPC코드" FROM "EP_IPC" WHERE 일련번호 = 1 ) D3 ON C3.문헌번호 = D3.문헌번호
                # UNION ALL
                # SELECT C4.*, D4."IPC코드" FROM (SELECT 문헌번호, "발명의명칭", 등록일자 
                # FROM "US_BIBLIO") C4 
                # INNER JOIN ( SELECT 문헌번호, "IPC코드" FROM "US_IPC" WHERE 일련번호 = 1 ) D4 ON C4.문헌번호 = D4.문헌번호
                # UNION ALL
                # SELECT C5.*, D5."IPC코드" FROM (SELECT 문헌번호, "발명의명칭", 등록일자 
                # FROM "WO_BIBLIO") C5 
                # INNER JOIN ( SELECT 문헌번호, "IPC코드" FROM "WO_IPC" WHERE 일련번호 = 1 ) D5 ON C5.문헌번호 = D5.문헌번호		
                # ) A ON B."연결출원번호"::text = A.출원번호

        return result    

    def rnd_query(self):
        result = f"""SELECT 연구개발과제번호 과제번호, 연구부처명 부처명, 연구사업명 사업명, 연구과제명 과제명, 주관기관명 주관기관, 연구기간내용 연구기간, 연구관리전문기관명 전문기관, 연구과제기여율내용 기여율 FROM "공개RND" {self._whereAppNo} ORDER BY 연구개발사업일련번호 ASC"""
        return result  

    # def ipc_cpc_query(self):
    #     result = f"""(SELECT 'I' 구분, "ipc코드" 코드, "ipc개정일자" 일자 from "공개IPC" {self._whereAppNo} ORDER BY 특허분류일련번호 ASC )
    #     UNION ALL 
    #     (SELECT 'C' 구분, "cpc코드" 코드, "cpc개정일자" 일자 from "공개CPC" {self._whereAppNo} ORDER BY 특허분류일련번호 ASC)"""
    #     return result  

    def legal_query(self):
        result = f"""SELECT count(*) over () as cnt, 법적상태명, format_date_fn(법적상태일자::text) 법적상태일, 법적상태영문명 FROM 법적상태이력 {self._whereAppNo} and not (법적상태명 in ('특허출원','출원공개','설정등록','등록공고'))"""
        result += self.add_orderby()
        # order by 법적상태일 DESC , 일련번호 DESC"""
        return result                  

    # def registerfee_query(self):
    #     result = f"""SELECT to_char(to_date(납부일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 납입일, concat(시작연차,'-',마지막년차) 납입년차, TO_CHAR(등록료,'FM999,999,999') as 납입금액 FROM 등록료 WHERE 등록료 = $${self._regNo} order by 시작연차 DESC"""
    #     return result                  

    # def rightfullorder_query(self):
    #     result = f"""SELECT * FROM 권리순위 {self._whereAppNo} order by 순위번호 ASC"""
    #     return result                  

    # def rightholder_query(self):
    #     result = f"""SELECT 순위번호, 권리자일련번호, concat(권리자명, ' (',주소,')') 권리자정보, to_char(to_date(등록일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 등록일 FROM 권리권자변동 WHERE 등록번호 = $${self.regNo} and 권리자구분 = $$권리자$$ order by 순위번호 ASC, 권리자일련번호 ASC"""
    #     return result                  

    # def applicant_trend_query(self):
    #     foo = f"""SELECT left(출원번호::text,1) 구분, left(출원일자::text,4) pyr, left(등록일자::text,4) ryr FROM kr_tsv_view WHERE "출원인코드1" = $${self._applicantCode}"""
    #     result = f"""select pyr, null ryr, count(*) pp, null::int4 up, null::int4 pr, null::int4 ur from ({foo}) A WHERE 구분 = '1' GROUP BY pyr 
    #     union all 
    #     select pyr, null, null::int4, count(*), null::int4, null::int4 from ({foo}) A WHERE 구분 = '2' GROUP BY pyr
    #     union all 
    #     select null, ryr, null::int4, null::int4, count(*), null::int4 from ({foo}) A WHERE 구분 = '1' GROUP BY ryr
    #     union all 
    #     select null, ryr, null::int4, null::int4,  null::int4, count(*) from ({foo}) A  WHERE 구분 = '2' GROUP BY ryr"""
    #     return result                  

    # def applicant_ipc_query(self):
    #     foo = f"""SELECT left(출원번호::text,1) 구분, left(출원일자::text,4) pyr, left(등록일자::text,4) ryr FROM kr_tsv_view WHERE "출원인코드1" = $${self._applicantCode}"""
    #     result = f"""SELECT ipc요약 "name", count(*) "value" FROM 공개공보 WHERE "출원인코드1" = $${self._applicantCode} GROUP BY ipc요약 order by "value" desc limit 15 offset 0"""
    #     return result
        
   