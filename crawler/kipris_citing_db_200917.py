# ## [키프리스 피인용 (plus.kipris.or.kr)](http://plus.kipris.or.kr/portal/data/service/DBII_000000000000334/view.do?menuNo=200100&kppBCode=&kppMCode=&kppSCode=&subTab=SC001&entYn=N&clasKeyword=%ed%94%bc%ec%9d%b8%ec%9a%a9)
# 

# 1009880005252 -1
# 1019900007281

from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
import urllib
import json
import requests
import psycopg2
from psycopg2.extensions import AsIs
import uuid
import psutil
import time
import threading
import sys

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

# dt = datetime.utcnow()

def connect():
    connection = psycopg2.connect(
        host="localhost", database="dj11000", user="postgres", password="btw160302*"
    )
    return connection

def insertTable(info):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:          
        
                postgres_insert_query = """ INSERT INTO 특허실용심사피인용문헌 (출원번호, 피인용문헌번호, 표준상태코드,표준상태코드명, 피인용문헌구분코드, 피인용문헌구분코드명) VALUES ( %s, %s, %s, %s, %s, %s)"""
                record_to_insert = (info['출원번호'], info['피인용문헌번호'], info['표준상태코드'], info['표준상태코드명'], info['피인용문헌구분코드'], info['피인용문헌구분코드명'])
                cursor.execute(postgres_insert_query, record_to_insert)
        
                connection.commit()
        # print ("1️⃣ " + info['출원번호'] + ':' + info['피인용문헌번호'], "Record inserted successfully" )

    except (Exception, psycopg2.Error) as error :
        if(connection):
            print("1️⃣ Failed to insert record into mobile table", error)

    finally:
        #closing database connection.
        if(connection):
            cursor.close()
            connection.close()
#             print("PostgreSQL connection is closed")        

def updateTable(info):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:        
                sql_template = "UPDATE 특허실용심사피인용문헌 SET 출원번호 = $$%s$$, 피인용문헌번호 = $$%s$$, 표준상태코드 = $$%s$$, 표준상태코드명 = $$%s$$, 피인용문헌구분코드 = $$%s$$, 피인용문헌구분코드명 = $$%s$$ WHERE 출원번호 = $$%s$$ and 피인용문헌번호 = $$%s$$" % (info['출원번호'], info['피인용문헌번호'], info['표준상태코드'], info['표준상태코드명'], info['피인용문헌구분코드'],info['피인용문헌구분코드명'], info['출원번호'],info['피인용문헌번호'] )
                cursor.execute(sql_template)   
                connection.commit()

        # print ("1️⃣ " + info['피인용문헌번호'], " updated ok" )
        
    except (Exception, psycopg2.Error) as error:
        print("1️⃣ Error in update operation", error)

    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()
#             print("PostgreSQL connection is closed")


def existCheck(info):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:

                sql_check = "select count(*) a from 특허실용심사피인용문헌 where 출원번호 = $$%s$$  and 피인용문헌번호 = $$%s$$" % (info['출원번호'], info['피인용문헌번호'])                
                cursor.execute(sql_check)
                connection.commit()
                row = dictfetchall(cursor)
                return row[0]['a']
        
    except (Exception, psycopg2.Error) as error:
        print("1️⃣ Error in exist check operation", error)
        return None

    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()

def insertTable2(appNo, citingCnt, family):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:          
        
                postgres_insert_query = """ INSERT INTO 특허실용심사피인용수패밀리수 (출원번호, 피인용수, 패밀리수) VALUES ( %s, %s, %s)"""
                record_to_insert = (appNo, citingCnt, family)
                cursor.execute(postgres_insert_query, record_to_insert)
        
                connection.commit()

        # print("2️⃣ " + str(citingCnt) + '/' + str(family), "inserted ok" )

    except (Exception, psycopg2.Error) as error :
        if(connection):
            print("2️⃣ Failed to insert record into mobile table", error)

    finally:
        if(connection):
            cursor.close()
            connection.close()
 

def updateTable2(appNo, citingCnt, family):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:        
                sql_template = "UPDATE 특허실용심사피인용수패밀리수 SET 출원번호 = $$%s$$, 피인용수 = $$%s$$, 패밀리수 = $$%s$$" % (appNo, citingCnt, family)
                cursor.execute(sql_template)   
                connection.commit()

        print ("2️⃣ " + str (appNo) + ' ' + str(citingCnt) + ':' + str(family), "updated ok" )
        
    except (Exception, psycopg2.Error) as error:
        print("2️⃣ Error in update operation", error)

    finally:
        if (connection):
            cursor.close()
            connection.close()


def existCheck2(appNo):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:

                sql_check = "select count(*) a from 특허실용심사피인용수패밀리수 where 출원번호 = $$" + str(appNo) + "$$"                
                cursor.execute(sql_check)
                connection.commit()
                row = dictfetchall(cursor)
                return row[0]['a']
        
    except (Exception, psycopg2.Error) as error:
        print("Error in exist check operation", error)
        return None

    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()



KIPRIS = {
"service_key": "aPmTnAjtr4j82WWmpgi=DrmRSiJXXaxHZs1W34pssBQ=",
"rest_url": "http://plus.kipris.or.kr/openapi/rest/"
}
serviceParam = 'CitingService/'
operationKey = 'citingInfo'

# <citingInfo>
#     <StandardCitationApplicationNumber>1019960064381</StandardCitationApplicationNumber>
#     <ApplicationNumber>1020010019325</ApplicationNumber>
#     <StandardStatusCode>20001</StandardStatusCode>
#     <StandardStatusCodeName>표준화</StandardStatusCodeName>
#     <CitationLiteratureTypeCode>E0802</CitationLiteratureTypeCode>
#     <CitationLiteratureTypeCodeName>선행기술조사보고서</CitationLiteratureTypeCodeName>
# </citingInfo>

def kipris_crawler(appNo):
    url = KIPRIS['rest_url'] + serviceParam + operationKey + '?standardCitationApplicationNumber=' + str(appNo) + '&accessKey=' + KIPRIS['service_key']
    try:
        html = requests.get(url)
    except requests.exceptions.RequestException as e:
        print(
            "====== {0} error ======".format(
                time.strftime('%H:%M', time.localtime(time.time()))
            )
        )        
        raise SystemExit(e)
        
    soup = BeautifulSoup(html.content, 'xml')        
    bs = soup.find_all(operationKey)

    data = []          
    if bs:
        for bs1 in bs:
            if bs1:
                # res = {}
                A = bs1.find("StandardCitationApplicationNumber").get_text()
                B = bs1.find("ApplicationNumber").get_text()
                C = bs1.find("StandardStatusCode").get_text()
                D = bs1.find("StandardStatusCodeName").get_text()
                E = bs1.find("CitationLiteratureTypeCode").get_text()
                F = bs1.find("CitationLiteratureTypeCodeName").get_text()
                
                if A:
                    res = {'출원번호' : B, '피인용문헌번호' : A, '표준상태코드' : C, '표준상태코드명' : D, '피인용문헌구분코드' : E, '피인용문헌구분코드명' : F }
                    data.append(res)     
               
    return data 

def family_cnt(appNo):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:
                sql = "SELECT count(DISTINCT 패밀리국가코드) cnt from 특허패밀리 where 출원번호 = $$" + str(appNo) + "$$"             
                cursor.execute(sql)
                connection.commit()
                row = dictfetchall(cursor)
                return row[0]['cnt']
        
    except (Exception, psycopg2.Error) as error:
        print("2️⃣ Error in family cont check operation", error)
        return None

    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()

def main_def(repeat_cnt = 0):
    """ 메인 def """

    start_time = time.time()

    startNo = 100 # 범위

    #######################
    # file에 endNo 읽기
    #######################
    f = open("/home/web/dj11000/src/task_python/appNo.txt", "r")
    appNo = f.read()
    f.close()

    with connect() as connection:
        with connection.cursor() as cursor:

            query = "select 출원번호 from 공개공보 WHERE 출원번호 > " + str(appNo) + " and (출원인코드1 <> 419980424971 or 출원인코드1 is null) ORDER BY 출원번호 ASC LIMIT " + str(startNo) + " OFFSET 0"

            cursor.execute(query)

            rawdata = cursor.fetchall()
            # cursor.close()
    connection.close()            

    lastAppNo = ""

    for row in rawdata:
        # 피인용
        if row[0]:
            info = kipris_crawler(row[0])

        # if not info:
        #     # print(str(row[0]) + ' is empty.')
        #     continue
        if info:
            for mydic in info:
                # 업데이트 체크는 안하는 걸로...
                # if existCheck(mydic) != 0:
                    # updateTable(mydic)
                # else:
                insertTable(mydic)

        # 피인용수, 패밀리수
        citingCnt = len(info) if info else 0
        family = family_cnt(row[0])
        # if existCheck2(row[0]) != 0:
            # updateTable2(row[0], citingCnt, family)
        # else:
        insertTable2(row[0], citingCnt, family)

        # kipris는 sleep 안걸면 Max retries exceeded with url 에러 나는 듯
        time.sleep(0.2)

    lastAppNo = row[0]                    

    # time.sleep(0.3)
    #######################
    # file에 endNo 저장
    #######################
    f = open("/home/web/dj11000/src/task_python/appNo.txt", "w")
    f.write(str(lastAppNo))
    f.close()

    # memory usage check
    memoryUse = psutil.virtual_memory()[2]         

    print(
        "{0}. {1} {2} {3} success --- {4} 초 ---".format(
            str(repeat_cnt), time.strftime('%H:%M', time.localtime(time.time())), 
            str(memoryUse)+'%',
            str(lastAppNo), round(time.time() - start_time)
        )
    )
    repeat_cnt += 1

            
    threading.Timer(1, main_def(repeat_cnt)).start()
            
    print('----------------------')
    print('done')    

if __name__ == "__main__":
    # request = int(sys.argv[1])
    # kr_tag(request)
    sys.setrecursionlimit(5000)
    main_def()
