#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
**************************************************
 DART 공시회사 [고유번호] -> mecab 사용자사전 csv 변환
 21.03.25
*********************************************
 Usage:
 $ ~/miniconda3/envs/techvisor/bin/python /home/btowin/techvisor-backend/crawler/disclosure_mecab_userdic-210325.py

 공시회사 전체목록을 노이즈필터링을 거처서 mecab-userdic 폴더에 disclosure.csv에 저장한다
 (파일 안에 전체 " 를 지워줘야함.)
"""

EXCLUDE_COMPANY_NAME = [
    "가솔린",
    "가온",
    "강남",
    "강원",
    "강화",
    "갤럭시",
    "경",
    "교차로",
    "그랜드",
    "그린",
    "금성",
    "나눔",
    "남부",
    "남성",
    "넓은",
    "다정",
    "대덕",
    "대상",
    "대선",
    "대세",
    "대항",
    "데일리",
    "동아",
    "동참",
    "디자인",
    "라움",
    "라이프",
    "로드",
    "로딩",
    "마운틴",
    "마음",
    "미래",
    "베스트",
    "보배",
    "보성",
    "보양",
    "비콘",
    "삼정",
    "상보",
    "셀프",
    "소재",
    "소정",
    "솔라",
    "송도",
    "시티",
    "신안",
    "영남",
    "용현",
    "율곡",
    "일진",
    "지디",
    "진",
    "코로나",
    "코리아",
    "코뿔소",
    "파트너",
    "포스트",
    "퓨전",
    "플랫폼",
    "플레이리스트",
    "플로",
    "헬스케어",
    "호남",
    "홈센타",
    "화산",
    "화석",
    "화성",
    "황소",
    "휠",
    "흙",
    "흥건",
    "희",
]

EXCLUDE_COMPANY_NAME_CONTAINS=[
    "0호",
    "1호",
    "2호",
    "3호",
    "4호",
    "5호",
    "6호",
    "7호",
    "8호",
    "9호",
    "기업인수",
    "농업회사",
    "부동산",
    "사무소",
    "시리즈",
    "영업소",
    "위탁관리",
    "유동화",
    "자산운용",
    "전문유한회사",
    "제구차",
    "제구호",
    "제사십",
    "제사차",
    "제사호",
    "제삼십",
    "제삼차",
    "제삼호",
    "제십구",
    "제십사",
    "제십삼",
    "제십오",
    "제십육",
    "제십이",
    "제십일",
    "제십차",
    "제십칠",
    "제십팔",
    "제십호",    
    "제오십",
    "제오차",
    "제오호",
    "제육차",
    "제육호",
    "제이십",
    "제이차",
    "제이호",
    "제일차",
    "제일호",
    "제칠차",
    "제칠호",
    "제팔차",
    "제팔호",
    "지점",
    "터미널",
    "투자",
    "펀드",
]


# app
import requests
import pandas as pd
import io
import zipfile
import xml.etree.ElementTree as et 
import json

from sqlalchemy import create_engine


# 공통
from bs4 import BeautifulSoup
from datetime import datetime
import time
import urllib.request

from clint.textui import progress, puts, colored
import csv
import re     

import datetime as dt

import psutil
import time
import threading
import sys

import psycopg2
from psycopg2.extensions import AsIs
from datetime import datetime

dt = datetime.utcnow()

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

def connect():
    connection = psycopg2.connect(
        host="btowin.synology.me", database="techvisor", user="postgres", password="btw*0302", port="5433"
    )
    return connection    

def backupAndEmptyTable(tableName):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:      
                query =" DROP TABLE IF EXISTS " + tableName + "_back; create table " + tableName + "_back as (select * from " + tableName + "); TRUNCATE " + tableName + ";"  
                cursor.execute(query)
                connection.commit()
    except (Exception, psycopg2.Error) as error :
        if(connection):
            print("Failed to backup and empty " + tableName + " table", error)

    finally:
        if(connection):
            cursor.close()
            connection.close()

def insertTable(no, kiscode, info, name, upjong, product, listed_date, settlemonth, representive, homepage, area):
    # table = 'listed_corp'    
    info = json.dumps(info)
    try:
        with connect() as connection:
            with connection.cursor() as cursor:      
        
                postgres_insert_query = """ INSERT INTO listed_corp (회사명, 종목코드, 업종, 주요제품, 상장일, 결산월, 대표자명, 홈페이지, 지역, 정보) VALUES ( %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                record_to_insert = (name, kiscode, upjong, product, listed_date, settlemonth, representive, homepage, area, info)
                cursor.execute(postgres_insert_query, record_to_insert)
                
                connection.commit()
                # count = cursor.rowcount
                # print (count, "Record inserted successfully into mobile table")
                # print (no, kiscode, "Record inserted successfully" )

    except (Exception, psycopg2.Error) as error :
        if(connection):
            print("Failed to insert record into mobile table", error)

    finally:
        #closing database connection.
        if(connection):
            cursor.close()
            connection.close()
            # print("PostgreSQL connection is closed")

def updateTable(no, kiscode, info):
    info = json.dumps(info)    
    try:
        with connect() as connection:
            with connection.cursor() as cursor:         
                sql_template = "UPDATE listed_corp SET 정보 = $$%s$$ WHERE 종목코드 = $$%s$$ " % (info, kiscode)
                cursor.execute(sql_template)   
                connection.commit()
                # cursor.execute("UPDATE listed_corp SET 정보 = %s WHERE 종목코드 = %s", (info, kiscode))

                # print (no, kiscode, "Record updated successfully" )
        
    except (Exception, psycopg2.Error) as error:
        print(no, "Error in update operation", error)

    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()
            # print("PostgreSQL connection is closed") 

def existCheck(kiscode):
    try:
        with connect() as connection:
            with connection.cursor() as cursor: 
        
                sql_check = "select count(*) a from listed_corp where 종목코드 = $$%s$$ " % (kiscode)
                cursor.execute(sql_check)
                connection.commit()
                row = dictfetchall(cursor)
                return row[0]['a']
        
    except (Exception, psycopg2.Error) as error:
        print(error)
        return None

    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()

def get_corpcode(crtfc_key, only_stock = True):
    """
    OpenDART 기업 고유번호 받아오기
    return 값: only_stock 에 따라 [주식코드를 가진 업체/ 전체] 의 DataFrame
    """
    params = {'crtfc_key':crtfc_key}
    items = ["corp_code","corp_name","stock_code","modify_date"]
    item_names = ["고유번호","회사명","종목코드","수정일"]
    url = "https://opendart.fss.or.kr/api/corpCode.xml"
    res = requests.get(url,params=params)
    zfile = zipfile.ZipFile(io.BytesIO(res.content))
    fin = zfile.open(zfile.namelist()[0])
    root = et.fromstring(fin.read().decode('utf-8'))
    data = []
    for child in root:
        if only_stock:
            if len(child.find('stock_code').text.strip()) > 1: # 종목코드가 있는 경우
                data.append([])
                for item in items:
                    data[-1].append(child.find(item).text)
        else:
            data.append([])
            for item in items:
                data[-1].append(child.find(item).text)                
    df = pd.DataFrame(data, columns=item_names)
    return df

DART = {
    "api_key": "e0e209eea9e65bd15ccbafb3adb8db40477cedc5",
    "dart_url": "https://opendart.fss.or.kr/api/",
}   

DATABASES = {
    "default": {
        "ENGINE": "postgresql",
        "NAME": "techvisor",
        "USER": "postgres",
        "PASSWORD": "btw*0302",
        "HOST": "btowin.synology.me",
        "PORT": "5433"
    }
}         
def isExistJongsung(words):
    result = []
    for word in words:
        res = (ord(word[-1]) - 44032) % 28 == 0
        result.append('F' if res else 'T')
    return result

def remove_brackets(words):
    result = []
    for word in words:
        word = word.strip()
        # 특수 부호 제거
        word = word.replace(r"\(.*\)","")       
        word = re.sub('주\)|\(|\)|\,|\&|\.|\-|\（|\）', '', word)
        result.append(word)    
    return result        
   
def main_def():
    """ 공시정보 - 고유번호 전체목록 크롤러 """

    db_connection_url = "postgresql://{}:{}@{}:{}/{}".format(
        DATABASES['default']['USER'],
        DATABASES['default']['PASSWORD'],
        DATABASES['default']['HOST'],
        DATABASES['default']['PORT'],
        DATABASES['default']['NAME'],
    )
    puts("-----------------------------")
    puts("dart 회사 목록 가져오기...")
    # start_time = time.time()

    df = get_corpcode(DART['api_key'], only_stock = False)

    # Match df columns name to model table name
    df.columns = ['corp_code', 'corp_name', 'stock_code', 'modify_date']

    puts("disclosure 테이블에 비우기...")
    backupAndEmptyTable('disclosure')

    total_count = len(df)
    puts(colored.green("공시회사 %d 발견." % total_count))

    puts("공시회사명이 EXCLUDE_COMPANY_NAME_CONTAINS %d 개의 목록에 포함되면 제거"  % len(EXCLUDE_COMPANY_NAME_CONTAINS))
    pattern = '|'.join(EXCLUDE_COMPANY_NAME_CONTAINS)
    df = df.loc[~(df['corp_name'].str.contains(pattern, case=False))]
    remove_contains_count = total_count - len(df)
    puts(colored.green("제거된 회사 -%d" % remove_contains_count))

    puts("공시회사명이 EXCLUDE_COMPANY_NAME %d 개의 목록과 일치하면 제거"  % len(EXCLUDE_COMPANY_NAME))
    pattern = '|'.join(EXCLUDE_COMPANY_NAME)
    df = df.loc[~(df['corp_name'].str.match(pattern, case=False))]
    remove_match_count = total_count - remove_contains_count - len(df)
    puts(colored.green("제거된 회사 -%d" % remove_match_count))


    puts("공시회사명에서 한글 없으면 제거...")
    patternDel = r'[ㄱ-ㅎ|가-힣]'
    df = df[(df['corp_name'].str.contains(patternDel, case=False))]
    remove_not_hangule_count = total_count - remove_contains_count - remove_match_count - len(df)
    puts(colored.green("제거된 회사 -%d" % remove_not_hangule_count))   

    puts("공시회사명에서 brakets, 특수부호 제거...")
    df['corp_name'] = remove_brackets(df['corp_name'].astype(str))
    total_left_count = total_count - remove_contains_count - remove_match_count - remove_not_hangule_count
    puts(colored.green("남은 공시회사 %d" % total_left_count))

    # puts("테이블 저장 시작...")
    # engine = create_engine(db_connection_url)
    # df.to_sql('disclosure', engine, if_exists='append', index=False, chunksize=100000)
    # puts(colored.green("테이블 저장 완료."))

    puts("공시회사명 mecab dictionary형태로 변환...")
    df['corp_name'] = df['corp_name'].astype(str) + \
        ',1786,3546,2953,NNP,*,' + \
        isExistJongsung(df['corp_name'].astype(str)) + \
        ',' + df['corp_name'].astype(str) + ',*,*,*,*'

    with open('/home/btowin/techvisor-backend/mecab-userdic/disclosure_210325.csv', 'w') as file:
        # df['corp_name'].to_csv(path_or_buf=file, index=False, header=False, doublequote=False, quoting=csv.QUOTE_NONE, escapechar="\\")
        df['corp_name'].to_csv(path_or_buf=file, index=False, header=False)

    puts(colored.green("csv 저장 완료."))
    puts("-----------------------------")
   

if __name__ == "__main__":
    ''' 실행하려면 argv 3개가 필요합니다. : startno, endno, tableclearatfirst? (True or False) '''
    # request = int(sys.argv[1])
    # argv ex) 0 2380 True
    # start = int(sys.argv[1])
    # end = int(sys.argv[2])
    # tableclearfirst = sys.argv[3]
    # sys.setrecursionlimit(5000)
    # main_def(start, end, tableclearfirst)    
    main_def()    

# import time

# count = 100
# print("시작".center(100, '-'))
# start = time.perf_counter()
# for i in range(count + 1):
#     a = "■" * i
#     b = " " * (count - i)
#     c = (i / count) * 100
#     res = time.perf_counter() - start
#     time.sleep(0.1)
# print("완료".center(100, '-'))

