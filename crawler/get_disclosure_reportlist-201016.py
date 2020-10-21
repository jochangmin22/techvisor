
from __future__ import print_function
import argparse 

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

import psutil
import time
import threading
import sys

import psycopg2
from psycopg2.extensions import AsIs

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

def get_list(crtfc_key, show_total = False, **kwargs):
    keys = ['corp_code','bgn_de','end_de','last_reprt_at','pblntf_ty','pblntf_detail_ty','corp_cls','sort','sort_mth','page_no','page_count']
    for key in kwargs.keys():
        if not key in keys:
            print("get_list() has no parameter \'"+key+"\'")
            return False
    # crtfc_key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&bgn_de=20200816&end_de=20201016&corp_cls=Y&page_no=1&page_count=100
    params = {**{'crtfc_key':crtfc_key},**kwargs}
    items = ['corp_cls','corp_name','corp_code','stock_code','report_nm','rcept_no','flr_nm','rcept_dt','rm']
    item_names = ['법인구분','종목명','고유번호','종목코드','보고서명','접수번호','공시제출인명','접수일자','비고']
    url = "https://opendart.fss.or.kr/api/list.json"
    res = requests.get(url,params=params)
    # print(res.text)
    json_dict = json.loads(res.text)

    if json_dict['status'] == "000":
        if show_total:
            return json_dict['total_count'], json_dict['total_page']

    data = []
    if json_dict['status'] == "000":
        for line in json_dict['list']:
            data.append([])
            for itm in items:
                if itm in line.keys():
                    data[-1].append(line[itm])
                else: data[-1].append("")
    else:
        return False
    df = pd.DataFrame(data,columns=item_names)
    return df

from datetime import timedelta, date

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

def main_def():
    """ 공시정보 - 공시검색 전체목록 크롤러 """
    now = datetime.now()
    formattedToday = now.strftime("%Y%m%d")

    parser = argparse.ArgumentParser()
    parser.add_argument('--start', type=str, default=0, help="What is the start date?")
    parser.add_argument('--end', type=str, default=formattedToday, help="What is the end date?")

    args = parser.parse_args()

    start = args.start
    end = args.end

    db_connection_url = "postgresql://{}:{}@{}:{}/{}".format(
        DATABASES['default']['USER'],
        DATABASES['default']['PASSWORD'],
        DATABASES['default']['HOST'],
        DATABASES['default']['PORT'],
        DATABASES['default']['NAME'],
    )

    # start_time = time.time()
    # crtfc_key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&bgn_de=20200816&end_de=20201016&corp_cls=Y&page_no=1&page_count=100

    data = str(start)
    start_dt = date(int(data[0:4]), int(data[4:6]), int(data[6:8]))

    data = str(end)
    end_dt = date(int(data[0:4]), int(data[4:6]), int(data[6:8]))

    for dt in daterange(start_dt, end_dt):
        my_date = dt.strftime("%Y%m%d")        

        # 총 건수
        try: # 없는 날짜 통과
            total_count, total_page = get_list(DART['api_key'], show_total=True, bgn_de=my_date, end_de=my_date, page_no='1', page_count = '100')
            print('날짜 :', str(my_date), '총 공시수 :', str(total_count), '총 page수 :', str(total_page))

            for i in range(1, total_page + 1):
                df = get_list(DART['api_key'], show_total= False, bgn_de=my_date, end_de=my_date, page_no=i, page_count = '100')

                engine = create_engine(db_connection_url)

                # df.to_sql('disclosure_report', engine, if_exists='replace', index=False, chunksize=10000)
                df.to_sql('disclosure_report', engine, if_exists='append', index=False, chunksize=10000)
                time.sleep(1)
        except:
            print('날짜 :', str(my_date), '자료없음')
            pass

        # time.sleep(1)

    print('----------------------')
    print('done')    

if __name__ == "__main__":
    ''' 실행하려면 argv n개가 필요합니다. : bgn_de, end_de '''
    # request = int(sys.argv[1])
    # argv ex) 0 2380 True
    # page_no = int(sys.argv[1])
    # bgn_de = sys.argv[1]
    # end_de = sys.argv[2]
    # sys.setrecursionlimit(5000)
    main_def()    
    # main_def()    