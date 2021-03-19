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
import csv

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

def save_claim():
    df = pd.read_csv('parse_claim.csv')
    with connect(name = 'sub') as connection:
        with connection.cursor() as cursor:
            sql = ''' 
            COPY claim
            FROM STDIN
            WITH DELIMITER ',' CSV HEADER
            '''

            with open('parse_claim.csv', 'r') as f:
                cursor.copy_expert(sql,f)
            connection.commit()
            
def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
    

def _parse_typo(xmlStr=""):
    """ 오타 정리 """
    if xmlStr != None:
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
    bs = BeautifulSoup(xmlStr, "lxml")  # case-insensitive
    # tree = elemTree.fromstring(xmlStr)

    # total = tree.findall("claim")
    # my_dict = {"독립항수": 0, "종속항수": 0, "총청구항수": len(total), "청구항들": []}
    # my_dict = {"독립항수": 0, "종속항수": 0, "청구항들": []}
    my_dict = {"type": [], "claims": []}
    # print('parser : ', bs)
    try:
        if bs.find("sdocl") and len(bs.find("sdocl")) != 0 and '참고사항' not in bs.find("sdocl").find("p").text:  # 청구항 타입 a
            # my_dict["독립항수"], my_dict["종속항수"], my_dict["청구항들"] = claims_a_type(bs)
            
            my_dict["type"], my_dict["claims"] = claims_a_type(bs)
            return my_dict
        elif bs.find("claims") and len(bs.find("claims")) != 0:  # 청구항 타입 b

            my_dict["type"], my_dict["claims"] = claims_b_type(bs)
            return my_dict
        elif bs.find("claim") and len(bs.find("claim")) != 0:  # 청구항 타입 c

            my_dict["type"], my_dict["claims"] = claims_c_type(bs)
            return my_dict
        else:
            pass
    except AttributeError:
        return None

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
    test1 = re.findall("제\s?[0-9]{1,3}\s?항에", val)
    test2 = re.findall("청구항\s?[0-9]{1,3}\s?에", val)
    test3 = re.findall("[0-9]{1,3}\s?항에", val)
    test4 = re.findall("제\s?[0-9]{1,3}\s?항의", val)
    test5 = re.findall("삭제", val)
    
    if re_range == 1 or len(test1 + test2 + test3 + test4 + test5) == 0:
        return "Ind"

    elif test5 or val in '삭제':
        return "Del"

    elif re_range not in test1 or re_range not in test2 or re_range not in test3 or re_range not in test4:
        return "Dep"

    else:
        return "Ind"

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
            p_txt = ""
            t_txt = ""
            soup_text = ""
            t_txt = ClaimTypeCheck(idx, soup.get_text())

            for soup2 in soup.find_all("p"):
                if '참고사항' not in soup2.text:
                    if p_txt:
                        p_txt += "\n" + soup2.get_text()
                    else:
                        p_txt += soup2.get_text()
            my_claim.append(p_txt)
            my_claim_type.append(t_txt)
    
    elif bs4:
        for idx, soup in enumerate(bs4):
            p_txt = ""
            t_txt = ""
            soup_text = ""
            soup_text = soup.get_text()
            t_txt = ClaimTypeCheck(idx, soup_text)
            if "참고사항" not in soup_text:
                if p_txt:
                    p_txt += "\n" + soup_text
                else:
                    p_txt += soup_text
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
    for idx, soup in enumerate(bs1):
        p_txt = ""
        t_txt = ""
        t_txt = ClaimTypeCheck(idx, soup.get_text())

        # if soup_text:
        #     if p_txt:
        #         p_txt += "\n" + soup_text
        #     else:
        #         p_txt += soup_text

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
    bs_list = bs.find_all("claim")
    if bs1:
        for idx, soup in enumerate(bs_list):
            
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
        for idx, soup in enumerate(bs_list):
            
            p_txt = ""
            t_txt = ""
            bs_p = soup.find_all("p")
            bs_amend = soup.find_all("amendstatus")
            
            if bs_p:
                for soup2 in bs_p:
                    if soup2:
                        if p_txt:
                            p_txt += "\n" + soup2.get_text()
                        else:
                            p_txt += soup2.get_text()
                t_txt = ClaimTypeCheck(idx, p_txt)
                my_claim.append(p_txt)
                my_claim_type.append(t_txt)
                # for soup2 in soup.find_all("p"):
                #     if soup2:
                #         if p_txt:
                #             p_txt += "\n" + soup2.get_text()
                #         else:
                #             p_txt += soup2.get_text()
            
            # p 태그가 청구항내 복수개
            else:
                for soup2 in bs_amend:
                    if soup2:
                        if p_txt:
                            p_txt += "\n" + soup2.get_text()
                        else:
                            p_txt += soup2.get_text()
                t_txt = ClaimTypeCheck(idx, p_txt)
                my_claim.append(p_txt)
                my_claim_type.append(t_txt)
                # for soup2 in soup.find_all("amendstatus"):
                #     if soup2:
                #         if p_txt:
                #             p_txt += "\n" + soup2.get_text()
                #         else:
                #             p_txt += soup2.get_text()
            
    elif bs3:
        for idx, soup in enumerate(bs_list):
            
            p_txt = ""
            t_txt = ""
            bs_p = soup.find_all("p")
            bs_amend = soup.find_all("amendstatus")

            if bs_p:
                for soup2 in bs_p:
                    if soup2:
                        if p_txt:
                            p_txt += "\n" + soup2.get_text()
                        else:
                            p_txt += soup2.get_text()
                        t_txt = ClaimTypeCheck(idx, p_txt)            
                my_claim.append(p_txt)
                my_claim_type.append(t_txt)
                # for soup2 in soup.find_all("p"):
                #     if soup2:
                #         if p_txt:
                #             p_txt += "\n" + soup2.get_text()
                #         else:
                #             p_txt += soup2.get_text()
            
            # p 태그가 청구항내 복수개
            else:
                for soup2 in bs_amend:
                    if soup2:
                        if p_txt:
                            p_txt += "\n" + soup2.get_text()
                        else:
                            p_txt += soup2.get_text()
                        t_txt = ClaimTypeCheck(idx, p_txt)            
                my_claim.append(p_txt)
                my_claim_type.append(t_txt)
                # for soup2 in soup.find_all("amendstatus"):
                #     if soup2:
                #         if p_txt:
                #             p_txt += "\n" + soup2.get_text()
                #         else:
                #             p_txt += soup2.get_text()                                            
    return my_claim_type, my_claim

def csv_write(data):
    csv_open = open('parse_claim.csv', 'w+', encoding = 'utf-8', newline = '')
    csv_writer = csv.writer(csv_open)

    csv_writer.writerow(('출원번호', '청구항'))

    for i in data:
        csv_writer.writerow((
            str(i[0]),
            json.dumps(parse_claims(i[-1]))
        ))
    csv_open.close()

def main_def(repeat_cnt = 0):
    start_time = time.time()

    # 시작 기준값 1009880005251
    startNo = 1000

    f = open('./claim_number.txt', 'r')
    appNo = f.read()
    f.close()

    with connect(name = 'sub') as connection:
        with connection.cursor() as cursor:

            query = "select 출원번호, 청구항 from 공개청구항 WHERE 출원번호 > " + str(appNo) + "ORDER BY 출원번호 ASC LIMIT " + str(startNo) + " OFFSET 0"
            cursor.execute(query)

            rowdata = cursor.fetchall()
            # rowdata = dictfetchall(cursor)
    connection.close()
    

    ## ver.dictfetchall
    # lastAppNo = str(rowdata[-1]['출원번호'])

    ## ver.fetchall
    lastAppNo = str(rowdata[-1][0])
    
    #       21.03.09    /   21.03.15     /    21.03.17
    # 시작    09:50           09:39             08:53
    # 종료    14:58           14:58             14:09
    # 개수  4,050,200       3,989,470         4,151,977

    csv_write(rowdata)
    save_claim()

    f = open('./claim_number.txt', 'w')
    f.write(str(lastAppNo))
    f.close()

    memoryUse = psutil.virtual_memory()[2]

    print(
        "{0}. {1} {2} {3} success --- {4} 초 ---".format(
            str(repeat_cnt), time.strftime('%H:%M', time.localtime(time.time())), 
            str(memoryUse)+'%',
            str(lastAppNo), round(time.time() - start_time)
        )
    )
    repeat_cnt += 1

    time.sleep(0.2)
    threading.Timer(1, main_def(repeat_cnt)).start()
            
    print('----------------------')
    print('done')

if __name__ == "__main__":
    sys.setrecursionlimit(5000)
    main_def()