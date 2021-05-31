# app
import requests
import json
import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from django.http import JsonResponse

import math
pd.set_option('display.float_format', '{:,.2f}'.format)

# astype(int) error handle
import numpy
from psycopg2.extensions import register_adapter, AsIs
def addapt_numpy_float64(numpy_float64):
    return AsIs(numpy_float64)
def addapt_numpy_int64(numpy_int64):
    return AsIs(numpy_int64)
register_adapter(numpy.float64, addapt_numpy_float64)
register_adapter(numpy.int64, addapt_numpy_int64)


from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from search.models import Listed_corp
from ..models import Stock_quotes 

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

def update_today_corp_report():
    def crawl_corp_report(**kwargs):
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
            return 0, None # TODO

    today = datetime.today().strftime('%Y%m%d')
    total_page, df = crawl_corp_report(bgn_de=today, end_de=today, page_no='1', page_count = '100')
    if total_page == 0: 
        return
    for i in range(1, total_page + 1):
        if i > 1: # df already have at first
            _, df = crawl_corp_report(bgn_de=today, end_de=today, page_no=i, page_count = '100')

        engine = create_engine(db_connection_url)

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
                         
def update_today_crawl_mdcline():
    ''' 2021년부터 이상하게 바뀐 api 적용 '''
    def crawl_mdcline(pageNo):
        ''' 임상정보 크롤링'''
        # 2021년이후 stdt이 안먹힘 ;totalCount / numOfRows (ex. 8434 / 100 = 84)를 pageNo에 넣어 최신 정보 얻게 고침

        # try:
        html = requests.get(MFDS['url'] + MFDS['serviceKey'] + "&numOfRows=100&pageNo=" + str(pageNo))
        # except requests.exceptions.Timeout: # 결과 없는 경우나 시간이 길어지면 stop
            # return 0, {}

        soup = BeautifulSoup(html.content, 'lxml')
        try:
            totalCount = soup.find("totalcount").get_text()
        except AttributeError:
            print('api error')
            return 0, {}

        if totalCount == '0':
            return 0, {}

        items = ['apply_entp_name','approval_time','goods_name','lab_name','clinic_exam_title','clinic_step_name']
        item_names = ['신청자','승인일','제품명','연구실명','시험제목','임상단계']

        data = soup.find_all("item")
        rawdata = []
        for d in data:
            if d:
                res = {}
                for (idx, key) in enumerate(items):
                    if key == 'approval_time':
                        foo = d.find(key).get_text()
                        res[item_names[idx]] = foo[:-9]
                    else:                    
                        res[item_names[idx]] = d.find(key).get_text()

                rawdata.append(res)    

        df = pd.DataFrame(rawdata)            
        return df    
    

    def get_mdcline_total_count():
        ''' totalCount로 마지막 pageNo 얻기 '''
        html = requests.get(MFDS['url'] + MFDS['serviceKey'] + "&numOfRows=1&pageNo=1")
        soup = BeautifulSoup(html.content, 'lxml')
        result = int(soup.find("totalcount").get_text())
        return result
    try:
        foo = math.floor(get_mdcline_total_count() / 100)
    except AttributeError:
        return        

    for pageNo in [foo, foo+1]: # 누락방지위해 전 pageNo도 크롤 ex. 8438 -> pageNo 84, 85
        df = crawl_mdcline(pageNo)
  
        if not df.empty and df['승인일'].ne('').values.all():
            engine = create_engine(db_connection_url)
            df.to_sql(name='mdcin_clinc_test_info_temp', con=engine, if_exists='replace')
            # note : need CREATE EXTENSION pgcrypto; psql >=12 , when using gen_random_uuid (),
            with engine.begin() as cn:
                sql = """INSERT INTO mdcin_clinc_test_info (id, 신청자, 승인일, 제품명, 시험제목, 연구실명, 임상단계)
                            SELECT gen_random_uuid (), t.신청자, t.승인일::date, t.제품명, t.시험제목, t.연구실명, t.임상단계 
                            FROM mdcin_clinc_test_info_temp t
                            WHERE NOT EXISTS 
                                (SELECT 1 FROM mdcin_clinc_test_info f
                                WHERE t.신청자 = f.신청자 and t.승인일::date = f.승인일 and t.제품명 = f.제품명 and t.임상단계 = f.임상단계)"""
                cn.execute(sql) 
    return                                            

def get_stock_search_top(request):
    ''' 네이버 금융 > 국내증시 > 검색상위 종목'''
    df = pd.read_html(NAVER['stock_search_top_url'], match = '종목명', header=0, encoding = 'euc-kr')[0]

    # remove null row
    df = df.iloc[1:]
    # convert values to numeric
    df[['순위','현재가', '전일비', '거래량', '시가', '고가', '저가']] = df[['순위','현재가', '전일비', '거래량', '시가', '고가', '저가']].fillna("0").astype(int)
    df[['PER', 'ROE']] = df[['PER', 'ROE']].fillna("0").astype(float).round(2)
    df['검색비율'] = df['검색비율'].str.replace('%', '').fillna("0").astype(float).round(2)
    df['등락률'] = df['등락률'].str.replace('%', '').fillna("0").astype(float).round(2)

    # remove null row
    df = df[df.순위 != 0]

    # add stockCode from model
    df['종목코드'] = [get_stockCode(corpName) for corpName in df['종목명']]
    df['회사명'] = [get_commonCorpName(corpName) for corpName in df['종목명']]
      
    rows = df.to_dict('records')
    result = { "rowsCount" : 30 , "rows": rows}


    return JsonResponse(result, safe=False)


def get_stock_theme(request):
    
    response = requests.get(NAVER['stock_theme_url'])    
    html = response.text
    soup = BeautifulSoup(html, 'html.parser')

    stock_theme_list = soup.select('div#contentarea_left > table.type_1.theme td.col_type1 > a[href]')

    df = pd.read_html(NAVER['stock_theme_url'], match = '테마명', header = 0, encoding = 'euc-kr')[0]
    
    df = df.iloc[1:]
    df.rename(
        columns = {
        '전일대비 등락현황' : '상승',
        '전일대비 등락현황.1' : '보합',
        '전일대비 등락현황.2' : '하락',
        '주도주' : '주도주1',
        '주도주.1' : '주도주2'
        }, inplace = True)

    df['전일대비'] = df['전일대비'].str.replace('%', '').fillna("0").astype(float).round(2)
    df['최근3일등락률(평균)'] = df['최근3일등락률(평균)'].str.replace('%', '').fillna("0").astype(float).round(2)

    df = df[df.전일대비 != 0]    

    rows = df.to_dict('records')
    result = { 'rowsCount' : 30, 'rows' : rows[:30] }
    
    for i in range(0,30):
        theme_num = stock_theme_list[i]['href'].split('=')[-1]
        rows[i]['theme_url'] = theme_num

    return JsonResponse(result, safe=False)


def get_theme_detail(request):
    data = json.loads(request.body)
    url =  'https://finance.naver.com/sise/sise_group_detail.nhn?type=theme&no=' + data['theme_url']

    df = pd.read_html(url, match = '종목명', header = 0, encoding = 'euc-kr')[0]
    df = df[['종목명','현재가','전일비','등락률','매수호가','매도호가','거래량','거래대금','전일거래량']]
    
    df[['현재가', '전일비', '매수호가', '매도호가', '거래량', '거래대금', '전일거래량']] = df[['현재가', '전일비', '매수호가', '매도호가', '거래량', '거래대금', '전일거래량']].fillna('0').astype(int)
    df['등락률'] = df['등락률'].str.replace('%', '').fillna('0').astype(float).round(2)

    df = df[df.현재가 != 0]
    rows = df.to_dict('records')

    return JsonResponse(rows, safe=False)


def get_stock_group(request):

    response = requests.get(NAVER['stock_group_url'])
    html = response.text
    soup = BeautifulSoup(html, 'html.parser')

    stock_group_list = soup.select('div#contentarea_left > table tr > td > a[href]')

    df = pd.read_html(NAVER['stock_group_url'], match = '업종명', header = 0, encoding = 'euc-kr')[0]
    df = df.iloc[1:]

    df.rename(
        columns = {
            '전일대비 등락현황' : '전체',
            '전일대비 등락현황.1' : '상승',
            '전일대비 등락현황.2' : '보합',
            '전일대비 등락현황.3' : '하락',
        }, inplace = True)
    
    df = df[['업종명', '전일대비', '전체', '상승', '보합', '하락']]
    df['전일대비'] = df['전일대비'].str.replace('%', '').fillna('0').astype(float).round(2)
    df['전체'] = df['전체'].fillna('0').astype(int)

    df = df[df.전체 != 0]
    rows = df.to_dict('records')

    for i in range(0, len(rows)):
        group_num = stock_group_list[i]['href'].split('=')[-1]
        rows[i]['group_num'] = group_num

    return JsonResponse(rows, safe=False)


def get_group_detail(request):
    
    data = json.loads(request.body)
    url = 'https://finance.naver.com/sise/sise_group_detail.nhn?type=upjong&no=' + data['group_num']

    df = pd.read_html(url, match = '종목명', header = 0, encoding = 'euc-kr')[0]
    df = df[['종목명','현재가','전일비','등락률','매수호가','매도호가','거래량','거래대금','전일거래량']]

    df[['현재가', '전일비', '매수호가', '매도호가', '거래량', '거래대금', '전일거래량']] = df[['현재가', '전일비', '매수호가', '매도호가', '거래량', '거래대금', '전일거래량']].fillna('0').astype(int)
    df['등락률'] = df['등락률'].str.replace('%', '').fillna('0').astype(float).round(2)

    df = df[df.현재가 != 0]
    rows = df.to_dict('records')

    return JsonResponse(rows, safe=False)


def get_stock_upper(request):
    ''' 네이버 금융 > 국내증시 > 상한가  + 상승'''
    rows = []
    # 상한가
    df = pd.read_html(NAVER['stock_upper_url'], header = 0, encoding = 'euc-kr')
    for i in [1,2]: # 2dn,3rd table
        mydf = df[i]
        # 필요한 row, column만
        # mydf = mydf.iloc[1:,0:11]
        mydf = mydf.iloc[1:,[3,4,5,6,7,11]]

        # convert values to numeric
        mydf[['현재가', '전일비', '거래량']] = mydf[['현재가', '전일비', '거래량']].fillna("0").astype(int)
        mydf[['PER']] = mydf[['PER']].fillna("0").astype(float).round(2)
        mydf['등락률'] = mydf['등락률'].astype(str).str.replace('%', '').fillna("0").astype(float).round(2)

        # remove null row
        # mydf = mydf[mydf.N != 0]
        mydf = mydf[mydf.현재가 != 0]

        # add stockCode from model
        mydf['종목코드'] = [get_stockCode(corpName) for corpName in mydf['종목명']]
        mydf['회사명'] = [get_commonCorpName(corpName) for corpName in mydf['종목명']]

        
        rows += mydf.to_dict('records')
        
    # 상승 - 기본탭 코스피
    df = pd.read_html(NAVER['stock_rise_url'], header=0, encoding = 'euc-kr')
    mydf = df[1]
    # 필요한 row, column만
    mydf = mydf.iloc[0:30,[1,2,3,4,5,10]]

    # convert values to numeric
    mydf[['현재가', '전일비', '거래량']] = mydf[['현재가', '전일비', '거래량']].fillna("0").astype(int)
    mydf[['PER']] = mydf[['PER']].fillna("0").astype(float).round(2)
    mydf['등락률'] = mydf['등락률'].astype(str).str.replace('%', '').fillna("0").astype(float).round(2)

    # remove null row
    # mydf = mydf[mydf.N != 0]
    mydf = mydf[mydf.현재가 != 0]

    # add stockCode from model
    mydf['종목코드'] = [get_stockCode(corpName) for corpName in mydf['종목명']]
    mydf['회사명'] = [get_commonCorpName(corpName) for corpName in mydf['종목명']]
    
    rows += mydf.to_dict('records')

    # 상승 - 코스닥
    df = pd.read_html(NAVER['stock_rise_url']+ '?sosok=1', header=0, encoding = 'euc-kr')
    mydf = df[1]
    # 필요한 row, column만
    mydf = mydf.iloc[0:30,[1,2,3,4,5,10]]

    # convert values to numeric
    mydf[['현재가', '전일비', '거래량']] = mydf[['현재가', '전일비', '거래량']].fillna("0").astype(int)
    mydf[['PER']] = mydf[['PER']].fillna("0").astype(float).round(2)
    mydf['등락률'] = mydf['등락률'].astype(str).str.replace('%', '').fillna("0").astype(float).round(2)

    # remove null row
    # mydf = mydf[mydf.N != 0]
    mydf = mydf[mydf.현재가 != 0]

    # add stockCode from model
    mydf['종목코드'] = [get_stockCode(corpName) for corpName in mydf['종목명']]
    mydf['회사명'] = [get_commonCorpName(corpName) for corpName in mydf['종목명']]

    rows += mydf.to_dict('records')

    rows = sorted(rows, key=lambda k : k["등락률"], reverse=True)

    result = { "rowsCount" : len(rows) , "rows": rows}
    return JsonResponse(result, safe=False)    

def get_stock_lower(request):
    ''' 네이버 금융 > 국내증시 > 하한가  + 하락'''
    rows = []
    # 하한가
    df = pd.read_html(NAVER['stock_lower_url'], header=0, encoding = 'euc-kr')
    for i in [1,2]: # 2dn,3rd table
        mydf = df[i]
        # 필요한 row, column만
        # mydf = mydf.iloc[1:,0:11]
        mydf = mydf.iloc[1:,[3,4,5,6,7,11]]

        # convert values to numeric
        mydf[['현재가', '전일비', '거래량']] = mydf[['현재가', '전일비', '거래량']].fillna("0").astype(int)
        mydf[['PER']] = mydf[['PER']].fillna("0").astype(float).round(2)
        mydf['등락률'] = mydf['등락률'].astype(str).str.replace('%', '').fillna("0").astype(float).round(2)

        # remove null row
        # mydf = mydf[mydf.N != 0]
        mydf = mydf[mydf.현재가 != 0]

        # add stockCode from model
        mydf['종목코드'] = [get_stockCode(corpName) for corpName in mydf['종목명']]
        mydf['회사명'] = [get_commonCorpName(corpName) for corpName in mydf['종목명']]
        
        rows += mydf.to_dict('records')
    # 하락 - 기본탭 코스피 
    df = pd.read_html(NAVER['stock_fall_url'], header=0, encoding = 'euc-kr')
    mydf = df[1]
    # 필요한 row, column만
    mydf = mydf.iloc[0:30,[1,2,3,4,5,10]]

    # convert values to numeric
    mydf[['현재가', '전일비', '거래량']] = mydf[['현재가', '전일비', '거래량']].fillna("0").astype(int)
    mydf[['PER']] = mydf[['PER']].fillna("0").astype(float).round(2)
    mydf['등락률'] = mydf['등락률'].astype(str).str.replace('%', '').fillna("0").astype(float).round(2)

    # remove null row
    # mydf = mydf[mydf.N != 0]
    mydf = mydf[mydf.현재가 != 0]

    # add stockCode from model
    mydf['종목코드'] = [get_stockCode(corpName) for corpName in mydf['종목명']]
    mydf['회사명'] = [get_commonCorpName(corpName) for corpName in mydf['종목명']]
    
    rows += mydf.to_dict('records')

    # 하락 - 코스닥 
    df = pd.read_html(NAVER['stock_fall_url'] + '?sosok=1', header=0, encoding = 'euc-kr')
    mydf = df[1]
    # 필요한 row, column만
    mydf = mydf.iloc[0:30,[1,2,3,4,5,10]]

    # convert values to numeric
    mydf[['현재가', '전일비', '거래량']] = mydf[['현재가', '전일비', '거래량']].fillna("0").astype(int)
    mydf[['PER']] = mydf[['PER']].fillna("0").astype(float).round(2)
    mydf['등락률'] = mydf['등락률'].astype(str).str.replace('%', '').fillna("0").astype(float).round(2)

    # remove null row
    # mydf = mydf[mydf.N != 0]
    mydf = mydf[mydf.현재가 != 0]

    # add stockCode from model
    mydf['종목코드'] = [get_stockCode(corpName) for corpName in mydf['종목명']]
    mydf['회사명'] = [get_commonCorpName(corpName) for corpName in mydf['종목명']]

    mydf = mydf.sort_values(by='등락률', ascending=False)

    rows += mydf.to_dict('records') 
    rows = sorted(rows, key=lambda k : k["등락률"])

    result = { "rowsCount" : len(rows) , "rows": rows}
    return JsonResponse(result, safe=False)

def get_stock_sector(request):
    ''' 네이버 금융 > 국내증시 > 검색상위 종목'''
    df = pd.read_html(NAVER['stock_search_top_url'], match = '종목명', header=0, encoding = 'euc-kr')[0]

    # remove null row
    df = df.iloc[1:]
    
    # convert values to numeric
    df[['순위','현재가', '전일비', '거래량', '시가', '고가', '저가']] = df[['순위','현재가', '전일비', '거래량', '시가', '고가', '저가']].fillna("0").astype(int)
    df[['PER', 'ROE']] = df[['PER', 'ROE']].fillna("0").astype(float).round(2)
    df['검색비율'] = df['검색비율'].str.replace('%', '').fillna("0").astype(float).round(2)
    df['등락률'] = df['등락률'].str.replace('%', '').fillna("0").astype(float).round(2)

    # remove null row
    df = df[df.순위 != 0]

    # add stockCode from model
    df['종목코드'] = [get_stockCode(corpName) for corpName in df['종목명']]
    df['회사명'] = [get_commonCorpName(corpName) for corpName in df['종목명']]
      
    rows = df.to_dict('records')
    result = { "rowsCount" : 30 , "rows": rows}
    return JsonResponse(result, safe=False)

def get_stock_theme(request):
    ''' 네이버 금융 > 국내증시 > 검색상위 종목'''
    df = pd.read_html(NAVER['stock_search_top_url'], match = '종목명', header=0, encoding = 'euc-kr')[0]

    # remove null row
    df = df.iloc[1:]
    
    # convert values to numeric
    df[['순위','현재가', '전일비', '거래량', '시가', '고가', '저가']] = df[['순위','현재가', '전일비', '거래량', '시가', '고가', '저가']].fillna("0").astype(int)
    df[['PER', 'ROE']] = df[['PER', 'ROE']].fillna("0").astype(float).round(2)
    df['검색비율'] = df['검색비율'].str.replace('%', '').fillna("0").astype(float).round(2)
    df['등락률'] = df['등락률'].str.replace('%', '').fillna("0").astype(float).round(2)

    # remove null row
    df = df[df.순위 != 0]

    # add stockCode from model
    df['종목코드'] = [get_stockCode(corpName) for corpName in df['종목명']]
    df['회사명'] = [get_commonCorpName(corpName) for corpName in df['종목명']]
      
    rows = df.to_dict('records')
    result = { "rowsCount" : 30 , "rows": rows}
    return JsonResponse(result, safe=False)             

def get_stockCode(corpName):
    listed = Listed_corp.objects.filter(회사명=corpName)
    if listed.exists():
        rows = list(listed.values())
        row = rows[0]
        return row['종목코드']   
    else:
        return None      

def get_commonCorpName(corpName):
    listed = Listed_corp.objects.filter(회사명=corpName)
    if listed.exists():
        rows = list(listed.values())
        row = rows[0]
        return row['정보']['기업명']   
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

        try:
            stockQuotes = Stock_quotes.objects.filter(stock_code=stockCode).latest('price_date')
            maxRecordDate = stockQuotes.price_date if stockQuotes else None
        except:
            maxRecordDate = None

        # get last page num
        url = NAVER['stock_sese_day_url'] + stockCode
        # html = urlopen(url) 
        html = requests.get(url, headers={'User-agent' : 'Mozilla/5.0'}).text 
        source = BeautifulSoup(html, "lxml")
        
        maxPage=source.select('td.pgRR a')

        if maxPage:
            mpNum = int(maxPage[0]['href'].split('=')[-1])
        else:
            mpNum = 1  
        df = pd.DataFrame()

        isCrawlBreak = None                                                    
        for page in range(1, mpNum+1):
            if isCrawlBreak:
                break
            pg_url = '{}&page={}'.format(url,page)
            
            df = df.append(pd.read_html(requests.get(pg_url,headers={'User-agent' : 'Mozilla/5.0'}).text)[0])
            # df = pd.read_html(NAVER['stock_sese_day_url'] + stockCode +'&page='+ str(page), match = '날짜', header=0, encoding = 'euc-kr')[0]

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
