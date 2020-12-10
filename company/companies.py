from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
import re
from itertools import permutations
from konlpy.tag import Mecab

from bs4 import BeautifulSoup
from lxml import etree as ET
import os

# stock
from datetime import datetime
from dateutil.relativedelta import relativedelta
from urllib.request import urlopen


# naver crawl
from selenium.webdriver import Chrome
from selenium import webdriver
import pandas as pd

# dart
import requests

from copy import deepcopy
import json

from .utils import get_redis_key, dictfetchall, remove_tags, remove_brackets, remove_punc, like_parse, str2int, str2round
from .crawler import crawl_stock
from .models import Nice_corp, Stock_quotes, Mdcin_clinc_test_info, Financial_statements
from search.models import Listed_corp, Disclosure

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

NAVER = settings.NAVER
DART = settings.DART

empty_info = {
    '매출액': '',
    '영업이익': '',
    '당기순이익': '',
    '자산총계': '',
    '부채총계': '',
    '자본총계': '',
    '자본총계(지배)': '',
    'ROE(%)': '',
    'ROA(%)': '',
    'EPS(원)': '',
    'PER(배)': '',        
    '부채비율': '',
    'BPS(원)': '',
    'PBR(배)': '',
    '발행주식수(보통주)':'',
    '종업원수': '',
    '상장일': '',
    '거래량': '',
    '시가총액':'',
    '수익률':'',
}
empty_fair = {
  'ROE(%)': 0,
  'PER(배)': 0,
  '업종PER(배)': 0,
  'EPS(원)': 0,
  '현재가': 0,
  '자본총계(지배)': 0,
  '발행주식수(보통주)': 0,
  '당기순이익': 0,
  '부채비율': 0,
  '영업이익증감(전전)': 0,
  '영업이익증감(직전)': 0,
  '순이익증감(전전)': 0,
  '순이익증감(직전)': 0,
  '기업가치(백만)': 0,
  '적(1)PER*EPS': 0,
  '적(2)ROE*EPS': 0,
  '적(3)EPS*10': 0,
  '적(4)s-rim': 0,
  '적(5)당기순이익*PER': 0,
  '추천매수가': 0,
  '적정가평균': 0,
  '갭1': 0,
  '갭2': 0,
  '갭3': 0,
  '갭4': 0,
  '갭5': 0,
  '기대수익률': 0,
  'PER갭(%)': 0
}

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
    '적(4)s-rim': 0,
    '적(5)당기순이익*PER': 0,
    '적정가평균': 0,
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

empty_info_dart = {
    '공시번호': '',
    '회사명': '', 
    '종목코드':'',
    '종목명': '',
    '대표자명':'',
    '상장일':'',
    '법인등록번호':'',
    '산업코드':'',
    '홈페이지':'',
    '전화번호':'',
    '주소':''
}

def get_companies(request, mode="begin"):
    mainKey = '¶all'
    context = cache.get(mainKey)
    if mode == "begin":
        try:
            if context['raw']:
                return JsonResponse(context['raw'], safe=False)
        except:
            pass  

    with connection.cursor() as cursor:

        whereAll = "1=1)"

        query = 'SELECT * FROM listed_corp WHERE (' + \
            whereAll

        if mode == "query": # mode가 query면 여기서 분기
            return query

        cursor.execute(
            "SET work_mem to '100MB';"
            + query
        )
        row = dictfetchall(cursor)

    if row:
        for i in range(len(row)):
            data = json.loads(row[i]['정보']) # move position each fields of 정보 json to main fields
            row[i]['id'] = row[i]['종목코드']
            for key, value in data.items():
                row[i].update({key: value})

            del row[i]['정보']

    # redis 저장 {
    new_context = {}
    new_context['raw'] = row

    cache.set(mainKey, new_context, CACHE_TTL)
    # redis 저장 }

    if mode == "begin":
        return JsonResponse(row, safe=False)
   

def parse_companies(request, mode="begin"): # mode : begin, nlp, query


    mainKey, _, params, _ = get_redis_key(request)

    context = cache.get(mainKey)

    if mode == "begin":
        try:
            if context['raw']:
                return JsonResponse(context['raw'], safe=False)
        except:
            pass  

    with connection.cursor() as cursor:

        # 번호검색
        if 'searchNum' in params and params['searchNum']:
            whereAll = ""
            # fields without "-"
            for value in ["종목코드"]:
                whereAll += value + "::text like '%" + \
                    params["searchNum"].replace("-","") + "%' or "

            if whereAll.endswith(" or "):
                whereAll = whereAll[:-4]            
            whereAll += ')'            
        # 키워드 검색
        else:
            if (params["searchText"] == 'all'):
                whereAll = "1=1)"
            else:
                whereAll = like_parse(params["searchText"]) if params["searchText"] else ""
            # whereAll = like_parse_nice(params["searchText"]) if params["searchText"] else ""

        # query = 'SELECT * FROM nice_corp WHERE (' + \
        query = 'SELECT * FROM listed_corp WHERE (' + \
            whereAll # + ")"

        if mode == "query": # mode가 query면 여기서 분기
            return query

        cursor.execute(
            "SET work_mem to '100MB';"
            + query
        )
        row = dictfetchall(cursor)

    # if row:
    #     for i in range(len(row)):
    #         del row[i]["요약token"]
    #         del row[i]["전체항token"]

    # all entries
    # entriesToRemove = ('BPS(원)','EPS(원)','PBR(배)','PER(배)','PER갭(%)','ROA(%)','ROE(%)','갭1','갭2','갭3','갭4','갭5','거래량','결산월','기대수익률','기업가치(백만)','당기순이익','대표자명','매출액','발행주식수(보통주)','부채비율','부채총계','적정가','상장일','수익률','순이익증감(전전)','순이익증감(직전)','시가총액','업종','업종PER(배)','영업이익','영업이익증감(전전)','영업이익증감(직전)','자본총계','자본총계(지배)','자산총계','적(1)PER*EPS','적(2)ROE*EPS','적(3)EPS*10','적(4)s-rim','적(5)당기순이익*PER','종목코드','종업원수','주요제품','지역','추천매수가','현재가','홈페이지','회사명')
    # entriesToRemove = ('BPS(원)','갭1','갭2','갭3','갭4','갭5','거래량','결산월','기대수익률','기업가치(백만)','당기순이익','매출액','발행주식수(보통주)','부채총계','상장일','수익률','영업이익','자본총계','자본총계(지배)','자산총계','적(1)PER*EPS','적(2)ROE*EPS','적(3)EPS*10','적(4)s-rim','적(5)당기순이익*PER','종업원수','추천매수가')
    if row:
        # res = deepcopy(res)
        for i in range(len(row)):
            data = json.loads(row[i]['정보']) # move position each fields of 정보 json to main fields
            for key, value in data.items():
                row[i].update({key: value})

            # data = json.loads(row[i]['적정'])
            # for key, value in data.items():
            #     row[i].update({key: value})                

            del row[i]['정보']
            # del row[i]['적정'] 

            # for k in entriesToRemove:
            #     row[i].pop(k, None)       


    # redis 저장 {
    new_context = {}
    # new_context['nlp_raw'] = nlp_raw
    # new_context['mtx_raw'] = mtx_raw
    new_context['raw'] = row

    cache.set(mainKey, new_context, CACHE_TTL)
    # redis 저장 }

    if mode == "begin":
        return JsonResponse(row, safe=False)
    # elif mode == "nlp":
    #     return nlp_raw
    # elif mode =="matrix":
    #     return mtx_raw        

def parse_query(request):
    """ 쿼리 확인용 """
    return HttpResponse(parse_companies(request, mode="query"), content_type="text/plain; charset=utf-8")

def parse_financial_info(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        stockCode = data['stockCode']

        # crawl current financial info
        # financial_crawler(stockCode)  # skip for faster page loading

        isExist = Listed_corp.objects.filter(종목코드=stockCode).exists()
        if not isExist:
            return JsonResponse([], safe=False)
            # return HttpResponse('Not Found', status=404)

        row = Listed_corp.objects.filter(종목코드=stockCode).values()
        row = list(row)
        res = row[0]['재무'] if row else {}
        if row:
            res.update({ 'stockFairValue': [ row[0]['정보']['적(1)PER*EPS'], row[0]['정보']['적(2)ROE*EPS'], row[0]['정보']['적(3)EPS*10'], row[0]['정보']['적(4)s-rim'], row[0]['정보']['적(5)당기순이익*PER'], row[0]['정보']['적정가평균'], row[0]['정보']['전일종가']]})

    return JsonResponse(res, safe=False)    

def parse_stock(request):
    """ stock quote """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        stockCode = data["stockCode"]
        chartType = 'year'

        # update 
        # try:
        crawl_stock(request)
        # except:
            # return HttpResponse() # 500

        try:
            today = datetime.today().strftime('%Y-%m-%d')
            
            # 하루 일주일 한달 일년 전체
            kwargs = {}
            if chartType == 'day':
                kwargs['days'] = -1
            elif chartType == 'week':
                kwargs['weeks'] = -1
            elif chartType == 'month':
                kwargs['months'] = -1
            elif chartType == "year":
                kwargs['years'] = -1
            # elif chartType == "all":
            #     kwargs['years'] = -10

            temp = datetime.now() + relativedelta(**kwargs)
            range_from = temp.strftime('%Y-%m-%d')

    
            isExist = Stock_quotes.objects.filter(stock_code=stockCode, price_date__range=[range_from,today]).exists()
            if not isExist:
                return HttpResponse('Not Found', status=404)

            stockQuotes = Stock_quotes.objects.filter(stock_code=stockCode, price_date__range=[range_from,today])

            myDate = list(stockQuotes.values_list('price_date', flat=True).order_by('price_date'))
            myStock = list(stockQuotes.values_list('stock', flat=True).order_by('price_date'))
            myVolume = list(stockQuotes.values_list('volume', flat=True).order_by('price_date'))

            response = { 'dates': myDate, 'data': myStock, 'volumes': myVolume}
            return JsonResponse(response,status=200, safe=False)
        except:
            return HttpResponse() # 500    
       
def get_corpCode(stockCode):
    disc = Disclosure.objects.filter(stock_code=stockCode)
    if disc.exists():
        rows = list(disc.values())
        row = rows[0]
        return row['corp_code']            
    else:
        return None  
             
def crawl_dart(corpCode):
    rows = Financial_statements.objects.filter(corp_code=corpCode)
    if rows.exists():
        row = rows.values()
        row = list(row)
        return row[0]['corp_info']

    # 기업개요 DART
    # https://opendart.fss.or.kr/api/company.json?crtfc_key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&corp_code=00126380
    url = DART['dart_url'] + DART['oper_company'] + '?crtfc_key=' + DART['api_key'] + '&corp_code=' + corpCode
    response = requests.get(url)
    data = json.loads(response.content)

    # status(pin):"000"
    # message(pin):"정상"
    # corp_code(pin):"01110678"
    # corp_name(pin):"(주)유틸렉스"
    # corp_name_eng(pin):"Eutilex Co.,Ltd."
    # stock_name(pin):"유틸렉스"
    # stock_code(pin):"263050"
    # ceo_nm(pin):"권병세, 최수영"
    # corp_cls(pin):"K"
    # jurir_no(pin):"2850110287959"
    # bizr_no(pin):"8638600031"
    # adres(pin):"서울특별시 금천구 가산디지털1로 25 1401호(가산동, 대륭테크노타운 17차)"
    # hm_url(pin):"www.eutilex.com"
    # ir_url(pin):""
    # phn_no(pin):"02-3402-7314"
    # fax_no(pin):"02-3402-7399"
    # induty_code(pin):"21102"
    # est_dt(pin):"20150227"
    # acc_mt(pin):"12"

    # match listed_corp table fieldNames                
    res = {}
    res['공시번호'] = data['corp_code']
    res['회사명'] = data['corp_name']
    res['종목코드'] = data['stock_code']
    res['종목명'] = data['stock_name']
    res['대표자명'] = data['ceo_nm']
    res['상장일'] = data['est_dt']
    res['법인등록번호'] = data['jurir_no']
    res['산업코드'] = data['induty_code']
    res['홈페이지'] = data['hm_url']
    res['전화번호'] = data['phn_no']
    res['주소'] = data['adres']

    newDart = {
        'stock_code': data['stock_code'],
        'corp_code': corpCode,
        'corp_info': res,
    }
    # TODO : update past information
    # isMatchToday = True if lastRecordDate and lastRecordDate_obj.date() == newDate_obj.date() else False

    # if not isMatchToday:
    Financial_statements.objects.create(**newDart)
    # else:                            
        # Financial_statements.objects.filter(corp_code=corpCode).update(**newDart)



    return res        

def crawl_naver(stock_code):
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.headless = True
    browser = webdriver.Chrome(executable_path="/usr/bin/chromedriver",options=options)

    url = NAVER['finance_sum_url'] + stock_code
    browser.get(url)

    # 폐지되어 자료없는 경우 - NoSuchElementException 
    try:
        browser.find_element_by_class_name('no_data') # <div class="no_data">
        return empty_info
    except:
        pass

    # page not found handle
    # 상장된지 얼마안되서 자료없는 경우인듯
    try:
        browser.find_element_by_id('pageError') # <div id="pageError">
        return empty_info
    except:
        pass 

    # 정상이면
    try:    
        browser.switch_to_frame(browser.find_element_by_id('coinfo_cp'))
    except:
        return empty_info    

    
    #재무제표 "연간" 클릭하기
    try:
        browser.find_elements_by_xpath('//*[@class="schtab"][1]/tbody/tr/td[3]')[0].click()
    except:
        return empty_info        

    html0 = browser.page_source
    html1 = BeautifulSoup(html0,'html.parser')
    
    # #기업명 뽑기
    # title0 = html1.find('head').find('title').text
    # print(title0.split('-')[-1])

    #거래량, 시가총액, 수익률 구하기
    html11 = html1.find('table',{'class':'gHead','summary':'기업의 기본적인 시세정보(주가/전일대비/수익률,52주최고/최저,액면가,거래량/거래대금,시가총액,유동주식비율,외국인지분율,52주베타,수익률(1M/3M/6M/1Y))를 제공합니다.'})
   
    tbody0 = html11.find('tbody')
    tr0 = tbody0.find_all('tr')
    
    tr1 = tr0[3]
    td1 = tr1.find('td').text

    tr2 = tr0[4]
    td2 = tr2.find('td').text

    tr3 = tr0[0]
    td3 = tr3.find('td')
    l = td3.find_all('span')

    stock_return = l[1].text if l else ''

    tr4 = tr0[8]
    td4 = tr4.find('td')
    sp0 = td4.find_all('span')
    stock_return += '/' + sp0[0].text
    stock_return += '/' + sp0[3].text

    stock_volume = td1.strip().split(' /',1)[0]
    market_cap = td2.strip()
    
    # If there is data in db, fetch it or continue crawling
    listedCorp = Listed_corp.objects.get(종목코드=stock_code)
    if listedCorp.정보['당기순이익'] != '':
        res = listedCorp.정보
        res.update({
        '업종' : listedCorp.업종,
        '주요제품' : listedCorp.주요제품,
        '거래량' : stock_volume,
        '시가총액' : market_cap,
        '수익률' : stock_return,
        })
        return res

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
    for i in range(len(tr0)):
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
    try:
        my_df = df.loc[['2019/12'],['매출액','영업이익','당기순이익','자산총계','부채총계','자본총계','EPS(원)','PER(배)','ROE(%)','BPS(원)','PBR(배)']]
    except:
        return empty_info
                
    res = my_df.to_dict('records')

    #종업원수·상장일 구하기
    #"기업개요" 클릭하기
    browser.find_elements_by_xpath('//*[@class="wrapper-menu"][1]/dl/dt[2]')[0].click()

    html0 = browser.page_source
    html1 = BeautifulSoup(html0,'html.parser')   
    
    html22 = html1.find('table',{'class':'gHead all-width','summary':'기업에 대한 기본적인 정보(본사주소,홈페이지,대표전화,설립일,대표이사,계열,종업원수,주식수(보통주/우선주),감사인,명의개서,주거래은행)을 제공합니다.'})
   
    tbody0 = html22.find('tbody')
    tr0 = tbody0.find_all('tr')[3]
    td0 = tr0.find_all('td')[1].text

    employee = td0.strip().split(' (')[0]

    # # 상장일 crawl
    # tr0 = tbody0.find_all('tr')[2]
    # td0 = tr0.find_all('td')[0].text
    # text0 = td0.strip().rsplit('상장일: ',1)[-1]
    # listing_date = text0.replace('/','.').replace(')','')

    # 상장일 from model
    listing_date = listedCorp.상장일.replace('-','.')

    res[0].update({
        '종업원수' : employee,
        '상장일' : listing_date,
        '거래량' : stock_volume,
        '시가총액' : market_cap,
        '수익률' : stock_return,
    })

    # save data in db if necessary
    # listedCorp = Listed_corp.objects.get(종목코드=stock_code)
    listedCorp.정보 = res[0]
    listedCorp.save(update_fields=['정보'])

    # 2 elements need not be included in `정보` field 
    res[0].update({
        '업종' : listedCorp.업종,
        '주요제품' : listedCorp.주요제품,
    })    
    return res[0]    
