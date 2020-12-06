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
from psycopg2.extensions import AsIs
from datetime import datetime


dt = datetime.utcnow()

options = webdriver.ChromeOptions()
options.add_argument("--headless")
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument("--remote-debugging-port=9222")
options.headless = True
browser = webdriver.Chrome(executable_path="/usr/bin/chromedriver",options=options)

pd.set_option('display.float_format', '{:,.2f}'.format)

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

def str2round(value, num=2):
    try:
        value = float(value)
        if math.isnan(value):
            return 0 
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
    # stock_code = pd.read_html('http://dev-kind.krx.co.kr/corpgeneral/corpList.do?method=download&orderMode=5&orderStat=A&searchType=13', header=0)[0] 
    stock_code = pd.read_html('http://kind.krx.co.kr/corpgeneral/corpList.do?method=download&orderMode=5&orderStat=A&searchType=13', header=0)[0] 
    
    # stock_code.sort_values(['상장일'], ascending=True)

    # 종목코드 6자리로 
    stock_code.종목코드 = stock_code.종목코드.map('{:06d}'.format) 
    
    return stock_code   

def backupAndEmptyTable():
    try:
        with connect() as connection:
            with connection.cursor() as cursor:      
                query =" DROP TABLE IF EXISTS listed_corp_back; create table listed_corp_back as (select * from listed_corp); TRUNCATE listed_corp;"  
                cursor.execute(query)
                connection.commit()
    except (Exception, psycopg2.Error) as error :
        if(connection):
            print("Failed to backup and empty listed_corp table", error)

    finally:
        if(connection):
            cursor.close()
            connection.close()

def insertTable(no, kiscode, info, financial_res, name, upjong, product, listed_date, settlemonth, representive, homepage, area):
    # table = 'listed_corp'    
    info = json.dumps(info)
    financial_res = json.dumps(financial_res)
    try:
        with connect() as connection:
            with connection.cursor() as cursor:      
        
                postgres_insert_query = """ INSERT INTO listed_corp (회사명, 종목코드, 업종, 주요제품, 상장일, 결산월, 대표자명, 홈페이지, 지역, 정보, 재무) VALUES ( %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                record_to_insert = (name, kiscode, upjong, product, listed_date, settlemonth, representive, homepage, area, info, financial_res)
                cursor.execute(postgres_insert_query, record_to_insert)
                
                connection.commit()
                # count = cursor.rowcount
                # print (count, "Record inserted successfully into mobile table")
                # print (no, kiscode, "Record inserted successfully" )

    except (Exception, psycopg2.Error) as error :
        if(connection):
            print(no, "Failed to insert record into mobile table", error)

    finally:
        #closing database connection.
        if(connection):
            cursor.close()
            connection.close()
            # print("PostgreSQL connection is closed")

def updateTable(no, kiscode, info, financial_res):
    info = json.dumps(info)
    financial_res = json.dumps(financial_res)    
    try:
        with connect() as connection:
            with connection.cursor() as cursor:         
                sql_template = "UPDATE listed_corp SET 정보 = $$%s$$, 재무 = $$%s$$ WHERE 종목코드 = $$%s$$ " % (info, financial_res, kiscode)
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
#wrapper > div.fund.fl_le > table > tbody > tr:nth-child(5) > td.num.noline-right
#wrapper > div.fund.fl_le > table > tbody > tr:nth-child(1) > td.num.noline-right

empty_dict = {
    '갭1': 0,
    '갭2': 0,
    '갭3': 0,
    '갭4': 0,
    '갭5': 0,
    '거래량': 0,
    '기대수익률': 0,
    '기업가치(백만)': 0,
    '당기순이익': 0,
    '매출액': 0,
    '발행주식수(보통주)': 0,
    '부채비율(%)': 0,
    '부채총계': 0,
    '상장일': '',    
    '수익률':0,
    '당기순이익(Y/Y)': 0,
    '시가총액(억)':0,
    '업종PER(배)': 0,
    '영업이익': 0,
    '영업이익(Y/Y)': 0,
    '자본총계': 0,
    '자본총계(지배)': 0,
    '자산총계': 0,
    '적(1)PER*EPS': 0,
    '적(2)ROE*EPS': 0,
    '적(3)EPS*10': 0,
    '적(4)s-rim': 0,
    '적(5)당기순이익*PER': 0,
    '적정가평균': 0,
    '종업원수': 0,
    '추천매수가': 0,
    '현금DPS': 0,
    '현금배당수익률': 0,
    '전일종가': 0,    
    'BPS(원)': 0,    
    'EPS(원)': 0,
    'NCAV(억)': 0,
    'NCAV(%)': 0,
    'PBR(배)': 0,
    'PEGR(배)': 0,
    'PER(배)': 0,
    'PER갭(%)': 0,
    'ROA(%)': 0,
    'ROE(%)': 0,
}

empty_financial_info = {
	"date": ["2017/12", "2018/12", "2019/12", "2020/12", "2019/12", "2020/03", "2020/06", "2020/09"],
	"dataset": [
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0]
	]
}

def sectorPer(df):
    ''' df[0] : '업종PER' '''
    mylist = df.iloc[0].values[0].replace('  ', ' ').split(' ')
    for (idx, val) in enumerate(mylist):
        if val == '업종PER':
            return {'업종PER(배)' : str2round(mylist[idx + 1]) }

    return {'업종PER(배)' : 0}

import math
def fundamental(df):
    ''' df[5] :  'PER', 'PBR', 'EPS', 'BPS', '현금DPS', '현금배당수익률' '''
    r = {}

    # C 컬럼이 안읽힐경우 C 포기
    df.columns = ['A','B','C'][:len(df.columns)]

    # 가장 최근으로 선택
    for name in ['PER', 'PBR', 'EPS', 'BPS', '현금DPS', '현금배당수익률']:
        bVal = df.loc[df['A'] == name, 'B']
        try:
            cVal = df.loc[df['A'] == name, 'C']
        except:
            pass
        try:            
            r[name] = bVal if cVal.isnull().values.any() else cVal
        except:
            r[name] = bVal


    for name in ['PER','PBR']:
        r[name] = r[name].fillna(0).astype(float).to_list()[0]

    for name in ['EPS','BPS','현금DPS']:
        try: 
            r[name] = r[name].str.replace('원','').str.replace(',', '').fillna(0).astype(int).to_list()[0]
        except: # 원 없고 null
            r[name] = 0
    try:
        r['현금배당수익률'] = r['현금배당수익률'].str.replace('%', '').fillna(0).astype(float).to_list()[0]
    except:
        r['현금배당수익률'] = 0 # 숫자없고 %만 있는 경우

    return r

# def qPrice(df):
#     ''' df[6] : 전분기 대비 : '영업이익증감(전전)','영업이익증감(직전)','순이익증감(전전)','순이익증감(직전)' '''
#     df.columns = df.iloc[0]
#     df = df.reindex(df.index.drop(0)).reset_index(drop=True)
#     df.columns.name = None 
#     jcols = list(df.columns)

#     jjbun = df[jcols[2]].fillna(0).to_list() # 3번째 cols
#     jbun = df[jcols[3]].fillna(0).to_list() # 4번째 cols
  
#     return {'영업이익증감(전전)' : str2round(jjbun[4]),'영업이익증감(직전)' : str2round(jbun[4]),'순이익증감(전전)' : str2round(jjbun[9]),'순이익증감(직전)' : str2round(jbun[9])}

def qPrice(df):
    ''' FIXME : df[6] : '영업이익' -> '전년동기대비', '당기순이익' -> '전년동기대비' : '영업이익(y/y)' , '당기순이익(y/y) '''
    df.columns = df.iloc[0]
    df = df.reindex(df.index.drop(0)).reset_index(drop=True)
    df.columns.name = None 
    jcols = list(df.columns)

    # jjbun = df[jcols[2]].fillna(0).to_list() # 3번째 cols
    # 최근분기만 사용
    jbun = df[jcols[3]].fillna(0).to_list() # 4번째 cols
  
    return {'영업이익(Y/Y)' : str2round(jbun[3]),'당기순이익(Y/Y)' : str2round(jbun[8])}

def stockVolume(df):
    ''' df[1] : '거래량','시가총액(억)' '''
    r = {}
    df.columns = ['A','B']
    r['거래량'] = df.loc[df['A'] == '거래량/거래대금', 'B'].str.split('주 /').str[0].str.replace(',', '').fillna(0).astype(int).to_list()[0]
    r['시가총액(억)'] = df.loc[df['A'] == '시가총액', 'B'].str.replace('억원','').str.replace(',', '').fillna(0).astype(int).to_list()[0]

    return r

def get_date_str(s):
    date_str = ''
    r = re.search("\\d{4}/\\d{2}", s)
    if r:
        date_str = r.group()

    return date_str

def financialSummary(df, PER):
    ''' df[12] : '매출액','영업이익','당기순이익','자산총계','부채총계','자본총계','자본총계(지배)','부채비율','BPS(원)','PBR(배)','발행주식수(보통주)' 
    'ROE(%)','ROA(%)','EPS(원)','PER(배)' 는 최근분기 사용
    PER : PEGR 만들때 사용
    '''
    r={}
    # columns을 first row로 변경 or pd.read_html(url, header=1)
    df.columns = df.iloc[0]
    # 첫줄 삭제
    df = df.iloc[1:]

    # cols = list(df.columns)
    # print(cols)

    df = df.set_index('주요재무정보')

    # column 이름 nan -> ''로 
    df.columns = df.columns.fillna('')

    # column 이름변경 - 숫자만
    cols = list(df.columns)

    # print(cols)
    cols = [get_date_str(x) if get_date_str(x) else '' for x in cols]
    # print(cols)
    df.columns = cols


    # df.fillna(0, inplace=True)
    # my_df = df.loc['매출액',:].fillna(0)
    # print(my_df)

    # print(df)
    df_f = df.loc[:,~df.columns.duplicated(keep='first')]  # 중복된건 앞에것만
    df_f = df_f.T

    my_df_cols = ['매출액','영업이익','당기순이익','자산총계','부채총계','자본총계','자본총계(지배)','EPS(원)','BPS(원)','발행주식수(보통주)','부채비율']

    my_df = df_f.loc[[cols[2]],my_df_cols] # 3번째 cols ; '2019/12'        

    for name in my_df_cols[:-1]: # '부채비율' 제외
        r[name] = my_df[name].fillna(0).astype(int).to_list()[0]

    r['부채비율(%)'] = my_df['부채비율'].fillna(0).astype(float).to_list()[0]

    # EPS(%) 구하기 
    # 공식: (마지막연도EPS(원)/시작연도EPS(원))^(1/계산하는연도갯수)-1
    x = []
    for i in range(0,3):
        my_df = df_f.loc[[cols[i]],['EPS(원)']]
        EPS = my_df['EPS(원)'].fillna(0).astype(int).to_list()[0]
        if EPS != 0:
            x.append(EPS)
    x_len = len(x)
    if x_len < 2:
        r['EPS(%)'] = 0
    else:
        # print('length', x_len-1, 'start', x[0], 'end',x[-1])
        if x[0] <= 0 or x[-1] <= 0:
            r['EPS(%)'] = 0
        else:            
            try:
                r['EPS(%)'] = ((x[-1] / x[0])**(1/(x_len - 1))-1) * 100
                # print('EPS', r['EPS(%)'])
            except:
                r['EPS(%)'] = 0

    if r['EPS(%)'] == 0:
        r['PEGR(배)'] = 0
    else:
        if PER >= 0:        
            try:
                r['PEGR(배)'] = PER / r['EPS(%)']
                r['PEGR(배)'] = str2round(r['PEGR(배)'])
                # print('PER', PER, 'PEGR', r['PEGR(배)'])
            except:        
                r['PEGR(배)'] = 0

    df_l = df.loc[:,~df.columns.duplicated(keep='last')]  # 중복된건 나중것만
    df_l = df_l.T

    # 최근 분기에서 4가지
    my_q_df_cols = ['ROE(%)','ROA(%)','PER(배)','PBR(배)']     

    my_q_df = df_l.loc[[cols[6]],my_q_df_cols] # 7번째 cols ; '2020/06' 

    for name in my_q_df_cols:
        r[name] = my_q_df[name].fillna(0).astype(float).to_list()[0]


    # 재무 field
    # 형태 { "date" : ['2017/12','2018/12','2019/12','2019/12','2020/03','2020/06'], "dataset": [[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0]]}

    financial_res = { "date" : cols, "dataset": []}
    my_list = [[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0]]

    for (idx, name) in enumerate(['매출액','영업이익','당기순이익','부채비율','자본유보율','현금배당성향(%)']):
        if name in ['매출액','영업이익','당기순이익','자본유보율']:
            my_list[idx] = df.loc[name,:].fillna(0).astype(float).astype(int).to_list()
        if name in ['부채비율','현금배당성향(%)']:
            my_list[idx] = df.loc[name,:].fillna(0).astype(float).to_list()

    financial_res['dataset'] = my_list

    return r, financial_res


def employee_listingdate_research(df):
    ''' 기업개요 - df[1] : 종업원수,상장일, df[4]: 연구개발비 '''
    r = {}

    # C,D 컬럼이 안읽힐경우 C, D 포기
    df[1].columns = ['A','B','C','D'][:len(df[1].columns)]
    try:
        r['상장일'] = df[1].loc[df[1]['A'] =='설립일', 'B'].str.split('상장일: ').str[1].str.replace('/','.').str.replace(')','').to_list()[0]
    except:
        r['상장일']  = ''
        print('상장일', df[1].columns)
    try:
        r['종업원수'] = df[1].loc[df[1]['C'] =='종업원수', 'D'].str.strip().str.split(r' \(').str[0].str.replace(',','').fillna(0).astype(int).to_list()[0]
    except: # 종업원수 null
        r['종업원수'] = 0
        print('종업원수', df[1].columns)
    try:       
        r['연구개발비(연)'] = df[4]['연구개발비용지출총액'].fillna(0).astype(int).to_list()[0]
    except:        
        r['연구개발비(연)'] = 0
        print('연구개발비', df[4].columns)

    return r

def current_assets_Total_liabilities(df):
    ''' 유동자산, 부채총계 '''
    r = {}

    # I 컬럼이 안읽힐경우 차례대로 포기
    try:
        df.columns = ['A','B','C','D','E','F'][:len(df.columns)]
    except:
        pass
    try:
        df.columns = ['A','B','C','D','E','F','G'][:len(df.columns)]
    except:
        pass
    try:
        df.columns = ['A','B','C','D','E','F','G','H'][:len(df.columns)]
    except:
        pass
    try:        
        df.columns = ['A','B','C','D','E','F','G','H','I'][:len(df.columns)]
    except:
        pass        

    r['유동자산'] = 0
    try:
        r['유동자산'] = df.loc[df['A'] =='유동자산', 'E'].fillna(0).astype(float).to_list()[0]
    except:
        pass        
    try:
        r['유동자산'] = df.loc[df['A'] =='유동자산', 'F'].fillna(0).astype(float).to_list()[0]
    except:
        pass

    r['부채총계'] = 0
    try:
        r['부채총계'] = df.loc[df['A'] =='부채총계', 'E'].fillna(0).astype(float).to_list()[0]
    except:
        pass        
    try:
        r['부채총계'] = df.loc[df['A'] =='부채총계', 'F'].fillna(0).astype(float).to_list()[0]
    except:
        pass


    return r

def calculate_stock_fair_value(r):
    '''
    적정주가 계산식
    '''
    res = {}    
    res['기업가치(백만)'] = r['자본총계(지배)']+(r['자본총계(지배)']*(r['ROE(%)']-7.9)/7.9)
    res['기업가치(백만)'] = int(res['기업가치(백만)'])

    sumCnt = 5
    if r['PER(배)'] > 0 and r['EPS(원)'] > 0:
        res['적(1)PER*EPS'] = r['PER(배)'] * r['EPS(원)']   #적정주가(1)PER*EPS
        res['적(1)PER*EPS'] =  int(res['적(1)PER*EPS'])     
    else:        
        res['적(1)PER*EPS'] = 0
        sumCnt -= 1

    if r['ROE(%)'] > 0 and r['EPS(원)'] > 0:
        res['적(2)ROE*EPS'] = r['ROE(%)'] * r['EPS(원)']    #적정주가(2)ROE*EPS
        res['적(2)ROE*EPS'] = int(res['적(2)ROE*EPS'])
    else:
        res['적(2)ROE*EPS'] = 0         
        sumCnt -= 1    

    if r['EPS(원)'] > 0:
        res['적(3)EPS*10'] =  r['EPS(원)']*10    #적정주가(3)EPS*10
        res['적(3)EPS*10'] = int(res['적(3)EPS*10'])
    else:        
        res['적(3)EPS*10'] = 0
        sumCnt -= 1  

    try:
        res['적(4)s-rim'] = res['기업가치(백만)']/ r['발행주식수(보통주)']*100000000 #100000000     #적정주가(4)s-rim
        res['적(4)s-rim'] = int(res['적(4)s-rim'])
        if res['적(4)s-rim'] < 0:
            res['적(4)s-rim'] = 0
    except:
         res['적(4)s-rim'] = 0
    finally:         
        if res['적(4)s-rim'] == 0:
            sumCnt -= 1         

    try:
        res['적(5)당기순이익*PER'] = r['당기순이익'] * r['PER(배)'] * 100000000 / r['발행주식수(보통주)'] #100000000    #적정주가(5)당기순이익*PER
        res['적(5)당기순이익*PER'] = int(res['적(5)당기순이익*PER'])
        if res['적(5)당기순이익*PER'] < 0:
            res['적(5)당기순이익*PER'] = 0        
    except:
        res['적(5)당기순이익*PER'] = 0
    finally:         
        if  res['적(5)당기순이익*PER'] == 0:
            sumCnt -= 1         

    try:
        res['추천매수가'] = (r['자본총계(지배)']+r['자본총계(지배)']*(r['ROE(%)']-7.9)/7.9*(0.8/(1+7.9-0.8)))/r['발행주식수(보통주)']*100000000 #100000000    #적정매수가
        res['추천매수가'] = int(res['추천매수가'])
    except:
        res['추천매수가'] = 0
        
    try:
        res['적정가평균'] = sum([res['적(1)PER*EPS'],res['적(2)ROE*EPS'],res['적(3)EPS*10'],res['적(4)s-rim'],res['적(5)당기순이익*PER']]) / sumCnt
        res['적정가평균'] = int(res['적정가평균'])
        if res['적정가평균'] < 0:
            res['적정가평균'] = 0
    except:
        res['적정가평균'] = 0

    try:
        res['갭1'] = (1 - r['전일종가'] / res['적(1)PER*EPS']) * 100    #1-전일종가/적정가*100
        res['갭1'] = str2round(res['갭1'],0)
    except:
        res['갭1'] = 0
        
    try:
        res['갭2'] = (1 - r['전일종가'] / res['적(2)ROE*EPS']) * 100    #1-전일종가/적정가*100
        res['갭2'] = str2round(res['갭2'],0)
    except:
        res['갭1'] = 0    
        
    try:
        res['갭3'] = (1 - r['전일종가'] / res['적(3)EPS*10']) * 100    #1-전일종가/적정가*100
        res['갭3'] = str2round(res['갭3'],0)
    except:
        res['갭1'] = 0    
        
    try:
        res['갭4'] = (1 - r['전일종가'] / res['적(4)s-rim']) * 100    #1-전일종가/적정가*100
        res['갭4'] = str2round(res['갭4'],0)
    except:
        res['갭1'] = 0    
        
    try:
        res['갭5'] = (1 - r['전일종가'] / res['적(5)당기순이익*PER']) * 100    #1-전일종가/적정가*100
        res['갭5'] = str2round(res['갭5'],0)
    except:
        res['갭1'] = 0    

    if res['적정가평균'] >  r['전일종가']:                  #(평균목표가 - 전일종가) / 평균목표가
        res['기대수익률'] = (res['적정가평균'] - r['전일종가']) / res['적정가평균'] *100
        res['기대수익률'] = round(res['기대수익률'],0)
    else:
        res['기대수익률'] = 0    

    if r['업종PER(배)'] > 0:                                # 기업 per 비율
        res['PER갭(%)'] = r['PER(배)'] / r['업종PER(배)'] *100
        res['PER갭(%)'] = round(res['PER갭(%)'],1)        
    else:
        res['PER갭(%)'] = 0

    try:
        res['PRR(배)'] = r['시가총액(억)'] / r['연구개발비(연)'] * 100 # 단위 보정 ; 억원 / 백만원
        res['PRR(배)'] = round(res['PRR(배)'],2)        
    except:
        res['PRR(배)'] = 0

    try:
        res['주당R&D(원)'] = r['연구개발비(연)'] / r['발행주식수(보통주)'] * 1000000 # 단위 보정 ; 백만원 / 원
        res['주당R&D(원)'] = int(res['주당R&D(원)'])        
    except:
        res['주당R&D(원)'] = 0
    finally:
        if not res['주당R&D(원)']:
            res['주당R&D(원)'] = 0

    # 가격성장흐름(PGF)
    try: 
        res['PGF(%)'] = (res['주당R&D(원)'] + r['EPS(원)'] ) / r['전일종가'] * 100
        res['PGF(%)'] = int(res['PGF(%)'])        
    except:
        res['PGF(%)'] = 0
    finally:
        if not res['PGF(%)']:
            res['PGF(%)'] = 0 

    # NCAV(억) : 유동자산 - 부채총계
    # NCAV(%) : NCAV(유동자산-부채총계) / (시가총액(억)*1.5)
    try:
        res['NCAV(억)'] = r['유동자산'] - r['부채총계']
        res['NCAV(억)'] = round(res['NCAV(억)'],1)    
    except:
        res['NCAV(억)'] = 0
    try:            
        res['NCAV(%)'] = res['NCAV(억)'] / (r['시가총액(억)']*1.5)
        res['NCAV(%)'] = round(res['NCAV(%)'],2)
    except:        
        res['NCAV(%)'] = 0
    print('유동자산',r['유동자산'])        
    print('부채총계',r['부채총계'])        
    print('NCAV(억)', res['NCAV(억)'])
    print('NCAV(%)', res['NCAV(%)'])
    return res

def financial_crawler(code):
    #code = 종목번호
    name = code
    base_url = 'https://finance.naver.com/item/coinfo.nhn?code='+ name + '&target=finsum_more'
    
    browser.get(base_url)
    
    # 상장폐지되어 자료없는 경우 - NoSuchElementException 
    try:
        browser.find_element_by_class_name('no_data') # <div class="no_data">
        return empty_dict, empty_financial_info
    except:
        pass    
    
    
    #frame구조에 들어가기
    try:
        browser.switch_to.frame(browser.find_element_by_id('coinfo_cp'))
    except:
        return empty_dict, empty_financial_info        
    
    # page not found handle
    # 상장된지 얼마안되서 자료없는 경우인듯
    try:
        browser.find_element_by_id('pageError') # <div id="pageError">
        return empty_dict, empty_financial_info
    except:
        pass       

    #재무제표 "전체" 클릭하기
    try:
        browser.find_elements_by_xpath('//*[@id="cns_Tab20"]')[0].click()
    except:
        return empty_dict, empty_financial_info

    html0 = browser.page_source
    html1 = BeautifulSoup(html0,'lxml')

    # * 전일종가, 
    # * 업종PER : df[0]
    # * 'PER', 'PBR', 'EPS', 'BPS', '현금배당수익률' - 펀더멘털 : df[5]
    # * '영업이익증감(전전)' - 펀더멘탈 > 어닝서프라이즈 > 영업이익 > 전분기대비 : df[5]
    # * '순이익증감(전전)' - 펀더멘탈 > 어닝서프라이즈 > 당기순이익 > 전분기대비 
    # * '거래량', '시가총액(억)', 수익률(1d/1m/1y) 구하기
    # * 피낸셜 서머리 : df[12]

    df = pd.read_html(browser.page_source, header=0, encoding = 'euc-kr')

    res = {}

    nowPrice = html1.find_all('strong')[0].get_text().strip()
    res.update({'전일종가' : str2int(nowPrice) })

    res.update(sectorPer(df[0]))

    res.update(fundamental(df[5]))

    res.update(qPrice(df[6]))

    res.update(stockVolume(df[1]))

    temp_res, second_res = financialSummary(df[12], res['PER'])
    res.update(temp_res)

    browser.find_elements_by_xpath('//*[@id="header-menu"]/div[1]/dl/dt[2]')[0].click() # "기업개요" 클릭하기
    df = pd.read_html(browser.page_source, header=0, encoding = 'euc-kr')
    res.update(employee_listingdate_research(df))

    browser.find_elements_by_xpath('//*[@id="header-menu"]/div[1]/dl/dt[3]')[0].click() # "재무분석" 클릭하기
    browser.find_elements_by_xpath('//*[@id="rpt_tab2"]')[0].click() # "재무분석" > "재무상태표" 클릭
    df = pd.read_html(browser.page_source, header=0, encoding = 'euc-kr')
    res.update(current_assets_Total_liabilities(df[5]))

    res.update(calculate_stock_fair_value(res))

    # print(res)
    # print(second_res)
    
    return res, second_res

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
    # print(kindInfo)
    # kindInfo = {'회사명' : 'DSR', '종목코드': '155660', '업종': '1차 비철금속 제조업', '주요제품' : '', '상장일': '', '결산월' : '', '대표자명': '', '홈페이지': '', '지역': ''}

          
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
        try:
            kiscode = kindInfo.종목코드.values[i].strip()
            print(kiscode)
        except:
            print('----------------------')
            print(str(i) + "번에 대한 종목코드가 없어서 종료합니다.")            
            print('done')
            break
        info, financial_res = financial_crawler(kiscode)
        if existCheck(kiscode) != 0:
            updateTable(i, kiscode, info, financial_res)
        else:
            insertTable(i, kiscode, info, financial_res, kindInfo.회사명.values[i], kindInfo.업종.values[i], kindInfo.주요제품.values[i], kindInfo.상장일.values[i], kindInfo.결산월.values[i], kindInfo.대표자명.values[i], kindInfo.홈페이지.values[i], kindInfo.지역.values[i])     

        # memory usage check
        memoryUse = psutil.virtual_memory()[2] 

        print(
            "{0}. {1} {2} {3} success --- {4} 초 ---".format(
                str(i),
                str(kiscode),
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