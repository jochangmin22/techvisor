# app
import requests
import json
import pandas as pd
from sqlalchemy import create_engine
from datetime import date, datetime, timedelta
from bs4 import BeautifulSoup
from django.http import JsonResponse, HttpResponse
from urllib.request import urlopen
import uuid

pd.set_option('display.float_format', '{:,.2f}'.format)

from selenium.webdriver import Chrome
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import re

# astype(int) error handle
import numpy
from psycopg2.extensions import register_adapter, AsIs
def addapt_numpy_float64(numpy_float64):
    return AsIs(numpy_float64)
def addapt_numpy_int64(numpy_int64):
    return AsIs(numpy_int64)
register_adapter(numpy.float64, addapt_numpy_float64)
register_adapter(numpy.int64, addapt_numpy_int64)


# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from search.models import Listed_corp
from .models import Disclosure_report, Stock_quotes, Mdcin_clinc_test_info

from .utils import str2int, str2round

DART = settings.DART
MFDS = settings.MFDS
NAVER = settings.NAVER

DATABASES = settings.DATABASES

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

def update_today_disclosure_report():
    today = datetime.today().strftime('%Y%m%d')
    total_page, df = crawl_disclosure_report(bgn_de=today, end_de=today, page_no='1', page_count = '100')
    if total_page == 0: 
        return
    for i in range(1, total_page + 1):
        if i > 1: # df already have at first
            _, df = crawl_disclosure_report(bgn_de=today, end_de=today, page_no=i, page_count = '100')

        engine = create_engine(db_connection_url)

        # df.to_sql('disclosure_report', engine, if_exists='replace', index=False, chunksize=10000)
        # df.to_sql('disclosure_report', engine, if_exists='append', index=False, chunksize=10000)    

        # temp table에 to_sql 하고 원 table에 unique한 것만 insert
        df.to_sql(name='disclosure_report_temp', con=engine, if_exists='replace')

        with engine.begin() as cn:
            sql = """INSERT INTO disclosure_report (법인구분, 종목명, 고유번호, 종목코드, 보고서명, 접수번호, 공시제출인명, 접수일자, 비고)
                        SELECT t.법인구분, t.종목명, t.고유번호, t.종목코드, t.보고서명, t.접수번호, t.공시제출인명, t.접수일자::date, t.비고 
                        FROM disclosure_report_temp t
                        WHERE NOT EXISTS 
                            (SELECT 1 FROM disclosure_report f
                            WHERE t.접수번호 = f.접수번호 and t.법인구분 = f.법인구분)"""

            cn.execute(sql)

def crawl_disclosure_report(**kwargs):
    keys = ['corp_code','bgn_de','end_de','last_reprt_at','pblntf_ty','pblntf_detail_ty','corp_cls','sort','sort_mth','page_no','page_count']
    for key in kwargs.keys():
        if not key in keys:
            print("get_list() has no parameter \'"+key+"\'")
            return False
    # crtfc_key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&bgn_de=20200816&end_de=20201016&corp_cls=Y&page_no=1&page_count=100
    params = {**{'crtfc_key':DART['api_key']},**kwargs}
    items = ['corp_cls','corp_name','corp_code','stock_code','report_nm','rcept_no','flr_nm','rcept_dt','rm']
    item_names = ['법인구분','종목명','고유번호','종목코드','보고서명','접수번호','공시제출인명','접수일자','비고']
    url = DART['dart_url'] + DART['oper_gong']
    res = requests.get(url,params=params)
    # print(res.text)
    json_dict = json.loads(res.text)

    data = []
    if json_dict['status'] == "000":
        for line in json_dict['list']:
            data.append([])
            for itm in items:
                if itm in line.keys():
                    data[-1].append(line[itm])
                else: data[-1].append("")
        df = pd.DataFrame(data,columns=item_names)
        return json_dict['total_page'], df
    elif json_dict['status'] == "013": # {"status":"013","message":"조회된 데이타가 없습니다."}
        return 0, None
    else:
        return 0, df # TODO


def update_today_crawl_mdcline():

    mdcinClinc = Mdcin_clinc_test_info.objects.latest('승인일')
    start = mdcinClinc.승인일

    end = datetime.today().strftime('%Y%m%d')    
    # today = datetime.today()
    # today = today + timedelta(days=0)
    # today = today.strftime('%Y%m%d')

    data = str(start)
    start_dt = date(int(data[0:4]), int(data[4:6]), int(data[6:8]))

    data = str(end)
    end_dt = date(int(data[0:4]), int(data[4:6]), int(data[6:8]))

    for dt in daterange(start_dt, end_dt):
        my_date = dt.strftime("%Y%m%d")  
        totalCount, df = crawl_mdcline(singleDate=my_date)

        if totalCount == 0:
            continue
        if not df.empty:
            engine = create_engine(db_connection_url)
            df.to_sql(name='mdcin_clinc_test_info_temp', con=engine, if_exists='replace')
            # note : need CREATE EXTENSION pgcrypto; psql >=12 , when using gen_random_uuid (),
            with engine.begin() as cn:
                sql = """INSERT INTO mdcin_clinc_test_info (id, 신청자, 승인일, 제품명, 시험제목, 연구실명, 임상단계)
                            SELECT gen_random_uuid (), t.신청자, t.승인일::integer, t.제품명, t.시험제목, t.연구실명, t.임상단계 
                            FROM mdcin_clinc_test_info_temp t
                            WHERE NOT EXISTS 
                                (SELECT 1 FROM mdcin_clinc_test_info f
                                WHERE t.신청자 = f.신청자 and t.승인일::integer = f.승인일 and t.제품명 = f.제품명 and t.임상단계 = f.임상단계)"""
                cn.execute(sql) 
    return                                            

def crawl_mdcline(singleDate):
    ''' 임상정보 크롤링'''
    # try:
    html = requests.get(MFDS['url'] + MFDS['serviceKey'] + "&numOfRows=100&pageNo=1&approval_time=" + str(singleDate)) #, timeout=10)
    # except requests.exceptions.Timeout: # 결과 없는 경우나 시간이 길어지면 stop
        # return 0, {}

    soup = BeautifulSoup(html.content, 'lxml')
    totalCount = soup.find("totalcount").get_text()
    if totalCount == '0':  # 결과 없으면
        return 0, {}
    items = ['apply_entp_name','approval_time','goods_name','lab_name','clinic_exam_title','clinic_step_name']
    item_names = ['신청자','승인일','제품명','연구실명','시험제목','임상단계']

    data = soup.find_all("item")
    rawdata = []
    for d in data:
        if d:
            res = {}
            for (idx, key) in enumerate(items):
                res[item_names[idx]] = d.find(key).get_text()

            rawdata.append(res)    

    df = pd.DataFrame(rawdata)            
    return totalCount, df    

def crawl_stock_search_top():
    ''' 네이버 금융 > 국내증시 > 검색상위 종목'''
    df = pd.read_html(NAVER['stock_search_top_url'], match = '종목명', header=0, encoding = 'euc-kr')[0]

    # remove null row
    df = df.iloc[1:]
    
    # convert values to numeric
    df[['순위','현재가', '전일비', '거래량', '시가', '고가', '저가']] = df[['순위','현재가', '전일비', '거래량', '시가', '고가', '저가']].fillna("0").astype(int)
    df[['PER', 'ROE']] = df[['PER', 'ROE']].fillna("0").astype(float).round(2)
    df['검색비율'] = df['검색비율'].str.replace('%', '').fillna("0").astype(float).round(2)
    df['등락률'] = df['등락률'].str.replace('%', '').fillna("0").astype(float).round(2)

    #remove null row
    df = df[df.순위 != 0]

    # add stockCode from model
    df['종목코드'] = [get_stockCode(corpName) for corpName in df['종목명']]
      
    result = df.to_dict('records')

    return JsonResponse(result, safe=False)

def crawl_stock_upper():
    ''' 네이버 금융 > 국내증시 > 상한가  + 상승'''
    result = []
    # 상한가
    df = pd.read_html(NAVER['stock_upper_url'], header=0, encoding = 'euc-kr')
    for i in [1,2]: # 2dn,3rd table
        mydf = df[i]
        # 필요한 row, column만
        # mydf = mydf.iloc[1:,0:11]
        mydf = mydf.iloc[1:,[3,4,5,6,7,11]]

        # convert values to numeric
        # mydf[['N','연속', '누적', '현재가', '전일비', '거래량', '시가', '고가', '저가']] = mydf[['N','연속', '누적', '현재가', '전일비', '거래량', '시가', '고가', '저가']].fillna("0").astype(int)
        mydf[['현재가', '전일비', '거래량']] = mydf[['현재가', '전일비', '거래량']].fillna("0").astype(int)
        mydf[['PER']] = mydf[['PER']].fillna("0").astype(float).round(2)
        mydf['등락률'] = mydf['등락률'].astype(str).str.replace('%', '').fillna("0").astype(float).round(2)

        #remove null row
        # mydf = mydf[mydf.N != 0]
        mydf = mydf[mydf.현재가 != 0]

        # add stockCode from model
        mydf['종목코드'] = [get_stockCode(corpName) for corpName in mydf['종목명']]
        
        result += mydf.to_dict('records')
    # 상승 - 기본탭 코스피
    df = pd.read_html(NAVER['stock_rise_url'], header=0, encoding = 'euc-kr')
    mydf = df[1]
    # 필요한 row, column만
    mydf = mydf.iloc[0:30,[1,2,3,4,5,10]]

    # convert values to numeric
    # mydf[['N','연속', '누적', '현재가', '전일비', '거래량', '시가', '고가', '저가']] = mydf[['N','연속', '누적', '현재가', '전일비', '거래량', '시가', '고가', '저가']].fillna("0").astype(int)
    mydf[['현재가', '전일비', '거래량']] = mydf[['현재가', '전일비', '거래량']].fillna("0").astype(int)
    mydf[['PER']] = mydf[['PER']].fillna("0").astype(float).round(2)
    mydf['등락률'] = mydf['등락률'].astype(str).str.replace('%', '').fillna("0").astype(float).round(2)

    #remove null row
    # mydf = mydf[mydf.N != 0]
    mydf = mydf[mydf.현재가 != 0]

    # add stockCode from model
    mydf['종목코드'] = [get_stockCode(corpName) for corpName in mydf['종목명']]
    
    result += mydf.to_dict('records')

    # 상승 - 코스닥
    df = pd.read_html(NAVER['stock_rise_url']+ '?sosok=1', header=0, encoding = 'euc-kr')
    mydf = df[1]
    # 필요한 row, column만
    mydf = mydf.iloc[0:30,[1,2,3,4,5,10]]

    # convert values to numeric
    # mydf[['N','연속', '누적', '현재가', '전일비', '거래량', '시가', '고가', '저가']] = mydf[['N','연속', '누적', '현재가', '전일비', '거래량', '시가', '고가', '저가']].fillna("0").astype(int)
    mydf[['현재가', '전일비', '거래량']] = mydf[['현재가', '전일비', '거래량']].fillna("0").astype(int)
    mydf[['PER']] = mydf[['PER']].fillna("0").astype(float).round(2)
    mydf['등락률'] = mydf['등락률'].astype(str).str.replace('%', '').fillna("0").astype(float).round(2)

    #remove null row
    # mydf = mydf[mydf.N != 0]
    mydf = mydf[mydf.현재가 != 0]

    # add stockCode from model
    mydf['종목코드'] = [get_stockCode(corpName) for corpName in mydf['종목명']]
    result += mydf.to_dict('records')

    result = sorted(result, key=lambda k : k["등락률"], reverse=True)


    return JsonResponse(result, safe=False)    

def crawl_stock_lower():
    ''' 네이버 금융 > 국내증시 > 하한가  + 하락'''
    result = []
    # 하한가
    df = pd.read_html(NAVER['stock_lower_url'], header=0, encoding = 'euc-kr')
    for i in [1,2]: # 2dn,3rd table
        mydf = df[i]
        # 필요한 row, column만
        # mydf = mydf.iloc[1:,0:11]
        mydf = mydf.iloc[1:,[3,4,5,6,7,11]]

        # convert values to numeric
        # mydf[['N','연속', '누적', '현재가', '전일비', '거래량', '시가', '고가', '저가']] = mydf[['N','연속', '누적', '현재가', '전일비', '거래량', '시가', '고가', '저가']].fillna("0").astype(int)
        mydf[['현재가', '전일비', '거래량']] = mydf[['현재가', '전일비', '거래량']].fillna("0").astype(int)
        mydf[['PER']] = mydf[['PER']].fillna("0").astype(float).round(2)
        mydf['등락률'] = mydf['등락률'].astype(str).str.replace('%', '').fillna("0").astype(float).round(2)

        #remove null row
        # mydf = mydf[mydf.N != 0]
        mydf = mydf[mydf.현재가 != 0]

        # add stockCode from model
        mydf['종목코드'] = [get_stockCode(corpName) for corpName in mydf['종목명']]
        
        result += mydf.to_dict('records')
    # 하락 - 기본탭 코스피 
    df = pd.read_html(NAVER['stock_fall_url'], header=0, encoding = 'euc-kr')
    mydf = df[1]
    # 필요한 row, column만
    mydf = mydf.iloc[0:30,[1,2,3,4,5,10]]

    # convert values to numeric
    # mydf[['N','연속', '누적', '현재가', '전일비', '거래량', '시가', '고가', '저가']] = mydf[['N','연속', '누적', '현재가', '전일비', '거래량', '시가', '고가', '저가']].fillna("0").astype(int)
    mydf[['현재가', '전일비', '거래량']] = mydf[['현재가', '전일비', '거래량']].fillna("0").astype(int)
    mydf[['PER']] = mydf[['PER']].fillna("0").astype(float).round(2)
    mydf['등락률'] = mydf['등락률'].astype(str).str.replace('%', '').fillna("0").astype(float).round(2)

    #remove null row
    # mydf = mydf[mydf.N != 0]
    mydf = mydf[mydf.현재가 != 0]

    # add stockCode from model
    mydf['종목코드'] = [get_stockCode(corpName) for corpName in mydf['종목명']]
    
    result += mydf.to_dict('records')

    # 하락 - 코스닥 
    df = pd.read_html(NAVER['stock_fall_url'] + '?sosok=1', header=0, encoding = 'euc-kr')
    mydf = df[1]
    # 필요한 row, column만
    mydf = mydf.iloc[0:30,[1,2,3,4,5,10]]

    # convert values to numeric
    # mydf[['N','연속', '누적', '현재가', '전일비', '거래량', '시가', '고가', '저가']] = mydf[['N','연속', '누적', '현재가', '전일비', '거래량', '시가', '고가', '저가']].fillna("0").astype(int)
    mydf[['현재가', '전일비', '거래량']] = mydf[['현재가', '전일비', '거래량']].fillna("0").astype(int)
    mydf[['PER']] = mydf[['PER']].fillna("0").astype(float).round(2)
    mydf['등락률'] = mydf['등락률'].astype(str).str.replace('%', '').fillna("0").astype(float).round(2)

    #remove null row
    # mydf = mydf[mydf.N != 0]
    mydf = mydf[mydf.현재가 != 0]

    # add stockCode from model
    mydf['종목코드'] = [get_stockCode(corpName) for corpName in mydf['종목명']]
    mydf = mydf.sort_values(by='등락률', ascending=False)

    result += mydf.to_dict('records') 
    result = sorted(result, key=lambda k : k["등락률"])

    return JsonResponse(result, safe=False)    


def get_stockCode(corpName):
    listed = Listed_corp.objects.filter(회사명=corpName)
    if listed.exists():
        rows = list(listed.values())
        row = rows[0]
        return row['종목코드']   
    else:
        return None      

def crawl_stock(request):
    ''' 
    * dataframe 스타일로 rebuild
    page 1 부터 crawling -> if exist at db ? 
              yes -> return
              no -> Stock_quotes.objects.create(**newStock)
    '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        stockCode = data["stockCode"]

        # exist ? {
        try:
            stockQuotes = Stock_quotes.objects.filter(stock_code=stockCode).latest('price_date')
            maxRecordDate = stockQuotes.price_date if stockQuotes else None
        except:
            maxRecordDate = None

        # exist ? }

        # get last page num
        url = NAVER['stock_sese_day_url'] + stockCode
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

            df = pd.read_html(NAVER['stock_sese_day_url'] + stockCode +'&page='+ str(page), match = '날짜', header=0, encoding = 'euc-kr')[0]

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
                    newStock = {
                        'stock_code': stockCode,
                        'price_date': price_date,
                        'stock': df.iloc[index].tolist(),
                        'volume' : df.iloc[index]['거래량']
                    }

                    if maxRecordDate and maxRecordDate.date() > minDate.date():
                        # print ("current page content is in db partially")
                        if maxRecordDate and maxRecordDate.date() == price_date.date():
                            # print("match today")
                            Stock_quotes.objects.filter(stock_code=stockCode, price_date=price_date).update(**newStock)
                        elif maxRecordDate and maxRecordDate.date() < price_date.date():
                            # print("db date is lower then price_date")    
                            Stock_quotes.objects.create(**newStock)
                    else:
                        # print("db date is older then the page")
                        Stock_quotes.objects.create(**newStock)


            # True after waiting the today's stock was updated; skip next page crawl
            if maxRecordDate and maxRecordDate.date() == maxDate.date():
                isCrawlBreak = True                      
    return

### financial_crawler start - 현재사용안함 (사용하려면 return 값 수정필요)

def sectorPer(df):
    ''' df[0] : '업종PER' '''
    mylist = df.iloc[0].values[0].replace('  ', ' ').split(' ')
    for (idx, val) in enumerate(mylist):
        if val == '업종PER':
            return {'업종PER(배)' : str2round(mylist[idx + 1]) }

    return {'업종PER(배)' : 0}

def fundamental(df):
    ''' df[5] :  'PER', 'PBR', 'EPS', 'BPS', '현금DPS', '현금배당수익률' '''

    result = {}

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
            result[name] = bVal if cVal.isnull().values.any() else cVal
        except:
            result[name] = bVal

    for name in ['PER','PBR']:
        result[name] = result[name].fillna(0).astype(float).to_list()[0]

    for name in ['EPS','BPS','현금DPS']:
        try: 
            result[name] = result[name].str.replace('원','').str.replace(',', '').fillna(0).astype(int).to_list()[0]
        except: # 원 없고 null
            result[name] = 0
    # change name        
    result['현금DPS(원)'] = result['현금DPS']
    del result['현금DPS']
    
    try:
        result['현금배당수익률'] = result['현금배당수익률'].str.replace('%', '').fillna(0).astype(float).to_list()[0]
    except:
        result['현금배당수익률'] = 0 # 숫자없고 %만 있는 경우

    return result

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
  
    return {'영업이익(Y/Y)' : str2round(jbun[3]),'당기순이익(Y/Y)' : str2round(jbun[8]), '영업이익(Q/Q)' : str2round(jbun[4]),'당기순이익(Q/Q)' : str2round(jbun[9])}


def stockVolume(df):
    ''' df[1] : '거래량','시가총액' '''
    result = {}
    df.columns = ['A','B']
    result['거래량'] = df.loc[df['A'] == '거래량/거래대금', 'B'].str.split('주 /').str[0].str.replace(',', '').fillna(0).astype(int).to_list()[0]
    result['시가총액'] = df.loc[df['A'] == '시가총액', 'B'].str.replace('억원','').str.replace(',', '').fillna(0).astype(int).to_list()[0]

    return result

def get_date_str(s):
    result = ''
    r = re.search("\\d{4}/\\d{2}", s)
    if r:
        result = r.group()
        # result = result.replace('/', '-')

    return result

def financialSummary(df, PER):
    ''' df[12] : '매출액','영업이익','당기순이익','자산총계','부채총계','자본총계','자본총계(지배)','부채비율','BPS(원)','PBR(배)','발행주식수(보통주)' 
    'ROE(%)','ROA(%)','EPS(원)','PER(배)' 는 최근분기 사용
    PER : PEGR 만들때 사용
    '''
    result={}
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
        result[name] = my_df[name].fillna(0).astype(int).to_list()[0]

    result['부채비율(%)'] = my_df['부채비율'].fillna(0).astype(float).to_list()[0]

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
        result['EPS(%)'] = 0
    else:
        if x[0] <= 0 or x[-1] <= 0:
            result['EPS(%)'] = 0
        else:          
            try:
                result['EPS(%)'] = ((x[:-1] / x[0])**(1/(x_len - 1))-1) * 100
            except:
                result['EPS(%)'] = 0

    if result['EPS(%)'] == 0:
        result['PEGR(배)'] = 0
    else:
        if PER >= 0:          
            try:
                result['PEGR(배)'] = PER / result['EPS(%)']
                result['PEGR(배)'] = str2round(result['PEGR(배)'])
            except:        
                result['PEGR(배)'] = 0    
 
    df_l = df.loc[:,~df.columns.duplicated(keep='last')]  # 중복된건 나중것만
    df_l = df_l.T

    # 최근 분기에서 4가지
    my_q_df_cols = ['ROE(%)','ROA(%)','PER(배)','PBR(배)']
         
    my_q_df = df_l.loc[[cols[6]],my_q_df_cols] # 7번째 cols ; '2020/06'       

    for name in my_q_df_cols:
        result[name] = my_q_df[name].fillna(0).astype(float).to_list()[0]


    # 재무 field
    # 형태 { "date" : ['2017/12','2018/12','2019/12','2019/12','2020/03','2020/06'], "dataset": [[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0]]}

    result_financial = { "dateY" : cols[:4], "dateQ": cols[4:], "valueY": [], "valueQ": []}
    my_list = [[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0]]
    y_list = [[0, 0, 0, 0],[0, 0, 0, 0],[0, 0, 0, 0],[0, 0, 0, 0],[0, 0, 0, 0],[0, 0, 0, 0]]
    q_list = [[0, 0, 0, 0],[0, 0, 0, 0],[0, 0, 0, 0],[0, 0, 0, 0],[0, 0, 0, 0],[0, 0, 0, 0]]
    my_list = [[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0]]

    for (idx, name) in enumerate(['매출액','영업이익','당기순이익','부채비율','자본유보율','현금배당성향(%)']):
        if name in ['매출액','영업이익','당기순이익','자본유보율']:
            my_list[idx] = df.loc[name,:].fillna(0).astype(float).astype(int).to_list()
        if name in ['부채비율','현금배당성향(%)']:
            my_list[idx] = df.loc[name,:].fillna(0).astype(float).to_list()

    # split half
    for (idx, d) in enumerate(my_list):
        y_list[idx] = d[:4]
        q_list[idx] = d[4:]

    result_financial['valueY'] = y_list
    result_financial['valueQ'] = q_list

    return result, result_financial


def employee_listingdate_research(df):
    ''' 기업개요 - df[1] : 종업원수,상장일, df[4]: 연구개발비 '''
    result = {}
    
    # C,D 컬럼이 안읽힐경우 C, D 포기
    df[1].columns = ['A','B','C','D'][:len(df[1].columns)]
        
    result['상장일'] = df[1].loc[df[1]['A'] =='설립일', 'B'].str.split('상장일: ').str[1].str.replace('/','.').str.replace(')','').to_list()[0]  
    try:
        result['종업원수'] = df[1].loc[df[1]['C'] =='종업원수', 'D'].str.strip().str.split(r' \(').str[0].str.replace(',','').fillna(0).astype(int).to_list()[0]
    except: # 종업원수 null
        result['종업원수'] = 0       
    try:       
        result['연구개발비(연)'] = df[4]['연구개발비용지출총액'].fillna(0).astype(int).to_list()[0]
    except:        
        result['연구개발비(연)'] = 0

    return result

def current_assets_Total_liabilities(df):
    ''' 유동자산, 부채총계 '''
    result = {}

    try:        
        df.columns = ['A','B','C','D','E','F','G','H','I'][:len(df.columns)]
    except:
        pass        

    result['유동자산'] = 0
    try:
        result['유동자산'] = df.loc[df['A'] =='유동자산', 'E'].fillna(0).astype(float).to_list()[0]
    except:
        pass        
    try:
        result['유동자산'] = df.loc[df['A'] =='유동자산', 'F'].fillna(0).astype(float).to_list()[0]
    except:
        pass

    result['부채총계'] = 0
    try:
        result['부채총계'] = df.loc[df['A'] =='부채총계', 'E'].fillna(0).astype(float).to_list()[0]
    except:
        pass        
    try:
        result['부채총계'] = df.loc[df['A'] =='부채총계', 'F'].fillna(0).astype(float).to_list()[0]
    except:
        pass


    return result    

def calculate_stock_fair_value(r):
    '''
    적정주가 계산식
    '''
    result = {}    
    result['기업가치(백만)'] = r['자본총계(지배)']+(r['자본총계(지배)']*(r['ROE(%)']-7.9)/7.9)
    result['기업가치(백만)'] = int(result['기업가치(백만)'])

    sumCnt = 5
    if r['PER(배)'] > 0 and r['EPS(원)'] > 0:
        result['적(1)PER*EPS'] = r['PER(배)'] * r['EPS(원)']   #적정주가(1)PER*EPS
        result['적(1)PER*EPS'] =  int(result['적(1)PER*EPS'])     
    else:        
        result['적(1)PER*EPS'] = 0
        sumCnt -= 1

    if r['ROE(%)'] > 0 and r['EPS(원)'] > 0:
        result['적(2)ROE*EPS'] = r['ROE(%)'] * r['EPS(원)']    #적정주가(2)ROE*EPS
        result['적(2)ROE*EPS'] = int(result['적(2)ROE*EPS'])
    else:
        result['적(2)ROE*EPS'] = 0         
        sumCnt -= 1    

    if r['EPS(원)'] > 0:
        result['적(3)EPS*10'] =  r['EPS(원)']*10    #적정주가(3)EPS*10
        result['적(3)EPS*10'] = int(result['적(3)EPS*10'])
    else:        
        result['적(3)EPS*10'] = 0
        sumCnt -= 1  

    try:
        result['적(4)s-rim'] = result['기업가치(백만)']/ r['발행주식수(보통주)']*100000000 #100000000     #적정주가(4)s-rim
        result['적(4)s-rim'] = int(result['적(4)s-rim'])
        if result['적(4)s-rim'] < 0:
            result['적(4)s-rim'] = 0
    except:
         result['적(4)s-rim'] = 0
    finally:         
        if result['적(4)s-rim'] == 0:
            sumCnt -= 1         

    try:
        result['적(5)당기순이익*PER'] = r['당기순이익'] * r['PER(배)'] * 100000000 / r['발행주식수(보통주)'] #100000000    #적정주가(5)당기순이익*PER
        result['적(5)당기순이익*PER'] = int(result['적(5)당기순이익*PER'])
        if result['적(5)당기순이익*PER'] < 0:
            result['적(5)당기순이익*PER'] = 0        
    except:
        result['적(5)당기순이익*PER'] = 0
    finally:         
        if  result['적(5)당기순이익*PER'] == 0:
            sumCnt -= 1         

    try:
        result['추천매수가'] = (r['자본총계(지배)']+r['자본총계(지배)']*(r['ROE(%)']-7.9)/7.9*(0.8/(1+7.9-0.8)))/r['발행주식수(보통주)']*100000000 #100000000    #적정매수가
        result['추천매수가'] = int(result['추천매수가'])
    except:
        result['추천매수가'] = 0
        
    try:
        result['적정가평균'] = sum([result['적(1)PER*EPS'],result['적(2)ROE*EPS'],result['적(3)EPS*10'],result['적(4)s-rim'],result['적(5)당기순이익*PER']]) / sumCnt
        result['적정가평균'] = int(result['적정가평균'])
        if result['적정가평균'] < 0:
            result['적정가평균'] = 0
    except:
        result['적정가평균'] = 0

    try:
        result['갭1'] = (1 - r['전일종가'] / result['적(1)PER*EPS']) * 100    #1-전일종가/적정가평균*100
        result['갭1'] = str2round(result['갭1'],0)
    except:
        result['갭1'] = 0
        
    try:
        result['갭2'] = (1 - r['전일종가'] / result['적(2)ROE*EPS']) * 100    #1-전일종가/적정가평균*100
        result['갭2'] = str2round(result['갭2'],0)
    except:
        result['갭1'] = 0    
        
    try:
        result['갭3'] = (1 - r['전일종가'] / result['적(3)EPS*10']) * 100    #1-전일종가/적정가평균*100
        result['갭3'] = str2round(result['갭3'],0)
    except:
        result['갭1'] = 0    
        
    try:
        result['갭4'] = (1 - r['전일종가'] / result['적(4)s-rim']) * 100    #1-전일종가/적정가평균*100
        result['갭4'] = str2round(result['갭4'],0)
    except:
        result['갭1'] = 0    
        
    try:
        result['갭5'] = (1 - r['전일종가'] / result['적(5)당기순이익*PER']) * 100    #1-전일종가/적정가평균*100
        result['갭5'] = str2round(result['갭5'],0)
    except:
        result['갭1'] = 0    

    if result['적정가평균'] >  r['전일종가']:                  #(평균목표가 - 현재가) / 평균목표가
        result['기대수익률'] = (result['적정가평균'] - r['전일종가']) / result['적정가평균'] *100
        result['기대수익률'] = round(result['기대수익률'],0)
    else:
        result['기대수익률'] = 0    

    if r['업종PER(배)'] > 0:                                # 기업 per 비율
        result['PER갭(%)'] = r['PER(배)'] / r['업종PER(배)'] *100
        result['PER갭(%)'] = round(result['PER갭(%)'],1)        
    else:
        result['PER갭(%)'] = 0

    try:
        result['PRR(배)'] = r['시가총액'] / r['연구개발비(연)'] * 100 # 단위 보정 ; 억원 / 백만원
        result['PRR(배)'] = round(result['PRR(배)'],2)        
    except:
        result['PRR(배)'] = 0

    try:
        result['주당R&D(원)'] = r['연구개발비(연)'] / r['발행주식수(보통주)'] * 1000000 # 단위 보정 ; 백만원 / 원
        result['주당R&D(원)'] = int(result['주당R&D(원)'])        
    except:
        result['주당R&D(원)'] = 0
    finally:
        if not result['주당R&D(원)']:
            result['주당R&D(원)'] = 0

    # 가격성장흐름(PGF)
    try: 
        result['PGF(%)'] = (result['주당R&D(원)'] + r['EPS(원)'] ) / r['전일종가'] * 100
        result['PGF(%)'] = int(result['PGF(%)'])        
    except:
        result['PGF(%)'] = 0
    finally:
        if not result['PGF(%)']:
            result['PGF(%)'] = 0

    # NCAV(억) : 유동자산 - 부채총계
    # NCAV(%) : NCAV(유동자산-부채총계) / (시가총액(억)*1.5)
    try:
        result['NCAV(억)'] = r['유동자산'] - r['부채총계']
        result['NCAV(억)'] = round(result['NCAV(억)'],1)    
    except:
        result['NCAV(억)'] = 0
    try:            
        result['NCAV(%)'] = result['NCAV(억)'] / (r['시가총액(억)']*1.5)
        result['NCAV(%)'] = round(result['NCAV(%)'],2)
    except:        
        result['NCAV(%)'] = 0

    return result

def financial_crawler(request):
    #code = 종목번호
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
    stockCode = data["stockCode"]

    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("--remote-debugging-port=9222")
    options.headless = True
    browser = webdriver.Chrome(executable_path="/usr/bin/chromedriver",options=options)

    url = NAVER['finance_sum_url'] + stockCode
    browser.get(url)


    # 상장폐지되어 자료없는 경우 - NoSuchElementException 
    try:
        browser.find_element_by_class_name('no_data') # <div class="no_data">
        return JsonResponse(empty_dict, safe=False)
    except:
        pass    
    
    
    #frame구조에 들어가기
    try:
        browser.switch_to.frame(browser.find_element_by_id('coinfo_cp'))
    except:
        return JsonResponse(empty_dict, safe=False)      
    
    # page not found handle
    # 상장된지 얼마안되서 자료없는 경우인듯
    try:
        browser.find_element_by_id('pageError') # <div id="pageError">
        return JsonResponse(empty_dict, safe=False)
    except:
        pass       

    #재무제표 "전체" 클릭하기
    try:
        browser.find_elements_by_xpath('//*[@id="cns_Tab20"]')[0].click()
    except:
        return JsonResponse(empty_dict, safe=False)

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

    result = {}

    nowPrice = html1.find_all('strong')[0].get_text().strip()
    result.update({'전일종가' : str2int(nowPrice) })

    result.update(sectorPer(df[0]))

    result.update(fundamental(df[5]))

    result.update(qPrice(df[6]))

    result.update(stockVolume(df[1]))

    temp_res, second_res = financialSummary(df[12], result['PER'])
    result.update(temp_res)

    wait = WebDriverWait(browser, 10)

    browser.find_elements_by_xpath('//*[@id="header-menu"]/div[1]/dl/dt[2]')[0].click() # "기업개요" 클릭하기
    wait.until(EC.presence_of_element_located((By.XPATH,'//*[@id="cTB201"]')))
    df = pd.read_html(browser.page_source, header=0, encoding = 'euc-kr')
    result.update(employee_listingdate_research(df))


    browser.find_elements_by_xpath('//*[@id="header-menu"]/div[1]/dl/dt[3]')[0].click() # "재무분석" 클릭하기
    # browser.find_elements_by_xpath('//*[@id="rpt_tab2"]')[0].click() # "재무분석" > "재무상태표" 클릭
    childTab = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="rpt_tab2"]'))) # "재무분석" > "재무상태표" 클릭
    childTab.click()
    wait.until(EC.presence_of_element_located((By.XPATH,'//*[@id="chart2"]')))

    df = pd.read_html(browser.page_source, header=0, encoding = 'euc-kr')
    result.update(current_assets_Total_liabilities(df[5]))

    result.update(calculate_stock_fair_value(result))

    # save data in db if necessary
    listedCorp = Listed_corp.objects.get(종목코드=stockCode)
    
    listedCorp.정보 = result
    listedCorp.save(update_fields=['정보'])

    listedCorp = Listed_corp.objects.get(종목코드=stockCode)
    listedCorp.재무 = second_res
    listedCorp.save(update_fields=['재무'])    
   
    return JsonResponse(result, safe=False) 

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
    '현금DPS(원)': 0,
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