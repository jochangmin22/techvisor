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
from .models import nice_corp, stock_quotes, mdcin_clinc_test_info, financial_statements
from search.models import listed_corp, disclosure

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
  '적(4)s-lim': 0,
  '적(5)당기순이익*PER': 0,
  '추천매수가': 0,
  '적정가': 0,
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
    # entriesToRemove = ('BPS(원)','EPS(원)','PBR(배)','PER(배)','PER갭(%)','ROA(%)','ROE(%)','갭1','갭2','갭3','갭4','갭5','거래량','결산월','기대수익률','기업가치(백만)','당기순이익','대표자명','매출액','발행주식수(보통주)','부채비율','부채총계','적정가','상장일','수익률','순이익증감(전전)','순이익증감(직전)','시가총액','업종','업종PER(배)','영업이익','영업이익증감(전전)','영업이익증감(직전)','자본총계','자본총계(지배)','자산총계','적(1)PER*EPS','적(2)ROE*EPS','적(3)EPS*10','적(4)s-lim','적(5)당기순이익*PER','종목코드','종업원수','주요제품','지역','추천매수가','현재가','홈페이지','회사명')
    # entriesToRemove = ('BPS(원)','갭1','갭2','갭3','갭4','갭5','거래량','결산월','기대수익률','기업가치(백만)','당기순이익','매출액','발행주식수(보통주)','부채총계','상장일','수익률','영업이익','자본총계','자본총계(지배)','자산총계','적(1)PER*EPS','적(2)ROE*EPS','적(3)EPS*10','적(4)s-lim','적(5)당기순이익*PER','종업원수','추천매수가')
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

 
def parse_company_info(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        stockCode = data['stockCode']

        isExist = listed_corp.objects.filter(종목코드=stockCode).exists()
        if not isExist:
            return JsonResponse([], safe=False)

        row = listed_corp.objects.filter(종목코드=stockCode).values()
        row = list(row)
        if row:
            res = { '회사명': row[0]['회사명'], '종목코드': stockCode, 'FV1': row[0]['정보']['적(1)PER*EPS'], 'FV2': row[0]['정보']['적(2)ROE*EPS'], 'FV3': row[0]['정보']['적(3)EPS*10'], 'FV4': row[0]['정보']['적(4)s-lim'], 'FV5': row[0]['정보']['적(5)당기순이익*PER'], 'FV': row[0]['정보']['적정가'], 'CV': row[0]['정보']['현재가']}

    return JsonResponse(res, safe=False)

def parse_financial_info(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        stockCode = data['stockCode']

        isExist = listed_corp.objects.filter(종목코드=stockCode).exists()
        if not isExist:
            return JsonResponse([], safe=False)
            # return HttpResponse('Not Found', status=404)

        row = listed_corp.objects.filter(종목코드=stockCode).values()
        row = list(row)
        res = row[0]['재무'] if row else {}

    return JsonResponse(res, safe=False)    

def stock_fair(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        stockCode = data['stockCode']

        isExist = listed_corp.objects.filter(종목코드=stockCode).exists()
        if not isExist:
            return JsonResponse([], safe=False)
            # return HttpResponse('Not Found', status=404)

        row = listed_corp.objects.filter(종목코드=stockCode).values()
        row = list(row)
        # if row:
        #     res.update(row[0])
        #     res.update(row[0]['정보']) # merge each fields of 정보 json to main fields
        #     del res['정보']
        #     del res['적정']

    return JsonResponse(row, safe=False)

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

    
            isExist = stock_quotes.objects.filter(stock_code=stockCode, price_date__range=[range_from,today]).exists()
            if not isExist:
                return HttpResponse('Not Found', status=404)

            stockQuotes = stock_quotes.objects.filter(stock_code=stockCode, price_date__range=[range_from,today])

            myDate = list(stockQuotes.values_list('price_date', flat=True).order_by('price_date'))
            myStock = list(stockQuotes.values_list('stock', flat=True).order_by('price_date'))
            myVolume = list(stockQuotes.values_list('volume', flat=True).order_by('price_date'))

            response = { 'dates': myDate, 'data': myStock, 'volumes': myVolume}
            return JsonResponse(response,status=200, safe=False)
        except:
            return HttpResponse() # 500    

def crawl_stock_info(request):
    ''' firstly, 거래량, 시가총액, 수익률 are taken from Naver, and if the rest is not in DB, crawling contiues'''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        stockCode = data["stockCode"] 

        options = webdriver.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
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


        # 정상이면
        try:    
            browser.switch_to_frame(browser.find_element_by_id('coinfo_cp'))
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

        ### 기타정보 -- 길어서 따로 def로 나눔
        etc = crawl_info_etc(html1)

        # # If there is data in db, fetch it or continue crawling
        # listedCorp = listed_corp.objects.get(종목코드=stockCode)
        # if listedCorp.정보['당기순이익'] != '':
        #     res = listedCorp.정보
        #     res.update({
        #     '업종' : listedCorp.업종,
        #     '주요제품' : listedCorp.주요제품,
        #     '거래량' : stock_volume,
        #     '시가총액' : market_cap,
        #     '수익률' : stock_return,
        #     })
        #     return JsonResponse(res, safe=False)   

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
            my_df = df.loc[['2019/12'],['매출액','영업이익','당기순이익','자산총계','부채총계','자본총계','자본총계(지배)','ROE(%)','ROA(%)','EPS(원)','PER(배)','부채비율','BPS(원)','PBR(배)','발행주식수(보통주)']]
        except:
            return JsonResponse(empty_dict, safe=False)
                    
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

        # 재무정보
        financial_res = { "date" : ['2017/12','2018/12','2019/12','2019/12','2020/03','2020/06'], "dataset": []}
        my_list = [[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0]]
        # 연도
        for idx, mycolumn in enumerate(['2017/12','2018/12','2019/12']):
            try:
                my_df = df.loc[[mycolumn],['매출액','영업이익','당기순이익','부채비율','자본유보율','현금배당성향(%)']]
                my_dict = my_df.to_dict('records')
                for key in my_dict[0]:
                    index = list(my_dict[0]).index(key)
                    value = my_dict[0][key]
                    value = str2int(value) if key == '매출액' or key == '영업이익' or key == '당기순이익' else str2round(value,2)
                    my_list[index][idx] = value
            except:
                pass

        # 분기
        df = df.loc[~df.index.duplicated(keep='last')] # 2019/12 중복 index 처리     

        for idx, mycolumn in enumerate(['2019/12','2020/03','2020/06']):
            try:
                my_df = df.loc[[mycolumn],['매출액','영업이익','당기순이익','부채비율','자본유보율','현금배당성향(%)']]
                my_dict = my_df.to_dict('records')
                for key in my_dict[0]:
                    index = list(my_dict[0]).index(key)
                    value = my_dict[0][key]
                    value = str2int(value) if key == '매출액' or key == '영업이익' or key == '당기순이익' else str2round(value,2)
                    my_list[index][idx+3] = value # 네번째부터 이어서 넣기
            except:
                pass

        financial_res['dataset'] = my_list     


        #종업원수·상장일·연구개발비 구하기

        #### "기업개요" 클릭하기
        try:
            browser.find_elements_by_xpath('//*[@id="header-menu"]/div[1]/dl/dt[2]')[0].click()
        
            html0 = browser.page_source
            html1 = BeautifulSoup(html0,'lxml')

            employee = html1.select('#cTB201 > tbody > tr:nth-of-type(4) > td.c4.txt')[0].get_text().strip().split(' (')[0]
            employee = employee.replace(',','')  

            listing_date = html1.select('#cTB201 > tbody > tr:nth-of-type(3) > td.c2.txt')[0].get_text().strip().rsplit('상장일: ',1)[-1]
            listing_date = listing_date.replace('/','.').replace(')','')   

            research = html1.select('#cTB205_1 > tbody > tr:nth-of-type(1) > td.c2.line.num')[0].get_text().strip().replace(',','') 
        except:
            employee = 0
            listing_date = ''
            research = 0

        # # 상장일 from model ; 더 느릴 것 같음
        # listing_date = listedCorp.상장일.replace('-','.')

        # res[0].update({
        #     '종업원수' : employee,
        #     '상장일' : listing_date,
        #     '거래량' : stock_volume,
        #     '시가총액' : market_cap,
        #     '수익률' : stock_return,
        # })

        # # 적정주가분석 산출
        # fair = fair_value(res[0], etc)

        # 적정주가분석 산출 · merge two json 
        result_merge = stock_fair_value(res[0], etc, employee, listing_date, research)    

        # save data in db if necessary
        listedCorp = listed_corp.objects.get(종목코드=stockCode)
        listedCorp.정보 = result_merge
        listedCorp.save(update_fields=['정보'])

        listedCorp = listed_corp.objects.get(종목코드=stockCode)
        listedCorp.재무 = financial_res
        listedCorp.save(update_fields=['재무'])

        # listedCorp.적정 = fair
        # listedCorp.save(update_fields=['적정'])        

        # # 2 elements need not be included in `정보` field 
        # res[0].update({
        #     '업종' : listedCorp.업종,
        #     '주요제품' : listedCorp.주요제품,
        # })  
        return JsonResponse(result_merge, safe=False)     

def _crawl_etc_info_sub(html1, value):
    ''' crawl_info_etc 의 sub def '''
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

def crawl_info_etc(html1):
    ''' 수집 : '현재가','업종PER(배)','PER(배)','PBR','EPS','BPS','현금배당수익률', '영업이익증감(전전)','영업이익증감(직전)','순이익증감(전전)','순이익증감(직전)' '''
    # 현재가 구하기
    try:
        nowPrice = html1.find_all('strong')[0].get_text()    #현재가 추출
        nowPrice = (nowPrice.strip()).replace(",","")
        nowPrice = int(nowPrice)
    except:
        nowPrice = 0      

    # 업종PER(배) 구하기
    try:
        sectorPer= html1.find_all('dt',{"class","line-left"})[12].get_text() #업종PER 값
        sectorPer = sectorPer.replace("업종PER ","").replace('N/A','0').replace(",","")
        sectorPer = float(sectorPer)
    except:
        sectorPer = 0   

    # PER(배) 구하기
    try:
        perValue = html1.find_all('dt',{"class","line-left"})[11].get_text()
        perValue = perValue.replace("PER ","").replace("N/A","0").replace(",","")
    except:
        perValue = 0

    ### 'PER(배)','PBR','EPS','BPS','현금배당수익률' 구하기
    ### 위치 : 펀더멘털 > 주요지표 > 2020/12(E) or 2019/12(A)
    ### 'ROE(%)','ROA(%)','PER(배)','PBR(배)'는 최근분기에서 사용 ; 최근 분기없으면 'PER(배)','PBR(배)'는 여기 것으로 대체 
    #     
    # 5가지가 나열이 길어져서 _crawl_etc_info_sub def 로 만듬
    r = {}
    dataList = [{'PER': 1}, {'PBR': 2}, {'EPS': 5}, {'BPS': 6}, {'현금배당수익률': 9}] # 뒤의 숫자는 tr:nth-of-type(n) 위치
    for index in range(len(dataList)):
        for key, value in dataList[index].items():
            r[key] = _crawl_etc_info_sub(html1, value)        

    # 전전분기대비 증감율 ; 펀더멘탈 > 어닝서프라이즈 > 영업이익 > 전분기대비
    
    try:
        qPrice1 = html1.select('#earning_list > tbody > tr:nth-of-type(6) td:nth-of-type(1)')[0].get_text().strip()   #전전분기대비 증감율
        qPrice1 = qPrice1.replace("","").replace("N/A","")
    except:
        qPrice1 = 0

    try:
        qPrice2 = html1.select('#earning_list > tbody > tr:nth-of-type(6) > td.num.noline-right')[0].get_text().strip()   #전전분기대비 증감율
        qPrice2 = qPrice2.replace("","").replace("N/A","")
    except:
        qPrice2 = 0

    # 전전분기대비 증감율 ; 펀더멘탈 > 어닝서프라이즈 > 당기순이익 > 전분기대비
    try:
        qPrice3 = html1.select('#earning_list > tbody > tr:nth-of-type(11) > td:nth-of-type(1)')[0].get_text().strip()   #전전분기대비 증감율
        qPrice3 = qPrice3.replace("","").replace("N/A","")
    except:
        qPrice3 = 0        

    try:
        qPrice4 = html1.select('#earning_list > tbody > tr:nth-of-type(11) > td.num.noline-right')[0].get_text().strip()   #전전분기대비 증감율
        qPrice4 = qPrice4.replace("","").replace("N/A","")              
    except:
        qPrice4 = 0

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
            '현재가' : nowPrice,
            '업종PER(배)': sectorPer,
            'PER(배)': r['PER'],
            'PBR(배)': r['PBR'],
            'EPS(원)': r['EPS'],
            'BPS(원)': r['BPS'],
            '현금배당수익률': r['현금배당수익률'],
            '영업이익증감(전전)' :qPrice1,
            '영업이익증감(직전)' :qPrice2,
            '순이익증감(전전)' :qPrice3,
            '순이익증감(직전)' :qPrice4,
            '거래량' : stock_volume,
            '시가총액' : market_cap,
            '수익률1d' :stock_return_1d, 
            '수익률1m' :stock_return_1m, 
            '수익률1y' :stock_return_1y, 
        }        

    return res

def stock_fair_value(main, etc, employee, listing_date, research):
    '''
    적정주가 계산식
    etc : '현재가','업종PER(배)','PER(배)','영업이익증감(전전)','영업이익증감(직전)','순이익증감(전전)','순이익증감(직전)'     
    나머지는 main
    '''
    r = {} 
    
    # numeric으로 미리 변환   - str2round, str2int 사전정의 def

    r['연구개발비(연)'] = str2round(research,2)
    r['매출액'] = str2int(main['매출액'])
    r['상장일'] = listing_date
    r['ROE(%)'] = str2round(main['ROE(%)'],2)
    r['ROA(%)'] = str2round(main['ROA(%)'],2)
    r['PER(배)'] = str2round(etc['PER(배)'],2)
    r['EPS(원)'] = str2int(etc['EPS(원)'])
    r['PBR(배)'] = str2round(etc['PBR(배)'],2)
    r['BPS(원)'] = str2int(etc['BPS(원)'])       
    r['업종PER(배)'] = str2round(etc['업종PER(배)'],2)
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

    if r['업종PER(배)'] > 0:                                # 기업 per 비율
        r['PER갭(%)'] = r['PER(배)'] / r['업종PER(배)'] *100
        r['PER갭(%)'] = round(r['PER갭(%)'],1)        
    else:
        r['PER갭(%)'] = 0

    try:
        r['PRR(배)'] = r['시가총액'] / r['연구개발비(연)'] * 100 # 단위 보정 ; 억원 / 백만원
        r['PRR(배)'] = round(r['PRR(배)'],2)        
    except:
        r['PRR(배)'] = 0

    try:
        r['주당R&D(원)'] = r['연구개발비(연)'] / r['발행주식수(보통주)'] * 1000000 # 단위 보정 ; 백만원 / 원
        r['주당R&D(원)'] = int(r['주당R&D(원)'])        
    except:
        r['주당R&D(원)'] = 0
    finally:
        if not r['주당R&D(원)']:
            r['주당R&D(원)'] = 0

    # 가격성장흐름(PGF)
    try: 
        r['PGF(%)'] = (r['주당R&D(원)'] + r['EPS(원)'] ) / r['현재가'] * 100
        r['PGF(%)'] = int(r['PGF(%)'])        
    except:
        r['PGF(%)'] = 0
    finally:
        if not r['PGF(%)']:
            r['PGF(%)'] = 0                

    return r

  
def clinic_test(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        corpName = data['corpName']

        if corpName:
            isExist = mdcin_clinc_test_info.objects.filter(신청자__contains=corpName).exists()
            if not isExist:
                return JsonResponse([], safe=False)

            rows = mdcin_clinc_test_info.objects.filter(신청자__contains=corpName).values()
        else:
            rows = mdcin_clinc_test_info.objects.all().order_by('-승인일')[:100].values()            

        rows = list(rows)
        res = [dict(row, **{
                '신청자': row['신청자'],
                '승인일': row['승인일'],
                '제품명': row['제품명'],
                '시험제목': row['정보']['시험제목'],
                '연구실명': row['정보']['연구실명'],
                '임상단계': row['정보']['임상단계'],
            }) for row in rows]
            
        return JsonResponse(res, safe=False)            

def get_corpCode(stockCode):
    disc = disclosure.objects.filter(stock_code=stockCode)
    if disc.exists():
        rows = list(disc.values())
        row = rows[0]
        return row['corp_code']            
    else:
        return None  
             

def crawl_dart(corpCode):
    rows = financial_statements.objects.filter(corp_code=corpCode)
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
    financial_statements.objects.create(**newDart)
    # else:                            
        # financial_statements.objects.filter(corp_code=corpCode).update(**newDart)



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
    listedCorp = listed_corp.objects.get(종목코드=stock_code)
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
    # listedCorp = listed_corp.objects.get(종목코드=stock_code)
    listedCorp.정보 = res[0]
    listedCorp.save(update_fields=['정보'])

    # 2 elements need not be included in `정보` field 
    res[0].update({
        '업종' : listedCorp.업종,
        '주요제품' : listedCorp.주요제품,
    })    
    return res[0]    
