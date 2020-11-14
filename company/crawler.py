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

from search.models import listed_corp
from .models import disclosure_report, stock_quotes

from .utils import str2int, str2round

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
        df = pd.DataFrame(data,columns=item_names)
        return json_dict['total_page'], df
    elif json_dict['status'] == "013": # {"status":"013","message":"조회된 데이타가 없습니다."}
        return 0, None
    else:
        return 0, df # TODO


def update_today_crawl_mdcline():
    today = datetime.today().strftime('%Y%m%d')
    totalCount, df = crawl_mdcline(str(today))
    # totalCount, df = crawl_mdcline('20201110')

    if totalCount == 0:
        return
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
    # try:
    html = requests.get(MFDS['url'] + MFDS['serviceKey'] + "&numOfRows=100&pageNo=1&approval_time=" + str(singleDate), timeout=10)
    # except requests.exceptions.Timeout: # 결과 없는 경우나 시간이 길어지면 stop
        # return 0, {}

    soup = BeautifulSoup(html.content, 'lxml')
    totalCount = soup.find("totalcount").get_text()
    if totalCount == '0':  # 결과 없으면
        return 0, {}

    data = soup.find_all("item")
    rawdata = []
    for d in data:
        citingNo = d.find('apply_entp_name').get_text()
        if citingNo:
            res = {'신청자' : citingNo, '승인일' : d.find("approval_time").get_text(), '제품명' : d.find("goods_name").get_text(),'연구실명' : d.find("lab_name").get_text(), '시험제목' : d.find("clinic_exam_title").get_text(),'임상단계' : d.find("clinic_step_name").get_text()}
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

### financial_crawler start - 현재사용안함 (사용하려면 return 값 수정필요)

def sectorPer(df):
    ''' df[0] : '업종PER' '''
    mylist = df.iloc[0].values[0].replace('  ', ' ').split(' ')
    for (idx, val) in enumerate(mylist):
        if val == '업종PER':
            return {'업종PER(배)' : str2round(mylist[idx + 1]) }

    return {'업종PER(배)' : 0}

def fundamental(df):
    ''' df[5] :  'PER', 'PBR', 'EPS', 'BPS', '현금배당수익률' '''

    r = {}

    # C 컬럼이 안읽힐경우 C 포기
    df.columns = ['A','B','C'][:len(df.columns)]

    # 가장 최근으로 선택
    for name in ['PER', 'PBR', 'EPS', 'BPS', '현금배당수익률']:
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

    for name in ['EPS','BPS']:
        try: 
            r[name] = r[name].str.replace('원','').str.replace(',', '').fillna(0).astype(int).to_list()[0]
        except: # 원 없고 null
            r[name] = 0
    try:
        r['현금배당수익률'] = r['현금배당수익률'].str.replace('%', '').fillna(0).astype(float).to_list()[0]
    except:
        r['현금배당수익률'] = 0 # 숫자없고 %만 있는 경우

    return r

def qPrice(df):
    ''' df[6] : '영업이익증감(전전)','영업이익증감(직전)','순이익증감(전전)','순이익증감(직전)' '''
    df.columns = df.iloc[0]
    df = df.reindex(df.index.drop(0)).reset_index(drop=True)
    jcols = list(df.columns)

    jjbun = df[jcols[2]].fillna(0).to_list() # 3번째 cols
    jbun = df[jcols[3]].fillna(0).to_list() # 4번째 cols           

    return {'영업이익증감(전전)' : str2round(jjbun[4]),'영업이익증감(직전)' : str2round(jbun[4]),'순이익증감(전전)' : str2round(jjbun[9]),'순이익증감(직전)' : str2round(jbun[9])}

def stockVolume(df):
    ''' df[1] : '거래량','시가총액' '''
    r = {}
    df.columns = ['A','B']
    r['거래량'] = df.loc[df['A'] == '거래량/거래대금', 'B'].str.split('주 /').str[0].str.replace(',', '').fillna(0).astype(int).to_list()[0]
    r['시가총액'] = df.loc[df['A'] == '시가총액', 'B'].str.replace('억원','').str.replace(',', '').fillna(0).astype(int).to_list()[0]

    return r

def get_date_str(s):
    date_str = ''
    r = re.search("\\d{4}/\\d{2}", s)
    if r:
        date_str = r.group()
        # date_str = date_str.replace('/', '-')

    return date_str

def financialSummary(df):
    ''' df[12] : '매출액','영업이익','당기순이익','자산총계','부채총계','자본총계','자본총계(지배)','부채비율','BPS(원)','PBR(배)','발행주식수(보통주)' 
    'ROE(%)','ROA(%)','EPS(원)','PER(배)' 는 최근분기 사용
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

    print(cols)
    cols = [get_date_str(x) if get_date_str(x) else '' for x in cols]
    print(cols)
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

    r['부채비율'] = my_df['부채비율'].fillna(0).astype(float).to_list()[0]
 
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
        
    r['상장일'] = df[1].loc[df[1]['A'] =='설립일', 'B'].str.split('상장일: ').str[1].str.replace('/','.').str.replace(')','').to_list()[0]  
    try:
        r['종업원수'] = df[1].loc[df[1]['C'] =='종업원수', 'D'].str.strip().str.split(r' \(').str[0].str.replace(',','').fillna(0).astype(int).to_list()[0]
    except: # 종업원수 null
        r['종업원수'] = 0       
    try:       
        r['연구개발비(연)'] = df[4]['연구개발비용지출총액'].fillna(0).astype(int).to_list()[0]
    except:        
        r['연구개발비(연)'] = 0

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
        res['적(4)s-lim'] = res['기업가치(백만)']/ r['발행주식수(보통주)']*100000000 #100000000     #적정주가(4)s-lim
        res['적(4)s-lim'] = int(res['적(4)s-lim'])
        if res['적(4)s-lim'] < 0:
            res['적(4)s-lim'] = 0
    except:
         res['적(4)s-lim'] = 0
    finally:         
        if res['적(4)s-lim'] == 0:
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
        res['적정가'] = sum([res['적(1)PER*EPS'],res['적(2)ROE*EPS'],res['적(3)EPS*10'],res['적(4)s-lim'],res['적(5)당기순이익*PER']]) / sumCnt
        res['적정가'] = int(res['적정가'])
        if res['적정가'] < 0:
            res['적정가'] = 0
    except:
        res['적정가'] = 0

    try:
        res['갭1'] = (1 - r['현재가'] / res['적(1)PER*EPS']) * 100    #1-현재가/적정가*100
        res['갭1'] = str2round(res['갭1'],0)
    except:
        res['갭1'] = 0
        
    try:
        res['갭2'] = (1 - r['현재가'] / res['적(2)ROE*EPS']) * 100    #1-현재가/적정가*100
        res['갭2'] = str2round(res['갭2'],0)
    except:
        res['갭1'] = 0    
        
    try:
        res['갭3'] = (1 - r['현재가'] / res['적(3)EPS*10']) * 100    #1-현재가/적정가*100
        res['갭3'] = str2round(res['갭3'],0)
    except:
        res['갭1'] = 0    
        
    try:
        res['갭4'] = (1 - r['현재가'] / res['적(4)s-lim']) * 100    #1-현재가/적정가*100
        res['갭4'] = str2round(res['갭4'],0)
    except:
        res['갭1'] = 0    
        
    try:
        res['갭5'] = (1 - r['현재가'] / res['적(5)당기순이익*PER']) * 100    #1-현재가/적정가*100
        res['갭5'] = str2round(res['갭5'],0)
    except:
        res['갭1'] = 0    

    if res['적정가'] >  r['현재가']:                  #(평균목표가 - 현재가) / 평균목표가
        res['기대수익률'] = (res['적정가'] - r['현재가']) / res['적정가'] *100
        res['기대수익률'] = round(res['기대수익률'],0)
    else:
        res['기대수익률'] = 0    

    if r['업종PER(배)'] > 0:                                # 기업 per 비율
        res['PER갭(%)'] = r['PER(배)'] / r['업종PER(배)'] *100
        res['PER갭(%)'] = round(res['PER갭(%)'],1)        
    else:
        res['PER갭(%)'] = 0

    try:
        res['PRR(배)'] = r['시가총액'] / r['연구개발비(연)'] * 100 # 단위 보정 ; 억원 / 백만원
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
        res['PGF(%)'] = (res['주당R&D(원)'] + r['EPS(원)'] ) / r['현재가'] * 100
        res['PGF(%)'] = int(res['PGF(%)'])        
    except:
        res['PGF(%)'] = 0
    finally:
        if not res['PGF(%)']:
            res['PGF(%)'] = 0             

    return res

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

    # * 현재가, 
    # * 업종PER : df[0]
    # * 'PER', 'PBR', 'EPS', 'BPS', '현금배당수익률' - 펀더멘털 : df[5]
    # * '영업이익증감(전전)' - 펀더멘탈 > 어닝서프라이즈 > 영업이익 > 전분기대비 : df[5]
    # * '순이익증감(전전)' - 펀더멘탈 > 어닝서프라이즈 > 당기순이익 > 전분기대비 
    # * '거래량', '시가총액', 수익률(1d/1m/1y) 구하기
    # * 피낸셜 서머리 : df[12]

    df = pd.read_html(browser.page_source, header=0, encoding = 'euc-kr')

    res = {}

    nowPrice = html1.find_all('strong')[0].get_text().strip()
    res.update({'현재가' : str2int(nowPrice) })

    res.update(sectorPer(df[0]))

    res.update(fundamental(df[5]))

    res.update(qPrice(df[6]))

    res.update(stockVolume(df[1]))

    temp_res, second_res = financialSummary(df[12])
    res.update(temp_res)

    browser.find_elements_by_xpath('//*[@id="header-menu"]/div[1]/dl/dt[2]')[0].click() # "기업개요" 클릭하기
    df = pd.read_html(browser.page_source, header=0, encoding = 'euc-kr')
    res.update(employee_listingdate_research(df))

    res.update(calculate_stock_fair_value(res))

    # save data in db if necessary
    listedCorp = listed_corp.objects.get(종목코드=stockCode)
    
    listedCorp.정보 = res
    listedCorp.save(update_fields=['정보'])

    listedCorp = listed_corp.objects.get(종목코드=stockCode)
    listedCorp.재무 = second_res
    listedCorp.save(update_fields=['재무'])    
   
    return JsonResponse(res, safe=False) 

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
    '업종PER(배)': 0,
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