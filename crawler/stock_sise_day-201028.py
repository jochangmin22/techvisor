from __future__ import print_function
import argparse 
import requests
import pandas as pd
import time
import urllib.request
import json
import re     
import datetime as dt
import psutil
import time
import threading
import sys
import psycopg2
import os

from datetime import datetime
from bs4 import BeautifulSoup
from selenium.webdriver import Chrome
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'techvisor.settings')

import django
django.setup()

from django import db
from django.conf import settings

# astype(int) error handle
import numpy
from psycopg2.extensions import register_adapter, AsIs
def addapt_numpy_float64(numpy_float64):
    return AsIs(numpy_float64)
def addapt_numpy_int64(numpy_int64):
    return AsIs(numpy_int64)
register_adapter(numpy.float64, addapt_numpy_float64)
register_adapter(numpy.int64, addapt_numpy_int64)


from datetime import datetime




dt = datetime.utcnow()

options = webdriver.ChromeOptions()

options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.headless = True
browser = webdriver.Chrome(executable_path="/usr/bin/chromedriver",options=options)


def str2int(value):
    try:
        value = int(value)
        return value
    except ValueError:
        pass
    
    try:
        res = int(value.replace(",",""))
    except:
        res = 0
    return res

def str2round(value, num=1):
    try:
        value = float(value)
        return round(value, num)
    except ValueError:
        pass
    
    try:
        res = round(float(value.replace(",","")),num)
    except:
        res = 0
    return res

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

def connect():
    connection = psycopg2.connect(
        # host="btowin.synology.me", database="techvisor", user="postgres", password="btw*0302", port="5433"
        host="192.168.0.40", database="techvisor", user="postgres", password="btw*0302", port="5433"
    )
    return connection    

def get_kind_stock_code():
    ''' kind ?????????????????? crawling '''
    stock_code = pd.read_html('http://kind.krx.co.kr/corpgeneral/corpList.do?method=download&orderMode=5&orderStat=A&searchType=13', header=0)[0] 
    
    # stock_code.sort_values(['?????????'], ascending=True)

    # ???????????? 6????????? 
    stock_code.???????????? = stock_code.????????????.map('{:06d}'.format)
    
    return stock_code  

def backupAndEmptyTable():
    try:
        with connect() as connection:
            with connection.cursor() as cursor:      
                query =" DROP TABLE IF EXISTS stock_quotes_back; create table stock_quotes_back as (select * from stock_quotes); TRUNCATE stock_quotes;"  
                cursor.execute(query)
                connection.commit()
    except (Exception, psycopg2.Error) as error :
        if(connection):
            print("Failed to backup and empty stock_quotes table", error)

    finally:
        if(connection):
            cursor.close()
            connection.close()

# from company.models import *

def insertTable(no, stockCode, price_date, stock, volume):
    # table = 'listed_corp'
    stock = json.dumps(stock)    
    try:
        with connect() as connection:
            with connection.cursor() as cursor:      
                postgres_insert_query = """ INSERT INTO stock_quotes ( stock_code, price_date, stock, volume) VALUES ( %s, %s, %s, %s)"""
                record_to_insert = (stockCode, price_date, stock, volume)
                cursor.execute(postgres_insert_query, record_to_insert)
                
                connection.commit()
                # count = cursor.rowcount
                # print (count, "Record inserted successfully into mobile table")
                # print (no, stockCode, "Record inserted successfully" )

    except (Exception, psycopg2.Error) as error :
        if(connection):
            print(no, "Failed to insert record into mobile table", error)

    finally:
        #closing database connection.
        if(connection):
            cursor.close()
            connection.close()
            # print("PostgreSQL connection is closed")


def updateTable(no, stockCode, price_date, stock, volume):
    stock = json.dumps(stock)         
    try:
        with connect() as connection:
            with connection.cursor() as cursor:         
                sql_template = "UPDATE stock_quotes SET stock = '%s', volume = %s WHERE stock_code = '%s' and price_date = '%s' " % (stock, volume, stockCode, price_date)
                cursor.execute(sql_template)   
                connection.commit()
                # cursor.execute("UPDATE listed_corp SET ?????? = %s WHERE ???????????? = %s", (info, stockCode))

                # print (no, stockCode, "Record updated successfully" )
        
    except (Exception, psycopg2.Error) as error:
        print(no, "Error in update operation", error)

    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()
            # print("PostgreSQL connection is closed") 

def getMaxValue(stockCode, targetColumn):
    try:
        with connect() as connection:
            with connection.cursor() as cursor: 
                sql = "SELECT MAX( %s ) a FROM stock_quotes WHERE stock_code = '%s'" % (targetColumn, stockCode)
                cursor.execute(sql)
                
                row = dictfetchall(cursor)
                
                return row[0]['a']
        
    except (Exception, psycopg2.Error) as error:
        return None

    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()

from urllib.request import urlopen
import uuid

def crawl_stock(no, stockCode):
    ''' 
    * dataframe ???????????? rebuild
    page 1 ?????? crawling -> if exist at db ? 
              yes -> return
              no -> stock_quotes.objects.create(**newStock)
    '''
    # if request.method == 'POST':
    #     data = json.loads(request.body.decode('utf-8'))
    #     stockCode = data["stockCode"]

        # exist ? {

        # try:
        #     stockQuotes = Stock_quotes.objects.filter(stock_code=stockCode).latest('price_date')
        #     maxRecordDate = stockQuotes.price_date if stockQuotes else None
        # except:
        #     maxRecordDate = None

    maxRecordDate = getMaxValue(stockCode, 'price_date')
    # exist ? }

    # get last page num
    stock_sese_day_url = 'https://finance.naver.com/item/sise_day.nhn?code='
    
    url = stock_sese_day_url + stockCode
    html = requests.get(url, headers={'User-agent' : 'Mozilla/5.0'}).text
    source = BeautifulSoup(html, "lxml")    
    
    maxPage=source.select('td.pgRR a')

    if maxPage:
        mpNum = int(maxPage[0]['href'].split('=')[-1])
    else:
        mpNum = 1    
    df = pd.DataFrame()

    isCrawlBreak = None
    try:                                               
        for page in range(1, mpNum+1):
            if isCrawlBreak:
                break
            
            pg_url = '{}&page={}'.format(url,page)

            df = df.append(pd.read_html(requests.get(pg_url,headers={'User-agent' : 'Mozilla/5.0'}).text)[0])

            # remove column not in used
            del df['?????????']

            # convert values to numeric or date
            df[['??????','??????', '??????', '??????','?????????']] = df[['??????','??????', '??????', '??????','?????????']].fillna("0").astype(int)
            df[['??????']] = df[['??????']].astype('datetime64[ns]')

            #remove all NaT values
            df = df[df.??????.notnull()]
            
            maxDate = df.iloc[0]['??????'] # first
            minDate = df.iloc[-1]['??????'] # last

            maxRecordDate = datetime.combine(maxRecordDate, datetime.min.time()) if maxRecordDate else None
            
            if maxRecordDate and maxRecordDate.date() > maxDate.date(): 
                isCrawlBreak = True 
            else:


                # delete date column not included in tolist
                datelist = df['??????'].tolist()
                del df['??????']

                # Change the order of df columns according to the recordset ???,???,???,???,????????? => ???,???,???,???,?????????
                columnsTitles = ['??????','??????','??????','??????','?????????']
                
                df = df.reindex(columns=columnsTitles)

                for (index, price_date) in enumerate(datelist):
                    # newStock = {
                    #     'stock_code': stockCode,
                    #     'price_date': price_date,
                    #     'stock': df[index].tolist(),
                    #     'volume' : df[index]['?????????']
                    # }
                    stock = df.iloc[index].tolist()

                    volume = df.iloc[index]['?????????']

                    if maxRecordDate and maxRecordDate.date() > minDate.date():
                        # print ("current page content is in db partially")
                        if maxRecordDate and maxRecordDate.date() == price_date.date():
                            # print("match today")
                            updateTable(no, stockCode, price_date, stock, volume) 
                        elif maxRecordDate and maxRecordDate.date() < price_date.date():
                            # print("db date is lower then price_date")    
                            insertTable(no, stockCode, price_date, stock, volume)
                    else:
                        print("db date is older then the page")
                        insertTable(no, stockCode, price_date, stock, volume)

            # True after waiting the today's stock was updated; skip next page crawl
            if maxRecordDate and maxRecordDate.date() == maxDate.date():
                isCrawlBreak = True                   
        return
    except IndexError:
        pass

def str2bool(v):
    if isinstance(v, bool):
       return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')



# def main_def(start = 0, end = 0, tableclearnow = False):
def main_def():
    """ ?????? def """
    parser = argparse.ArgumentParser()
    parser.add_argument('--start', type=int, default=0, help="What is the start number?")
    parser.add_argument('--end', type=int, default=0, help="What is the end number?")
    parser.add_argument('--clear', type=str2bool, nargs='?', const=True, default=False, help='Should I truncate the Table before execution?')
    parser.add_argument('--entire', type=str2bool, nargs='?', const=True, default=False, help='Do you want to crawl the entire company regardless of start, end number')          
    parser.add_argument('--acode', type=str, nargs='?', const=True, default=None, help='What is the stockcode of company do you want Update?') 



                       
    args = parser.parse_args()

    start = args.start
    end = args.end
    clear = args.clear
    entire = args.entire
    acode = args.acode

    # start_time = time.time()
    if not acode:
        kindInfo = get_kind_stock_code()
            
        # threading.Timer(1, main_def(repeat_cnt)).start()

        if entire:
            share_dict = settings.SHARE_LIST
            share_list = list(share_dict.keys())
            stockCode_list = []
            for i in range(len(kindInfo)):
                stockCode_list.append(kindInfo.????????????.values[i].strip())
            stockCode_list = share_list + stockCode_list

            rangeValue = range(len(stockCode_list))
        else:
            rangeValue = range(start, end)

        print('??? ??????????????? :', len(kindInfo))
        print('?????????       :', len(rangeValue))        
        print('?????????????????? :', int(int(len(rangeValue)) * 1 / 60), '???')        

        if clear:
            backupAndEmptyTable()
        # for i in range(len(kindInfo)):
        # for i in range(0,50):


        for i in rangeValue:
            start_time = time.time()
            # stockCode = kindInfo.????????????.values[i].strip()
            
            stockCode = stockCode_list[i]

            crawl_stock(i, stockCode)

            # memory usage check
            memoryUse = psutil.virtual_memory()[2] 

            print(
                "{0}. {1} {2} {3} success --- {4} ??? ---".format(
                    str(i),
                    str(stockCode),
                    time.strftime('%H:%M', time.localtime(time.time())), 
                    str(memoryUse)+'%',
                    round(time.time() - start_time,1)
                )
            )            
                
        print('----------------------')
        print('done')
    else:
        stockCode = acode
        print('?????????       :', stockCode)   
        crawl_stock(0, stockCode)

        # memory usage check
        memoryUse = psutil.virtual_memory()[2] 

        # print(
        #     "{0}. {1} {2} {3} success --- {4} ??? ---".format(
        #         str(i),
        #         str(stockCode),
        #         time.strftime('%H:%M', time.localtime(time.time())), 
        #         str(memoryUse)+'%',
        #         round(time.time() - start_time,1)
        #     )
        # )            
                
        print('----------------------')
        print('done')

if __name__ == "__main__":
    # request = int(sys.argv[1])
    # argv ex) 0 2380 True
    # start = int(sys.argv[1])
    # end = int(sys.argv[2])
    # tableclearnow = sys.argv[3]
    sys.setrecursionlimit(5000)
    main_def()    