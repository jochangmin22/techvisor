# app
import requests
import json
import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime
from bs4 import BeautifulSoup

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from .models import disclosure_report

DART = settings.DART
MFDS = settings.MFDS
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
    if df:
        engine = create_engine(db_connection_url)
        df.to_sql(name='mdcin_clinc_test_info_temp', con=engine, if_exists='replace')

        with engine.begin() as cn:
            sql = """INSERT INTO mdcin_clinc_test_info (신청자, 승인일, 제품명, 시험제목, 연구실명, 임상단계)
                        SELECT t.신청자, t.승인일, t.제품명, t.시험제목, t.연구실명, t.임상단계 
                        FROM mdcin_clinc_test_info_temp t
                        WHERE NOT EXISTS 
                            (SELECT 1 FROM mdcin_clinc_test_info f
                            WHERE t.신청자 = f.신청자 and t.승인일 = f.승인일 and t.제품명 = f.제품명 and t.임상단계 = f.임상단계)"""
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
