
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
        host="localhost", database="ipgrim", user="ipgrim", password="btw*0302", port="5433"
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
        "NAME": "ipgrim",
        "USER": "ipgrim",
        "PASSWORD": "btw*0302",
        "HOST": "localhost",
        "PORT": "5433"
    }
}             

def main_def():
    """ 공시정보 - 고유번호 전체목록 크롤러 """

    db_connection_url = "postgresql://{}:{}@{}:{}/{}".format(
        DATABASES['default']['USER'],
        DATABASES['default']['PASSWORD'],
        DATABASES['default']['HOST'],
        DATABASES['default']['PORT'],
        DATABASES['default']['NAME'],
    )


    # start_time = time.time()

    df = get_corpcode(DART['api_key'], only_stock = True)

    # Match df columns name to model table name
    df.columns = ['corp_code', 'corp_name', 'stock_code', 'modify_date']

    # truncate table
    backupAndEmptyTable('disclosure')

    # threading.Timer(1, main_def(repeat_cnt)).start()

    print('총 공시회사수 :', len(df))

    engine = create_engine(db_connection_url)

    df.to_sql('disclosure', engine, if_exists='append', index=False, chunksize=10000)

  
            
    print('----------------------')
    print('done')       

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