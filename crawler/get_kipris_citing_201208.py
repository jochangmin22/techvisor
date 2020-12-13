# -*- coding: utf-8 -*- 
from __future__ import print_function
import argparse 
from bs4 import BeautifulSoup
import requests
import time
import sys
from datetime import date, timedelta
import psycopg2
import psutil
import pandas as pd
from sqlalchemy import create_engine
from colorama import Fore
from colorama import Style
import threading

# DATABASES = {
#     "default": {
#         "ENGINE": "postgresql",
#         "NAME": "ipgrim",
#         "USER": "ipgrim",
#         "PASSWORD": "btw*0302",
#         "HOST": "localhost",
#         "PORT": "5433"
#     }
# }

DATABASES = {
    "default": {
        "ENGINE": "postgresql",
        "NAME": "dj11000",
        "DATABASE": "dj11000",
        "USER": "postgres",
        "PASSWORD": "btw160302*",
        "HOST": "localhost",
        "PORT": "5432"
    }
}

db_connection_url = "postgresql://{}:{}@{}:{}/{}".format(
    DATABASES['default']['USER'],
    DATABASES['default']['PASSWORD'],
    DATABASES['default']['HOST'],
    DATABASES['default']['PORT'],
    DATABASES['default']['NAME'],
)

def daterange(date1, date2):
    for n in range(int ((date2 - date1).days)+1):
        yield date1 + timedelta(n)       

def str2bool(v):
    if isinstance(v, bool):
       return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')

 

def connect():
    connection = psycopg2.connect(
        host="localhost", database="dj11000", user="postgres", password="btw160302*", port="5432"
        # host="localhost", database="ipgrim", user="ipgrim", password="btw*0302", port="5433"        
    )
    return connection   

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

def record_log(msg):
    #######################
    # file에 log 저장
    #######################
    f = open("/home/web/dj11000/src/task_python/citing_crawl_log.txt", "a")
    f.write(str(msg)+'\n')
    f.close()
    return        

# 전체검색 - 먼저 공개일자로 검색해야해서.
rest_url = "http://plus.kipris.or.kr/openapi/rest/CitingService/citingInfo"
service_key = "aPmTnAjtr4j82WWmpgi=DrmRSiJXXaxHZs1W34pssBQ="

items = ['ApplicationNumber','StandardCitationApplicationNumber','StandardStatusCode','StandardStatusCodeName','CitationLiteratureTypeCode','CitationLiteratureTypeCodeName']
item_names = ['출원번호','피인용문헌번호','표준상태코드','표준상태코드명','피인용문헌구분코드','피인용문헌구분코드명']  


def get_db_appNo_list(appNo, startNo):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:
                query = "select 출원번호 from 공개공보 WHERE 출원번호 > " + str(appNo) + " and (출원인코드1 <> 419980424971 or 출원인코드1 is null) ORDER BY 출원번호 ASC LIMIT " + str(startNo) + " OFFSET 0"      
                cursor.execute(query)
                connection.commit()
                row = dictfetchall(cursor)
                return [d['출원번호']for d in row]

    except (Exception, psycopg2.Error) as error :
        if(connection):
            print("Failed", error)

    finally:
        if(connection):
            cursor.close()
            connection.close()
    return                     

def family_cnt(appList):
    res = []
    try:
        with connect() as connection:
            with connection.cursor() as cursor:
                for appNo in appList:
                    # sql = "SELECT count(DISTINCT 패밀리국가코드) cnt from 특허패밀리 where 출원번호  in (" + appListStr +")"             
                    sql = "SELECT COUNT(*) cnt FROM (SELECT DISTINCT 패밀리국가코드 FROM 특허패밀리 where 출원번호 = $$" + str(appNo) + "$$) as TEMP"
                    cursor.execute(sql)
                    connection.commit()
                    row = dictfetchall(cursor)
                    res.append(row[0]['cnt'])
                return res
        
    except (Exception, psycopg2.Error) as error:
        print("2️⃣ Error in family cont check operation", error)
        return None

    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()


def get_db_count(appNoList, table = '특허실용심사피인용문헌'):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:      
                query ="select count(피인용문헌번호) cnt from " + table + " where 피인용문헌번호 = ANY( " + appNoList +" );"  
                cursor.execute(query)
                connection.commit()
                row = dictfetchall(cursor)
                return row[0]['cnt']

    except (Exception, psycopg2.Error) as error :
        if(connection):
            print("Failed", error)

    finally:
        if(connection):
            cursor.close()
            connection.close()
    return  

def get_citing(appNo):
    url = rest_url + '?standardCitationApplicationNumber=' + str(appNo) + '&accessKey=' + service_key
    items = ['ApplicationNumber','StandardCitationApplicationNumber','StandardStatusCode','StandardStatusCodeName','CitationLiteratureTypeCode','CitationLiteratureTypeCodeName']
    item_names = ['출원번호','피인용문헌번호','표준상태코드','표준상태코드명','피인용문헌구분코드','피인용문헌구분코드명']        
    try:
        # html = requests.get(url)
        html = requests.get(url,headers={'Connection':'close'})
    except requests.exceptions.RequestException as e:
        print(
            "====== {0} error ======".format(
                time.strftime('%H:%M', time.localtime(time.time()))
            )
        )        
        raise SystemExit(e)
        
    soup = BeautifulSoup(html.content, 'xml')        
    data = soup.find_all('citingInfo')
    rawdata = []
    # 피인용 있으면
    if data:
        for d in data:
            if d:
                res = {}
                for (idx, key) in enumerate(items):
                    res[item_names[idx]] = d.find(key).get_text()

                rawdata.append(res)
        return rawdata
    else:
        # 피인용 없는 건
        return rawdata 

def main_def(repeat_cnt = 0):
    """ 메인 def """
    # parser = argparse.ArgumentParser()
    # parser.add_argument('--start', type=int, default=0, help="What is the start number?")
    # parser.add_argument('--end', type=int, default=0, help="What is the end number?")
    # parser.add_argument('--compare', type=str2bool, nargs='?', const=True, default=False, help='Do you check db and total number after crawling?')

    # parser.add_argument('--clear', type=str2bool, nargs='?', const=True, default=False, help='Should I truncate the Table before execution?')
    # parser.add_argument('--entire', type=str2bool, nargs='?', const=True, default=False, help='Do you want to crawl the entire company regardless of start, end number')          

                       
    # args = parser.parse_args()

    # start = args.start
    # end = args.end
    # compare = args.compare
    # clear = args.clear
    # entire = args.entire

    start_time = time.time()

    startNo = 100 # 범위

    #######################
    # file에 endNo 읽기
    #######################
    f = open("/home/web/dj11000/src/task_python/newAppNo.txt", "r")
    appNo = f.read()
    f.close()    

    # db 출원번호(100개)로 citing append해서 dataframe 만들기
    print(
        "{0}. {1} ".format(
            str(repeat_cnt),
            str(appNo),
        ), end="", flush="True"
    )


    dbAppNoList = get_db_appNo_list(appNo, startNo)
    lastAppNo = ""
    myDict = []
    myCitingDict = []
    for dbAppNo in dbAppNoList:
        # 피인용
        if dbAppNo:
            myDict = get_citing(dbAppNo)
            time.sleep(0.3)
            if myDict:
                myDict += myDict

            myCitingDict += [{'출원번호': str(dbAppNo), '피인용수' : len(myDict)}]

    if myDict:
        # save db
        df = pd.DataFrame(myDict, columns=item_names)           
        engine = create_engine(db_connection_url)
        df.to_sql(name='특허실용심사피인용문헌_temp', con=engine, if_exists='replace')
        # note : need CREATE EXTENSION pgcrypto; psql >=12 , when using gen_random_uuid (),
        with engine.begin() as cn:
            sql = """INSERT INTO "특허실용심사피인용문헌" (출원번호,피인용문헌번호,표준상태코드,표준상태코드명,피인용문헌구분코드,피인용문헌구분코드명)
                        SELECT t.출원번호::numeric, t.피인용문헌번호, t.표준상태코드, t.표준상태코드명, t.피인용문헌구분코드, t.피인용문헌구분코드명 
                        FROM 특허실용심사피인용문헌_temp t
                        WHERE NOT EXISTS 
                            (SELECT 1 FROM "특허실용심사피인용문헌" f
                            WHERE t.출원번호::numeric = f.출원번호::numeric)"""
            cn.execute(sql)

        # save second db
    appList = [d['출원번호'] for d in myCitingDict]
    familyList = family_cnt(appList)
    citingList = [d['피인용수'] for d in myCitingDict]
    df = pd.DataFrame({'출원번호': appList, '피인용수': citingList, '패밀리수' :familyList})
    engine = create_engine(db_connection_url)
    df.to_sql(name='특허실용심사피인용수패밀리수_temp', con=engine, if_exists='replace')         
    with engine.begin() as cn:
        sql = """INSERT INTO "특허실용심사피인용수패밀리수" (출원번호,피인용수,패밀리수)
                    SELECT t.출원번호::numeric, t.피인용수::numeric, t.패밀리수::numeric  
                    FROM 특허실용심사피인용수패밀리수_temp t
                    WHERE NOT EXISTS 
                        (SELECT 1 FROM "특허실용심사피인용수패밀리수" f
                        WHERE t.출원번호::numeric = f.출원번호::numeric)"""
        cn.execute(sql)        


    # time.sleep(1)

    lastAppNo =dbAppNo

    #######################
    # file에 endNo 저장
    #######################
    f = open("/home/web/dj11000/src/task_python/newAppNo.txt", "w")
    f.write(str(lastAppNo))
    f.close()

    # memory usage check
    memoryUse = psutil.virtual_memory()[2] 

    print(
        "~ {0} {1} {2} success --- {3} 초 ---".format(
            str(lastAppNo),
            str(memoryUse)+'%',
            time.strftime('%H:%M', time.localtime(time.time())), 
            round(time.time() - start_time,1)
        )
    )

    # if compare:
    #     msg = 'db : '
    #     # dbAppNoComma = ','.join(dbAppNoList)
    #     # dbAppNoComma = ','.join(map(str, dbAppNoList))
    #     db_count = get_db_count(dbAppNoList)
    #     print(db_count, len(myDict))
    #     if db_count > 0 :
    #         msg += str(appNo) + ': ' + f'{Fore.GREEN}' + str(db_count) + f'{Style.RESET_ALL}' + ' , '
    # print(msg)

    repeat_cnt += 1  

    threading.Timer(1, main_def(repeat_cnt)).start()
            
    print('----------------------')
    print('done')



if __name__ == "__main__":
    sys.setrecursionlimit(5000)
    main_def()
