# app
import requests
import json
import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime
from bs4 import BeautifulSoup
from django.http import JsonResponse, HttpResponse
from urllib.request import urlopen
import uuid

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

from search.models import listed_corp
from .models import disclosure_report, stock_quotes

DART = settings.DART
MFDS = settings.MFDS
NAVER = settings.NAVER

DATABASES =settings.DATABASES

db_connection_url = "postgresql://{}:{}@{}:{}/{}".format(
    DATABASES['default']['USER'],
    DATABASES['default']['PASSWORD'],
    DATABASES['default']['HOST'],
    DATABASES['default']['PORT'],
    DATABASES['default']['NAME'],
)

def update_today_disclosure_report():
    today = datetime.today().strftime('%Y%m%d')
    total_page, df = crawl_disclosure_report(bgn_de=today, end_de=today, page_no='1', page_count = '100')
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
                            WHERE t.접수번호 = f.접수번호)"""

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
    else:
        return False
    df = pd.DataFrame(data,columns=item_names)

    return json_dict['total_page'], df

def update_today_crawl_mdcline():
    today = datetime.today().strftime('%Y%m%d')
    df = crawl_mdcline(today)
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

def crawl_mdcline(singleDate):
    ''' 임상정보 크롤링'''
    html = requests.get(MFDS['url'] + MFDS['serviceKey'] + "&numOfRows=100&pageNo=1&approval_time=" + singleDate)
    soup = BeautifulSoup(html.content, 'lxml')
    data = soup.find_all("item")
    rawdata = []
    for d in data:
        citingNo = d.find('apply_entp_name').get_text()
        if citingNo:
            res = {'신청자' : citingNo, '승인일' : d.find("approval_time").get_text(), '제품명' : d.find("goods_name").get_text(),'연구실명' : d.find("lab_name").get_text(), '시험제목' : d.find("clinic_exam_title").get_text(),'임상단계' : d.find("clinic_step_name").get_text()}
            rawdata.append(res)    

    df = pd.DataFrame(rawdata)            
    return df    

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
      
    res = df.to_dict('records')

    return JsonResponse(res, safe=False)

def get_stockCode(corpName):
    listed = listed_corp.objects.filter(회사명=corpName)
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
              no -> stock_quotes.objects.create(**newStock)
    '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        stockCode = data["stockCode"]

        # exist ? {
        try:
            stockQuotes = stock_quotes.objects.filter(stock_code=stockCode).latest('price_date')
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
                            stock_quotes.objects.filter(stock_code=stockCode, price_date=price_date).update(**newStock)
                        elif maxRecordDate and maxRecordDate.date() < price_date.date():
                            # print("db date is lower then price_date")    
                            stock_quotes.objects.create(**newStock)
                    else:
                        # print("db date is older then the page")
                        stock_quotes.objects.create(**newStock)


            # True after waiting the today's stock was updated; skip next page crawl
            if maxRecordDate and maxRecordDate.date() == maxDate.date():
                isCrawlBreak = True                      
    return