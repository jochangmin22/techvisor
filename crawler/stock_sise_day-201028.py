from __future__ import print_function
import argparse 

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import pandas as pd
import time
import urllib.request
from selenium.webdriver import Chrome
from selenium import webdriver
import json
import re     
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
import datetime as dt

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

import psutil
import time
import threading
import sys

import psycopg2

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
        host="localhost", database="ipgrim", user="ipgrim", password="btw*0302", port="5433"
    )
    return connection    

def get_kind_stock_code():
    ''' kind 상장법인목록 crawling '''
    stock_code = pd.read_html('http://kind.krx.co.kr/corpgeneral/corpList.do?method=download&orderMode=5&orderStat=A&searchType=13', header=0)[0] 
    
    # stock_code.sort_values(['상장일'], ascending=True)

    # 종목코드 6자리로 
    stock_code.종목코드 = stock_code.종목코드.map('{:06d}'.format) 
    
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
                # cursor.execute("UPDATE listed_corp SET 정보 = %s WHERE 종목코드 = %s", (info, stockCode))

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
    * dataframe 스타일로 rebuild
    page 1 부터 crawling -> if exist at db ? 
              yes -> return
              no -> stock_quotes.objects.create(**newStock)
    '''
    # if request.method == 'POST':
    #     data = json.loads(request.body.decode('utf-8'))
    #     stockCode = data["stockCode"]

        # exist ? {

        # try:
        #     stockQuotes = stock_quotes.objects.filter(stock_code=stockCode).latest('price_date')
        #     maxRecordDate = stockQuotes.price_date if stockQuotes else None
        # except:
        #     maxRecordDate = None

    maxRecordDate = getMaxValue(stockCode, 'price_date')
    # exist ? }

    # get last page num
    stock_sese_day_url = 'http://finance.naver.com/item/sise_day.nhn?code='
    url = stock_sese_day_url + stockCode
    html = urlopen(url) 
    source = BeautifulSoup(html.read(), "html.parser")
    
    maxPage=source.find_all("table",align="center")
    mp = maxPage[0].find_all("td",class_="pgRR")
    if mp:
        mpNum = int(mp[0].a.get('href').split('page=')[1])
    else:
        mpNum = 1    
    

    isCrawlBreak = None                                                    
    for page in range(1, mpNum+1):
        if isCrawlBreak:
            break
        # print (str(page) )

        df = pd.read_html(stock_sese_day_url + stockCode +'&page='+ str(page), match = '날짜', header=0, encoding = 'euc-kr')[0]

        # remove null row
        df = df.iloc[1:]

        # remove column not in used
        del df['전일비']

        # convert values to numeric or date
        df[['종가','시가', '고가', '저가','거래량']] = df[['종가','시가', '고가', '저가','거래량']].fillna("0").astype(int)
        df[['날짜']] = df[['날짜']].astype('datetime64[ns]')

        #remove all NaT values
        df = df[df.날짜.notnull()]

        maxDate = df.iloc[0]['날짜'] # first
        minDate = df.iloc[-1]['날짜'] # last

        maxRecordDate = datetime.combine(maxRecordDate, datetime.min.time()) if maxRecordDate else None

        if maxRecordDate and maxRecordDate.date() > maxDate.date(): 
            isCrawlBreak = True 
        else:


            # delete date column not included in tolist
            datelist = df['날짜'].tolist() 
            del df['날짜']

            # Change the order of df columns according to the recordset 종,시,고,저,거래량 => 시,종,저,고,거래량
            columnsTitles = ['시가','종가','저가','고가','거래량']
            df = df.reindex(columns=columnsTitles)

            for (index, price_date) in enumerate(datelist):
                # newStock = {
                #     'stock_code': stockCode,
                #     'price_date': price_date,
                #     'stock': df[index].tolist(),
                #     'volume' : df[index]['거래량']
                # }
                stock = df.iloc[index].tolist()

                volume = df.iloc[index]['거래량']

                if maxRecordDate and maxRecordDate.date() > minDate.date():
                    # print ("current page content is in db partially")
                    if maxRecordDate and maxRecordDate.date() == price_date.date():
                        # print("match today")
                        updateTable(no, stockCode, price_date, stock, volume) 
                    elif maxRecordDate and maxRecordDate.date() < price_date.date():
                        # print("db date is lower then price_date")    
                        insertTable(no, stockCode, price_date, stock, volume)
                else:
                    # print("db date is older then the page")
                    insertTable(no, stockCode, price_date, stock, volume)

        # True after waiting the today's stock was updated; skip next page crawl
        if maxRecordDate and maxRecordDate.date() == maxDate.date():
            isCrawlBreak = True                   
    return

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
    """ 메인 def """
    parser = argparse.ArgumentParser()
    parser.add_argument('--start', type=int, default=0, help="What is the start number?")
    parser.add_argument('--end', type=int, default=0, help="What is the end number?")
    parser.add_argument('--clear', type=str2bool, nargs='?', const=True, default=False, help='Should I truncate the Table before execution?')
    parser.add_argument('--entire', type=str2bool, nargs='?', const=True, default=False, help='Do you want to crawl the entire company regardless of start, end number')          

                       
    args = parser.parse_args()

    start = args.start
    end = args.end
    clear = args.clear
    entire = args.entire

    # start_time = time.time()

    kindInfo = get_kind_stock_code()


          
    # threading.Timer(1, main_def(repeat_cnt)).start()

    if entire:
        rangeValue = range(len(kindInfo))
    else:
        rangeValue = range(start, end)

    print('총 상장법인수 :', len(kindInfo))
    print('실행건       :', len(rangeValue))        
    print('실행소요예상 :', int(int(len(rangeValue)) * 1 / 60), '분')        

    if clear:
        backupAndEmptyTable()
    # for i in range(len(kindInfo)):
    # for i in range(0,50):
    for i in rangeValue:
        start_time = time.time()

        stockCode = kindInfo.종목코드.values[i].strip()
    #     print(stockCode)
        crawl_stock(i, stockCode)

        # memory usage check
        memoryUse = psutil.virtual_memory()[2] 

        print(
            "{0}. {1} {2} {3} success --- {4} 초 ---".format(
                str(i),
                str(stockCode),
                time.strftime('%H:%M', time.localtime(time.time())), 
                str(memoryUse)+'%',
                round(time.time() - start_time,1)
            )
        )            
            
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