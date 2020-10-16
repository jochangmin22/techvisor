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
            print(no, "Failed to insert record into mobile table", error)

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
#wrapper > div.fund.fl_le > table > tbody > tr:nth-child(5) > td.num.noline-right
#wrapper > div.fund.fl_le > table > tbody > tr:nth-child(1) > td.num.noline-right
def _etc_info_sub(html1, value):
    ''' etc_info의 sub def '''
    ''' [{'PER': 1}, {'PBR': 2}, {'EPS': 5}, {'BPS': 6}, {'현금배당수익률': 9}] '''    
    # 2020/12(E)
    try:
        res = html1.select('#wrapper > div.fund.fl_le > table > tbody > tr:nth-of-type(' + str(value) + ') > td.num.noline-right')[0].get_text().strip()
        res = res.replace("N/A","0").replace(",","").replace("원","").replace("%","")
        if not res:
            res = 0
    except:
        res = 0

    if res == 0: # 2020/12(E) is not valild and is replaced by 2019/12(A)
        # 2019/12(A)
        try:
            res = html1.select('#wrapper > div.fund.fl_le > table > tbody > tr:nth-of-type(' + str(value) + ') > td:nth-of-type(1)')[0].get_text().strip()
            res = res.replace("N/A","0").replace(",","").replace("원","").replace("%","")
            if not res:
                res = 0            
        except:
            res = 0
         
        return res
    else:
        return res

def etc_info(html1):

    ''' 수집 : '현재가','업종PER(%)','PER(배)','PBR','EPS','BPS','현금배당수익률', '영업이익증감(전전)','영업이익증감(직전)','순이익증감(전전)','순이익증감(직전)' '''
    # 현재가 구하기
    try:
        NowPrice = html1.find_all('strong')[0].get_text()    #현재가 추출
        NowPrice = (NowPrice.strip()).replace(",","")
        NowPrice = int(NowPrice)
    except:
        NowPrice = 0      

    # 업종PER(%) 구하기
    try:
        SectorPer= html1.find_all('dt',{"class","line-left"})[12].get_text() #업종PER 값
        SectorPer = SectorPer.replace("업종PER ","").replace('N/A','0').replace(",","")
        SectorPer = float(SectorPer)
    except:
        SectorPer = 0   
    
    ### 'PER(배)','PBR','EPS','BPS','현금배당수익률' 구하기
    ### 위치 : 펀더멘털 > 주요지표 > 2020/12(E) or 2019/12(A)
    ### 'ROE(%)','ROA(%)','PER(배)','PBR(배)'는 최근분기에서 사용 ; 최근 분기없으면 'PER(배)','PBR(배)'는 여기 것으로 대체 

    # 5가지가 나열이 길어져서 _etc_info_sub def 로 만듬
    r = {}
    dataList = [{'PER': 1}, {'PBR': 2}, {'EPS': 5}, {'BPS': 6}, {'현금배당수익률': 9}] # 뒤의 숫자는 tr:nth-of-type(n) 위치
    for index in range(len(dataList)):
        for key, value in dataList[index].items():
            r[key] = _etc_info_sub(html1, value)
            

    # 전전분기대비 증감율 ; 펀더멘탈 > 어닝서프라이즈 > 영업이익 > 전분기대비
    try:
        QPrice1 = html1.select('#earning_list > tbody > tr:nth-of-type(6) td:nth-of-type(1)')[0].get_text().strip()   #전전분기대비 증감율
        QPrice1 = QPrice1.replace("","").replace("N/A","")
    except:
        QPrice1 = 0

    try:
        QPrice2 = html1.select('#earning_list > tbody > tr:nth-of-type(6) > td.num.noline-right')[0].get_text().strip()   #전전분기대비 증감율
        QPrice2 = QPrice2.replace("","").replace("N/A","")
    except:
        QPrice2 = 0

    # 전전분기대비 증감율 ; 펀더멘탈 > 어닝서프라이즈 > 당기순이익 > 전분기대비
    try:
        QPrice3 = html1.select('#earning_list > tbody > tr:nth-of-type(11) > td:nth-of-type(1)')[0].get_text().strip()   #전전분기대비 증감율
        QPrice3 = QPrice3.replace("","").replace("N/A","")
    except:
        QPrice3 = 0        

    try:
        QPrice4 = html1.select('#earning_list > tbody > tr:nth-of-type(11) > td.num.noline-right')[0].get_text().strip()   #전전분기대비 증감율
        QPrice4 = QPrice4.replace("","").replace("N/A","")              
    except:
        QPrice4 = 0

    #거래량, 시가총액, 수익률(1d/1m/1y) 구하기
    try:
        stock_volume = html1.select('#cTB11 > tbody > tr:nth-of-type(4) > td')[0].get_text().strip().split(' /')[0]
        stock_volume = stock_volume.replace('주','').replace(',','')
    except:
        stock_volume = 0

    try:
        market_cap = html1.select('#cTB11 > tbody > tr:nth-of-type(5) > td')[0].get_text().strip()
        market_cap = market_cap.replace('억원','').replace(',','')    
    except:
        market_cap = 0
        
    try:
        stock_return_1d = html1.select('#cTB11 > tbody > tr:nth-of-type(1) > td > span:nth-of-type(2)')[0].get_text().strip().split('%')[0]
        stock_return_1m = html1.select('#cTB11 > tbody > tr:nth-of-type(9) > td > span:nth-of-type(1)')[0].get_text().strip().split('%')[0]
        stock_return_1y = html1.select('#cTB11 > tbody > tr:nth-of-type(9) > td > span:nth-of-type(4)')[0].get_text().strip().split('%')[0]
        # stock_return = stock_return_1d + '/' + stock_return_1m + '/' + stock_return_1y
    except:
        stock_return_1d = 0  
        stock_return_1m = 0  
        stock_return_1y = 0

    res = {
            '현재가' : NowPrice,
            '업종PER(%)': SectorPer,
            'PER(배)': r['PER'],
            'PBR(배)': r['PBR'],
            'EPS(원)': r['EPS'],
            'BPS(원)': r['BPS'],
            '현금배당수익률': r['현금배당수익률'],
            '영업이익증감(전전)' :QPrice1,
            '영업이익증감(직전)' :QPrice2,
            '순이익증감(전전)' :QPrice3,
            '순이익증감(직전)' :QPrice4,
            '거래량' : stock_volume,
            '시가총액' : market_cap,
            '수익률1d' :stock_return_1d, 
            '수익률1m' :stock_return_1m, 
            '수익률1y' :stock_return_1y, 
        }        

    return res
          
def stock_fair_value(main, etc, employee, listing_date):
    '''
    적정주가 계산식
    etc : '현재가','업종PER(%)','PER(배)','PBR(배)','EPS(원)','BPS(원)','현금배당수익률','영업이익증감(전전)','영업이익증감(직전)','순이익증감(전전)','순이익증감(직전)'     
    나머지는 main
    '''
    r = {} 
    
    # numeric으로 미리 변환   - str2round, str2int 사전정의 def

    r['매출액'] = str2int(main['매출액'])
    r['상장일'] = listing_date
    r['ROE(%)'] = str2round(main['ROE(%)'],2)
    r['ROA(%)'] = str2round(main['ROA(%)'],2)
    r['PER(배)'] = str2round(etc['PER(배)'],2)
    r['EPS(원)'] = str2int(etc['EPS(원)'])
    r['PBR(배)'] = str2round(etc['PBR(배)'],2)
    r['BPS(원)'] = str2int(etc['BPS(원)'])       
    r['업종PER(%)'] = str2round(etc['업종PER(%)'],2)
    r['현재가'] = str2int(etc['현재가'])
    r['현금배당수익률'] = str2round(etc['현금배당수익률'],2)
    r['자본총계(지배)'] = str2int(main['자본총계(지배)'])
    r['발행주식수(보통주)'] = str2int(main['발행주식수(보통주)'])
    r['당기순이익'] = str2int(main['당기순이익'])
    r['부채비율'] = str2round(main['부채비율'],2)
    r['부채총계'] = str2int(main['부채총계'])
    r['자산총계'] = str2int(main['자산총계'])
    r['종업원수'] = str2int(employee)
    r['당기순이익'] = str2int(main['당기순이익'])
    r['영업이익증감(전전)'] = str2round(etc['영업이익증감(전전)'],2)
    r['영업이익증감(직전)'] = str2round(etc['영업이익증감(직전)'],2)
    r['순이익증감(전전)'] = str2round(etc['순이익증감(전전)'],2)
    r['순이익증감(직전)'] = str2round(etc['순이익증감(직전)'],2)
    r['거래량'] = str2int(etc['거래량'])
    r['시가총액'] = str2int(etc['시가총액'])
    r['수익률1d'] = str2round(etc['수익률1d'],2)
    r['수익률1m'] = str2round(etc['수익률1m'],2)
    r['수익률1y'] = str2round(etc['수익률1y'],2)
 
    
    #
    r['기업가치(백만)'] = r['자본총계(지배)']+(r['자본총계(지배)']*(r['ROE(%)']-7.9)/7.9)
    r['기업가치(백만)'] = int(r['기업가치(백만)'])
    
    sumCnt = 5
    if r['PER(배)'] > 0 and r['EPS(원)'] > 0:
        r['적(1)PER*EPS'] = r['PER(배)'] * r['EPS(원)']   #적정주가(1)PER*EPS
        r['적(1)PER*EPS'] =  int(r['적(1)PER*EPS'])     
    else:        
        r['적(1)PER*EPS'] = 0
        sumCnt -= 1

    if r['ROE(%)'] > 0 and r['EPS(원)'] > 0:
        r['적(2)ROE*EPS'] = r['ROE(%)'] * r['EPS(원)']    #적정주가(2)ROE*EPS
        r['적(2)ROE*EPS'] = int(r['적(2)ROE*EPS'])
    else:
        r['적(2)ROE*EPS'] = 0         
        sumCnt -= 1    

    if r['EPS(원)'] > 0:
        r['적(3)EPS*10'] =  r['EPS(원)']*10    #적정주가(3)EPS*10
        r['적(3)EPS*10'] = int(r['적(3)EPS*10'])
    else:        
        r['적(3)EPS*10'] = 0
        sumCnt -= 1  

    try:
        r['적(4)s-lim'] = r['기업가치(백만)']/ r['발행주식수(보통주)']*100000000 #100000000     #적정주가(4)s-lim
        r['적(4)s-lim'] = int(r['적(4)s-lim'])
        if r['적(4)s-lim'] < 0:
            r['적(4)s-lim'] = 0
    except:
         r['적(4)s-lim'] = 0
    finally:         
        if r['적(4)s-lim'] == 0:
            sumCnt -= 1         

    try:
        r['적(5)당기순이익*PER'] = r['당기순이익'] * r['PER(배)'] * 100000000 / r['발행주식수(보통주)'] #100000000    #적정주가(5)당기순이익*PER
        r['적(5)당기순이익*PER'] = int(r['적(5)당기순이익*PER'])
        if r['적(5)당기순이익*PER'] < 0:
            r['적(5)당기순이익*PER'] = 0        
    except:
        r['적(5)당기순이익*PER'] = 0
    finally:         
        if  r['적(5)당기순이익*PER'] == 0:
            sumCnt -= 1         

    
    try:
        r['추천매수가'] = (r['자본총계(지배)']+r['자본총계(지배)']*(r['ROE(%)']-7.9)/7.9*(0.8/(1+7.9-0.8)))/r['발행주식수(보통주)']*100000000 #100000000    #적정매수가
        r['추천매수가'] = int(r['추천매수가'])
    except:
        r['추천매수가'] = 0
        
    try:
        r['적정가'] = sum([r['적(1)PER*EPS'],r['적(2)ROE*EPS'],r['적(3)EPS*10'],r['적(4)s-lim'],r['적(5)당기순이익*PER']]) / sumCnt
        r['적정가'] = int(r['적정가'])
        if r['적정가'] < 0:
            r['적정가'] = 0
    except:
        r['적정가'] = 0

    try:
        r['갭1'] = (1 - r['현재가'] / r['적(1)PER*EPS']) * 100    #1-현재가/적정가*100
        r['갭1'] = str2round(r['갭1'],0)
    except:
        r['갭1'] = 0
        
    try:
        r['갭2'] = (1 - r['현재가'] / r['적(2)ROE*EPS']) * 100    #1-현재가/적정가*100
        r['갭2'] = str2round(r['갭2'],0)
    except:
        r['갭1'] = 0    
        
    try:
        r['갭3'] = (1 - r['현재가'] / r['적(3)EPS*10']) * 100    #1-현재가/적정가*100
        r['갭3'] = str2round(r['갭3'],0)
    except:
        r['갭1'] = 0    
        
    try:
        r['갭4'] = (1 - r['현재가'] / r['적(4)s-lim']) * 100    #1-현재가/적정가*100
        r['갭4'] = str2round(r['갭4'],0)
    except:
        r['갭1'] = 0    
        
    try:
        r['갭5'] = (1 - r['현재가'] / r['적(5)당기순이익*PER']) * 100    #1-현재가/적정가*100
        r['갭5'] = str2round(r['갭5'],0)
    except:
        r['갭1'] = 0    

    if r['적정가'] >  r['현재가']:                  #(평균목표가 - 현재가) / 평균목표가
        r['기대수익률'] = (r['적정가'] - r['현재가']) / r['적정가'] *100
        r['기대수익률'] = round(r['기대수익률'],0)
    else:
        r['기대수익률'] = 0    

    if r['업종PER(%)'] > 0:                                # 기업 per 비율
        r['PER갭(%)'] = r['PER(배)'] / r['업종PER(%)'] *100
        r['PER갭(%)'] = round(r['PER갭(%)'],1)        
    else:
        r['PER갭(%)'] = 0

    return r

# empty_info = {
#     '매출액': '',
#     '영업이익': '',
#     '당기순이익': '',
#     '자산총계': '',
#     '부채총계': '',
#     '자본총계': '',
#     '자본총계(지배)': '',
#     'ROE(%)': '',
#     'ROA(%)': '',
#     'EPS(원)': '',
#     'PER(배)': '',        
#     '부채비율': '',
#     'BPS(원)': '',
#     'PBR(배)': '',
#     '발행주식수(보통주)':'',
#     '종업원수': '',
#     '상장일': '',
# }
# empty_fair = {
#   'ROE(%)': 0,
#   'PER(배)': 0,
#   'PBR(배)': 0,
#   'BPS(원)': 0,    
#   '업종PER(%)': 0,
#   '현재가': 0,    
#   '현금배당수익률': 0,
#   '자본총계(지배)': 0,
#   '발행주식수(보통주)': 0,
#   '당기순이익': 0,
#   '부채비율': 0,
#   '영업이익증감(전전)': 0,
#   '영업이익증감(직전)': 0,
#   '순이익증감(전전)': 0,
#   '순이익증감(직전)': 0,
#   '기업가치(백만)': 0,
#   '거래량': 0,
#   '시가총액':0,
#   '수익률1d':0,
#   '수익률1m':0,
#   '수익률1y':0,
#   '적(1)PER*EPS': 0,
#   '적(2)ROE*EPS': 0,
#   '적(3)EPS*10': 0,
#   '적(4)s-lim': 0,
#   '적(5)당기순이익*PER': 0,
#   '추천매수가': 0,
#   '적정가': 0,
#   '갭1': 0,
#   '갭2': 0,
#   '갭3': 0,
#   '갭4': 0,
#   '갭5': 0,
#   '기대수익률': 0,
#   'PER갭(%)': 0
# }

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
'부채비율': 0,
'부채총계': 0,
'상장일': '',    
'수익률':0,
'순이익증감(전전)': 0,
'순이익증감(직전)': 0,
'시가총액':0,
'업종PER(%)': 0,
'영업이익': 0,
'영업이익증감(전전)': 0,
'영업이익증감(직전)': 0,
'자본총계': 0,
'자본총계(지배)': 0,
'자산총계': 0,
'적(1)PER*EPS': 0,
'적(2)ROE*EPS': 0,
'적(3)EPS*10': 0,
'적(4)s-lim': 0,
'적(5)당기순이익*PER': 0,
'적정가': 0,
'종업원수': 0,
'추천매수가': 0,
'현금배당수익률': 0,
'현재가': 0,    
'BPS(원)': 0,    
'EPS(원)': 0,
'PBR(배)': 0,
'PER(배)': 0,
'PER갭(%)': 0,
'ROA(%)': 0,
'ROE(%)': 0,
}

# def stock_crawler(code):
#     #code = 종목번호
#     name = code
#     base_url = 'https://finance.naver.com/item/coinfo.nhn?code='+ name + '&target=finsum_more'
    
#     browser.get(base_url)
    
#     # 상장폐지되어 자료없는 경우 - NoSuchElementException 
#     try:
#         browser.find_element_by_class_name('no_data') # <div class="no_data">
#         return empty_dict
#     except:
#         pass    
    
    
#     #frmae구조 안에 필요한 데이터가 있기 때문에 해당 데이터를 수집하기 위해서는 frame구조에 들어가야한다.
#     browser.switch_to.frame(browser.find_element_by_id('coinfo_cp'))
    
#     # page not found handle
#     # 상장된지 얼마안되서 자료없는 경우인듯
#     try:
#         browser.find_element_by_id('pageError') # <div id="pageError">
#         return empty_dict
#     except:
#         pass       
 
#     #재무제표 "연간" 클릭하기
#     try:
#         browser.find_elements_by_xpath('//*[@class="schtab"][1]/tbody/tr/td[3]')[0].click()
#     except:
#         return empty_dict

#     html0 = browser.page_source
#     # html1 = BeautifulSoup(html0,'html.parser')
#     html1 = BeautifulSoup(html0,'lxml')
    
  
#     ### 기타정보 -- 길어서 따로 def로 나눔 ; etc는 아래 [적정주가분석 산출] 부분에서 사용됨
#     etc = etc_info(html1)
    
#     # #기업명 뽑기
#     # title0 = html1.find('head').find('title').text
#     # print(title0.split('-')[-1])
    
#     #### Financial Summary ###
#     html22 = html1.find('table',{'class':'gHead01 all-width','summary':'주요재무정보를 제공합니다.'})    
    
#     #date scrapy
#     thead0 = html22.find('thead')
#     tr0 = thead0.find_all('tr')[1]
#     th0 = tr0.find_all('th')
    
#     date = []
#     for i in range(len(th0)):
#         date.append(''.join(re.findall('[0-9/]',th0[i].text)))
    
#     #columns scrapy
#     tbody0 = html22.find('tbody')
#     tr0 = tbody0.find_all('tr')
    
#     col = []
#     for i in range(len(tr0)):

#         if '\xa0' in tr0[i].find('th').text:
#             tx = re.sub('\xa0','',tr0[i].find('th').text)
#         else:
#             tx = tr0[i].find('th').text

#         col.append(tx)
    
#     #main text scrapy
#     td = []
#     for i in range(len(tr0)):
#         td0 = tr0[i].find_all('td')
#         td1 = []
#         for j in range(len(td0)):
#             if td0[j].text == '':
#                 td1.append('0')
#             else:
#                 td1.append(td0[j].text)

#         td.append(td1)
    
#     td2 = list(map(list,zip(*td)))
    
#     df = pd.DataFrame(td2,columns = col,index = date)
  
#     try:  # page not found handle
#         my_df = df.loc[['2019/12'],['매출액','영업이익','당기순이익','자산총계','부채총계','자본총계','자본총계(지배)','ROE(%)','ROA(%)','EPS(원)','PER(배)','부채비율','BPS(원)','PBR(배)','발행주식수(보통주)']]
#         # my_df = df.loc[['2019/12'],['매출액','영업이익','당기순이익','자산총계','부채총계','자본총계','자본총계(지배)','ROE(%)','ROA(%)','부채비율','발행주식수(보통주)']]
#     except:
#         return empty_dict
    
#     res = my_df.to_dict('records')
    
#     #종업원수·상장일 구하기

#     #### "기업개요" 클릭하기
#     try:
#         browser.find_elements_by_xpath('//*[@id="header-menu"]/div[1]/dl/dt[2]')[0].click()
    
#         html0 = browser.page_source
#         html1 = BeautifulSoup(html0,'lxml')
#         # html1 = BeautifulSoup(html0,'html.parser')   
    
#         employee = html1.select('#cTB201 > tbody > tr:nth-of-type(4) > td.c4.txt')[0].get_text().strip().split(' (')[0]
#         employee = employee.replace(',','')  
#         listing_date = html1.select('#cTB201 > tbody > tr:nth-of-type(3) > td.c2.txt')[0].get_text().strip().rsplit('상장일: ',1)[-1]
#         listing_date = listing_date.replace('/','.').replace(')','')   
   
#     except:
#         employee = 0
#         listing_date = ''


    
#     # # 적정주가분석 산출
#     # fair = stock_fair_value(res[0], etc)    

#     # res[0].update({
#     #     'EPS(원)' : fair['EPS(원)'],
#     #     'PER(배)' : fair['PER(배)'],
#     #     'BPS(원)' : fair['BPS(원)'],
#     #     'PBR(배)' : fair['PBR(배)'],        
#     #     '종업원수' : employee,
#     #     '상장일' : listing_date,
#     #     # '거래량' : stock_volume,
#     #     # '시가총액' : market_cap,
#     #     # '수익률' : stock_return,
#     # })

#     # 적정주가분석 산출 · merge two json 
#     result_merge = stock_fair_value(res[0], etc, employee, listing_date)    
#     return result_merge

# print(stock_crawler('005930'))
# stock_crawler('226330')
# stock_crawler('002170')
# stock_crawler('357120')

def stock_crawler(code):
    #code = 종목번호
    name = code
    base_url = 'https://finance.naver.com/item/coinfo.nhn?code='+ name + '&target=finsum_more'
    
    browser.get(base_url)
    
    # 상장폐지되어 자료없는 경우 - NoSuchElementException 
    try:
        browser.find_element_by_class_name('no_data') # <div class="no_data">
        return empty_dict
    except:
        pass    
    
    
    #frame구조에 들어가기
    try:
        browser.switch_to.frame(browser.find_element_by_id('coinfo_cp'))
    except:
        return empty_dict        
    
    # page not found handle
    # 상장된지 얼마안되서 자료없는 경우인듯
    try:
        browser.find_element_by_id('pageError') # <div id="pageError">
        return empty_dict
    except:
        pass       

    #재무제표 "전체" 클릭하기
    try:
        browser.find_elements_by_xpath('//*[@id="cns_Tab20"]')[0].click()
    except:
        return empty_dict

    html0 = browser.page_source
    html1 = BeautifulSoup(html0,'lxml')
    
  
    ### 기타정보 -- 길어서 따로 def로 나눔
    etc = etc_info(html1)
    
    
    #### Financial Summary ###
    html22 = html1.find('table',{'class':'gHead01 all-width','summary':'주요재무정보를 제공합니다.'})    
    
    #date scrapy
    thead0 = html22.find('thead')
    tr0 = thead0.find_all('tr')[1]
    th0 = tr0.find_all('th')
    
    date = []
    for i in range(len(th0)):
        date.append(''.join(re.findall('[0-9/]',th0[i].text)))
    
    #columns scrapy
    tbody0 = html22.find('tbody')
    tr0 = tbody0.find_all('tr')
    
    col = []
    for i in range(len(tr0)):

        if '\xa0' in tr0[i].find('th').text:
            tx = re.sub('\xa0','',tr0[i].find('th').text)
        else:
            tx = tr0[i].find('th').text

        col.append(tx)
    
    #main text scrapy
    td = []
    for     i in range(len(tr0)):
        td0 = tr0[i].find_all('td')
        td1 = []
        for j in range(len(td0)):
            if td0[j].text == '':
                td1.append('0')
            else:
                td1.append(td0[j].text)

        td.append(td1)
    
    td2 = list(map(list,zip(*td)))
    
    df = pd.DataFrame(td2,columns = col,index = date)
  
    try:  # page not found handle
        my_df = df.loc[['2019/12'],['매출액','영업이익','당기순이익','자산총계','부채총계','자본총계','자본총계(지배)','ROE(%)','ROA(%)','EPS(원)','PER(배)','부채비율','BPS(원)','PBR(배)','발행주식수(보통주)']]
        # my_df = df.loc[['2019/12'],['매출액','영업이익','당기순이익','자산총계','부채총계','자본총계','자본총계(지배)','ROE(%)','ROA(%)','부채비율','발행주식수(보통주)']]
    except:
        return empty_dict
    
    res = my_df.to_dict('records')

    # 최근 분기
    try:  # page not found handle
        my_q_df = df.loc[['2020/06'],['ROE(%)','ROA(%)','PER(배)','PBR(배)']]
        res2 = my_q_df.to_dict('records')

        # 4가지는 최근 분기 정보로 update
        res[0].update({
            'ROE(%)' : res2[0]['ROE(%)'],
            'ROA(%)' : res2[0]['ROA(%)'],
        })          
        etc.update({
            'PER(배)' : res2[0]['PER(배)'],
            'PBR(배)' : res2[0]['PBR(배)'],        
        })
     
    except:
        pass # or etc 자료 그대로 씀
  
   
    #종업원수·상장일 구하기

    #### "기업개요" 클릭하기
    try:
        browser.find_elements_by_xpath('//*[@id="header-menu"]/div[1]/dl/dt[2]')[0].click()
    
        html0 = browser.page_source
        html1 = BeautifulSoup(html0,'lxml')
    
        employee = html1.select('#cTB201 > tbody > tr:nth-of-type(4) > td.c4.txt')[0].get_text().strip().split(' (')[0]
        employee = employee.replace(',','')  
        listing_date = html1.select('#cTB201 > tbody > tr:nth-of-type(3) > td.c2.txt')[0].get_text().strip().rsplit('상장일: ',1)[-1]
        listing_date = listing_date.replace('/','.').replace(')','')   
   
    except:
        employee = 0
        listing_date = ''


    
    # # 적정주가분석 산출
    # fair = stock_fair_value(res[0], etc)    

    # res[0].update({
    #     'EPS(원)' : fair['EPS(원)'],
    #     'PER(배)' : fair['PER(배)'],
    #     'BPS(원)' : fair['BPS(원)'],
    #     'PBR(배)' : fair['PBR(배)'],        
    #     '종업원수' : employee,
    #     '상장일' : listing_date,
    #     # '거래량' : stock_volume,
    #     # '시가총액' : market_cap,
    #     # '수익률' : stock_return,
    # })

    # 적정주가분석 산출 · merge two json 
    result_merge = stock_fair_value(res[0], etc, employee, listing_date)    
    return result_merge
# print(stock_crawler('155660'))
# print(stock_crawler('005930'))
# stock_crawler('226330')
# stock_crawler('002170')
# stock_crawler('357120')

def main_def(start = 0, end = 0, tableclearnow = False):
    """ 메인 def """

    # start_time = time.time()

    kindInfo = get_kind_stock_code()


          
    # threading.Timer(1, main_def(repeat_cnt)).start()

    if start == 0 and end == 0:
        rangeValue = range(len(kindInfo))
    else:
        rangeValue = range(start, end)

    print('총 상장법인수 :', len(kindInfo))
    print('실행건       :', len(rangeValue))        
    print('실행소요예상 :', int(int(len(rangeValue)) * 1 / 60), '분')        

    if tableclearnow:
        backupAndEmptyTable()
    # for i in range(len(kindInfo)):
    # for i in range(0,50):
    for i in rangeValue:
        start_time = time.time()

        kiscode = kindInfo.종목코드.values[i].strip()
    #     print(kiscode)
        info = stock_crawler(kiscode)
        if existCheck(kiscode) != 0:
            updateTable(i, kiscode, info)
        else:
            insertTable(i, kiscode, info, kindInfo.회사명.values[i], kindInfo.업종.values[i], kindInfo.주요제품.values[i], kindInfo.상장일.values[i], kindInfo.결산월.values[i], kindInfo.대표자명.values[i], kindInfo.홈페이지.values[i], kindInfo.지역.values[i])     

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
    ''' 실행하려면 argv 3개가 필요합니다. : startno, endno, tableclearatfirst? (True or False) '''
    # request = int(sys.argv[1])
    # argv ex) 0 2380 True
    start = int(sys.argv[1])
    end = int(sys.argv[2])
    tableclearnow = sys.argv[3]
    sys.setrecursionlimit(5000)
    main_def(start, end, tableclearnow)    