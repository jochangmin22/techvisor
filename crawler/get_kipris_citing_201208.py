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

# def connect():
#     connection = psycopg2.connect(
#         host="localhost", database="ipgrim", user="ipgrim", password="btw*0302", port="5433"
#     )
#     return connection    

def connect():
    connection = psycopg2.connect(
        host="localhost", database="dj11000", user="postgres", password="btw160302*", port="5432"
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
                # rawdata = dictfetchall(cursor)
                rawdata = cursor.fetchall()
                return rawdata

    except (Exception, psycopg2.Error) as error :
        if(connection):
            print("Failed", error)

    finally:
        if(connection):
            cursor.close()
            connection.close()
    return                     


def get_db_count(appNoList, table = '특허실용심사피인용문헌1'):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:      
                query ="select count(출원번호) cnt from " + table + " where 출원번호 IN (" + str(appNoList) +");"  
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
    print(url)
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
    data = soup.find_all('citingInfo')
    print(data)
    rawdata = []
    if data:
        for d in data:
            if d:
                res = {}
                for (idx, key) in enumerate(items):
                    res[item_names[idx]] = d.find(key).get_text()

                rawdata.append(res)

        df = pd.DataFrame(rawdata) 
        return df
    else:
        return pd.DataFrame([]) 

def main_def(repeat_cnt = 0):
    """ 메인 def """
    parser = argparse.ArgumentParser()
    # parser.add_argument('--start', type=int, default=0, help="What is the start number?")
    # parser.add_argument('--end', type=int, default=0, help="What is the end number?")
    parser.add_argument('--compare', type=str2bool, nargs='?', const=True, default=True, help='Do you check db and total number after crawling?')

    # parser.add_argument('--clear', type=str2bool, nargs='?', const=True, default=False, help='Should I truncate the Table before execution?')
    # parser.add_argument('--entire', type=str2bool, nargs='?', const=True, default=False, help='Do you want to crawl the entire company regardless of start, end number')          

                       
    args = parser.parse_args()

    # start = args.start
    # end = args.end
    compare = args.compare
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
    rawdata = get_db_appNo_list(appNo, startNo)
    main_df = pd.DataFrame([], columns=item_names)
    lastAppNo = ""

    for row in rawdata:
        # 피인용
        if row[0]:
            df = get_citing(row[0])
            print(df)
            if not df.empty:
                main_df.append(df)
            else:
                print('error')
                # print(f'{Fore.BLUE}' + str(dt) + f'{Style.RESET_ALL}', page, f'{Fore.RED}error{Style.RESET_ALL}')
                # record_log(
                #     "{0}. {1} / {2} - total: {3} --- {4}".format(
                #     str(dt),
                #     str(page),
                #     str(totalPage+1), 
                #     str(api_count),
                #     time.strftime('%H:%M', time.localtime(time.time())), 
                #     )
                # )                    
            time.sleep(1)
    # save db            
    engine = create_engine(db_connection_url)
    df.to_sql(name='특허실용심사피인용문헌1_temp', con=engine, if_exists='replace')
    # note : need CREATE EXTENSION pgcrypto; psql >=12 , when using gen_random_uuid (),
    with engine.begin() as cn:
        sql = """INSERT INTO "특허실용심사피인용문헌1" (출원번호,피인용문헌번호,표준상태코드,표준상태코드명,피인용문헌구분코드,피인용문헌구분코드명)
                    SELECT t.출원번호, t.피인용문헌번호, t.표준상태코드, t.표준상태코드명, t.피인용문헌구분코드, t.피인용문헌구분코드명 
                    FROM 특허실용심사피인용문헌1_temp t
                    WHERE NOT EXISTS 
                        (SELECT 1 FROM "특허실용심사피인용문헌1" f
                        WHERE t.출원번호 = f.출원번호)"""
        cn.execute(sql)


    # # 피인용수, 패밀리수
    # citingCnt = len(info) if info else 0
    # family = family_cnt(row[0])
    # # if existCheck2(row[0]) != 0:
    #     # updateTable2(row[0], citingCnt, family)
    # # else:
    # insertTable2(row[0], citingCnt, family)            
            
    time.sleep(3)

    lastAppNo = row[0] 

    #######################
    # file에 endNo 저장
    #######################
    f = open("/home/web/dj11000/src/task_python/newAppNo.txt", "w")
    f.write(str(lastAppNo))
    f.close()

    # memory usage check
    memoryUse = psutil.virtual_memory()[2] 

    print(
        "{0}. {1} {2} {3} success --- {4} 초 ---".format(
            str(repeat_cnt),
            time.strftime('%H:%M', time.localtime(time.time())), 
            str(memoryUse)+'%',
            str(lastAppNo),
            round(time.time() - start_time,1)
        )
    )

    if compare:
        msg = 'db : '
        appNoList = ''
        for row in rawdata:
            if row[0]:
                appNoList += row[0] + ","

        if appNoList.endswith(","):
            appNoList = appNoList[:-1]                

        db_count = get_db_count(appNoList)
        if db_count > 0 :
            msg += str(appNo) + ': ' + f'{Fore.GREEN}' + str(db_count) + f'{Style.RESET_ALL}' + ' , '
    print(msg)

    repeat_cnt += 1  

    threading.Timer(1, main_def(repeat_cnt)).start()
            
    print('----------------------')
    print('done')



if __name__ == "__main__":
    sys.setrecursionlimit(5000)
    main_def()
