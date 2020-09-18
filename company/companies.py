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
import uuid

from copy import deepcopy
import json

from .utils import get_redis_key, dictfetchall, remove_tags, remove_brackets, remove_punc

from .models import nice_corp, stock_quotes


# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

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
        # 키워드 검색
        else:
            # whereAll = like_parse(params["searchText"]) if params["searchText"] else ""
            whereAll = like_parse_nice(params["searchText"]) if params["searchText"] else ""

        # query = 'SELECT * FROM listed_corp WHERE (' + \
        query = 'SELECT * FROM nice_corp WHERE (' + \
            whereAll + ")"

        if mode == "query": # mode가 query면 여기서 분기
            return query

        cursor.execute(
            "SET work_mem to '100MB';"
            + query
        )
        row = dictfetchall(cursor)


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

def like_parse(keyword=""):
    """ like query 생성 """
    """ keyword 변환 => and, or, _, -, not, near, adj 를 tsquery 형식의 | & ! <1> 로 변경 """

    # (기업이름).CN and (주소).CA and (사업영역).BD and (관련키워드).RK and (사용자).CC and (@MC>=1111<=2222) and (@FD>=33333333<=44444444) and (@EM>=55<=66) and (@RA>=77<=88)
    if keyword and keyword != "":

        res = ""  # unquote(keyword) # ; issue fix
        # for val in keyword.split(" AND "):
        for val in re.split(" and ", keyword, flags=re.IGNORECASE):  # case insentitive
            # continue they were not implemented
            if val.startswith("(@") or val.endswith(").RK") or val.endswith(").CC"):
                continue
            res += "("  # not add paranthesis when above terms
            # select fieldName and remove initial symbol
            if val.endswith(".CN"):
                val = val.replace(".CN", "")
                res += '회사명'
            if val.endswith(".CA"):
                val = val.replace(".CA", "")
                res += '지역'                
            if val.endswith(".BD"):
                val = val.replace(".BD", "")
                res += '업종'                
            if val.endswith(".IN"):
                val = val.replace(".IN", "")
                res += '주요제품'                
           
            # convert nagative - to None
            if val.startswith("-") or ' or -' in val:
                val = val.replace("-", "")
                res += " not"
            # convert nagative not to None
            if val.startswith("not ") or ' or not ' in val:
                val = val.replace("not ", "")
                res += " not"
            val = re.sub('[()]', '', val)
            res += " like '%" + val + "%' and " 
            # if " OR " in val:
            # if " or ".upper() in map(str.upper, val):
            #     needPlainto = "\""

            # # add paranthesis every terms block

            # res += (
            #     needPlainto + "".join(str(val)) + needPlainto + ") & "
            # )
        # res = res.replace(" AND ", needPlainto + " & ").replace(" OR ", needPlainto + " | ").replace(
        #     " and ", needPlainto + " & ").replace(" or ", needPlainto + " | ")  # .replace("_", " ")

        if res.endswith(" and "):
            res = res[:-5]
        res += ")"
    else:
        res = None
    return res     

def like_parse_nice(keyword=""):
    """ like query 생성 """
    """ keyword 변환 => and, or, _, -, not, near, adj 를 tsquery 형식의 | & ! <1> 로 변경 """

    # (기업이름).CN and (주소).CA and (사업영역).BD and (관련키워드).RK and (사용자).CC and (@MC>=1111<=2222) and (@FD>=33333333<=44444444) and (@EM>=55<=66) and (@RA>=77<=88)
    if keyword and keyword != "":

        res = ""  # unquote(keyword) # ; issue fix
        # for val in keyword.split(" AND "):
        for val in re.split(" and ", keyword, flags=re.IGNORECASE):  # case insentitive
            # continue they were not implemented
            if val.startswith("(@") or val.endswith(").RK") or val.endswith(").CC"):
                continue
            res += "("  # not add paranthesis when above terms
            # select fieldName and remove initial symbol
            if val.endswith(".CN"):
                val = val.replace(".CN", "")
                res += '업체명'
            if val.endswith(".CA"):
                val = val.replace(".CA", "")
                res += '주소'                
            if val.endswith(".BD"):
                val = val.replace(".BD", "")
                res += '업종명'                
            if val.endswith(".IN"):
                val = val.replace(".IN", "")
                res += '주요제품'                
           
            # convert nagative - to None
            if val.startswith("-") or ' or -' in val:
                val = val.replace("-", "")
                res += " not"
            # convert nagative not to None
            if val.startswith("not ") or ' or not ' in val:
                val = val.replace("not ", "")
                res += " not"
            val = re.sub('[()]', '', val)
            res += " like '%" + val + "%' and " 
            # if " OR " in val:
            # if " or ".upper() in map(str.upper, val):
            #     needPlainto = "\""

            # # add paranthesis every terms block

            # res += (
            #     needPlainto + "".join(str(val)) + needPlainto + ") & "
            # )
        # res = res.replace(" AND ", needPlainto + " & ").replace(" OR ", needPlainto + " | ").replace(
        #     " and ", needPlainto + " & ").replace(" or ", needPlainto + " | ")  # .replace("_", " ")

        if res.endswith(" and "):
            res = res[:-5]
        res += ")"
    else:
        res = None
    return res       

def parse_company_info(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        corpNo = data['corpNo']

        isExist = nice_corp.objects.filter(사업자등록번호=corpNo).exists()
        if not isExist:
            return HttpResponse('Not Found', status=404)

        row = nice_corp.objects.filter(사업자등록번호=corpNo).values()
        row = list(row)
        res = row[0] if row else {} #dict

    return JsonResponse(res, safe=False)

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
        stockCode = data["stockCode"]

        # exist ? {
        try:
            stockQuotes = stock_quotes.objects.filter(stock_code=stockCode).latest('price_date')
            lastRecordDate = stockQuotes.price_date if stockQuotes else None
        except:
            lastRecordDate = None

        # exist ? }

        naver_url = 'http://finance.naver.com/item/sise_day.nhn?code='
        url = naver_url + stockCode
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
            url = naver_url + stockCode +'&page='+ str(page)
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
                            'stock_code': stockCode,
                            'price_date': newDate,
                            'stock': [first, second, third, fourth, fifth],
                            'volume' : fifth
                        }
                        isMatchToday = True if lastRecordDate and lastRecordDate_obj.date() == newDate_obj.date() else False

                        if not isMatchToday:
                            stock_quotes.objects.create(**newStock)
                        else:                            
                            stock_quotes.objects.filter(stock_code=stockCode, price_date=newDate).update(**newStock)
                        # stock_quotes.objects.update_or_create(**newStock)
                    else:
                        isCrawlBreak = True    
    return            