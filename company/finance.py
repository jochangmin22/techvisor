from .models import stock_quotes, financial_statements
from search.models import listed_corp

from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse

from urllib.request import urlopen
from bs4 import BeautifulSoup
import uuid
import json
import time
from datetime import datetime
from dateutil.relativedelta import relativedelta
import requests
import pandas as pd

# naver crawl
from selenium.webdriver import Chrome
from selenium import webdriver
import re    


# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

DART = settings.DART
NAVER = settings.NAVER

empty_info = {
    '매출액': '',
    '영업이익': '',
    '당기순이익': '',
    '자산총계': '',
    '부채총계': '',
    '자본총계': '',
    'EPS(원)': '',
    'PER(배)': '',
    'ROE(%)': '',
    'BPS(원)': '',
    'PBR(배)': '',
    '종업원수': '',
    '상장일': '',
    '업종': '',
    '주요제품':'',
    '거래량': '',
    '시가총액':'',
    '수익률':'',
}

def parse_stock(request):
    """ stock quote """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        stockCode = data["stockCode"]
        chartType = 'year'

        # update 
        try:
            crawl_stock(request)
        except:
            return HttpResponse() # 500

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
            elif chartType == "all":
                kwargs['years'] = -10

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

def crawl_stock(request):
    ''' 
    page 1 부터 crawling -> if exist at db ? 
              yes -> return
              no -> stock_quotes.objects.create(**newStock)
    '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        kiscode = data["kiscode"]

        # exist ? {
        try:
            stockQuotes = stock_quotes.objects.filter(stock_code=kiscode).latest('price_date')
            lastRecordDate = stockQuotes.price_date if stockQuotes else None
        except:
            lastRecordDate = None

        # exist ? }

        naver_url = 'http://finance.naver.com/item/sise_day.nhn?code='
        url = naver_url + kiscode
        html = urlopen(url) 
        source = BeautifulSoup(html.read(), "html.parser")
        
        maxPage=source.find_all("table",align="center")
        mp = maxPage[0].find_all("td",class_="pgRR")
        if mp:
            # mpNum = int(mp[0].a.get('href')[-3:])
            mpNum = int(mp[0].a.get('href').split('page=')[1])
        else:
            mpNum = 1    
        

        isCrawlBreak = None                                                    
        for page in range(1, mpNum+1):
            if isCrawlBreak:
                break
            # print (str(page) )
            url = naver_url + kiscode +'&page='+ str(page)
            html = urlopen(url)
            source = BeautifulSoup(html.read(), "html.parser")
            srlists=source.find_all("tr")
            isCheckNone = None

            # if((page % 1) == 0):
            #     time.sleep(1.50)

            # data : open, close, lowest, highest, volume
            # naver : 종가, 전일비, 시가, 고가, 저가, 거래량
            # ResultSet order : 2,0,4,3,5 
            for i in range(1,len(srlists)-1):
                if(srlists[i].span != isCheckNone):

                    newDate = srlists[i].find_all("td",align="center")[0].text
                    newDate = newDate.replace('.','-')
                    newDate_obj = datetime.strptime(newDate, '%Y-%m-%d')
                    lastRecordDate_obj = datetime.combine(lastRecordDate, datetime.min.time()) if lastRecordDate else ''

                    if not lastRecordDate or (lastRecordDate and lastRecordDate_obj.date() <= newDate_obj.date()):
                        first = srlists[i].find_all("td",class_="num")[2].text
                        second = srlists[i].find_all("td",class_="num")[0].text
                        third = srlists[i].find_all("td",class_="num")[4].text
                        fourth = srlists[i].find_all("td",class_="num")[3].text
                        fifth = srlists[i].find_all("td",class_="num")[5].text

                        first = int(first.replace(',',''))
                        second = int(second.replace(',',''))
                        third = int(third.replace(',',''))
                        fourth = int(fourth.replace(',',''))
                        fifth = int(fifth.replace(',',''))
                        
                        # newUid = str(uuid.uuid4())
                        newStock = {
                            # 'id': newUid,
                            'stock_code': kiscode,
                            'price_date': newDate,
                            'stock': [first, second, third, fourth, fifth],
                            'volume' : fifth
                        }
                        isMatchToday = True if lastRecordDate and lastRecordDate_obj.date() == newDate_obj.date() else False

                        if not isMatchToday:
                            stock_quotes.objects.create(**newStock)
                        else:                            
                            stock_quotes.objects.filter(stock_code=kiscode, price_date=newDate).update(**newStock)
                        # stock_quotes.objects.update_or_create(**newStock)
                    else:
                        isCrawlBreak = True    
    return


def crawl_dart(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        corp_code = data["corp_code"]
        # exist ? {
        try:
            financial = financial_statements.objects.filter(stock_code=kiscode)
            lastRecordDate = None
            if financial.exists():
                rows = list(financial.values())
                row = rows[0]
                lastRecordDate = row['updated_at']            
        except:
            lastRecordDate = None

        # exist ? }

        # 기업개요 DART
        # https://opendart.fss.or.kr/api/company.json?crtfc_key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&corp_code=00126380
        url = DART['dart_url'] + DART['oper_company'] + '?crtfc_key=' + DART['api_key'] + '&corp_code=' + corp_code
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
                
        res = {}
        res['corp_code'] = data['corp_code']
        res['corp_name'] = data['corp_name']
        res['stock_code'] = data['stock_code']
        res['stock_name'] = data['stock_name']
        res['ceo_nm'] = data['ceo_nm']
        res['est_dt'] = data['est_dt']
        res['jurir_no'] = data['jurir_no']
        res['induty_code'] = data['induty_code']
        res['hm_url'] = data['hm_url']
        res['phn_no'] = data['phn_no']
        res['adres'] = data['adres']

        # 시황 정보 · 재무 정보
        if data['stock_code']:
            more_info = crawl_naver(data['stock_code'])
        else:
            more_info = empty_info
            
        res.update(more_info)

    return JsonResponse(res, safe=False)        

        # # 시황 정보 · 재무 정보
        # if data['stock_code']:
        #     url = NAVER['finance_url'] + data['stock_code']

        #     request = requests.get(url)
        #     df = pd.read_html(request.text)[3]

        #     df.set_index(('주요재무정보', '주요재무정보', '주요재무정보'), inplace=True)
        #     df.index.rename('주요재무정보', inplace=True)
        #     df.columns = df.columns.droplevel(2)
        #     df = df.iloc[:,2:-7] # 최근 연간 실적 - 작년
        #     dft = df.T
        #     data2 = dft.to_dict('records')
        #     res['PER'] = data2[0]['PER(배)']
        #     res['PBR'] = data2[0]['PBR(배)']
        #     res['ROE'] = data2[0]['ROE(지배주주)']
        #     res['매출액'] = data2[0]['매출액']
        #     res['영업이익'] = data2[0]['영업이익']
        #     res['당기순이익'] = data2[0]['당기순이익']
        #     res['당기순이익'] = data2[0]['당기순이익']
        # else:
        #     res['PER'] = ''
        #     res['PBR'] = ''
        #     res['ROE'] = ''
        #     res['매출액'] = ''
        #     res['영업이익'] = ''
        #     res['당기순이익'] = ''
        #     res['당기순이익'] = ''                 

def crawl_naver(stock_code):
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.headless = True
    browser = webdriver.Chrome(executable_path="/usr/bin/chromedriver",options=options)

    url = NAVER['finance_sum_url'] + stock_code
    browser.get(url)

    browser.switch_to_frame(browser.find_element_by_id('coinfo_cp'))

    # page not found handle
    # 상장된지 얼마안되서 자료없는 경우인듯
    try:
        browser.find_element_by_id('pageError') # <div id="pageError">
        return empty_info
    except:
        pass    
    
    #재무제표 "연간" 클릭하기
    browser.find_elements_by_xpath('//*[@class="schtab"][1]/tbody/tr/td[3]')[0].click()

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

# def crawl_naver(stock_code):
#     options = webdriver.ChromeOptions()
#     options.add_argument('--no-sandbox')
#     options.add_argument('--disable-dev-shm-usage')
#     options.headless = True
#     browser = webdriver.Chrome(executable_path="/usr/bin/chromedriver",options=options)

#     url = NAVER['finance_sum_url'] + stock_code
#     browser.get(url)

#     browser.switch_to_frame(browser.find_element_by_id('coinfo_cp'))

#     # page not found handle
#     # 상장된지 얼마안되서 자료없는 경우인듯
#     try:
#         browser.find_element_by_id('pageError') # <div id="pageError">
#         return empty_info
#     except:
#         pass    
    
#     #재무제표 "연간" 클릭하기
#     browser.find_elements_by_xpath('//*[@class="schtab"][1]/tbody/tr/td[3]')[0].click()

#     html0 = browser.page_source
#     html1 = BeautifulSoup(html0,'html.parser')
    
#     # #기업명 뽑기
#     # title0 = html1.find('head').find('title').text
#     # print(title0.split('-')[-1])

#     #거래량, 시가총액, 수익률 구하기
#     html11 = html1.find('table',{'class':'gHead','summary':'기업의 기본적인 시세정보(주가/전일대비/수익률,52주최고/최저,액면가,거래량/거래대금,시가총액,유동주식비율,외국인지분율,52주베타,수익률(1M/3M/6M/1Y))를 제공합니다.'})
   
#     tbody0 = html11.find('tbody')
#     tr0 = tbody0.find_all('tr')
    
#     tr1 = tr0[3]
#     td1 = tr1.find('td').text

#     tr2 = tr0[4]
#     td2 = tr2.find('td').text

#     tr3 = tr0[0]
#     td3 = tr3.find('td')
#     l = td3.find_all('span')

#     stock_return = l[1].text if l else ''

#     tr4 = tr0[8]
#     td4 = tr4.find('td')
#     sp0 = td4.find_all('span')
#     stock_return += '/' + sp0[0].text
#     stock_return += '/' + sp0[3].text

#     stock_volume = td1.strip().split(' /',1)[0]
#     market_cap = td2.strip()
    
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
#     try:
#         my_df = df.loc[['2019/12'],['매출액','영업이익','당기순이익','자산총계','부채총계','자본총계','EPS(원)','PER(배)','ROE(%)','BPS(원)','PBR(배)']]
#     except:
#         return empty_info
                
#     res = my_df.to_dict('records')

#     #종업원수·상장일 구하기
#     #"기업개요" 클릭하기
#     browser.find_elements_by_xpath('//*[@class="wrapper-menu"][1]/dl/dt[2]')[0].click()

#     html0 = browser.page_source
#     html1 = BeautifulSoup(html0,'html.parser')   
    
#     html22 = html1.find('table',{'class':'gHead all-width','summary':'기업에 대한 기본적인 정보(본사주소,홈페이지,대표전화,설립일,대표이사,계열,종업원수,주식수(보통주/우선주),감사인,명의개서,주거래은행)을 제공합니다.'})
   
#     tbody0 = html22.find('tbody')
#     tr0 = tbody0.find_all('tr')[3]
#     td0 = tr0.find_all('td')[1].text

#     employee = td0.strip().split(' (')[0]

#     tr0 = tbody0.find_all('tr')[2]
#     td0 = tr0.find_all('td')[0].text
#     text0 = td0.strip().rsplit('상장일: ',1)[-1]
#     listing_date = text0.replace('/','.').replace(')','')

#     res[0].update({
#         '종업원수' : employee,
#         '상장일' : listing_date,
#         '거래량' : stock_volume,
#         '시가총액' : market_cap,
#         '수익률' : stock_return,
#     })

#     return res[0]    

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

# def dateLessThan(date1,date2):
#     "date1 < date2 is True?"
#     datetime1 = datetime.strptime(date1, '%Y-%m-%d') if isinstance(date1, str) else date1
#     datetime2 = datetime.strptime(date2, '%Y-%m-%d') if isinstance(date2, str) else date2
#     return datetime1 < datetime2    
