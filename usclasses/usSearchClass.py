from utils import request_data, remove_tail, redis_key
from django.core.cache import cache

from ipclasses.ipSearchClass import IpSearch
from ipclasses import IpSearch

class UsSearch(IpSearch):
    def set_up(self):
        self._params, self._subParams = request_data(self._request)

        self._appNo = self._params.get('appNo','')  
        self._whereAppNo = f'WHERE "문헌번호" = $${self._appNo}$$'
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

    def search_query(self):
        result = f"""SELECT A.*,
	    B."발명자", B."발명자국적",
        D.요약, F."청구항",
     
        CASE
            WHEN I."IPC코드" IS NULL
            THEN ARRAY[]::text[]
            ELSE I."IPC코드"
        END "IPC코드",
        CASE
            WHEN J."CPC코드" IS NULL
            THEN ARRAY[]::text[]
            ELSE J."CPC코드"
        END "CPC코드",
        M."출원인", M."출원인국적", M."출원인주소" 
        FROM 
	    (
	    SELECT
            문헌번호,
            CONCAT('US ', TRIM (
            LEADING '0'
            FROM
                CAST (concat_ws(' ',
                    left(문헌번호, 12),
                    right(문헌번호,2)
                    ) AS TEXT)
            )) 문헌번호enrich,
            CASE
                WHEN 등록일 IS NULL
                THEN NULL
                ELSE to_char(출원일::text::date + INTERVAL '20 year', 'yyyymmdd')
            END 존속기간만료일,                          
		    'Live' AS 등록사항,
		    "발명의명칭" AS 명칭,
		    '' AS 영문명칭,
            출원번호, 출원일,
            공개번호, 공개일,
            공보번호, 공보일,
            등록번호, 등록일 
	    FROM
		    "US_BIBLIO" {self._whereAppNo} 
	    )
	    A LEFT JOIN (
        SELECT 문헌번호, array_agg(이름) 발명자, array_agg(국적) 발명자국적 
	    FROM "US_REL_PSN" 
        WHERE 구분 = '발명자'
	    GROUP BY 문헌번호            
	    ) B ON A.문헌번호 = B.문헌번호
        LEFT JOIN ( SELECT 문헌번호, 요약 FROM "US_ABSTRACT") D ON A.문헌번호 = D.문헌번호
	    LEFT JOIN ( SELECT 문헌번호, 청구항 FROM "US_CLAIM") F ON A.문헌번호 = F.문헌번호	
        LEFT JOIN (
            SELECT 문헌번호, array_agg(ipc코드) AS "IPC코드" FROM "US_IPC" GROUP BY 문헌번호 ) I ON A.문헌번호 = I.문헌번호
        LEFT JOIN ( 
            SELECT 문헌번호, array_agg(cpc코드) AS "CPC코드" FROM "US_CPC" GROUP BY 문헌번호 ) J ON A.문헌번호 = J.문헌번호
        LEFT JOIN (
            SELECT 문헌번호, array_agg(이름) 출원인, array_agg(국적) 출원인국적, array_agg(주소) 출원인주소 
	    FROM "US_REL_PSN" 
	    GROUP BY 문헌번호 ) M ON A.문헌번호 = M.문헌번호"""
        return result

    def quote_query(self):
        result = f"""
        SELECT count(*) over () as cnt,
            B.번호,
            B.국가,
            A.명칭,
            A.출원인,
	        format_date_fn(A.일자::TEXT) 일자,
            A."ipc코드" 
        FROM
            (
            SELECT
                문헌번호,
                TRIM(인용문헌국적코드) 국가,
                '종류',
                "출원/등록일자" 일자,   
                CASE 
                    WHEN TRIM(인용문헌국적코드) = 'US' AND 종류 like 'A_' THEN replace("출원/등록번호", '/','')
                    WHEN TRIM(인용문헌국적코드) = 'US' AND 종류 like 'B_' THEN lpad("출원/등록번호", 8, '0')
                    ELSE "출원/등록번호"
                END 번호
            FROM
                "US_CTLTR" {self._whereAppNo} 
            GROUP BY
                문헌번호, 국가, 일자, 번호, 종류
            ) B LEFT JOIN 
            (
                SELECT C.*, D."ipc코드", E.출원인 
                FROM (
                SELECT
                    문헌번호,
                    발명의명칭 명칭,
                    CASE 
                        WHEN COALESCE ( 등록번호:: TEXT, '' ) = '' THEN  공개번호
                        ELSE 등록번호
                    END 번호,                    
                    CASE 
                        WHEN COALESCE ( 등록일:: TEXT, '' ) = '' THEN  출원일 
                        ELSE 등록일
                    END 일자
                FROM
                "US_BIBLIO" WHERE 문헌번호 like '____________B_'
                ) C	
                INNER JOIN ( SELECT 문헌번호, "ipc코드" FROM "US_IPC" WHERE 일련번호 = 1 ) D ON C.문헌번호 = D.문헌번호  
                INNER JOIN ( SELECT 문헌번호, 이름 출원인 FROM "US_REL_PSN" WHERE 구분 = '출원인' AND 일련번호 = 1) E ON C.문헌번호 = E.문헌번호  
            ) A
        ON B.번호 = A.번호 ORDER BY 국가"""
        print(result)
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
                출원번호, 패밀리국가코드 AS 국가코드, 패밀리번호, 패밀리특허문헌코드 AS 문헌코드, 문헌번호, 출원번호 AS 패밀리출원번호
            FROM
                "US_FAMILY" {self._whereAppNo} AND 패밀리국가코드 = 'KR'
            ) B
                CROSS JOIN (
                SELECT C.*, D.명칭, D.ipc코드 FROM (SELECT 출원번호::text,
                등록일자 AS 일자 FROM 공개서지정보) C
                INNER JOIN ( SELECT 출원번호::text, 명칭, ipc코드 FROM "공개출원인ipc"
                ) D ON C.출원번호 = D.출원번호
                ) A
				WHERE B."패밀리출원번호"::text = A.출원번호

        UNION ALL

        SELECT
            B1.국가코드, B1.패밀리번호, B1.패밀리출원번호, B1.문헌코드, B1.문헌번호,
			A1.명칭, A1.일자, A1."IPC코드" AS "IPC" 
        FROM
            (
            SELECT
                출원번호, 패밀리국가코드 AS 국가코드, 패밀리번호, 패밀리특허문헌코드 AS 문헌코드, 문헌번호, 출원번호 AS 패밀리출원번호
            FROM
                "US_FAMILY" {self._whereAppNo} AND 패밀리국가코드 = 'CN'
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
			A2.명칭, A2.일자, A2."IPC코드" AS "IPC" 
        FROM
            (
            SELECT
                출원번호, 패밀리국가코드 AS 국가코드, 패밀리번호, 패밀리특허문헌코드 AS 문헌코드, 문헌번호, 출원번호 AS 패밀리출원번호
            FROM
                "US_FAMILY" {self._whereAppNo} AND 패밀리국가코드 = 'JP'
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
			A3.명칭, A3.일자, A3."IPC코드" AS "IPC" 	
        FROM
            (
            SELECT
                출원번호, 패밀리국가코드 AS 국가코드, 패밀리번호, 패밀리특허문헌코드 AS 문헌코드, 문헌번호, 출원번호 AS 패밀리출원번호 
            FROM
                "US_FAMILY" {self._whereAppNo} AND 패밀리국가코드 = 'EP'
            ) B3
                CROSS JOIN ( 
                SELECT C3.*, D3."IPC코드" FROM (SELECT 문헌번호, 발명의명칭 AS 명칭,
                등록일 AS 일자 FROM "EP_BIBLIO") C3 
                INNER JOIN ( SELECT 문헌번호, "IPC코드" FROM "EP_IPC" WHERE 일련번호 = 1
                ) D3 ON C3.문헌번호 = D3.문헌번호
                ) A3
                WHERE B3.문헌번호 = A3.문헌번호	
        UNION ALL						
						
        SELECT
            B4.국가코드, B4.패밀리번호, B4.패밀리출원번호, B4.문헌코드, B4.문헌번호,
			A4.명칭, A4.일자, A4.IPC코드 AS "IPC" 
        FROM
            (
            SELECT
                출원번호, 패밀리국가코드 AS 국가코드, 패밀리번호, 패밀리특허문헌코드 AS 문헌코드, 문헌번호, 출원번호 AS 패밀리출원번호
            FROM
                "US_FAMILY" {self._whereAppNo} AND 패밀리국가코드 = 'US'
            ) B4
                CROSS JOIN ( 
                SELECT C4.*, D4.IPC코드 FROM (SELECT 문헌번호, 발명의명칭 AS 명칭,
                등록일 AS 일자 FROM "US_BIBLIO") C4 
                INNER JOIN ( SELECT 문헌번호, IPC코드 FROM "US_IPC" WHERE 일련번호 = 1
                ) D4 ON C4.문헌번호 = D4.문헌번호
                ) A4
                WHERE B4.문헌번호 = A4.문헌번호			
        UNION ALL						
						
        SELECT
            B5.국가코드, B5.패밀리번호, B5.패밀리출원번호, B5.문헌코드, B5.문헌번호,
			A5.명칭, A5.일자, A5."IPC코드" AS "IPC" 
            FROM
            (
            SELECT
                출원번호, 패밀리국가코드 AS 국가코드, 패밀리번호, 패밀리특허문헌코드 AS 문헌코드, 문헌번호, 출원번호 AS 패밀리출원번호
            FROM
                "US_FAMILY" {self._whereAppNo} AND 패밀리국가코드 = 'WO'
            ) B5
                CROSS JOIN ( 
                SELECT C5.*, D5."IPC코드" FROM (SELECT 문헌번호, 발명의명칭 AS 명칭,
                등록일 AS 일자 FROM "WO_BIBLIO") C5 
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
                출원번호, 패밀리국가코드 AS 국가코드, 패밀리번호, 패밀리특허문헌코드 AS 문헌코드, 문헌번호, 출원번호 AS 패밀리출원번호
            FROM
                "US_FAMILY" {self._whereAppNo}
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
            #         "US_FAMILY" {self._whereAppNo} 

            #     SELECT
            #         출원번호, 패밀리국가코드 AS 국가코드, 패밀리번호, 문헌코드, 문헌번호,
            #     CASE
            #         WHEN 패밀리국가코드 = 'KR' 
            #         THEN
            #             split_part( 패밀리출원번호, ',', 1 ) :: TEXT ELSE 문헌번호 
            #         END "연결출원번호"
            #     FROM
            #         "US_FAMILY" {self._whereAppNo}                     
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

