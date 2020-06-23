from .models import stock_quotes, financial_statements
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



# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

DART = settings.DART
NAVER = settings.NAVER

def parse_stock(request):
    """ stock quote """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        kiscode = data["kiscode"]
        # return JsonResponse(crawl_stock(request), safe=False)
        # update 
        try:
            crawl_stock(request)
        except:
            return HttpResponse() # 500
            
        try:
            today = datetime.today().strftime('%Y-%m-%d')
            ten_yrs_before = datetime.now() + relativedelta(years=-10)
            ten_yrs_before = ten_yrs_before.strftime('%Y-%m-%d')

            isExist = stock_quotes.objects.filter(kiscode=kiscode, price_date__range=[ten_yrs_before,today]).exists()
            if not isExist:
                return HttpResponse('Not Found', status=404)

            stockQuotes = stock_quotes.objects.filter(kiscode=kiscode, price_date__range=[ten_yrs_before,today])

            myDate = list(stockQuotes.values_list('price_date', flat=True).order_by('price_date'))
            myStock = list(stockQuotes.values_list('stock', flat=True).order_by('price_date'))
            myVolume = list(stockQuotes.values_list('volume', flat=True).order_by('price_date'))

            response = { 'dates': myDate, 'data': myStock, 'volumes': myVolume}          
            return JsonResponse(response,status=200, safe=False)
        except:
            return HttpResponse() # 500

# def crawl_stock_all(request):
#     ''' 
#     page 1 부터 crawling -> if exist at db ? 
#               yes -> return
#               no -> stock_quotes.objects.create(**newStock)
#     '''
#     if request.method == 'POST':
#         data = json.loads(request.body.decode('utf-8'))
#         kiscode = data["kiscode"]

#         from openpyxl import load_workbook
#         app_path = settings.BASE_DIR + '/company/'
#         wb = load_workbook(app_path + '상장법인목록.xlsx')
#         # ws = wb.get_sheet_by_name('상장법인목록')
#         ws = wb[wb.sheetnames[0]]
#         column = ws['B']
#         column_list = [column[x].value for x in range(len(column))]
#         del column_list[0] # remove title

#         for kiscode in column_list[5:100]:
#             # exist ? {
#             try:
#                 stockQuotes = stock_quotes.objects.filter(kiscode=kiscode).latest('price_date')
#                 lastRecordDate = stockQuotes.price_date if stockQuotes else None
#             except:
#                 lastRecordDate = None

#             # exist ? }



#             naver_url = 'http://finance.naver.com/item/sise_day.nhn?code='
#             url = naver_url + kiscode
#             html = urlopen(url) 
#             source = BeautifulSoup(html.read(), "html.parser")
            
#             maxPage=source.find_all("table",align="center")
#             mp = maxPage[0].find_all("td",class_="pgRR")
#             if mp:
#                 # mpNum = int(mp[0].a.get('href')[-3:])
#                 mpNum = int(mp[0].a.get('href').split('page=')[1])
#             else:
#                 mpNum = 1    
            

#             isCrawlBreak = None                                                    
#             for page in range(1, mpNum+1):
#                 if isCrawlBreak:
#                     break
#                 # print (str(page) )
#                 url = naver_url + kiscode +'&page='+ str(page)
#                 html = urlopen(url)
#                 source = BeautifulSoup(html.read(), "html.parser")
#                 srlists=source.find_all("tr")
#                 isCheckNone = None

#                 # if((page % 1) == 0):
#                 #     time.sleep(1.50)

#                 # data : open, close, lowest, highest, volume
#                 # naver : 종가, 전일비, 시가, 고가, 저가, 거래량
#                 # ResultSet order : 2,0,4,3,5 
#                 for i in range(1,len(srlists)-1):
#                     if(srlists[i].span != isCheckNone):

#                         newDate = srlists[i].find_all("td",align="center")[0].text
#                         newDate = newDate.replace('.','-')
#                         newDate_obj = datetime.strptime(newDate, '%Y-%m-%d')
#                         lastRecordDate_obj = datetime.combine(lastRecordDate, datetime.min.time()) if lastRecordDate else ''

#                         if not lastRecordDate or (lastRecordDate and lastRecordDate_obj.date() <= newDate_obj.date()):
#                             first = srlists[i].find_all("td",class_="num")[2].text
#                             second = srlists[i].find_all("td",class_="num")[0].text
#                             third = srlists[i].find_all("td",class_="num")[4].text
#                             fourth = srlists[i].find_all("td",class_="num")[3].text
#                             fifth = srlists[i].find_all("td",class_="num")[5].text

#                             first = int(first.replace(',',''))
#                             second = int(second.replace(',',''))
#                             third = int(third.replace(',',''))
#                             fourth = int(fourth.replace(',',''))
#                             fifth = int(fifth.replace(',',''))
                            
#                             newUid = str(uuid.uuid4())
#                             newStock = {
#                                 'id': newUid,
#                                 'kiscode': kiscode,
#                                 'price_date': newDate,
#                                 'stock': [first, second, third, fourth, fifth],
#                                 'volume' : fifth
#                             }
#                             isMatchToday = True if lastRecordDate and lastRecordDate_obj.date() == newDate_obj.date() else False

#                             if not isMatchToday:
#                                 stock_quotes.objects.create(**newStock)
#                             else:                            
#                                 stock_quotes.objects.filter(kiscode=kiscode, price_date=newDate).update(**newStock)
#                             # stock_quotes.objects.update_or_create(**newStock)
#                         else:
#                             isCrawlBreak = True    
#     return

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
            stockQuotes = stock_quotes.objects.filter(kiscode=kiscode).latest('price_date')
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
                        
                        newUid = str(uuid.uuid4())
                        newStock = {
                            'id': newUid,
                            'kiscode': kiscode,
                            'price_date': newDate,
                            'stock': [first, second, third, fourth, fifth],
                            'volume' : fifth
                        }
                        isMatchToday = True if lastRecordDate and lastRecordDate_obj.date() == newDate_obj.date() else False

                        if not isMatchToday:
                            stock_quotes.objects.create(**newStock)
                        else:                            
                            stock_quotes.objects.filter(kiscode=kiscode, price_date=newDate).update(**newStock)
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
            financial = financial_statements.objects.filter(kiscode=kiscode)
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
        res['ceo_nm'] = data['ceo_nm']
        res['est_dt'] = data['est_dt']
        res['jurir_no'] = data['jurir_no']
        res['induty_code'] = data['induty_code']
        res['hm_url'] = data['hm_url']
        res['phn_no'] = data['phn_no']
        res['adres'] = data['adres']


        # 시황 정보 · 재무 정보
        if data['stock_code']:
            url = NAVER['finance_url'] + data['stock_code']

            request = requests.get(url)
            df = pd.read_html(request.text)[3]

            df.set_index(('주요재무정보', '주요재무정보', '주요재무정보'), inplace=True)
            df.index.rename('주요재무정보', inplace=True)
            df.columns = df.columns.droplevel(2)
            df = df.iloc[:,2:-7] # 최근 연간 실적 - 작년
            dft = df.T
            data2 = dft.to_dict('records')
            res['PER'] = data2[0]['PER(배)']
            res['PBR'] = data2[0]['PBR(배)']
            res['ROE'] = data2[0]['ROE(지배주주)']
            res['매출액'] = data2[0]['매출액']
            res['영업이익'] = data2[0]['영업이익']
            res['당기순이익'] = data2[0]['당기순이익']
            res['당기순이익'] = data2[0]['당기순이익']
        else:
            res['PER'] = ''
            res['PBR'] = ''
            res['ROE'] = ''
            res['매출액'] = ''
            res['영업이익'] = ''
            res['당기순이익'] = ''
            res['당기순이익'] = ''                 

    return JsonResponse(res, safe=False)

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

def dateLessThan(date1,date2):
    "date1 < date2 is True?"
    datetime1 = datetime.strptime(date1, '%Y-%m-%d') if isinstance(date1, str) else date1
    datetime2 = datetime.strptime(date2, '%Y-%m-%d') if isinstance(date2, str) else date2
    return datetime1 < datetime2    
