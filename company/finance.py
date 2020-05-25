from .models import stock_quotes
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

three_yrs_ago = datetime.now() - relativedelta(years=3)
# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)


def parse_stock(request):
    """ stock quote """
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        kiscode = data["kiscode"]
        today = datetime.today().strftime('%Y-%m-%d')
        ten_yrs_before = datetime.now() + relativedelta(years=-10)
        ten_yrs_before = ten_yrs_before.strftime('%Y-%m-%d')

        try:
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
            noRecord = None
            if stockQuotes.exists():
                rows = list(stockQuotes.values())
                row = rows[0]
                noRecord = row['price_date']            
        except:
            noRecord = None

        # exist ? }

        naver_url = 'http://finance.naver.com/item/sise_day.nhn?code='
        url = naver_url + kiscode
        html = urlopen(url) 
        source = BeautifulSoup(html.read(), "html.parser")
        
        maxPage=source.find_all("table",align="center")
        mp = maxPage[0].find_all("td",class_="pgRR")
        mpNum = int(mp[0].a.get('href')[-3:])
                                                    
        for page in range(1, mpNum+1):
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

                    if not noRecord or (noRecord and noRecord < newDate):
                        first = srlists[i].find_all("td",class_="num")[2].text
                        second = srlists[i].find_all("td",class_="num")[0].text
                        third = srlists[i].find_all("td",class_="num")[4].text
                        fourth = srlists[i].find_all("td",class_="num")[3].text
                        fifth = srlists[i].find_all("td",class_="num")[5].text

                        first = float(first.replace(',',''))
                        second = float(second.replace(',',''))
                        third = float(third.replace(',',''))
                        fourth = float(fourth.replace(',',''))
                        fifth = float(fifth.replace(',',''))
                        
                        newUid = str(uuid.uuid4())
                        newStock = {
                            'id': newUid,
                            'kiscode': kiscode,
                            'price_date': newDate,
                            'stock': [first, second, third, fourth, fifth],
                            'volume' : fifth
                        }

                        stock_quotes.objects.create(**newStock)
                        
                        # srlists[i].td.text
                        # print(srlists[i].find_all("td",align="center")[0].text, srlists[i].find_all("td",class_="num")[0].text )
    return




def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
