import requests
from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
from bs4 import BeautifulSoup
from lxml import etree as ET
import re
from itertools import permutations
import json

import os
from konlpy.tag import Mecab

from utils import dictfetchall

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

def get_company(request, companyId=""):
    """ searchDetails용 검색 """
    companyId = companyId.replace("-", "")

    redisKey = companyId + "¶" # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    handleRedis(redisKey, 'raw')
    # Redis }  

    with connection.cursor() as cursor:
        whereAppNo = "" if companyId == "" else 'WHERE "출원번호" = $$' + companyId + "$$"
        # regexp_replace(초록, E'<[^>]+>', '', 'gi') 
        # regexp_replace(regexp_replace(청구항,E'<?/?br>',E'\r\n', 'gi'),E'<DP[^<]+?>', ' ', 'gi')
        # TODO : 공개공보에 발명자4~10 넣어버리기 - crosstab 속도문제
        
        cursor.execute(
            "SELECT A.*, concat(B.발명자1,'(',C.코드1,'), ',B.발명자2,'(',C.코드2,'), ',B.발명자3,'(',C.코드3,'), ',B.발명자4,'(',C.코드4,'), ',B.발명자5,'(',C.코드5,'), ',B.발명자6,'(',C.코드6,'), ',B.발명자7,'(',C.코드7,'), ',B.발명자8,'(',C.코드8,'), ',B.발명자9,'(',C.코드9,'), ',B.발명자10,'(',C.코드10,')') 발명자, D.명세서 FROM (SELECT 등록사항, \"발명의명칭(국문)\" as 명칭, 출원번호, 출원일자, 공개번호, 공개일자, 공고번호, 공고일자, 등록번호, 등록일자, ipc코드, 출원인1, 출원인2, 출원인3, 출원인코드1, 청구항수, 초록, 청구항, concat(명칭token, ' ', 요약token, ' ', 대표항token) 전문소token FROM 공개공보 "
            + whereAppNo
            + ") A LEFT JOIN "
            + " (select * from crosstab('SELECT 출원번호, \"RN2\", 성명 FROM 공개인명정보 "
            + whereAppNo            
            + " and \"RN2\" between 1 and 10 order by 1,2') as ct(출원번호 numeric, 발명자1 varchar, 발명자2 varchar, 발명자3 varchar, 발명자4 varchar, 발명자5 varchar, 발명자6 varchar, 발명자7 varchar, 발명자8 varchar, 발명자9 varchar, 발명자10 varchar)) B ON A.출원번호 = B.출원번호 "
            + " LEFT JOIN "
            + " (select * from crosstab('SELECT 출원번호, \"RN2\", 국가코드 FROM 공개인명정보 "
            + whereAppNo            
            + " and \"RN2\" between 1 and 10 order by 1,2') as ct(출원번호 numeric, 코드1 varchar, 코드2 varchar, 코드3 varchar, 코드4 varchar, 코드5 varchar, 코드6 varchar, 코드7 varchar, 코드8 varchar, 코드9 varchar, 코드10 varchar)) C ON A.출원번호 = C.출원번호 "
            + " LEFT JOIN "
            + " (select * from 공개명세서 "
            + whereAppNo            
            + ") D ON A.출원번호 = D.출원번호 "                        
            # + " limit 1000"
        )
        row = dictfetchall(cursor)
        result = row[0]

        res = (
            get_claims(request, result["청구항"], result["출원번호"])
            if result["청구항"] and result["청구항"] != "<SDOCL></SDOCL>"
            # else {"독립항수": 0, "종속항수": 0, "청구항들": []}
            else {"청구항종류": [], "청구항들": []}
        )

        result.update(res)

        del result['청구항'] # remove claims for memory save

        res = (
            get_abstract(request, result["초록"])
            if result["초록"] and result["초록"] != "<SDOAB></SDOAB>"
            else {"초록": '', "키워드": ''}
        )

        result.update(res)

        empty_res = {"기술분야": "", "배경기술": "", "해결과제": "", "해결수단": "", "발명효과": "", "도면설명": "", "발명의실시예": ""}
        res = (
            get_description(request, result["명세서"])
            if result["명세서"] and result["명세서"] != "<SDODE></SDODE>"
            else empty_res
        )
        # res = res if res else empty_res

        result.update(res)

        del result['명세서'] # remove description for memory save

        # 전문소 tokenizer
        res = ({'전문소token': ' '.join(tokenizer(result['전문소token']) if result['전문소token'] else [])})
        result.update(res)

    # Redis {
    handleRedis(redisKey, 'raw', result, mode="w")        
    # Redis } 
   
    return JsonResponse(result, safe=False)
    # return HttpResponse(row, content_type="text/plain; charset=utf-8")

def get_company_quote(request, companyId=""):
    """ searchDetails용 인용 검색 """
    companyId = companyId.replace("-", "")

    redisKey = companyId + "¶" # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    handleRedis(redisKey, 'quote')
    # Redis }  

    with connection.cursor() as cursor:
        whereAppNo = "" if companyId == "" else 'WHERE "출원번호" = $$' + companyId + "$$"
        cursor.execute(
            "SELECT A.*, B.* FROM (SELECT *, split_part(\"인용문헌출원번호_국내\", ',', 1)::numeric AS 인용문헌번호1 FROM 특허실용심사인용문헌 "
            + whereAppNo
            + ") A LEFT JOIN (SELECT 출원번호, \"발명의명칭(국문)\" || case when coalesce(\"발명의명칭(영문)\", '') = '' then '' else ' (' || \"발명의명칭(영문)\" || ')' end 명칭, 출원인1 || case when coalesce(출원인2, '') = '' then '' else ', ' || 출원인2 end || case when coalesce(출원인3, '') = '' then '' else ', ' || 출원인3 end 출원인, 등록일자 FROM 공개공보 "
            + ") B ON A.인용문헌번호1 = B.출원번호"
        )
        result = dictfetchall(cursor)

    # Redis {
    handleRedis(redisKey, 'quote', result, mode="w")        
    # Redis }       

    return JsonResponse(result, safe=False)

def get_company_family(request, companyId=""):
    """ searchDetails용 패밀리 검색 """
    companyId = companyId.replace("-", "")
    redisKey = companyId + "¶" # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    handleRedis(redisKey, 'family')
    # Redis }  
    with connection.cursor() as cursor:
        whereAppNo = "" if companyId == "" else 'WHERE "출원번호" = $$' + companyId + "$$"
        cursor.execute(
            "SELECT A.*, B.* FROM (SELECT *, case when 패밀리국가코드 = 'KR' then split_part(패밀리출원번호, ',', 1)::numeric else null end 패밀리출원번호1 FROM 특허패밀리 "
            + whereAppNo
            + ") A LEFT JOIN (SELECT 출원번호, \"발명의명칭(국문)\" || case when coalesce(\"발명의명칭(영문)\", '') = '' then '' else ' (' || \"발명의명칭(영문)\" || ')' end 명칭, 등록일자, ipc코드 FROM 공개공보 "
            + ") B ON A.패밀리출원번호1 = B.출원번호"
        )
        result = dictfetchall(cursor)

    # Redis {
    handleRedis(redisKey, 'family', result, mode="w")        
    # Redis } 

    return JsonResponse(result, safe=False)

def get_company_legal(request, companyId=""):
    """ searchDetails용 법적상태이력 검색 """
    companyId = companyId.replace("-", "")
    redisKey = companyId + "¶" # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    handleRedis(redisKey, 'legal')
    # Redis }    
    with connection.cursor() as cursor:
        whereAppNo = "" if companyId == "" else 'WHERE "출원번호" = $$' + companyId + "$$"
        cursor.execute(
            "SELECT * FROM 법적상태이력 "
            + whereAppNo
            + " order by 법적상태일자 DESC , 일련번호 DESC"
        )
        result = dictfetchall(cursor)

    # Redis {
    handleRedis(redisKey, 'legal', result, mode="w")        
    # Redis }          

    return JsonResponse(result, safe=False)

def get_company_registerfee(request, rgNo=""):
    """ searchDetails용 등록료 검색 """
    rgNo = rgNo.replace("-", "")
    redisKey = rgNo + "¶" # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    handleRedis(redisKey, 'registerfee')
    # Redis }
    with connection.cursor() as cursor:
        whereRgNo = "" if rgNo == "" else 'WHERE "등록번호" = $$' + rgNo + "$$"
        cursor.execute(
            "SELECT * FROM 등록료 "
            + whereRgNo
            + " order by 시작연차 DESC"
        )
        result = dictfetchall(cursor)

    # Redis {
    handleRedis(redisKey, 'registerfee', result, mode="w")        
    # Redis }         

    return JsonResponse(result, safe=False)

def get_company_rightfullorder(request, companyId=""):
    """ searchDetails용 권리순위 검색 """
    companyId = companyId.replace("-", "")
    redisKey = companyId + "¶" # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    handleRedis(redisKey, 'rightfullorder')
    # Redis }     
    with connection.cursor() as cursor:
        whereAppNo = "" if companyId == "" else 'WHERE "출원번호" = $$' + companyId + "$$"
        cursor.execute(
            "SELECT * FROM 권리순위 "
            + whereAppNo
            + " order by 순위번호 ASC"
        )
        result = dictfetchall(cursor)

    # Redis {
    handleRedis(redisKey, 'rightfullorder', result, mode="w")        
    # Redis }   

    return JsonResponse(result, safe=False)

def get_company_rightholder(request, rgNo=""):
    """ searchDetails용 권리권자변동 검색 """
    rgNo = rgNo.replace("-", "")
    redisKey = rgNo + "¶" # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    handleRedis(redisKey, 'rightholder')
    # Redis }      
    with connection.cursor() as cursor:
        whereRgNo = "" if rgNo == "" else 'WHERE "등록번호" = $$' + rgNo + "$$"
        cursor.execute(
            "SELECT * FROM 권리권자변동 "
            + whereRgNo
            + " order by 순위번호 ASC"
        )
        result = dictfetchall(cursor)

    # Redis {
    handleRedis(redisKey, 'rightholder', result, mode="w")        
    # Redis }  

    return JsonResponse(result, safe=False)

def get_company_applicant(request, cusNo=""):
    """ searchDetails용 출원인 법인, 출원동향, 보유기술 검색 """
    cusNo = cusNo.replace("-", "")    
    operationKey = 'corpBsApplicantInfo'
    
    source = requests.get(settings.KIPRIS['rest_url'] + '/' + operationKey + '?ApplicantNumber=' + cusNo + '&accessKey=' + settings.KIPRIS['service_key']).text
    soup = BeautifulSoup(source, "lxml")

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

    result = { "name" : "", "corpNo" : "", "bizNo" : "" }
    bs = soup.find(operationKey)
    if bs:
        result['name'] = bs.find("ApplicantName")
        result['corpNo'] = bs.find("CorporationNumber")
        result['bizNo'] = bs.find("BusinessRegistrationNumber")
    return JsonResponse(result, safe=False)

       
def get_company_applicant_trend(request, cusNo=""):
    """ searchDetails용 출원인 출원동향, 보유기술 검색 """
    cusNo = cusNo.replace("-", "")
    redisKey = cusNo + "¶" # Add delimiter to distinguish from searchs's searchNum
    # Redis {
    handleRedis(redisKey, 'applicant_trend')
    # Redis }       
    with connection.cursor() as cursor:
        whereCusNo = "" if cusNo == "" else 'WHERE "출원인코드1" = $$' + cusNo + "$$"
        # cursor.execute("SELECT left(출원번호::text,1) 구분, left(출원일자::text,4) 출원년, left(공개일자::text,4) 공개년, left(등록일자::text,4) 등록년, ipc요약 FROM 공개공보 " + whereCusNo)
        # cursor.execute("SELECT left(출원일자::text,4) 출원년, left(공개일자::text,4) 공개년, left(등록일자::text,4) 등록년, ipc요약 FROM 공개공보 " + whereCusNo)
        # query = "SELECT left(출원일자::text,4) 출원년, left(공개일자::text,4) 공개년, left(등록일자::text,4) 등록년, ipc요약 FROM 공개공보 " + whereCusNo
        query = "SELECT left(출원일자::text,4) 출원년, ipc요약 FROM 공개공보 " + whereCusNo
        cursor.execute(query)
        result = dictfetchall(cursor)

    # Redis {
    handleRedis(redisKey, 'applicant_trend', result, mode="w")        
    # Redis }  
    #        
    return JsonResponse(result, safe=False)


def handleRedis(redisKey, keys, result="", mode="r"):
    """ read or write to redis """
    context = cache.get(redisKey) 
    if mode == 'r':
        if context and context[keys]:
            return JsonResponse(context[keys], safe=False)
    if mode == 'w':
        if context is not None:
            context[keys] = result
            cache.set(redisKey, context, CACHE_TTL)
        return JsonResponse(result, safe=False)        
    return    

def _get_typo(result=""): 
    """ 오타 정리 """
    result = re.sub(r"<EMIID=", "<EMI ID=", result)  # tag 오타
    result = re.sub(
        r"<EMI .*?>", "", result
    )  # attribute 에 따옴표 없는 tree 에러 방지 - <EMI ID=8 HE=24 WI=164 FILE="kpo00008.TIF">
    result = re.sub(
        r"(<SB>|</SB>|<SP>|</SP>|<AP>|<U>|</U>|<SB\.| >|<PS>|</Sb>|)", "", result
    )  # <P></P> 사이에 문제되는 태그, 오타 태그 정리
    result = re.sub(r"(</SB)", "", result)  # <P></P> 사이에 문제되는 태그, 오타 태그 정리 2
    result = re.sub(r"</p>", "</P>", result)
    result = re.sub(r".TIF<", '.TIF"><', result)  # FILE="kpo00001.TIF</P>
    return result

def get_abstract(request, xmlStr=""):

    xmlStr = _get_typo(xmlStr) # typo   

    bs = BeautifulSoup(xmlStr, "lxml")  # case-insensitive

    result = {"초록": "", "키워드": ""}

    if bs.find("sdoab"): # type sdoab tag start
        result["초록"], result["키워드"] = abstract_type(bs, 'sdoab', 'summary', 'idxword')
        return result
    elif bs.find("abstract"):  # type abstract tag start
        result["초록"], result["키워드"] = abstract_type(bs, 'abstract', 'summary', 'keyword')
        return result
    elif bs.find("summary"):  # type summary tag start
        result["초록"], result["키워드"] = abstract_type(bs, 'summary', '', 'keyword')
        return result        

def abstract_type(bs, startTag, nextTag, keywordTag):
    # sample : <SDOAB><SUMMARY><P INDENT="14" ALIGN="JUSTIFIED">본 발명은 구아바로부터 얻은 단백질 타이로신 탈인산화 효소 1B 저해용 활성분획 추출물에 관한 것으로, 더욱 상세하게는 열대 식물인 구아바(guava, <I>Psidium guajava </I>Linn)의 잎 또는 열매로부터 단백질 타이로신 탈인산화 효소 1B(protein tyrosine phosphatase 1B, PTP1B)를 저해하여 인슐린의 작용을 촉진시킴으로써 당뇨병의 증상인 혈당상승에 대한 혈당강하 효과를 갖는 활성분획 추출물과 이를 효율적으로 추출, 정제하는 방법 그리고 그 추출물을 유효성분으로 함유하는 당뇨병 예방과 치료, 혈당강하 및 지방간 억제용 생약제에 관한 것이다.</P></SUMMARY><ABDR><DRAWREF IDREF="2"></ABDR><BR><IDXWORD>구아바, 단백질 타이로신 탈인산화 효소 1B(protein tyrosine phosphatase1B, PTP1B), 당뇨병 예방과 치료, 혈당강하, 지방간 억제</IDXWORD></SDOAB>

    # sample : <Abstract><Summary><P align="JUSTIFIED" indent="14">본 발명은 비자 유래의 신규 단백질 타이로신 탈인산효소 1B 저해용 화합물에 관한 것으로서, 비자(<I>Torreya nucifera</I>)를 메탄올 추출한 후 크로마토그래피를 이용하여 순수 분리 정제하여 얻은 신규 단백질 타이로신 탈인산효소 1B(protein tyrosine phosphatase1B, PTP1B) 저해 화합물과 이를 효율적으로 추출, 정제하는 방법 그리고 비자 추출물 및 이로부터 분리된 화합물을 유효성분으로 함유하는 당뇨병 예방과 치료, 혈당 강하용 용도에 관한 것이다.</P></Summary><AbstractFigure><DrawReference idref="1"/><BR/></AbstractFigure><Keyword>비자(Torreya nucifera), 단백질 타이로신 탈인산 효소 1B(protein tyrosine phosphatase1B, PTP1B), 당뇨병 예방과 치료, 혈당 강하용<DP n="2" type="HARD"/></Keyword></Abstract>

    # sample : <Summary><P align="JUSTIFIED" indent="14">본 발명은 부추(Allium tuberosum Rottler, Leek) 추출물로부터 분리한 단백질을 유효성분으로 함유하는 혈전 관련 질환의 예방 및 치료용 조성물에 관한 것으로, 보다 상세하게는 부추 추출물로부터 분리·정제되고 서열번호 1로 기재되는 아미노산 서열을 가지는 단백질은 피브린에 대한 효소 특이성을 가지고 있어 혈전 분해 활성을 나타내며, 주사제로 사용하고 있는 종래의 혈전용해제와 비교해 볼 때 식용식물의 대사산물로서의 안전성과 혈전용해 활성이 우수함으로써 혈전 관련 질환의 예방 및 치료용 조성물, 또는 건강식품으로 유용하게 사용될 수 있다. </P><BR></BR></Summary><AbstractFigure><DrawReference idref="1"></DrawReference><BR></BR></AbstractFigure><Keyword>부추 추출물, 혈전 용해<BR></BR></Keyword>     
    result_abstract = ""
    result_keyword = ""

    bs1 = bs.find(startTag).find_all(nextTag) if nextTag != '' else bs.find_all(startTag)# sdoab summary / abstract summary / summary
    if bs1:
        p_txt = ""
        for soup in bs1:
            if soup:
                if p_txt:
                    p_txt += "\n" + soup.get_text()
                else:
                    p_txt += soup.get_text()
            result_abstract =p_txt
    bs_keyword = bs.find(startTag).find(keywordTag)                    
    if bs_keyword:
        result_keyword = bs_keyword.get_text()            

    return result_abstract, result_keyword

def get_claims(request, xmlStr="", appNo=""):
    """ 비정형 청구항을 bs를 이용하여 처리 """

    xmlStr = _get_typo(xmlStr)  # typo

    bs = BeautifulSoup(xmlStr, "lxml")  # case-insensitive
    # tree = elemTree.fromstring(xmlStr)

    # total = tree.findall("claim")
    # result = {"독립항수": 0, "종속항수": 0, "총청구항수": len(total), "청구항들": []}
    # result = {"독립항수": 0, "종속항수": 0, "청구항들": []}
    result = {"청구항종류": [], "청구항들": []}

    if bs.find("sdocl"):  # 청구항 타입 a
        # result["독립항수"], result["종속항수"], result["청구항들"] = claims_a_type(bs)
        result["청구항종류"], result["청구항들"] = claims_a_type(bs)
        return result
    elif bs.find("claims"):  # 청구항 타입 b
        result["청구항종류"], result["청구항들"] = claims_b_type(bs)
        return result
    elif bs.find("claim"):  # 청구항 타입 c
        # print(appNo)
        result["청구항종류"], result["청구항들"] = claims_c_type(bs)
        return result

def ClaimTypeCheck(val):
    """ 독립항, 종속항, 삭제항 판단 """
    if "항에 있어서" in val or "항의 " in val or ("청구항" in val and "에 따른" in val) or ("청구항" in val and "에 있어서" in val) or '중 어느 한 항에' in val:
        return "jong"
    elif "삭제" in val: 
        return "sak"
    else:
        return "dok"

def claims_a_type(bs):
    """ 청구항 비정형타입 A """
    result_claim = []
    result_claim_type = []

    # jong = 0
    # dok = 0
    # 청구항 타입 a-1 - <SDOCL><CLAIM N="1"><P INDENT="14" ALIGN="JUSTIFIED">입력되는</P><P INDENT="14" ALIGN="JUSTIFIED">신호를</P></CLAIM>
    # 청구항 타입 a-3 - <SDOCL><CLAIM N=1><P>분말 용성인비를 조립함에 있어 분말 용성인비
    # 청구항 타입 a-4 - <SDOCL><P>사각형의 시트, 특히 감광 인쇄지의 더미를 순  ---- 첫 p tag가 1항임
    bs1 = bs.find("sdocl").find_all("claim") # beatifulSoup에서는 대소문 구분없음
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
            result_claim.append(p_txt)
            result_claim_type.append(t_txt)
        return result_claim_type, result_claim        
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
            result_claim.append(p_txt)
            result_claim_type.append(t_txt)            
        return result_claim_type, result_claim

def claims_b_type(bs):
    """ 청구항 비정형타입 B """    
    result_claim = []
    result_claim_type = []    
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
        result_claim.append(p_txt)
        result_claim_type.append(t_txt)        
    return result_claim_type, result_claim    

def claims_c_type(bs):
    """ 청구항 비정형타입 C """    
    result_claim = []
    result_claim_type = []
    # jong = 0
    # dok = 0

    # 청구항 타입 c-1 - <claim num="1"><claim-text>지면에 수직으로 설치되는
    #                 <claim num="12"><AmendStatus status="D">삭제</AmendStatus></claim>
    #           c-2 - <Claim num="1"><P align="JUSTIFIED" indent="14">이산화탄소 격리방법으로서, </P>
    # 청구항 타입 c-3 - <CLAIM N="1">       <P ALIGN="JUSTIFIED" INDENT="14">1. 로봇트의 리 : 1019850007359
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
                result_claim.append(bs_text.get_text())
                t_txt = ClaimTypeCheck(soup.get_text())
                result_claim_type.append(t_txt)
            elif bs_amend:
                result_claim.append(bs_amend.get_text())
                t_txt = ClaimTypeCheck(soup.get_text())
                result_claim_type.append(t_txt)                
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

            result_claim.append(p_txt)
            result_claim_type.append(t_txt)
    elif bs3:
        for soup in bs.find_all("claim"):
            p_txt = ""
            t_txt = ""
            for soup2 in soup.find_all("p"):
                if soup2:
                    if p_txt:
                        p_txt += "\n" + soup2.get_text()
                    else:
                        p_txt += soup2.get_text()
            # p 태그가 청구항내 복수개
            t_txt = ClaimTypeCheck(p_txt)

            result_claim.append(p_txt)
            result_claim_type.append(t_txt)
    return result_claim_type, result_claim

def get_description(request, xmlStr=""):

    xmlStr = _get_typo(xmlStr)  # typo

    bs = BeautifulSoup(xmlStr, "lxml")  # case-insensitive

    if bs.find("sdode"): # type sdode tag start
        my_name = ["도면의 간단한 설명", "발명의 상세한 설명", "발명의 목적", "발명이 속하는 기술 및 그 분야의 종래기술", "발명이 이루고자 하는 기술적 과제", "발명의 구성 및 작동", "발명의 효과"]
        # my_tag = ["drdes", "invdes", "purinv", "bkgr", "tech", "config", "effect"]
        my_tag = ["drdes", "", "", "bkgr", "tech", "config", "effect"]
        # 상위 제목 ; 내용 추출 안함 - invdes, purinv

        # p attribute 있는지 확인
        attrName = "n" if bs.find_all('p', {"n": True}) else ""
        # TODO : convert tabular tag to table tag - sample 1019970061654
        return description_type(bs, attrName, my_name, my_tag)
    elif bs.find("applicationbody"):  # type <ApplicationBody> tag start
        my_name = ["도면의 간단한 설명", "발명의 상세한 설명", "발명의 목적", "발명이 속하는 기술 및 그 분야의 종래기술", "발명이 이루고자 하는 기술적 과제", "발명의 구성 및 작용", "발명의 효과"]
        # my_tag = ['descriptiondrawings', 'disclosure', 'inventionpurpose', 'backgroundart','abstractproblem','inventionconfiguration','advantageouseffects']
        my_tag = ['descriptiondrawings', '', '', 'backgroundart','abstractproblem','inventionconfiguration','advantageouseffects']
        # 상위 제목 - disclosure, inventionpurpose
        return description_type(bs, 'n', my_name, my_tag)
    elif bs.find("invention-title"):  # type <invention-title> tag start
        my_name = ["기술분야", "배경기술", "발명의 내용", "해결 하고자하는 과제", "과제 해결수단", "효과", "도면의 간단한 설명", "발명의 실시를 위한 구체적인 내용", "부호의 설명"]
        # my_tag = ['technical-field', 'background-art', 'summary-of-invention', 'tech-problem','tech-solution','advantageous-effects','description-of-drawings', 'description-of-embodiments', 'reference-signs-list']
        my_tag = ['technical-field', 'background-art', '', 'tech-problem','tech-solution','advantageous-effects','description-of-drawings', 'description-of-embodiments', 'reference-signs-list']
        # 상위 제목 - summary-of-invention
        return description_type(bs, 'num', my_name, my_tag)
    elif bs.find("pctapplicationbody"):  # type <InventionTitle> tag start
        # ex. 1020047002564

        my_name = ["기술분야", "배경기술", "발명의 상세한 설명", "도면의 간단한 설명", "실시예", "산업상 이용 가능성"]
        # my_tag = ['pcttechnicalfield', 'pctbackgroundart', 'pctdisclosure','pctdescriptiondrawings','pctexample','pctindustrialapplicability']
        my_tag = ['pcttechnicalfield', 'pctbackgroundart', 'pctdisclosure','pctdescriptiondrawings','pctexample','pctindustrialapplicability']

        # 상위 제목 - None
        return description_type(bs, 'n', my_name, my_tag)             
    elif bs.find("pctinventiontitle"):  # type <PCTInventionTitle> tag start
        # ex. 1020097019662

        my_name = ["기술분야", "배경기술", "발명의 상세한 설명", "도면의 간단한 설명", "실시예", "산업상 이용 가능성"]
        # my_tag = ['pcttechnicalfield', 'pctbackgroundart', 'pctdisclosure','pctdescriptiondrawings','pctexample','pctindustrialapplicability']
        my_tag = ['pcttechnicalfield', 'pctbackgroundart', 'pctdisclosure','pctdescriptiondrawings','pctexample','pctindustrialapplicability']

        # 상위 제목 - None
        return description_type(bs, 'n', my_name, my_tag)             
    elif bs.find("inventiontitle") and bs.find("backgroundtech"):  # type <InventionTitle> tag start
        # ex. 1020080045418

        # 예외 사항이 더 많아지면 이 방법으로... {
        # my_dict = {"disclosure": "발명의 상세한 설명", "technicalfield": "기술분야", "backgroundtech": "배경기술", "inventioncontent": "발명의 내용", "solutionproblem": "해결 하고자하는 과제", "meansproblemsolution": "과제 해결수단", "effectiveness": "효과", "inventdetailcontent": "발명의 실시를 위한 구체적인 내용", "practiceexample": "실시 예", "descriptiondrawings": "도면의 간단한 설명", "disclosure": "", "technicalfield": "",}
        # my_tag = [tag.name for tag in bs.find_all() if tag not in ['<p>', '<br>']]
        # 예외 사항이 더 많아지면 이 방법으로... }

        my_name = ["발명의 상세한 설명", "기술분야", "배경기술", "발명의 내용", "해결 하고자하는 과제", "과제 해결수단", "효과", "발명의 실시를 위한 구체적인 내용", '실시 예']
        # my_tag = ['disclosure', 'technicalfield', 'backgroundtech', 'inventioncontent','solutionproblem','meansproblemsolution','effectiveness', 'inventdetailcontent','practiceexample']
        my_tag = ['', 'technicalfield', 'backgroundtech', '','solutionproblem','meansproblemsolution','effectiveness', 'inventdetailcontent','practiceexample']
        # 상위 제목 - disclosure, inventioncontent
        # TODO inventdetailcontent 가 뒤에 practiceexample 와 중복
        return description_type(bs, 'n', my_name, my_tag)        
    elif bs.find("inventiontitle") and bs.find("backgroundart"):  # type <InventionTitle> tag start
        # ex. 1020050081479

        my_name = ["도면의 간단한 설명", "발명의 상세한 설명", "발명의 목적", "발명이 속하는 기술 및 그 분야의 종래기술", "발명이 이루고자 하는 기술적 과제", "발명의 구성 및 작용", "발명의 효과"]
        # my_tag = ['descriptiondrawings', 'disclosure', 'inventionpurpose','backgroundart','abstractproblem','inventionconfiguration', 'advantageouseffects']
        my_tag = ['descriptiondrawings', '', '','backgroundart','abstractproblem','inventionconfiguration', 'advantageouseffects']
        # 상위 제목 - disclosure, inventionpurpose
        # TODO inventdetailcontent 가 뒤에 practiceexample 와 중복
        return description_type(bs, 'n', my_name, my_tag)        
    else:
        return ""  
        
def description_type(bs, attName, my_name, my_tag):
    result = {}
    for idx, val in enumerate(my_tag):
        result[my_name[idx]] = bs_desc(bs.find_all(val), attName)
    result['descPart'] = my_name
    return result                          

def bs_desc(bs, attName):
    if bs:
        result = ""
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
                        if result:
                            result = result + "\n" + n_txt + s # soup2.get_text("\n")
                        else:
                            result = n_txt + s # soup2.get_text("\n")
        return result
    else:
        return ""

def replace_with_newlines(element):
    result = ''
    for elem in element.recursiveChildGenerator():
        if isinstance(elem, str):
            result += elem.strip()
        elif elem.name == 'br':
            result += '\n'
    return result                

def tokenizer( raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]): # NNG,NNP명사, SY기호, SL외국어, SH한자, UNKNOW (외래어일 가능성있음)
    mecab = Mecab()
    STOPWORDS = settings.TERMS['STOPWORDS']    
    return [
        word
        for word, tag in mecab.pos(raw) if len(word) > 1 and tag in pos and word not in STOPWORDS
        # if len(word) > 1 and tag in pos and word not in stopword
        # if tag in pos
        # and not type(word) == float
]    
