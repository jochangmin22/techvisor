from django.db import connection
from bs4 import BeautifulSoup
from sqlalchemy import create_engine

import re
import requests
import json
import os
import sys
import time
import threading
import psycopg2
import psutil
import pandas as pd

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'techvisor.settings')

import django
django.setup()

from django import db
from django.conf import settings

def connect(name):
    if name == 'sub':
        connection = psycopg2.connect(
            host="192.168.0.50", database="dj11000", user="postgres", password="btw160302*", port="5432"
            )
    elif name == 'main':
        connection = psycopg2.connect(
            host="192.168.0.40", database="ipgrim", user="ipgrim", password="btw*0302", port="5433"
        )
    return connection

def execute(sql, params={}):
    with connect(name = 'sub') as connection:
        with connection.cursor() as cursor:
            cursor.execute(sql, params)

SINGLE_INSERT = """
        INSERT INTO claim(출원번호, 청구항)
        VALUES (%(appNo)s, %(claims)s)
        ON CONFLICT (출원번호) DO NOTHING
        """

class DataInserter():

    def __init__(self, rowdata):
        self.data = [
            {
                '출원번호' : str(i['출원번호']),
                '청구항' : json.dumps(parse_claims(i['청구항']))
            }
            for i in rowdata if i['청구항']
        ]

    def fast_insert(self):
        sql = '''
            INSERT INTO claim(출원번호, 청구항)
            SELECT unnest(%(appNo)s),
                    unnest({claims})
        '''
        appNo = [i['출원번호'] for i in self.data]
        claims = [i['청구항'] for i in self.data]
        # print('claims : ', locals())
        execute(sql, locals())

    def normal_insert(self):
        with connect(name = 'sub') as connection:
            with connection.cursor() as cursor:
                for row in self.data:
                    appNo = row['출원번호']
                    claims = row['청구항']
                    # cursor.execute(SINGLE_INSERT, locals())

# def save_claim(appNo, data):
def save_claim(data):
    # data = json.dumps(data)
    try:
        appNo_list = []
        data_list = []

        for i in data:
            appNo_list.append(str(i['출원번호']))
            # print('data : ', str(i['출원번호']), parse_claims(i['청구항']))
            data_list.append(parse_claims(i['청구항']))

        # print('data : ', json.dumps(data_list[0]))

        ## postgresql data 대량 insert 쿼리문 생각하기
        
        # with connect(name = 'main') as connection:
        #     with connection.cursor() as cursor:
        #         query = f'INSERT INTO claim (출원번호, 청구항) VALUES ( $${appNo}$$, $${data}$$)'
        #         cursor.execute(query)
        #         connection.commit()
        data_len = len(data) + 1
        with connect(name = 'sub') as connection:
            with connection.cursor() as cursor:
                query = '''
                    DECLARE tbl_ins claim%ROWTYPE;
                    w_ins tbl_ins;

                    BEGIN
                    FOR i IN 1..data_len LOOP
                        w_ins(i).출원번호 := appNo[i];
                        w_ins(i).청구항 := data_list[i];
                    END LOOP;
                        FORALL i in 1..data_len INSERT INTO claim VALUES w_ins(i);
                        COMMIT;
                    END;
                    '''
                # appNo = [i for i in appNo_list]
                # claims = [json.dumps(i) for i in data_list]
                # print('query : ', locals())
                # cursor.execute(query)
                # connection.commit()

    except (Exception, psycopg2.Error) as error:
        # if(connection):
        print('Faild to insert record into claim', error)
    
    # finally:
    #     if(connection):
    #         cursor.close()
    #         connection.close()

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
    

def _parse_typo(xmlStr=""):
    """ 오타 정리 """
    if xmlStr != None:
        # print('typo : ',xmlStr)
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
    else:
        return ''


def parse_claims(xmlStr=""):
    """ 비정형 청구항을 bs를 이용하여 처리 """
    
    xmlStr = _parse_typo(xmlStr) # typo
    # print('xmlStr : ', xmlStr)

    bs = BeautifulSoup(xmlStr, "lxml")  # case-insensitive
    # tree = elemTree.fromstring(xmlStr)

    # total = tree.findall("claim")
    # my_dict = {"독립항수": 0, "종속항수": 0, "총청구항수": len(total), "청구항들": []}
    # my_dict = {"독립항수": 0, "종속항수": 0, "청구항들": []}
    my_dict = {"type": [], "claims": []}

    if bs.find("sdocl") and len(bs.find("sdocl")) != 0 and '참고사항' not in bs.find("sdocl").find("p").text:  # 청구항 타입 a
        # print('parser A : ', bs)
        # 그리고 데이터가 중복으로 들어갈 수 있음 중복제거하는부분도 작성 필요

        # my_dict["독립항수"], my_dict["종속항수"], my_dict["청구항들"] = claims_a_type(bs)
        my_dict["type"], my_dict["claims"] = claims_a_type(bs)
        # print('parser A : ', my_dict)
        return my_dict
    elif bs.find("claims") and len(bs.find("claims")) != 0:  # 청구항 타입 b
        # print('parser B : ', bs)

        my_dict["type"], my_dict["claims"] = claims_b_type(bs)
        return my_dict
    elif bs.find("claim") and len(bs.find("claim")) != 0:  # 청구항 타입 c
        # print('parser C : ', bs)

        my_dict["type"], my_dict["claims"] = claims_c_type(bs)
        return my_dict
    else:
        pass

def ClaimTypeCheck(idx, val):
    """ 독립항, 종속항, 삭제항 판단 """
    # if "항에 있어서" in val or "항의 " in val or ("청구항" in val and "에 따른" in val) or ("청구항" in val and "에 있어서" in val) or '중 어느 한 항에' in val:


    # if "항에 있어서" in val or ("청구항" in val and "에 따른" in val) or ("청구항" in val and "에 있어서" in val) or '중 어느 한 항에' in val or '항이나' in val or '항에' in val :
    #     return "Dep"
        
    # elif "삭제" in val:
    #     return "Del"
        
    # else:
    #     return "Ind"
    re_range = idx + 1
    # print('claim check : ', re_range, re.match("삭제", 'qvvgageb dfklsa  삭제 dsf '))
    # if re.match("제\s?[0-9]{1,3}\s?항에", val):
    #     print('claim check : ', re_range, val)
    # test = re.findall("제\s?[0-9]{1,3}\s?항에", val)

    if len(re.findall("제\s?[0-9]{1,3}\s?항에", val)) == 0:
        ## print('claim check : ', idx, 'Ind')
        return "Ind"

    elif re_range not in re.findall("제\s?[0-9]{1,3}\s?항에", val):
        ## print('claim check : ', idx, 'Dep')
        return "Dep"
    
    elif re.findall("삭제", val):
        ## print('claim check : ', idx, 'Del')
        return "Del"

    else:
        ## print('claim check : ', idx, 'Ind')
        return "Ind"

# 제 [0-9]항 | 
# 제\d항에 

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
        for idx, soup in enumerate(bs1):
            # print('bs1 type A idx : ', idx)
            p_txt = ""
            t_txt = ""
            t_txt = ClaimTypeCheck(idx, soup.get_text())
            for soup2 in soup.find_all("p"):
                if soup2:
                    if p_txt:
                        p_txt += "\n" + soup2.get_text()
                    else:
                        p_txt += soup2.get_text()
            
            my_claim.append(p_txt)
            my_claim_type.append(t_txt)
        # print('type A : ', my_claim_type, my_claim)
        return my_claim_type, my_claim
    elif bs4:
        p_txt = ""
        t_txt = ""
        for idx, soup in enumerate(bs4):
            # print('bs4 type A idx : ', soup)
            t_txt = ClaimTypeCheck(idx, soup.get_text())
            if soup:
                if p_txt:
                    p_txt += "\n" + soup.get_text()
                    # print('bs4 text : ', p_txt)
                else:
                    p_txt += soup.get_text()
                    # print('bs4 text : ', p_txt)
            my_claim.append(p_txt)
            my_claim_type.append(t_txt)
        # print('type A : ', my_claim_type, my_claim)
        return my_claim_type, my_claim


def claims_b_type(bs):
    """ 청구항 비정형타입 B """
    my_claim = []
    my_claim_type = []
    # jong = 0
    # dok = 0

    # 청구항 타입 2 - <Claims><Claim n="1"><P align="JUSTIFIED" indent="14">플립의 열림 동작과 닫힘
    bs1 = bs.find("claims").find_all("claim")
    for idx, soup in enumerate(bs1):
        # print('type B idx : ', idx)
        p_txt = ""
        t_txt = ""
        t_txt = ClaimTypeCheck(idx, soup.get_text())

        for soup2 in soup.find_all("p"):
            if soup2:
                if p_txt:
                    p_txt += "\n" + soup2.get_text()
                else:
                    p_txt += soup2.get_text()
        
        my_claim.append(p_txt)
        my_claim_type.append(t_txt)
    # print('type B : ', my_claim_type, my_claim)
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
        for idx, soup in enumerate(bs.find_all("claim")):
            
            # print('type C idx : ', idx, soup)

            bs_text = soup.find("claim-text")
            # bs_amend = soup.find("claim_amend-text")
            bs_amend = soup.find("amendstatus")
            t_txt = ""
        
            if bs_text:
                my_claim.append(bs_text.get_text())
                t_txt = ClaimTypeCheck(idx, soup.get_text())
                my_claim_type.append(t_txt)
            elif bs_amend:
                my_claim.append(bs_amend.get_text())
                t_txt = ClaimTypeCheck(idx, soup.get_text())
                my_claim_type.append(t_txt)
    elif bs2:
        for idx, soup in enumerate(bs.find_all("claim")):

            # print('type C idx : ', idx, soup)
            
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
            t_txt = ClaimTypeCheck(idx, p_txt)
            
            my_claim.append(p_txt)
            my_claim_type.append(t_txt)
    elif bs3:
        for idx, soup in enumerate(bs.find_all("claim")):

            # print('type C idx : ', idx, soup)
            
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
            t_txt = ClaimTypeCheck(idx, p_txt)
            
            my_claim.append(p_txt)
            my_claim_type.append(t_txt)
    # print('type C : ', my_claim_type, my_claim)
    return my_claim_type, my_claim


## 지금은 ubuntu의 dj11000에서 공개청구항 테이블이랑 공개공보 테이블만 사용중
def main_def(repeat_cnt = 0):
    start_time = time.time()

    # startNo = 1000
    startNo = 1
    appNo = 1019850002477
    # appNo = 1019930701473
    ## 청구항 데이터가 Null 이거나 <SDOCL></SDOCL> 이렇게 비어있는 데이터들의 출원번호
    # 1020080118538
    # 1019880009890
    # -----------------
    # 1019930700958
    # 1019890018518
    # 1019890701905
    # 2019870019418
    # 2019930007243
    # 2019870017505
    # 2019920003748
    # 2019920008112
    # 2019870007090
    # 2019900005845
    # 2019870014058
    # 1019870007983
    # 2019940010476
    # 2019850006519
    # 2019930010147
    # 2019910008232
    # 데이터가 null인 상태로 DB에 들어가는것들이 있음

    # 시작 기준값 1009880005251

    # f = open('./claim_number.txt', 'r')
    # appNo = f.read()
    # f.close()

    with connect(name = 'sub') as connection:
        with connection.cursor() as cursor:

            query = "select 출원번호, 청구항 from 공개청구항 WHERE 출원번호 > " + str(appNo) + "ORDER BY 출원번호 ASC LIMIT " + str(startNo) + " OFFSET 0"
            # print('query :', query)
            cursor.execute(query)

            # rowdata = cursor.fetchall()
            rowdata = dictfetchall(cursor)
    connection.close()
    # print('rowdata :', rowdata)

    ## ver.dictfetchall
    lastAppNo = str(rowdata[-1]['출원번호'])
    # print('lastAppNo :', lastAppNo)

    ## ver.fetchall
    # lastAppNo = str(rowdata[-1][0])

    # for row in rowdata:
    #     print('출원번호 : ', str(row['출원번호']))
    #     if row['청구항']:
    #         res = parse_claims(row['청구항'])
    #         save_claim(str(row['출원번호']), res)
    
    # save_claim(rowdata)

    db_insert = DataInserter(rowdata)
    db_insert.normal_insert()

    # f = open('./claim_number.txt', 'w')
    # f.write(str(lastAppNo))
    # f.close()

    memoryUse = psutil.virtual_memory()[2]

    print(
        "{0}. {1} {2} {3} success --- {4} 초 ---".format(
            str(repeat_cnt), time.strftime('%H:%M', time.localtime(time.time())), 
            str(memoryUse)+'%',
            str(lastAppNo), round(time.time() - start_time)
        )
    )
    repeat_cnt += 1

            
    # threading.Timer(1, main_def(repeat_cnt)).start()
            
    print('----------------------')
    print('done')    

if __name__ == "__main__":
    sys.setrecursionlimit(5000)
    main_def()