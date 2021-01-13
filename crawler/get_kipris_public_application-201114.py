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
        "NAME": "techvisor",
        "DATABASE": "techvisor",
        "USER": "postgres",
        "PASSWORD": "btw*0302",
        "HOST": "localhost",
        "PORT": "5433"
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
        host="localhost", database="techvisor", user="postgres", password="btw*0302", port="5433"
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
    f = open("/home/btowin/downloads/public_crawl_log.txt", "a")
    f.write(str(msg)+'\n')
    f.close()
    return        

# 전체검색 - 먼저 공개일자로 검색해야해서.
count_url = "http://plus.kipris.or.kr/kipo-api/kipi/patUtiModInfoSearchSevice/getAdvancedSearch"
# numOfRows 최대 99까지

# 서지
biblo_url = "http://plus.kipris.or.kr/kipo-api/kipi/patUtiModInfoSearchSevice/getBibliographyDetailInfoSearch"
service_key = "aPmTnAjtr4j82WWmpgi=DrmRSiJXXaxHZs1W34pssBQ="
# operationKey = 'getAdvancedSearch'    

def get_db_date_count(date, table = '공개공보'):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:      
                query ="select count(출원번호) cnt from " + table + " where 공개일자::int = " + str(date) + ";"  
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


def get_api_date_count(date):
    # url = count_url + '?applicationDate=' + str(date) + '~' + str(date) + '&patent=true&utility=true&numOfRows=1&ServiceKey=' + service_key
    url = count_url + '?openDate=' + str(date) + '~' + str(date) + '&patent=true&utility=true&pageNo=1&numOfRows=1&ServiceKey=' + service_key
    try:    
        html = requests.get(url)
    except requests.exceptions.RequestException as e:
        raise SystemExit(e)

    soup = BeautifulSoup(html.content, 'xml')
    totalCount = soup.find('totalCount').get_text()
    return totalCount

def get_public_application(date, page):
    
    items = ['applicationNumber','applicationDate','openNumber','openDate','registerDate','registerNumber','publicationDate','publicationNumber','inventionTitle','registerStatus', 'applicantInfoArray', 'ipcInfoArray']
    item_names = ['출원번호','출원일자','공개번호','공개일자','등록번호','등록일자','공고번호','공고일자','발명의명칭국문','등록사항', '출원인1', 'ipc코드']
    
    url = count_url + '?openDate=' + str(date) + '~' + str(date) + '&patent=true&utility=true&numOfRows=99&pageNo=' + str(page) + '&ServiceKey=' + service_key
    try:
        html = requests.get(url)
    except requests.exceptions.RequestException as e:
        raise SystemExit(e)
        
    soup = BeautifulSoup(html.content, 'xml')        
    data = soup.find_all('item')
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

def main_def():
    """ 메인 def """
    parser = argparse.ArgumentParser()
    parser.add_argument('--start', type=int, default=0, help="What is the start number?")
    parser.add_argument('--end', type=int, default=0, help="What is the end number?")
    parser.add_argument('--compare', type=str2bool, nargs='?', const=True, default=False, help='Do you check db and total number after crawling?')

    # parser.add_argument('--clear', type=str2bool, nargs='?', const=True, default=False, help='Should I truncate the Table before execution?')
    # parser.add_argument('--entire', type=str2bool, nargs='?', const=True, default=False, help='Do you want to crawl the entire company regardless of start, end number')          

                       
    args = parser.parse_args()

    start = args.start
    end = args.end
    compare = args.compare
    # clear = args.clear
    # entire = args.entire


    data = str(start)
    start_dt = date(int(data[0:4]), int(data[4:6]), int(data[6:8]))

    data = str(end)
    end_dt = date(int(data[0:4]), int(data[4:6]), int(data[6:8]))

    for dt in daterange(start_dt, end_dt):
        start_time = time.time()
        my_date = dt.strftime("%Y%m%d")  
        db_count = get_db_date_count(my_date)
        api_count = get_api_date_count(my_date)
        text = 'db : ' + str(db_count) + ' api : ' + str(api_count)
        if int(db_count) >= int(api_count): # db의 출원일자 cnt와 api의 출원일자 cnt가 같으면 pass
            print(f'{Fore.YELLOW}',str(my_date),".", text, f'{Style.RESET_ALL}')
            continue
        # 2019-08-13
        # count 228 / 20
        totalPage = int(int(api_count) / 99)

        print(dt, '1 ~', totalPage+1, '- total:', f'{Fore.GREEN}' + api_count + f'{Style.RESET_ALL}')
        for page in range(1, totalPage+1+1):
            df = get_public_application(my_date, page)
            if not df.empty:
                engine = create_engine(db_connection_url)
                df.to_sql(name='공개공보1_temp', con=engine, if_exists='replace')
                # note : need CREATE EXTENSION pgcrypto; psql >=12 , when using gen_random_uuid (),
                with engine.begin() as cn:
                    sql = """INSERT INTO "공개공보1" (출원번호,출원일자,공개번호,공개일자,등록번호,등록일자,공고번호,공고일자,"발명의명칭(국문)",등록사항, 출원인1, ipc코드)
                                SELECT t.출원번호, t.출원일자, t.공개번호, t.공개일자, t.등록번호, t.등록일자, t.공고번호, t.공고일자, t.발명의명칭국문, t.등록사항 t.출원인1, t.ipc코드
                                FROM 공개공보1_temp t
                                WHERE NOT EXISTS 
                                    (SELECT 1 FROM "공개공보1" f
                                    WHERE t.출원번호 = f.출원번호)"""
                    cn.execute(sql)                 
            else:
                print(f'{Fore.BLUE}' + str(dt) + f'{Style.RESET_ALL}', page, f'{Fore.RED}error{Style.RESET_ALL}')
                record_log(
                    "{0}. {1} / {2} - total: {3} --- {4}".format(
                    str(dt),
                    str(page),
                    str(totalPage+1), 
                    str(api_count),
                    time.strftime('%H:%M', time.localtime(time.time())), 
                    )
                )
            time.sleep(1)
            
        time.sleep(3)
        # memory usage check
        memoryUse = psutil.virtual_memory()[2] 

        print(
            "{0}. {1} {2} {3} success --- {4} 초 ---".format(
                str(my_date),
                str(text),
                time.strftime('%H:%M', time.localtime(time.time())), 
                str(memoryUse)+'%',
                round(time.time() - start_time,1)
            )
        )            
            
    print('----------------------')
    print('done')

    if compare:
        msg = 'db : '
        for dt in daterange(start_dt, end_dt):
            my_date = dt.strftime("%Y%m%d")  
            db_count = get_db_date_count(my_date, table="공개공보1")
            if db_count > 0 :
                msg += str(my_date) + ': ' + f'{Fore.GREEN}' + str(db_count) + f'{Style.RESET_ALL}' + ' , '
    print(msg)

if __name__ == "__main__":
    sys.setrecursionlimit(5000)
    main_def()
