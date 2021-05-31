from utils import request_data, redis_key, remove_tail, dictfetchall, sampling, frequency_count, snake_to_camel
from django.core.cache import cache
from django.db import connection
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
COMPANY_ASSIGNE_MATCHING = settings.TERMS['COMPANY_ASSIGNE_MATCHING']

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
        self._regNo = self._params.get('regNo','')

        self._applicantCode = self._params.get('applicantCode','')
        bar = ''
        for foo in self._applicantCode:
            bar += f'출원인코드1 = $${foo}$$ or '
        self._whereApplicantCode = 'WHERE ' + remove_tail(bar, ' or ')

        mainKey, subKey = redis_key(self._request)
        self._searchKey = f'{mainKey}¶search'
        self._mainKey = f'{mainKey}¶{self._mode}'
        self._subKey = f'{subKey}¶{self._mode}'

        try:
            result = cache.get(self._searchKey)
            if result:
                print('load searchKey redis')
                self._rows = result
                return result
            res = cache.get(self._subKey)
            if res:
                print('load subKey redis')
                setattr(self, '_%s' % self._mode, res)
                return res
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
    
    def query_execute(self, key):
        query = self.query_chioce(key)

        with connection.cursor() as cursor:
            cursor.execute(
                "SET work_mem to '100MB';"
                + query
            )
            rows = dictfetchall(cursor)
        if key == 'search':
            try:
                result = rows[0]
            except IndexError:
                result = rows    
        else:
            result = rows
        cache.set(self._mainKey, result, CACHE_TTL)
        setattr(self, '_%s' % key, result)
        print('query execute: ', key)
        return result

    def setup_application_number(self):
        rows = self.query_execute(key = 'application_number')
        return self.make_vis_num(rows)

    def setup_ipc(self):
        rows = self.query_execute(key = 'ipc')
        return self.make_vis_ipc(rows)

    def setup_associate_corp(self):
        def move_jsonfield_to_top_level():
            for i in range(len(rows)):
                data = json.loads(rows[i]['정보']) 
                for key, value in data.items():
                    rows[i].update({key: value})

                del rows[i]['정보']
            return rows  
        self.enrich_applicant()
        rows = self.query_execute(key = 'associate_corp')
        result = move_jsonfield_to_top_level()
        return self.make_paging_rows(result)

    def make_vis_num(self, result):
        ''' visual application number '''
        if not result:
            return [{ 'data' : [], 'labels' : []}]        

        for i in range(len(result)):
            result[i]['출원일'] = str(result[i]['출원일'])[:-4]

            result[i]['등록일'] = str(result[i]['등록일'])[:-4]

            result[i]['구분'] = str(result[i]['출원번호'])[0]


        def make_each_category_dict(flag):
            if flag:
                foo = [i[key] for i in result if i[key] and i['구분'] == flag]
            else:            
                foo = [i[key] for i in result if i[key]]
            bar = frequency_count(foo)        
            labels = [key for key in sorted(bar)]
            data = [bar[key] for key in sorted(bar)]  
            return { 'labels': labels, 'data' : data }         

        key = '출원일'
        PN = make_each_category_dict(flag=None)
        PP = make_each_category_dict(flag='1')
        UP = make_each_category_dict(flag='2')
        key = '등록일'
        RN = make_each_category_dict(flag=None)
        PR = make_each_category_dict(flag='1')
        UR = make_each_category_dict(flag='2')

        return [ PN, RN, PP, UP, PR, UR ]

    def make_vis_ipc(self, res):
        ''' visual ipc '''
        def make_dic_to_list_of_dic():
            try:
                return { 'name' : list(bar.keys()), 'value' : list(bar.values())}
            except AttributeError:
                return { 'name' : [], 'value' : []}

        result = []
        foo = [i['name'] for i in res if i['type'] == 'A']
        bar = frequency_count(foo,20)
        result.append(make_dic_to_list_of_dic())

        foo = [i['name'] for i in res if i['type'] == 'B']
        bar = frequency_count(foo,20)
        result.append(make_dic_to_list_of_dic())
        return result

    def query_execute_paging(self, key):
        query = self.query_chioce(key)

        try:
            result = cache.get(self._mainKey)
            if result:
                print('load mainKey redis', key, self._mainKey)
                # setattr(self, '_%s' % self._mode, result)
                rows = result
            else:
                rows = self.query_execute(key)
        except (KeyError, NameError, UnboundLocalError):
            rows = self.query_execute(key)

        result = self.make_paging_rows(rows)
        cache.set(self._subKey, result, CACHE_TTL)
        return result

    def make_paging_rows(self, result):
        try:
            rowsCount = result[0]["cnt"]
        except IndexError:        
            rowsCount = 0

        mode = snake_to_camel(self._mode)

        foo = self._subParams["menuOptions"]["tableOptions"][mode]
        self._pageIndex = foo.get('pageIndex', 0)
        self._pageSize = foo.get('pageSize', 10)
        self._sortBy = foo.get('sortBy', [])            


        # Add offset limit
        offset = self._pageIndex * self._pageSize
        limit = self._pageSize

        return { 'rowsCount': rowsCount, 'rows': sampling(result, offset, limit)}
       
    def query_chioce(self, key):
        command = { 'search': self.search_query, 'quote': self.quote_query, 'family' : self.family_query, 'legal' : self.legal_query, 'rnd' : self.rnd_query, 'application_number' : self.application_number_query, 'ipc' : self.ipc_query, 'right_holder' : self.right_holder_query, 'register_fee' : self.register_fee_query, 'rightfull_order' : self.rightfull_order_query, 'associate_corp' : self.associate_corp_query}
        return command[key]()

    def enrich_applicant(self):
        foo = self._params.get('applicant','')
        result = ''
        for applicant in foo:
            strings = ["주식회사","(주)"]
            for string in strings:
                applicant = applicant.replace(string,"").strip()

            for k, v in COMPANY_ASSIGNE_MATCHING.items():
                if v == applicant:
                    applicant = k
                    break

            result += f"""회사명 LIKE '%{applicant}%' or 대표자명 LIKE '%{applicant}%' or """
        self._whereApplicant = 'WHERE ' + remove_tail(result, ' or ')
        return                         

    def search_query(self):
        result = f"""SELECT A.*,
	    B."발명자", B."발명자국적",
        D.요약, F."청구항"::JSON, H."존속기간만료일" AS "존속기간만료일", H."소멸일" AS "소멸일",
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
	    A LEFT JOIN (
        SELECT 출원번호, array_agg(성명 order by "RN2") 발명자, array_agg(국가코드 order by "RN2") 발명자국적 
	    FROM 공개인명정보 
        WHERE "RN2" is not null
	    GROUP BY 출원번호            
	    ) B ON A.출원번호 = B.출원번호
        LEFT JOIN ( SELECT 출원번호, 초록 AS 요약 FROM "공개초록") D ON A.출원번호 = D.출원번호
	    LEFT JOIN ( SELECT 출원번호, 청구항 FROM "공개청구항JSON") F ON A.출원번호 = F.출원번호	
	    LEFT JOIN ( SELECT 출원번호, 존속기간만료일자 AS 존속기간만료일, 소멸일자 AS 소멸일 FROM 등록 ) H ON A.출원번호 = H.출원번호
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
        SELECT count(*) over () as cnt,
            B.식별코드,
            B.국가,
            B.인용참증단계,
            A.명칭,
            A.출원인,
        CASE
            WHEN COALESCE ( B.일자, '' ) = '' THEN	format_date_fn(A.문헌일::TEXT) 
        ELSE format_date_fn(B.일자 :: TEXT)
        END 일자,
            B.관련출원번호 AS 출원번호,
            A."ipc코드" 
        FROM
            (
            SELECT
                'B1' 식별코드, 
                표준인용문헌국가코드 국가,
                case when 표준인용문헌국가코드 = 'KR' then split_part( "인용문헌출원번호_국내":: TEXT, ',', 1 ) else 원인용문헌번호 end "관련출원번호", 
                string_agg (distinct(case when left(원인용문헌번호,2) = "표준인용문헌국가코드" then substring(원인용문헌번호,3) end), ', ' ) 문헌번호,
                string_agg ( 인용문헌구분코드명, ', ' ) 인용참증단계,
                표준인용문헌발행일자::TEXT AS 일자, 출원번호  
            FROM
                "특허실용심사인용문헌" {self._whereAppNo} 
            GROUP BY
                "관련출원번호", 국가, 일자, 출원번호
            UNION ALL
            SELECT
                'F1' 식별코드,
                'KR' 국가,
                split_part( 출원번호:: TEXT, ',', 1 )  AS "관련출원번호",
                피인용문헌번호, 
                string_agg ( 피인용문헌구분코드명, ', ' ) 피인용참증단계,
                '' 일자, 출원번호 
            FROM
                "특허실용심사피인용문헌" 
            WHERE
                "피인용문헌번호" = $${self._appNo}$$ 
            GROUP BY
                "관련출원번호", 피인용문헌번호 , 출원번호
            ) B LEFT JOIN 
            (
                SELECT C.*, D.명칭, D.출원인, D."ipc코드"
            FROM (
            SELECT
                출원번호,
            CASE
                WHEN COALESCE ( 등록일자:: TEXT, '' ) = '' THEN  출원일자 
                ELSE 등록일자 
                END 문헌일
            FROM
            "공개서지정보" 
            ) C	
            INNER JOIN ( SELECT 출원번호, 명칭, 출원인, "ipc코드" 
            FROM "공개출원인ipc" ) D ON C.출원번호 = D.출원번호  
            ) A
        ON B."관련출원번호" = A.출원번호::TEXT"""
        return result        

    def family_query(self):
        result = f"""
        SELECT count(*) over () as cnt, C.*
        FROM 
				(
        SELECT
                B.국가코드, B.패밀리번호, B."패밀리출원번호", B.문헌코드, B.문헌번호,
            A.명칭, A.일자, A.ipc코드 AS "IPC"
        FROM
            (
            SELECT
                출원번호, 패밀리국가코드 국가코드, 패밀리번호, 문헌코드, 문헌번호,
                패밀리출원번호
            FROM
                특허패밀리 {self._whereAppNo} AND 패밀리국가코드 = 'KR'
            ) B
            CROSS JOIN (
            SELECT C.*, D.명칭, D.ipc코드 FROM (SELECT 출원번호::text,
            등록일자 AS 일자 FROM 공개서지정보) C
            INNER JOIN ( SELECT 출원번호::text, 명칭, ipc코드 FROM "공개출원인ipc"
            ) D ON C.출원번호 = D.출원번호
            ) A
						WHERE B."문헌번호"::text = A.출원번호

        UNION ALL

        SELECT
            B1.국가코드, B1.패밀리번호, B1.패밀리출원번호, B1.문헌코드, B1.문헌번호,
						A1.명칭,	A1.일자, A1."IPC코드" AS "IPC" 	
        FROM
            (
            SELECT
                출원번호, 패밀리국가코드 국가코드, 패밀리번호, 문헌코드, 문헌번호,
                패밀리출원번호
            FROM
                특허패밀리 {self._whereAppNo} AND 패밀리국가코드 = 'CN'
            ) B1
						CROSS JOIN ( 
						SELECT C1.*, D1."IPC코드" FROM (SELECT 문헌번호, 발명의명칭 AS 명칭,
						등록일자 AS 일자 FROM "CN_BIBLIO") C1 
						INNER JOIN ( SELECT 문헌번호, "IPC코드" FROM "CN_IPC" WHERE 일련번호 = 1
						) D1 ON C1.문헌번호 = D1.문헌번호
						) A1
						WHERE B1.문헌번호 = A1.문헌번호	

        UNION ALL

        SELECT
            B2.국가코드, B2.패밀리번호, B2.패밀리출원번호, B2.문헌코드, B2.문헌번호,
						A2.명칭,	A2.일자, A2."IPC코드" AS "IPC" 	
        FROM
            (
            SELECT
                출원번호, 패밀리국가코드 국가코드, 패밀리번호, 문헌코드, 문헌번호,
                패밀리출원번호
            FROM
                특허패밀리 {self._whereAppNo} AND 패밀리국가코드 = 'JP'
            ) B2
						CROSS JOIN ( 
						SELECT C2.*, D2."IPC코드" FROM (SELECT 문헌번호, 발명의명칭 AS 명칭,
						등록일자 AS 일자 FROM "JP_BIBLIO") C2 
						INNER JOIN ( SELECT 문헌번호, "IPC코드" FROM "JP_IPC" WHERE 일련번호 = 1
						) D2 ON C2.문헌번호 = D2.문헌번호
						) A2
						WHERE B2.문헌번호 = A2.문헌번호	
						
        UNION ALL						
						
        SELECT
            B3.국가코드, B3.패밀리번호, B3.패밀리출원번호, B3.문헌코드, B3.문헌번호,
						A3.명칭,	A3.일자, A3."IPC코드" AS "IPC" 	
        FROM
            (
            SELECT
                출원번호, 패밀리국가코드 국가코드, 패밀리번호, 문헌코드, 문헌번호,
                패밀리출원번호
            FROM
                특허패밀리 {self._whereAppNo} AND 패밀리국가코드 = 'EP'
            ) B3
						CROSS JOIN ( 
						SELECT C3.*, D3."IPC코드" FROM (SELECT 문헌번호, 발명의명칭 AS 명칭,
						등록일자 AS 일자 FROM "EP_BIBLIO") C3 
						INNER JOIN ( SELECT 문헌번호, "IPC코드" FROM "EP_IPC" WHERE 일련번호 = 1
						) D3 ON C3.문헌번호 = D3.문헌번호
						) A3
						WHERE B3.문헌번호 = A3.문헌번호	
        UNION ALL						
						
        SELECT
            B4.국가코드, B4.패밀리번호, B4.패밀리출원번호, B4.문헌코드, B4.문헌번호,
						A4.명칭,	A4.일자, A4."IPC코드" AS "IPC" 	
        FROM
            (
            SELECT
                출원번호, 패밀리국가코드 국가코드, 패밀리번호, 문헌코드, 문헌번호,
                패밀리출원번호
            FROM
                특허패밀리 {self._whereAppNo} AND 패밀리국가코드 = 'US'
            ) B4
						CROSS JOIN ( 
						SELECT C4.*, D4."IPC코드" FROM (SELECT 문헌번호, 발명의명칭 AS 명칭,
						등록일 AS 일자 FROM "US_BIBLIO") C4 
						INNER JOIN ( SELECT 문헌번호, "IPC코드" FROM "US_IPC" WHERE 일련번호 = 1
						) D4 ON C4.문헌번호 = D4.문헌번호
						) A4
						WHERE B4.문헌번호 = A4.문헌번호			
        UNION ALL						
						
        SELECT
            B5.국가코드, B5.패밀리번호, B5.패밀리출원번호, B5.문헌코드, B5.문헌번호,
						A5.명칭,	A5.일자, A5."IPC코드" AS "IPC" 	
        FROM
            (
            SELECT
                출원번호, 패밀리국가코드 국가코드, 패밀리번호, 문헌코드, 문헌번호,
                패밀리출원번호
            FROM
                특허패밀리 {self._whereAppNo} AND 패밀리국가코드 = 'WO'
            ) B5
						CROSS JOIN ( 
						SELECT C5.*, D5."IPC코드" FROM (SELECT 문헌번호, 발명의명칭 AS 명칭,
						등록일자 AS 일자 FROM "WO_BIBLIO") C5 
						INNER JOIN ( SELECT 문헌번호, "IPC코드" FROM "WO_IPC" WHERE 일련번호 = 1
						) D5 ON C5.문헌번호 = D5.문헌번호
						) A5
						WHERE B5.문헌번호 = A5.문헌번호							
        UNION ALL
        SELECT
            B6.국가코드, B6.패밀리번호, B6.패밀리출원번호, B6.문헌코드, B6.문헌번호,
            '' AS 명칭, null AS 일자, '' AS "IPC"
        FROM
            (
            SELECT
                출원번호, 패밀리국가코드 국가코드, 패밀리번호, 문헌코드, 문헌번호,
                패밀리출원번호
            FROM
                특허패밀리 {self._whereAppNo}
                AND 패밀리국가코드 <> 'KR'
                AND 패밀리국가코드 <> 'CN'
                AND 패밀리국가코드 <> 'JP'
                AND 패밀리국가코드 <> 'EP'
                AND 패밀리국가코드 <> 'US'
                AND 패밀리국가코드 <> 'WO'
            ) B6
        ) C
        """
            #         SELECT count(*) over () as cnt,
            #     B.국가코드, B.패밀리번호, B.문헌코드, B.문헌번호, '' AS 명칭,
            #     '' AS 일자,
            #     '' AS "IPC" 
            # FROM
            #     (
            #     SELECT
            #         출원번호, 패밀리국가코드 AS 국가코드, 패밀리번호, 문헌코드, 문헌번호,
            #     CASE
            #         WHEN 패밀리국가코드 = 'KR' 
            #         THEN
            #             split_part( 패밀리출원번호, ',', 1 ) :: TEXT ELSE 문헌번호 
            #         END "연결출원번호"
            #     FROM
            #         특허패밀리 {self._whereAppNo} 

            #     SELECT
            #         출원번호, 패밀리국가코드 AS 국가코드, 패밀리번호, 문헌코드, 문헌번호,
            #     CASE
            #         WHEN 패밀리국가코드 = 'KR' 
            #         THEN
            #             split_part( 패밀리출원번호, ',', 1 ) :: TEXT ELSE 문헌번호 
            #         END "연결출원번호"
            #     FROM
            #         특허패밀리 {self._whereAppNo}                     
            #     ) B                
                #         LEFT JOIN ( 
                # SELECT C.*, D.명칭, D.ipc코드 FROM (SELECT 출원번호::text, 등록일자 AS 일자 FROM 공개서지정보) C 
                # INNER JOIN ( SELECT 출원번호::text, 명칭, ipc코드 FROM "공개출원인ipc" ) D ON C.출원번호 = D.출원번호
                # ) A ON B."연결출원번호"::text = A.출원번호
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
        result = f"""SELECT count(*) over () as cnt,연구개발과제번호 과제번호, 연구부처명 부처명, 연구사업명 사업명, 연구과제명 과제명, 주관기관명 주관기관, 연구기간내용 연구기간, 연구관리전문기관명 전문기관, 연구과제기여율내용 기여율 FROM "공개RND" {self._whereAppNo} ORDER BY 연구개발사업일련번호 ASC"""
        return result  

    def legal_query(self):
        result = f"""SELECT count(*) over () as cnt, 법적상태명, format_date_fn(법적상태일자::text) 법적상태일, 법적상태영문명 FROM 법적상태이력 {self._whereAppNo} and not (법적상태명 in ('특허출원','출원공개','설정등록','등록공고'))"""
        # result += self.add_orderby()
        # order by 법적상태일 DESC , 일련번호 DESC"""
        return result                  

    def application_number_query(self):
        return f"""SELECT 출원번호, 출원일, 등록일 FROM kr_tsv_view {self._whereApplicantCode}"""

    def ipc_query(self):
        return f"""SELECT * FROM (SELECT substring(ipc코드,1,4) "name", count(*) "value", 'A' AS type FROM kr_tsv_view {self._whereApplicantCode} GROUP BY substring(ipc코드,1,4) order by "value" desc limit 15 offset 0 ) A
        UNION ALL 
        SELECT * FROM (SELECT substring(ipc코드,1,3) "name", count(*) "value", 'B' AS type FROM kr_tsv_view {self._whereApplicantCode} GROUP BY substring(ipc코드,1,3) order by "value" desc limit 15 offset 0) B"""    

    def register_fee_query(self):
        return f"""SELECT count(*) over () as cnt, to_char(to_date(납부일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 납입일, concat(시작연차,'-',마지막년차) 납입년차, TO_CHAR(등록료,'FM999,999,999') as 납입금액 FROM 등록료 WHERE 등록번호 = $${self._regNo}$$ order by 시작연차 DESC"""


    def right_holder_query(self):
        return f"""SELECT count(*) over () as cnt, 순위번호, 권리자일련번호, concat(권리자명, ' (',주소,')') 권리자정보, to_char(to_date(등록일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 등록일 FROM 권리권자변동 WHERE 등록번호 = $${self._regNo}$$ and 권리자구분 = $$권리자$$ order by 순위번호 ASC, 권리자일련번호 ASC"""
   
    def rightfull_order_query(self):
        return f"""SELECT count(*) over () as cnt, * FROM 권리순위 {self._whereAppNo} order by 순위번호 ASC"""

    def associate_corp_query(self):
        return f"""SELECT count(*) over () as cnt, 회사명, 종목코드, 업종, 주요제품, 상장일, 결산월, 대표자명, 정보 FROM Listed_corp {self._whereApplicant}"""    