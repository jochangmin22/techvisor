from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
from bs4 import BeautifulSoup
import re
from konlpy.tag import Mecab
from collections import Counter

from .similarity import similarity

import requests
import json

from django.db.models import Q
from ..models import Listed_corp
from utils import readRedis, writeRedis, dictfetchall

from django.conf import settings
COMPANY_ASSIGNE_MATCHING = settings.TERMS['COMPANY_ASSIGNE_MATCHING']
KIPRIS = settings.KIPRIS

def get_search(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        appNo = data["appNo"]    

    redisKey = appNo + "¶"  # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    result = readRedis(redisKey, 'raw')
    if result:
        return JsonResponse(result, safe=False)
    # Redis }

    with connection.cursor() as cursor:
        whereAppNo = "" if appNo == "" else 'WHERE "출원번호" = $$' + appNo + "$$"
        # regexp_replace(초록, E'<[^>]+>', '', 'gi')
        # regexp_replace(regexp_replace(청구항,E'<?/?br>',E'\r\n', 'gi'),E'<DP[^<]+?>', ' ', 'gi')
        # TODO : 공개공보에 발명자4~10 넣어버리기 - crosstab 속도문제

            # "SELECT A.*, concat(B.발명자1,'(',C.코드1,'), ',B.발명자2,'(',C.코드2,'), ',B.발명자3,'(',C.코드3,'), ',B.발명자4,'(',C.코드4,'), ',B.발명자5,'(',C.코드5,'), ',B.발명자6,'(',C.코드6,'), ',B.발명자7,'(',C.코드7,'), ',B.발명자8,'(',C.코드8,'), ',B.발명자9,'(',C.코드9,'), ',B.발명자10,'(',C.코드10,')') 발명자, D.명세서, E.존속기간만료일자 FROM (SELECT 등록사항, \"발명의명칭(국문)\" as 명칭, 출원번호, 출원일자, 공개번호, 공개일자, 공고번호, 공고일자, 등록번호, 등록일자, ipc코드, 출원인1, 출원인2, 출원인3, 출원인코드1, 출원인주소1, 출원인국가코드1,  청구항수, 초록, 청구항, concat(명칭token, ' ', 요약token, ' ', 대표항token) 전문소token FROM 공개공보 "
            # TO_CHAR(출원번호,'99-9999-9999999')
            # TO_CHAR(등록번호,'99-9999999-9999')
        cursor.execute(
            "SELECT A.*, B.발명자1, B.발명자2, B.발명자3, B.발명자4, B.발명자5, B.발명자6, B.발명자7, B.발명자8, B.발명자9, B.발명자10, C.코드1, C.코드2, C.코드3, C.코드4, C.코드5, C.코드6, C.코드7, C.코드8, C.코드9, C.코드10, D.명세서, E.존속기간만료일자, E.소멸일자 FROM (SELECT 등록사항, \"발명의명칭(국문)\" as 명칭, \"발명의명칭(영문)\" as 영문명칭, 출원번호 as 출원번호원본, 출원번호, to_char(to_date(출원일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 출원일자, 공개번호, to_char(to_date(공개일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 공개일자, 공고번호, to_char(to_date(공고일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 공고일자, 등록번호, to_char(to_date(등록일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 등록일자, ipc코드, 출원인1, 출원인2, 출원인3, 출원인코드1, 출원인주소1, 출원인국가코드1,  청구항수, 초록, 청구항, concat(명칭token, ' ', 요약token, ' ', 대표항token) 전문소token FROM 공개공보 "
            + whereAppNo
            + ") A LEFT JOIN "
            + " (select * from crosstab('SELECT 출원번호, \"RN2\", 성명 FROM 공개인명정보 "
            + whereAppNo
            + " and \"RN2\" between 1 and 10 order by 1,2') as ct(출원번호 numeric, 발명자1 varchar, 발명자2 varchar, 발명자3 varchar, 발명자4 varchar, 발명자5 varchar, 발명자6 varchar, 발명자7 varchar, 발명자8 varchar, 발명자9 varchar, 발명자10 varchar)) B ON A.출원번호원본 = B.출원번호 "
            + " LEFT JOIN "
            + " (select * from crosstab('SELECT 출원번호, \"RN2\", 국가코드 FROM 공개인명정보 "
            + whereAppNo
            + " and \"RN2\" between 1 and 10 order by 1,2') as ct(출원번호 numeric, 코드1 varchar, 코드2 varchar, 코드3 varchar, 코드4 varchar, 코드5 varchar, 코드6 varchar, 코드7 varchar, 코드8 varchar, 코드9 varchar, 코드10 varchar)) C ON A.출원번호원본 = C.출원번호 "
            + " LEFT JOIN "
            + " (select * from 공개명세서 "
            + whereAppNo
            + ") D ON A.출원번호원본 = D.출원번호 "
            + " LEFT JOIN "
            + " (select 출원번호, to_char(to_date(존속기간만료일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 존속기간만료일자, to_char(to_date(소멸일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 소멸일자 from 등록 "
            + whereAppNo
            + ") E ON A.출원번호원본 = E.출원번호 "            
            # + " limit 1000"
        )
        row = dictfetchall(cursor)
        # _row = row[0]
        # row[0].update({"독립항수": 99, "종속항수": 88})
        # row[0].update(get_claims(request, row[0]["청구항"]))
        res = (
            get_claims(request, row[0]["청구항"], row[0]["출원번호"])
            if row[0]["청구항"] and row[0]["청구항"] != "<SDOCL></SDOCL>"
            # else {"독립항수": 0, "종속항수": 0, "청구항들": []}
            else {"청구항종류": [], "청구항들": []}
        )

        row[0].update(res)

        del row[0]['청구항']  # remove claims for memory save

        res = (
            get_abstract(request, row[0]["초록"])
            if row[0]["초록"] and row[0]["초록"] != "<SDOAB></SDOAB>"
            else {"초록": '', "키워드": ''}
        )

        row[0].update(res)

        empty_res = {"기술분야": "", "배경기술": "", "해결과제": "",
                     "해결수단": "", "발명효과": "", "도면설명": "", "발명의실시예": ""}
        res = (
            get_description(request, row[0]["명세서"])
            if row[0]["명세서"] and row[0]["명세서"] != "<SDODE></SDODE>"
            else empty_res
        )
        # res = res if res else empty_res

        row[0].update(res)

        del row[0]['명세서']  # remove description for memory save

        # 전문소 tokenizer
        res = ({'전문소token': ' '.join(
            tokenizer(row[0]['전문소token']) if row[0]['전문소token'] else [])})
        row[0].update(res)

    # Redis {
    writeRedis(redisKey, 'raw', row[0])
    # Redis }

    return JsonResponse(row[0], safe=False)
    # return HttpResponse(row, content_type="text/plain; charset=utf-8")

def get_search_quote(request):
    """ 인용 검색 """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        appNo = data["appNo"]    

    redisKey = appNo + "¶"  # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    result = readRedis(redisKey, 'quote')
    if result:
        return JsonResponse(result, safe=False)        
    # Redis }

    with connection.cursor() as cursor:
        query = 'SELECT Z.식별코드, Z.국가, Z.인용참증단계, A.명칭, A.출원인, case when coalesce(Z.일자,\'\')=\'\' then A.문헌일 else Z.일자 end 일자, A.출원번호, A."IPC코드" FROM ( \
            SELECT \
                split_part( 인용문헌출원번호_국내, \',\', 1 ) :: NUMERIC AS 인용문헌번호1, string_agg ( 인용문헌구분코드명, \', \' ) 인용참증단계, \'B1\' 식별코드, 표준인용문헌국가코드 국가, to_char( to_date( 표준인용문헌발행일자:: TEXT, \'YYYYMMDD\' ), \'YYYY.MM.DD\' ) 일자, 출원번호 FROM \
                특허실용심사인용문헌 WHERE "출원번호" = $$' + appNo + '$$ \
            GROUP BY \
                인용문헌번호1, 국가, 일자, 출원번호 \
            UNION ALL \
            SELECT split_part( 출원번호::TEXT, \',\', 1) :: NUMERIC AS 출원번호1, string_agg( 피인용문헌구분코드명, \', \' ) 피인용참증단계, \'F1\' 식별코드, \'KR\' 국가, \'\' 일자, 피인용문헌번호::numeric FROM \
        "특허실용심사피인용문헌" WHERE "피인용문헌번호" = $$' + appNo + '$$ \
        GROUP BY \
        출원번호1, 피인용문헌번호 \
            ) \
            Z, (SELECT 출원번호, "발명의명칭(국문)" || case when coalesce("발명의명칭(영문)", \'\') = \'\' then \'\' else \' (\' || "발명의명칭(영문)" || \')\' end 명칭, 출원인1 || case when coalesce(출원인2, \'\') = \'\' then \'\' else \', \' || 출원인2 end || case when coalesce(출원인3, \'\') = \'\' then \'\' else \', \' || 출원인3 end 출원인, case when coalesce(등록일자:: TEXT,\'\') = \'\' then to_char( to_date( 출원일자:: TEXT, \'YYYYMMDD\' ), \'YYYY.MM.DD\' ) else to_char( to_date( 등록일자:: TEXT, \'YYYYMMDD\' ), \'YYYY.MM.DD\' ) end 문헌일, ipc코드 "IPC코드" FROM 공개공보) A WHERE Z.인용문헌번호1 = A.출원번호'

        cursor.execute(query)
        # whereAppNo = "" if appNo == "" else 'WHERE "출원번호" = $$' + appNo + "$$"
        # cursor.execute(
        #     "SELECT A.식별코드, A.국가, A.인용참증단계, B.명칭, A.일자, B.출원인, B.출원번호, B.\"IPC코드\" FROM (SELECT split_part(\"인용문헌출원번호_국내\", ',', 1)::numeric AS 인용문헌번호1, string_agg(인용문헌구분코드명, ', ') 인용참증단계, 'B1' 식별코드, 표준인용문헌국가코드 국가, to_char(to_date(표준인용문헌발행일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 일자, 출원번호 FROM 특허실용심사인용문헌 "
        #     + whereAppNo 
        #     + " GROUP BY 인용문헌번호1, 국가, 일자, 출원번호) A "
        #     + "JOIN ("
        #     + " SELECT 출원번호, \"발명의명칭(국문)\" || case when coalesce(\"발명의명칭(영문)\", '') = '' then '' else ' (' || \"발명의명칭(영문)\" || ')' end 명칭, 출원인1 || case when coalesce(출원인2, '') = '' then '' else ', ' || 출원인2 end || case when coalesce(출원인3, '') = '' then '' else ', ' || 출원인3 end 출원인, 등록일자, ipc코드 \"IPC코드\" FROM 공개공보 "
        #     + " ) B ON A.인용문헌번호1 = B.출원번호 "           
        # )
        row = dictfetchall(cursor)
  

    # 피인용 REST ; bulk 신청못했음
    # serviceParam = 'CitingService/'
    # operationKey = 'citingInfo'
    # url = KIPRIS['rest_url'] + serviceParam + operationKey + '?standardCitationApplicationNumber=' + appNo + '&accessKey=' + KIPRIS['service_key']
    # # url = "http://plus.kipris.or.kr/openapi/rest/CitingService/citingInfo?standardCitationApplicationNumber=1019470000187&accessKey=" + KIPRIS['service_key']
    # # return JsonResponse(url, safe=False)
    # html = requests.get(url)
    # soup = BeautifulSoup(html.content, 'xml')

    # <response>
    # <header>
    # <resultCode/>
    # <resultMsg/>
    # </header>
    # <body>
    # <items>
    # <citingInfo>
    # <StandardCitationApplicationNumber>1020150034235</StandardCitationApplicationNumber>
    # <ApplicationNumber>1020180133527</ApplicationNumber>
    # <StandardStatusCode>20001</StandardStatusCode>
    # <StandardStatusCodeName>표준화</StandardStatusCodeName>
    # <CitationLiteratureTypeCode>E0802</CitationLiteratureTypeCode>
    # <CitationLiteratureTypeCodeName>선행기술조사보고서</CitationLiteratureTypeCodeName>
    # </citingInfo>
    # <citingInfo>
    # <StandardCitationApplicationNumber>1020150034235</StandardCitationApplicationNumber>
    # <ApplicationNumber>1020180133527</ApplicationNumber>
    # <StandardStatusCode>20001</StandardStatusCode>
    # <StandardStatusCodeName>표준화</StandardStatusCodeName>
    # <CitationLiteratureTypeCode>E0806</CitationLiteratureTypeCode>
    # <CitationLiteratureTypeCodeName>출원서인용문헌이력정보</CitationLiteratureTypeCodeName>
    # </citingInfo>
    # </items>
    # </body>
    # </response>    

    # 식별코드: "A"
    # 국가: "KR"
    # 문헌번호: "공개특허공보 제10-2010-0017284호(2010.02.16.) 1부."
    # 인용참증단계: "발송문서"
    # 일자: "2010.02.16"
    # 인용문헌번호1: "1020097024395"
    # 출원번호: "1020097024395"
    # 명칭: "에지 보호기를 갖는 가요성 디스플레이를 포함하는 전자 장치 (AN ELECTRONIC DEVICE COMPRISING A FLEXIBLE DISPLAY WITH  EDGE PROTECTORS)"
    # 출원인: "크리에이터 테크놀로지 비.브이."
    # 등록일자: "20141205"

    # bs = soup.find_all(operationKey)

    # empty_res = {"식별코드": "", "국가": "", "문헌번호": "", "인용참증단계": "", "일자": "", "인용문헌번호1": "", "출원번호": "", "명칭": "", "출원인": "", "등록번호": ""}    

    # if bs:
    #     for bs1 in bs:
    #         if bs1:
    #             citingNo = bs1.find("ApplicationNumber").get_text()
    #             if citingNo:
    #                 res = get_citing_info(citingNo)
    #                 if res:
    #                     res.update({'문헌번호' : "KR" + res['문헌번호'] + ' ' + res['식별코드']})
    #                     res.update({'식별코드' : 'F1'}) # wips style
    #                     res.update({'일자' : res['등록일자']})
    #                     res.update({'인용참증단계' : bs1.find("CitationLiteratureTypeCodeName").get_text()}) 

    #                     row.append(res)      

    # data = []          
    # if bs:
    #     for bs1 in bs:
    #         if bs1:
    #             # res = {}
    #             citingNo = bs1.find("ApplicationNumber").get_text()
    #             if citingNo:
    #                 res = {'출원번호' : citingNo, '인용참증단계' : bs1.find("CitationLiteratureTypeCodeName").get_text()}
    #                 data.append(res)                

    # # Grouping                    
    # groups = {}
    # for d in data:
    #     if d['출원번호'] not in groups:
    #         groups[d['출원번호']] = {'인용참증단계': d['인용참증단계']}
    #     else:
    #         groups[d['출원번호']]['인용참증단계'] += ', ' + d['인용참증단계']
    # result = [{**{'출원번호': k}, **v} for k, v in groups.items()]        

    # # Add more entires from db
    # for r in result:
    #     if r['출원번호']:
    #         res = get_citing_info(r['출원번호'])
    #         if res:
    #             # res.update({'문헌번호' : "KR" + res['문헌번호'] + ' ' + res['식별코드']})
    #             res.update({'식별코드' : 'F1'})
    #             res.update({'일자' : res['일자']})
    #             res.update({'인용참증단계' : r['인용참증단계']}) 

    #             row.append(res)                   

    # # Change words in 인용참증단계
    # for r in row:
    #     if r['인용참증단계']:
    #         r.update({'인용참증단계' : r['인용참증단계'].replace('발송문서','심사관 인용').replace('선행기술조사문헌','심사보고서').replace('선행기술조사보고서','선행기술조사').replace('출원서인용문헌이력정보','출원서 인용')})

    # Redis {
    writeRedis(redisKey, 'quote', row)
    # Redis }

    return JsonResponse(row, safe=False)

def get_citing_info(appNo):
    with connection.cursor() as cursor:
        whereAppNo = "" if appNo == "" else 'WHERE "출원번호" = $$' + appNo + "$$"
        cursor.execute(
            "SELECT case when coalesce(등록일자::numeric::text, '') = '' then 'A' else 'B1' end 식별코드, 'KR' 국가, 출원번호, \"발명의명칭(국문)\" || case when coalesce(\"발명의명칭(영문)\", '') = '' then '' else ' (' || \"발명의명칭(영문)\" || ')' end 명칭, 출원인1 || case when coalesce(출원인2, '') = '' then '' else ', ' || 출원인2 end || case when coalesce(출원인3, '') = '' then '' else ', ' || 출원인3 end 출원인, to_char(to_date(case when coalesce(등록일자::numeric::text, '') = '' then case when coalesce(공개일자::numeric::text,'') = '' then 출원일자::text else 공개일자::text end else 등록일자::text end, 'YYYYMMDD'), 'YYYY.MM.DD') 일자, ipc코드 \"IPC코드\" FROM 공개공보 "
            + whereAppNo
        )
        row = dictfetchall(cursor)

    res = [] if row == [] else row[0]
    return res

def get_search_rnd(request):
    """ searchDetails RND """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
    appNo = data["appNo"]    
    redisKey = appNo + "¶"

    result = readRedis(redisKey, 'rnd')
    if result:
        return JsonResponse(result, safe=False)    

    with connection.cursor() as cursor:
        whereAppNo = 'WHERE "출원번호" = $$' + appNo + "$$"
        cursor.execute(
            "SELECT 연구개발과제번호 과제번호, 연구부처명 부처명, 연구사업명 사업명, 연구과제명 과제명, 주관기관명 주관기관, 연구기간내용 연구기간, 연구관리전문기관명 전문기관, 연구과제기여율내용 기여율 FROM \"공개RND\" "
            + whereAppNo
            + " ORDER BY 연구개발사업일련번호 ASC"
            )
        row = dictfetchall(cursor)
    writeRedis(redisKey, 'rnd', row)
    return JsonResponse(row, safe=False)

def get_search_family(request):
    """ searchDetails용 패밀리 검색 """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        appNo = data["appNo"]    
    redisKey = appNo + "¶"  # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    result = readRedis(redisKey, 'family')
    if result:
        return JsonResponse(result, safe=False)        
    # Redis }
    with connection.cursor() as cursor:
        whereAppNo = "" if appNo == "" else 'WHERE "출원번호" = $$' + appNo + "$$"
        cursor.execute(
            "SELECT A.국가코드, A.패밀리번호, A.문헌코드, A.문헌번호, B.명칭, B.일자, B.ipc코드 \"IPC\" FROM (SELECT 출원번호, 패밀리국가코드 국가코드, 패밀리번호, 문헌코드, 문헌번호, case when 패밀리국가코드 = 'KR' then split_part(패밀리출원번호, ',', 1)::numeric else null end 패밀리출원번호1 FROM 특허패밀리 "
            + whereAppNo
            + ") A LEFT JOIN (SELECT 출원번호, \"발명의명칭(국문)\" || case when coalesce(\"발명의명칭(영문)\", '') = '' then '' else ' (' || \"발명의명칭(영문)\" || ')' end 명칭, to_char(to_date(등록일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 일자, ipc코드 FROM 공개공보 "
            + ") B ON A.패밀리출원번호1 = B.출원번호"
        )
        row = dictfetchall(cursor)

    # Redis {
    writeRedis(redisKey, 'family', row)
    # Redis }

    return JsonResponse(row, safe=False)

def get_search_ipc_cpc(request):
    """ searchDetails IPC, CPC """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        appNo = data["appNo"]    
    redisKey = appNo + "¶"

    result = readRedis(redisKey, 'ipccpc')
    if result:
        return JsonResponse(result, safe=False)
    with connection.cursor() as cursor:
        whereAppNo = "" if appNo == "" else 'WHERE "출원번호" = $$' + appNo + "$$"
        cursor.execute(
            "(SELECT 'I' 구분, \"ipc코드\" 코드, \"ipc개정일자\" 일자 from \"공개IPC\" "
            + whereAppNo
            + " ORDER BY 특허분류일련번호 ASC)"
            + " UNION ALL "
            + "(SELECT 'C' 구분, \"cpc코드\" 코드, \"cpc개정일자\" 일자 from \"공개CPC\" "
            + whereAppNo
            + " ORDER BY 특허분류일련번호 ASC)"
        )
        row = dictfetchall(cursor)

    writeRedis(redisKey, 'ipccpc', row)

    return JsonResponse(row, safe=False)

def get_search_legal(request):
    """ searchDetails용 법적상태이력 검색 """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        appNo = data["appNo"]    
    redisKey = appNo + "¶"  # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    result = readRedis(redisKey, 'legal')
    if result:
        return JsonResponse(result, safe=False)    
    # Redis }
    with connection.cursor() as cursor:
        whereAppNo = "" if appNo == "" else 'WHERE "출원번호" = $$' + appNo + "$$"
        whereFilter = " and not (법적상태명 in ('특허출원','출원공개','설정등록','등록공고'))" #'등록료납부','연차료납부'))"
        cursor.execute(
            "SELECT 출원번호, 법적상태명, to_char(to_date(법적상태일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 법적상태일자, 법적상태영문명 FROM 법적상태이력 "
            + whereAppNo
            + whereFilter
            + " order by 법적상태일자 DESC , 일련번호 DESC"
        )
        row = dictfetchall(cursor)

    # Redis {
    writeRedis(redisKey, 'legal', row)
    # Redis }

    return JsonResponse(row, safe=False)

def get_search_registerfee(request):
    """ searchDetails용 등록료 검색 """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        rgNo = data["rgNo"]    
    redisKey = rgNo + "¶"  # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    result = readRedis(redisKey, 'registerfee')
    if result:
        return JsonResponse(result, safe=False)    
    # Redis }
    with connection.cursor() as cursor:
        whereRgNo = "" if rgNo == "" else 'WHERE "등록번호" = $$' + rgNo + "$$"
        cursor.execute(
            "SELECT to_char(to_date(납부일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 납입일, concat(시작연차,'-',마지막년차) 납입년차, TO_CHAR(등록료,'FM999,999,999') as 납입금액 FROM 등록료 "
            + whereRgNo
            + " order by 시작연차 DESC"
        )
        row = dictfetchall(cursor)

    # Redis {
    writeRedis(redisKey, 'registerfee', row)
    # Redis }

    return JsonResponse(row, safe=False)

def get_search_rightfullorder(request):
    """ searchDetails용 권리순위 검색 """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        appNo = data["appNo"]    
    redisKey = appNo + "¶"  # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    result = readRedis(redisKey, 'rightfullorder')
    if result:
        return JsonResponse(result, safe=False)    
    # Redis }
    with connection.cursor() as cursor:
        whereAppNo = "" if appNo == "" else 'WHERE "출원번호" = $$' + appNo + "$$"
        cursor.execute(
            "SELECT * FROM 권리순위 "
            + whereAppNo
            + " order by 순위번호 ASC"
        )
        row = dictfetchall(cursor)

    # Redis {
    writeRedis(redisKey, 'rightfullorder', row)
    # Redis }

    return JsonResponse(row, safe=False)

def get_search_rightholder(request):
    """ searchDetails용 권리권자변동 검색 """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        rgNo = data["rgNo"]    
    redisKey = rgNo + "¶"  # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    result = readRedis(redisKey, 'rightholder')
    if result:
        return JsonResponse(result, safe=False)
    # Redis }
    with connection.cursor() as cursor:
        whereRgNo = "" if rgNo == "" else 'WHERE "등록번호" = $$' + rgNo + "$$"
        cursor.execute(
            "SELECT 순위번호, 권리자일련번호, concat(권리자명, ' (',주소,')') 권리자정보, to_char(to_date(등록일자::text, 'YYYYMMDD'), 'YYYY.MM.DD') 등록일자 FROM 권리권자변동 "
            + whereRgNo
            + " and 권리자구분 = $$권리자$$ order by 순위번호 ASC, 권리자일련번호 ASC"
        )
        row = dictfetchall(cursor)

    # Redis {
    writeRedis(redisKey, 'rightholder', row)
    # Redis }

    return JsonResponse(row, safe=False)

def get_search_applicant(request):
    """ searchDetails용 출원인 법인, 출원동향, 보유기술 검색 """
    data = json.loads(request.body.decode('utf-8'))
    aCode = data['aCode']
    aCode = aCode.replace("-", "")      

    serviceParam = 'CorpBsApplicantService/'
    operationKey = 'corpBsApplicantInfo'
    url = KIPRIS['rest_url'] + serviceParam + operationKey + '?ApplicantNumber=' + aCode + '&accessKey=' + KIPRIS['service_key']
    # url = "http://plus.kipris.or.kr/openapi/rest/CorpBsApplicantService/corpBsApplicantInfo?ApplicantNumber=519980692724&accessKey=" + KIPRIS['service_key']

    html = requests.get(url)
    soup = BeautifulSoup(html.content, 'xml')

      
    # faliure msg ;

    # <response>
    # <header>
    # <resultCode>101</resultCode>
    # <resultMsg>AccessKey&ServiceID Is Not Registerd Error</resultMsg>
    # </header>
    # <body>
    # <items> </items>
    # </body>
    # </response>

    # succes msg ;

    # <response>
    # <header>
    # <resultCode/>
    # <resultMsg/>
    # </header>
    # <body>
    # <items>
    # <corpBsApplicantInfo>
    # <ApplicantNumber>119980018012</ApplicantNumber>
    # <ApplicantName>삼성카드 주식회사</ApplicantName>
    # <CorporationNumber>110111-0346901</CorporationNumber>
    # <BusinessRegistrationNumber>202-81-45602</BusinessRegistrationNumber>
    # </corpBsApplicantInfo>
    # </items>
    # </body>
    # </response>

    res = {"name": "", "corpNo": "", "bizNo": ""}
    bs = soup.find(operationKey)
    if bs:
        res['name'] = bs.find("ApplicantName").get_text()
        res['corpNo'] = bs.find("CorporationNumber").get_text()
        res['bizNo'] = bs.find("BusinessRegistrationNumber").get_text()

    return JsonResponse(res, safe=False)

def get_search_applicant_trend(request):
    """ searchDetails용 출원인 출원동향, 보유기술 검색 """
    """ 출원건수, 특허출원, 실용출원, 특허등록, 실용등록 """
    data = json.loads(request.body.decode('utf-8'))
    aCode = data['aCode']
    aCode = aCode.replace("-", "")
    redisKey = aCode + "¶"  # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    result = readRedis(redisKey, 'applicant_trend')
    if result:
        return JsonResponse(result, safe=False)    
    # Redis }
    with connection.cursor() as cursor:
        whereACode = "" if aCode == "" else 'WHERE "출원인코드1" = $$' + aCode + "$$"
        # query = "SELECT 출원일자, 공개일자, 등록일자, 출원번호, ipc요약 FROM 공개공보 " + whereACode
        # query = "SELECT left(출원번호::text,1) 구분, left(출원일자::text,4) 출원년, left(공개일자::text,4) 공개년, left(등록일자::text,4) 등록년, ipc요약 FROM 공개공보 " + whereACode

        subQuery = "SELECT left(출원번호::text,1) 구분, left(출원일자::text,4) pyr, left(등록일자::text,4) ryr FROM 공개공보 " + whereACode
        # subQueryR = "SELECT left(출원번호::text,1) 구분, left(등록일자::text,4) ryr FROM 공개공보 " + whereACode + " and 등록일자 is not null"
        query = "select pyr, null ryr, count(*) pp, null::int4 up, null::int4 pr, null::int4 ur from (" + subQuery + ") A WHERE 구분 = '1' GROUP BY pyr"
        query +=" union all "
        query += "select pyr, null, null::int4, count(*), null::int4, null::int4 from (" + subQuery + ") A WHERE 구분 = '2' GROUP BY pyr"
        query +=" union all "
        query += "select null, ryr, null::int4, null::int4, count(*), null::int4 from (" + subQuery + ") A WHERE 구분 = '1' GROUP BY ryr"
        query +=" union all "
        query += "select null, ryr, null::int4, null::int4,  null::int4, count(*) from (" + subQuery + ") A  WHERE 구분 = '2' GROUP BY ryr"
        cursor.execute(query)
        row = dictfetchall(cursor)

    # Redis {
    writeRedis(redisKey, 'applicant_trend', row)
    # Redis }
    #
    return JsonResponse(row, safe=False)

def get_search_applicant_ipc(request):
    """ searchDetails용 출원인 보유기술 검색 """
    data = json.loads(request.body.decode('utf-8'))
    aCode = data['aCode']
    aCode = aCode.replace("-", "")
    redisKey = aCode + "¶"  # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    result = readRedis(redisKey, 'applicant_ipc')
    if result:
        return JsonResponse(result, safe=False)    
    # Redis }
    with connection.cursor() as cursor:
        whereACode = "" if aCode == "" else 'WHERE "출원인코드1" = $$' + aCode + "$$"
        query = 'SELECT ipc요약 "name", count(*) "value" FROM 공개공보 ' + whereACode + ' GROUP BY ipc요약 order by "value" desc limit 15 offset 0'

        cursor.execute(query)
        row = dictfetchall(cursor)

    # Redis {
    writeRedis(redisKey, 'applicant_ipc', row)
    # Redis }
    #
    return JsonResponse(row, safe=False)

def get_similar(request):
    """ 유사 문서 목록 """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
    appNo = data["appNo"]    
    modelType = data["modelType"] or 'doc2vec'   

    redisKey = appNo + "¶"  # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    result = readRedis(redisKey, 'similar')
    if result:
        return JsonResponse(result, safe=False)    
    # Redis }

    # with connection.cursor() as cursor:
    #     cursor.execute('select "명칭token" t, "요약token" a, "대표항token" c from 공개공보 where 출원번호 =' + appNo)
    #     row = dictfetchall(cursor)
    # raw = ' '.join(filter(None, (row[0]['t'], row[0]['a'], row[0]['c'])))
    # raw = tokenizer(raw)
    # raw = tuple(raw)

    # count = Counter(raw)
    # count = count.most_common(3)
    # new_raw = dict(count)
    # new_raw = list(new_raw.keys())

    # row = similarity(new_raw, modelType) 
        
    # # Redis {
    # handleRedis(redisKey, 'similar', row, mode="w")
    # # Redis }

    # return JsonResponse(row, safe=False)      

    with connection.cursor() as cursor:
        cursor.execute('select "요약token" a from 공개공보 where 출원번호 =' + appNo)
        # cursor.execute('select concat("요약token", \' \',"명칭token", \' \',"대표항token") a from 공개공보 where 출원번호 =' + appNo)
        row = dictfetchall(cursor)

    # 1/3 토큰화 중복제거
    # unique_list = list(dict.fromkeys(tokenizer(row[0]['a'])))
    # data = ' '.join(unique_list if unique_list else [])

    # 2/3 토큰화
    # data = ' '.join(tokenizer(row[0]['a']) if row[0]['a'] else [])

    # 3/3 그대로
    data = row[0]['a']
    dataList = tokenizer(row[0]['a']) if row[0]['a'] else []
    res = similarity(data, modelType, dataList) 

    # Redis {
    writeRedis(redisKey, 'similar', row)
    # Redis }

    return HttpResponse(res, content_type="application/json")

def _move_jsonfield_to_top_level(result):
    ''' move position each fields of 정보 json to main fields '''
    for i in range(len(result)):
        # data = json.loads(result[i]['정보']) 
        data = result[i]['정보'] 
        for key, value in data.items():
            result[i].update({key: value})

        del result[i]['정보']
        del result[i]['재무']
    return result            

def get_associate_corp(request):
    ''' Search for a company name that matches the applicant and representative or company name '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        applicant = data['applicant']
        if applicant:
            new_applicant = applicant
            strings = ["주식회사","(주)"]
            for string in strings:
                new_applicant = new_applicant.replace(string,"").strip()

            for k, v in COMPANY_ASSIGNE_MATCHING.items():
                if v == new_applicant:
                    new_applicant = k
                    break

            listedCorp = Listed_corp.objects.filter(Q(회사명__contains=new_applicant) | Q(대표자명__contains=new_applicant))
            if not listedCorp.exists():
                return JsonResponse([], safe=False)

                    # row = newListedCorp.values()
                    # result = list(row)
                    # result = _move_jsonfield_to_top_level(result)
                    # return JsonResponse(result, safe=False)

            row = listedCorp.values()
            result = list(row)
            result = _move_jsonfield_to_top_level(result)
            return JsonResponse(result, safe=False)

    return JsonResponse(result, safe=False)

def _get_typo(xmlStr=""):
    """ 오타 정리 """
    xmlStr = re.sub(r"<EMIID=", "<EMI ID=", xmlStr)  # tag 오타
    xmlStr = re.sub(
        r"<EMI .*?>", "", xmlStr
    )  # attribute 에 따옴표 없는 tree 에러 방지 - <EMI ID=8 HE=24 WI=164 FILE="kpo00008.TIF">
    xmlStr = re.sub(
        r"(<SB>|</SB>|<SP>|</SP>|<AP>|<U>|</U>|<SB\.| >|<PS>|</Sb>|)", "", xmlStr
    )  # <P></P> 사이에 문제되는 태그, 오타 태그 정리
    xmlStr = re.sub(r"(</SB)", "", xmlStr)  # <P></P> 사이에 문제되는 태그, 오타 태그 정리 2
    xmlStr = re.sub(r"</p>", "</P>", xmlStr)
    xmlStr = re.sub(r".TIF<", '.TIF"><', xmlStr)  # FILE="kpo00001.TIF</P>
    return xmlStr


def get_abstract(request, xmlStr=""):
   
    xmlStr = _get_typo(xmlStr)  # typo

    bs = BeautifulSoup(xmlStr, "lxml")  # case-insensitive

    my_dict = {"초록": "", "키워드": ""}

    if bs.find("sdoab"):  # type sdoab tag start
        my_dict["초록"], my_dict["키워드"] = abstract_type(
            bs, 'sdoab', 'summary', 'idxword')
        return my_dict
    elif bs.find("abstract"):  # type abstract tag start
        my_dict["초록"], my_dict["키워드"] = abstract_type(
            bs, 'abstract', 'summary', 'keyword')
        return my_dict
    elif bs.find("summary"):  # type summary tag start
        my_dict["초록"], my_dict["키워드"] = abstract_type(
            bs, 'summary', '', 'keyword')
        return my_dict


def abstract_type(bs, startTag, nextTag, keywordTag):
    # sample : <SDOAB><SUMMARY><P INDENT="14" ALIGN="JUSTIFIED">본 발명은 구아바로부터 얻은 단백질 타이로신 탈인산화 효소 1B 저해용 활성분획 추출물에 관한 것으로, 더욱 상세하게는 열대 식물인 구아바(guava, <I>Psidium guajava </I>Linn)의 잎 또는 열매로부터 단백질 타이로신 탈인산화 효소 1B(protein tyrosine phosphatase 1B, PTP1B)를 저해하여 인슐린의 작용을 촉진시킴으로써 당뇨병의 증상인 혈당상승에 대한 혈당강하 효과를 갖는 활성분획 추출물과 이를 효율적으로 추출, 정제하는 방법 그리고 그 추출물을 유효성분으로 함유하는 당뇨병 예방과 치료, 혈당강하 및 지방간 억제용 생약제에 관한 것이다.</P></SUMMARY><ABDR><DRAWREF IDREF="2"></ABDR><BR><IDXWORD>구아바, 단백질 타이로신 탈인산화 효소 1B(protein tyrosine phosphatase1B, PTP1B), 당뇨병 예방과 치료, 혈당강하, 지방간 억제</IDXWORD></SDOAB>

    # sample : <Abstract><Summary><P align="JUSTIFIED" indent="14">본 발명은 비자 유래의 신규 단백질 타이로신 탈인산효소 1B 저해용 화합물에 관한 것으로서, 비자(<I>Torreya nucifera</I>)를 메탄올 추출한 후 크로마토그래피를 이용하여 순수 분리 정제하여 얻은 신규 단백질 타이로신 탈인산효소 1B(protein tyrosine phosphatase1B, PTP1B) 저해 화합물과 이를 효율적으로 추출, 정제하는 방법 그리고 비자 추출물 및 이로부터 분리된 화합물을 유효성분으로 함유하는 당뇨병 예방과 치료, 혈당 강하용 용도에 관한 것이다.</P></Summary><AbstractFigure><DrawReference idref="1"/><BR/></AbstractFigure><Keyword>비자(Torreya nucifera), 단백질 타이로신 탈인산 효소 1B(protein tyrosine phosphatase1B, PTP1B), 당뇨병 예방과 치료, 혈당 강하용<DP n="2" type="HARD"/></Keyword></Abstract>

    # sample : <Summary><P align="JUSTIFIED" indent="14">본 발명은 부추(Allium tuberosum Rottler, Leek) 추출물로부터 분리한 단백질을 유효성분으로 함유하는 혈전 관련 질환의 예방 및 치료용 조성물에 관한 것으로, 보다 상세하게는 부추 추출물로부터 분리·정제되고 서열번호 1로 기재되는 아미노산 서열을 가지는 단백질은 피브린에 대한 효소 특이성을 가지고 있어 혈전 분해 활성을 나타내며, 주사제로 사용하고 있는 종래의 혈전용해제와 비교해 볼 때 식용식물의 대사산물로서의 안전성과 혈전용해 활성이 우수함으로써 혈전 관련 질환의 예방 및 치료용 조성물, 또는 건강식품으로 유용하게 사용될 수 있다. </P><BR></BR></Summary><AbstractFigure><DrawReference idref="1"></DrawReference><BR></BR></AbstractFigure><Keyword>부추 추출물, 혈전 용해<BR></BR></Keyword>
    my_abstract = ""
    my_keyword = ""

    bs1 = bs.find(startTag).find_all(nextTag) if nextTag != '' else bs.find_all(
        startTag)  # sdoab summary / abstract summary / summary
    if bs1:
        p_txt = ""
        for soup in bs1:
            if soup:
                if p_txt:
                    p_txt += "\n" + soup.get_text()
                else:
                    p_txt += soup.get_text()
            my_abstract = p_txt
    bs_keyword = bs.find(startTag).find(keywordTag)
    if bs_keyword:
        my_keyword = bs_keyword.get_text()

    return my_abstract, my_keyword


def get_claims(request, xmlStr="", appNo=""):
    """ 비정형 청구항을 bs를 이용하여 처리 """

    xmlStr = _get_typo(xmlStr) # typo

    bs = BeautifulSoup(xmlStr, "lxml")  # case-insensitive
    # tree = elemTree.fromstring(xmlStr)

    # total = tree.findall("claim")
    # my_dict = {"독립항수": 0, "종속항수": 0, "총청구항수": len(total), "청구항들": []}
    # my_dict = {"독립항수": 0, "종속항수": 0, "청구항들": []}
    my_dict = {"청구항종류": [], "청구항들": []}

    if bs.find("sdocl"):  # 청구항 타입 a
        # my_dict["독립항수"], my_dict["종속항수"], my_dict["청구항들"] = claims_a_type(bs)
        my_dict["청구항종류"], my_dict["청구항들"] = claims_a_type(bs)
        return my_dict
    elif bs.find("claims"):  # 청구항 타입 b
        my_dict["청구항종류"], my_dict["청구항들"] = claims_b_type(bs)
        return my_dict
    elif bs.find("claim"):  # 청구항 타입 c
        # print(appNo)
        my_dict["청구항종류"], my_dict["청구항들"] = claims_c_type(bs)
        return my_dict


def ClaimTypeCheck(val):
    """ 독립항, 종속항, 삭제항 판단 """
    # if "항에 있어서" in val or "항의 " in val or ("청구항" in val and "에 따른" in val) or ("청구항" in val and "에 있어서" in val) or '중 어느 한 항에' in val:
    if "항에 있어서" in val or ("청구항" in val and "에 따른" in val) or ("청구항" in val and "에 있어서" in val) or '중 어느 한 항에' in val:
        return "jong"
    elif "삭제" in val:
        return "sak"
    else:
        return "dok"


def claims_a_type(bs):
    """ 청구항 비정형타입 A """
    my_claim = []
    my_claim_type = []

    # jong = 0
    # dok = 0
    # 청구항 타입 a-1 - <SDOCL><CLAIM N="1"><P INDENT="14" ALIGN="JUSTIFIED">입력되는</P><P INDENT="14" ALIGN="JUSTIFIED">신호를</P></CLAIM>
    # 청구항 타입 a-3 - <SDOCL><CLAIM N=1><P>분말 용성인비를 조립함에 있어 분말 용성인비
    # 청구항 타입 a-4 - <SDOCL><P>사각형의 시트, 특히 감광 인쇄지의 더미를 순  ---- 첫 p tag가 1항임
    bs1 = bs.find("sdocl").find_all("claim")  # beatifulSoup에서는 대소문 구분없음
    bs4 = bs.find("sdocl").find_all("p")  # 첫 p tag가 1항임
    if bs1:
        for soup in bs1:
            p_txt = ""
            t_txt = ""
            t_txt = ClaimTypeCheck(soup.get_text())
            for soup2 in soup.find_all("p"):
                if soup2:
                    if p_txt:
                        p_txt += "\n" + soup2.get_text()
                    else:
                        p_txt += soup2.get_text()
            my_claim.append(p_txt)
            my_claim_type.append(t_txt)
        return my_claim_type, my_claim
    elif bs4:
        p_txt = ""
        t_txt = ""
        for soup in bs4:
            t_txt = ClaimTypeCheck(soup.get_text())
            if soup:
                if p_txt:
                    p_txt += "\n" + soup.get_text()
                else:
                    p_txt += soup.get_text()
            my_claim.append(p_txt)
            my_claim_type.append(t_txt)
        return my_claim_type, my_claim


def claims_b_type(bs):
    """ 청구항 비정형타입 B """
    my_claim = []
    my_claim_type = []
    # jong = 0
    # dok = 0

    # 청구항 타입 2 - <Claims><Claim n="1"><P align="JUSTIFIED" indent="14">플립의 열림 동작과 닫힘
    bs1 = bs.find("claims").find_all("claim")
    for soup in bs1:
        p_txt = ""
        t_txt = ""
        t_txt = ClaimTypeCheck(soup.get_text())

        for soup2 in soup.find_all("p"):
            if soup2:
                if p_txt:
                    p_txt += "\n" + soup2.get_text()
                else:
                    p_txt += soup2.get_text()
        my_claim.append(p_txt)
        my_claim_type.append(t_txt)
    return my_claim_type, my_claim


def claims_c_type(bs):
    """ 청구항 비정형타입 C """
    my_claim = []
    my_claim_type = []
    # jong = 0
    # dok = 0

    # 청구항 타입 c-1 - <claim num="1"><claim-text>지면에 수직으로 설치되는
    #                 <claim num="12"><AmendStatus status="D">삭제</AmendStatus></claim>
    #           c-2 - <Claim num="1"><P align="JUSTIFIED" indent="14">이산화탄소 격리방법으로서, </P>
    # 청구항 타입 c-3 - <CLAIM N="1">       <P ALIGN="JUSTIFIED" INDENT="14">1. 로봇트의 리 : 1019850007359
    # 청구항 타입 c-4 - <Claim n="1"><P align="JUSTIFIED" indent="14"><Claim n="2"><AmendStatus status="D">삭제</AmendStatus> : 1020087019727
    temp = bs.find_all("claim", {"num": 1})
    bs1 = bs.find("claim-text") if temp else None
    bs2 = bs.find("p") if temp else None
    bs3 = bs.find_all("claim", {"n": 1})

    if bs1:
        for soup in bs.find_all("claim"):
            bs_text = soup.find("claim-text")
            # bs_amend = soup.find("claim_amend-text")
            bs_amend = soup.find("amendstatus")
            t_txt = ""
            if bs_text:
                my_claim.append(bs_text.get_text())
                t_txt = ClaimTypeCheck(soup.get_text())
                my_claim_type.append(t_txt)
            elif bs_amend:
                my_claim.append(bs_amend.get_text())
                t_txt = ClaimTypeCheck(soup.get_text())
                my_claim_type.append(t_txt)
    elif bs2:
        for soup in bs.find_all("claim"):
            p_txt = ""
            t_txt = ""
            bs_p = soup.find_all("p")
            bs_amend = soup.find_all("amendstatus")
            if bs_p:
                for soup2 in soup.find_all("p"):
                    if soup2:
                        if p_txt:
                            p_txt += "\n" + soup2.get_text()
                        else:
                            p_txt += soup2.get_text()
            elif bs_amend:
                for soup2 in soup.find_all("amendstatus"):
                    if soup2:
                        if p_txt:
                            p_txt += "\n" + soup2.get_text()
                        else:
                            p_txt += soup2.get_text()
            # p 태그가 청구항내 복수개
            t_txt = ClaimTypeCheck(p_txt)

            my_claim.append(p_txt)
            my_claim_type.append(t_txt)
    elif bs3:
        for soup in bs.find_all("claim"):
            p_txt = ""
            t_txt = ""
            bs_p = soup.find_all("p")
            bs_amend = soup.find_all("amendstatus")
            if bs_p:            
                for soup2 in soup.find_all("p"):
                    if soup2:
                        if p_txt:
                            p_txt += "\n" + soup2.get_text()
                        else:
                            p_txt += soup2.get_text()
            elif bs_amend:
                for soup2 in soup.find_all("amendstatus"):
                    if soup2:
                        if p_txt:
                            p_txt += "\n" + soup2.get_text()
                        else:
                            p_txt += soup2.get_text()                                            
            # p 태그가 청구항내 복수개
            t_txt = ClaimTypeCheck(p_txt)

            my_claim.append(p_txt)
            my_claim_type.append(t_txt)
    return my_claim_type, my_claim


def get_description(request, xmlStr=""):
    xmlStr = _get_typo(xmlStr) # typo

    bs = BeautifulSoup(xmlStr, "lxml")  # case-insensitive

    if bs.find("sdode"):  # type sdode tag start
        my_name = ["도면의 간단한 설명", "발명의 상세한 설명", "발명의 목적",
                   "발명이 속하는 기술 및 그 분야의 종래기술", "발명이 이루고자 하는 기술적 과제", "발명의 구성 및 작동", "발명의 효과"]
        # my_tag = ["drdes", "invdes", "purinv", "bkgr", "tech", "config", "effect"]
        my_tag = ["drdes", "", "", "bkgr", "tech", "config", "effect"]
        # 상위 제목 ; 내용 추출 안함 - invdes, purinv

        # p attribute 있는지 확인
        attrName = "n" if bs.find_all('p', {"n": True}) else ""
        # TODO : convert tabular tag to table tag - sample 1019970061654
        return description_type(bs, attrName, my_name, my_tag)
    # TODO : 1019930701447 구분 태그없는 비정형 타입, 처리요망 (psdode) -- wips경우 구분안함     
    # TODO : 1019930700523 구분 태그없는 비정형 타입, 처리요망 (psdode)      
    # TODO : 1019900018250 구분 태그없는 비정형 타입, 처리요망 (sdode)      
    elif bs.find("psdode"):  # type psdode tag start
        if bs.find('pinvti'):
            my_name = ["발명의 명칭","발명의 상세한 설명"]
            # my_tag = ["pinvti", "pinvdes"]
            my_tag = ["", "pinvdes"]
        else:            
            my_name = ["발명의 명칭","도면의 간단한 설명", "발명의 상세한 설명"]
            # my_tag = ["drdes", "invdes", "purinv", "bkgr", "tech", "config", "effect"]
            # my_tag = ["drdes", "", "", "bkgr", "tech", "config", "effect"]
            my_tag = ["", "", ""]
            # 상위 제목 ; 내용 추출 안함 - invdes, purinv

        # p attribute 있는지 확인
        attrName = "n" if bs.find_all('p', {"n": True}) else ""
        # TODO : convert tabular tag to table tag - sample 1019970061654
        return description_type(bs, attrName, my_name, my_tag)        
    elif bs.find("applicationbody"):  # type <ApplicationBody> tag start
        my_name = ["도면의 간단한 설명", "발명의 상세한 설명", "발명의 목적",
                   "발명이 속하는 기술 및 그 분야의 종래기술", "발명이 이루고자 하는 기술적 과제", "발명의 구성 및 작용", "발명의 효과"]
        # my_tag = ['descriptiondrawings', 'disclosure', 'inventionpurpose', 'backgroundart','abstractproblem','inventionconfiguration','advantageouseffects']
        my_tag = ['descriptiondrawings', '', '', 'backgroundart',
                  'abstractproblem', 'inventionconfiguration', 'advantageouseffects']
        # 상위 제목 - disclosure, inventionpurpose
        return description_type(bs, 'n', my_name, my_tag)
    elif bs.find("invention-title"):  # type <invention-title> tag start
        my_name = ["기술분야", "배경기술", "발명의 내용", "해결 하고자하는 과제", "과제 해결수단",
                   "효과", "도면의 간단한 설명", "발명의 실시를 위한 구체적인 내용", "부호의 설명"]
        # my_tag = ['technical-field', 'background-art', 'summary-of-invention', 'tech-problem','tech-solution','advantageous-effects','description-of-drawings', 'description-of-embodiments', 'reference-signs-list']
        my_tag = ['technical-field', 'background-art', '', 'tech-problem', 'tech-solution',
                  'advantageous-effects', 'description-of-drawings', 'description-of-embodiments', 'reference-signs-list']
        # 상위 제목 - summary-of-invention
        return description_type(bs, 'num', my_name, my_tag)
    elif bs.find("pctapplicationbody"):  # type <InventionTitle> tag start
        # ex. 1020047002564

        my_name = ["기술분야", "배경기술", "발명의 상세한 설명",
                   "도면의 간단한 설명", "실시예", "산업상 이용 가능성"]
        # my_tag = ['pcttechnicalfield', 'pctbackgroundart', 'pctdisclosure','pctdescriptiondrawings','pctexample','pctindustrialapplicability']
        my_tag = ['pcttechnicalfield', 'pctbackgroundart', 'pctdisclosure',
                  'pctdescriptiondrawings', 'pctexample', 'pctindustrialapplicability']

        # 상위 제목 - None
        return description_type(bs, 'n', my_name, my_tag)
    elif bs.find("pctinventiontitle"):  # type <PCTInventionTitle> tag start
        # ex. 1020097019662

        my_name = ["기술분야", "배경기술", "발명의 상세한 설명",
                   "도면의 간단한 설명", "실시예", "산업상 이용 가능성"]
        # my_tag = ['pcttechnicalfield', 'pctbackgroundart', 'pctdisclosure','pctdescriptiondrawings','pctexample','pctindustrialapplicability']
        my_tag = ['pcttechnicalfield', 'pctbackgroundart', 'pctdisclosure',
                  'pctdescriptiondrawings', 'pctexample', 'pctindustrialapplicability']

        # 상위 제목 - None
        return description_type(bs, 'n', my_name, my_tag)
    # type <InventionTitle> tag start
    elif bs.find("inventiontitle") and bs.find("backgroundtech"):
        # ex. 1020080045418

        # 예외 사항이 더 많아지면 이 방법으로... {
        # my_dict = {"disclosure": "발명의 상세한 설명", "technicalfield": "기술분야", "backgroundtech": "배경기술", "inventioncontent": "발명의 내용", "solutionproblem": "해결 하고자하는 과제", "meansproblemsolution": "과제 해결수단", "effectiveness": "효과", "inventdetailcontent": "발명의 실시를 위한 구체적인 내용", "practiceexample": "실시 예", "descriptiondrawings": "도면의 간단한 설명", "disclosure": "", "technicalfield": "",}
        # my_tag = [tag.name for tag in bs.find_all() if tag not in ['<p>', '<br>']]
        # 예외 사항이 더 많아지면 이 방법으로... }

        my_name = ["발명의 상세한 설명", "기술분야", "배경기술", "발명의 내용",
                   "해결 하고자하는 과제", "과제 해결수단", "효과", "발명의 실시를 위한 구체적인 내용", '실시 예']
        # my_tag = ['disclosure', 'technicalfield', 'backgroundtech', 'inventioncontent','solutionproblem','meansproblemsolution','effectiveness', 'inventdetailcontent','practiceexample']
        my_tag = ['', 'technicalfield', 'backgroundtech', '', 'solutionproblem',
                  'meansproblemsolution', 'effectiveness', 'inventdetailcontent', 'practiceexample']
        # 상위 제목 - disclosure, inventioncontent
        # TODO inventdetailcontent 가 뒤에 practiceexample 와 중복
        return description_type(bs, 'n', my_name, my_tag)
    # type <InventionTitle> tag start
    elif bs.find("inventiontitle") and bs.find("backgroundart"):
        # ex. 1020050081479

        my_name = ["도면의 간단한 설명", "발명의 상세한 설명", "발명의 목적",
                   "발명이 속하는 기술 및 그 분야의 종래기술", "발명이 이루고자 하는 기술적 과제", "발명의 구성 및 작용", "발명의 효과"]
        # my_tag = ['descriptiondrawings', 'disclosure', 'inventionpurpose','backgroundart','abstractproblem','inventionconfiguration', 'advantageouseffects']
        my_tag = ['descriptiondrawings', '', '', 'backgroundart',
                  'abstractproblem', 'inventionconfiguration', 'advantageouseffects']
        # 상위 제목 - disclosure, inventionpurpose
        # TODO inventdetailcontent 가 뒤에 practiceexample 와 중복
        return description_type(bs, 'n', my_name, my_tag)
    elif bs.find("invti") and bs.find("invdes"):
        # ex. 1019850007359

        my_name = ["발명의 명칭", "도면의 간단한 설명", "청구의 범위",
                   "발명의 목적", "배경기술", "기술분야", "발명의 구성 및 작용","발명의 효과"]
        # my_tag = ['invti', 'drdes', 'invdes','purinv','bkgr','tech', 'config','effect']
        my_tag = ['invti', 'drdes', '', '','bkgr', '', '', '']

        # 상위 제목 - disclosure, inventionpurpose
        # TODO inventdetailcontent 가 뒤에 practiceexample 와 중복
        return description_type(bs, 'n', my_name, my_tag)
    else:
        return ""


def description_type(bs, attName, my_name, my_tag):
    my_dict = {}
    for idx, val in enumerate(my_tag):
        my_dict[my_name[idx]] = bs_desc(bs.find_all(val), attName)
    my_dict['descPart'] = my_name
    return my_dict


def bs_desc(bs, attName):
    if bs:
        p_txt = ""
        n_txt = ""
        for soup in bs:
            if soup:
                for soup2 in soup.find_all("p"):
                    if soup2:
                        if attName:
                            if soup2[attName]:
                                n_txt = '[' + soup2[attName].zfill(4) + '] '
                        else:
                            n_txt = ''
                        s = replace_with_newlines(soup2)
                        # s = re.sub('<br\s*?>', '\n', soup2)
                        if p_txt:
                            p_txt = p_txt + "\n" + n_txt + \
                                s  # soup2.get_text("\n")
                        else:
                            p_txt = n_txt + s  # soup2.get_text("\n")
        return p_txt
    else:
        return ""


def replace_with_newlines(element):
    text = ''
    for elem in element.recursiveChildGenerator():
        if isinstance(elem, str):
            text += elem.strip()
        elif elem.name == 'br':
            text += '\n'
    return text

# NNG,NNP명사, SY기호, SL외국어, SH한자, UNKNOW (외래어일 가능성있음)
def tokenizer(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
    mecab = Mecab()
    STOPWORDS = settings.TERMS['STOPWORDS']
    return [
        word
        for word, tag in mecab.pos(raw) if len(word) > 1 and tag in pos and word not in STOPWORDS
        # if len(word) > 1 and tag in pos and word not in stopword
        # if tag in pos
        # and not type(word) == float
    ]

    # # source = requests.get('http://kpat.kipris.or.kr/kpat/thsrs.do?s_flag=2&thsrs_srch=').text

    # keyword = urllib.parse.quote_plus(urllib.parse.quote_plus(keyword))
    # # source = requests.get('http://kpat.kipris.or.kr/kpat/thsrs.do?thsrs_srch=%25ED%2595%2598%25EC%259D%25B4%25EB%25B8%258C%25EB%25A6%25AC%25EB%2593%259C&s_flag=2').text
    # source = requests.get(
    #     "http://kpat.kipris.or.kr/kpat/thsrs.do?thsrs_srch=" + keyword + "&s_flag=2"
    # ).text

    # soup = BeautifulSoup(source, "lxml")

    # _content = soup.find_all("table")
    # content = str(_content)
    # content = content.replace("<table", "<table id='table-modal'")
    # content = content.replace("tstyle_list txt_left", "table table-sm")
    # content = content.replace("thsrs_str", "e_str")
    # content = content.replace("&amp;", "&")
    # # content = re.sub(r'<caption>(.+?)</caption>', '', content)
    # content = re.sub(r"<caption>[^<]*\s[^<]*</caption>", "", content)
    # return HttpResponse(content)
    # # return content


# def get_search_arr(request, keyword):
#     keyword = urllib.parse.quote_plus(urllib.parse.quote_plus(keyword))
#     # source = requests.get('http://kpat.kipris.or.kr/kpat/thsrs.do?thsrs_srch=%25ED%2595%2598%25EC%259D%25B4%25EB%25B8%258C%25EB%25A6%25AC%25EB%2593%259C&s_flag=2').text
#     source = requests.get(
#         "http://kpat.kipris.or.kr/kpat/thsrs.do?thsrs_srch=" + keyword + "&s_flag=2"
#     ).text

#     soup = BeautifulSoup(source, "lxml")

#     table = soup.find("table")
#     table_rows = table.find_all("tr")

#     res = []
#     for tr in table_rows:
#         td = tr.find_all("td")
#         row = [
#             tr.text.strip().lower()
#             for tr in td
#             if tr.text.strip() and tr.text.strip() != "&nbsp"
#         ]
#         if row:
#             res.extend(row)
#     # 중복 제거
#     unique_list = list(OrderedDict(zip(res, repeat(None))))

#     # return HttpResponse(res, content_type="application/json")
#     # return JsonResponse(res, safe=False)
#     return JsonResponse(
#         sorted(sorted(unique_list), key=lambda c: 0 if re.search("[ㄱ-힣]", c) else 1),
#         safe=False,
#     )  # 한글 먼저

# def get_searchs(request, keyword=""):
#     with connection.cursor() as cursor:

#         # keyword를 쿼리 형태로 parse ; like 방식
#         # myWhere = get_keywords(keyword, "출원인1")
#         # myWhere2 = get_keywords(keyword, "초록")

#         # to_tsquery 형태로 parse
#         myWhere = tsquery_keywords(keyword, "출원인1")
#         myWhere2 = tsquery_keywords(keyword, "전체tsvec")

#         cursor.execute(
#             "SET work_mem to '100MB';"
#             + "SELECT 등록사항, \"발명의명칭(국문)\", 출원번호, 출원일자, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일자, 공개일자, ipc요약, regexp_replace(초록, E'<[^>]+>', '', 'gi') 초록 FROM 공개공보 WHERE "
#             + myWhere
#             + " or "
#             + myWhere2
#             # + " or "
#             # + whereInventor
#             # + ' and (등록사항 <> ALL (\'{"소멸","거절","취하"}\'::varchar[]))'
#             # + " GROUP BY 특허고객대표번호"
#             # + " order by 출원번호 DESC"
#             # + " limit 1000"
#         )

#         # cursor.execute(
#         #     "SELECT 특허고객대표번호, 출원인대표명, 출원인영문대표명 FROM 출원인대표명 WHERE 출원인명::text like concat('%',%s,'%');",
#         #     [keyword],
#         # )
#         # row = cursor.fetchall()

#         row = dictfetchall(cursor)

#         # rawdata = json.dumps(row, ensure_ascii=False)
#     # return HttpResponse(myWhere, content_type="text/plain; charset=utf-8")

#     # 결과값 없을 때 처리
#     if row:
#         # 초록부분만 DB 저장
#         ids = [y["초록"] for y in row]
#         api_content = kr_taged(HttpResponse(ids))
#         api_content = json.dumps(api_content, ensure_ascii=False)

#         # memory 절약을 위해 10번째 초록부분만 제외 - row는 list of dictionaries 형태임
#         for i in range(len(row)):
#             del row[i]["초록"]
#     else:
#         api_content = ""
#         row = []

#     # "API검색저장"에 기록
#     with connection.cursor() as cursor:
#         cursor.execute(
#             # 'WITH SLELECTED AS (SELECT keyword FROM "API검색저장") INSERT INTO "API검색저장" (keyword, content) SELECT $$' + keyword + '$$, $$' + content + '$$ WHERE NOT EXISTS (SELECT * FROM SELECTED)'
#             'INSERT INTO "API검색저장" (params, content) values ($$'
#             + keyword
#             + "$$, "
#             + ("$$" + api_content + "$$" if api_content else "$$[]$$")
#             + ") ON CONFLICT (params) DO NOTHING;"
#         )

#     # return HttpResponse(row, content_type="text/plain; charset=utf-8")
#     return JsonResponse(row, safe=False)
