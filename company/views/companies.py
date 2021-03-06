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
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from urllib.request import urlopen


# naver crawl
from selenium.webdriver import Chrome
from selenium import webdriver

import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
import pandas as pd

# dart
import requests

from copy import deepcopy
import json

from ..utils import get_redis_key, dictfetchall, remove_tags, remove_brackets, remove_punc, str2int, str2round
from .crawler import crawl_stock
from ..models import Nice_corp, Stock_quotes, Stock_split, Mdcin_clinc_test_info, Financial_statements
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
    
    # mainKey = '¶all'
    # context = cache.get(mainKey)

    # mainKey, _, params, subParams = get_redis_key(request)
    mainKey, _, _, _ = get_redis_key(request)
    context = cache.get(mainKey)

    if mode == "begin":
        try:
            if context['raw']:
                return JsonResponse(context['raw'], safe=False)
        except:
            pass 

    if mode == "trash":
        try:
            if context['raw']:
                return context['raw']
        except:
            pass 

    with connection.cursor() as cursor:

        # if 'starred' in params.values() and subParams:
        #     whereAll = "종목코드 = ANY(%s));"
        # else:        
        # whereAll = "1=1)"

        whereAll = "1=1)"
        query = 'SELECT * FROM listed_corp WHERE (' + \
            whereAll

        # query = 'SELECT * FROM listed_corp ' + \
        #     'union all ' + \
        #     'select B.회사명, B.종목코드, A.업종, A.주요제품, A.상장일, A.결산월, A.대표자명, A.홈페이지, A.지역, A.정보, A.재무, A.kiscode FROM listed_corp A JOIN preferred_stock B ON A.종목코드 = B.연결코드'

        if mode == "query": # mode가 query면 여기서 분기
            return query

        cursor.execute(
            "SET work_mem to '100MB';"
            + query)            
        result = dictfetchall(cursor)

    if result:
        for i in range(len(result)):
            data = json.loads(result[i]['정보']) # move position each fields of 정보 json to main fields
            result[i]['id'] = result[i]['종목코드']
            for key, value in data.items():
                result[i].update({key: value})

            del result[i]['정보']

    # redis 저장 {
    new_context = {}
    new_context['raw'] = result

    cache.set(mainKey, new_context, CACHE_TTL)
    # redis 저장 }

    if mode == "begin":
        return JsonResponse(result, safe=False)

    if mode == "trash":
        return result

def trash_search(request):
    data = json.loads(request.body.decode('utf-8'))
    searchId = data["searchId"]

    listDicts = get_companies(request, mode="trash")
    result = [d for d in listDicts if d['id'] == searchId]

    return JsonResponse(result, safe=False)    

def trash_searchs(request):
    data = json.loads(request.body.decode('utf-8'))
    searchIds = data["searchIds"]

    listDicts = get_companies(request, mode="trash")
    result = [d for d in listDicts if d['id'] in searchIds]

    return JsonResponse(result, safe=False)

def get_query(request):
    """ 쿼리 확인용 """
    return HttpResponse(get_companies(request, mode="query"), content_type="text/plain; charset=utf-8")

def get_financial_info(request):
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
        result = row[0]['재무'] if row else {}
        if row:
            result.update({ 'stockFairValue': [ row[0]['정보']['적(1)PER*EPS'], row[0]['정보']['적(2)ROE*EPS'], row[0]['정보']['적(3)EPS*10'], row[0]['정보']['적(4)s-rim'], row[0]['정보']['적(5)당기순이익*PER'], row[0]['정보']['적정가평균'], row[0]['정보']['전일종가']]})

    return JsonResponse(result, safe=False)    

def get_stock(request):
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

            range_dt = datetime.now() + relativedelta(**kwargs)
            range_from = range_dt.strftime('%Y-%m-%d')

    
            stockQuotes = Stock_quotes.objects.filter(stock_code=stockCode, price_date__range=[range_from,today])
            if not stockQuotes.exists():
                return HttpResponse('Not Found', status=404)

            # Check if exist par value division
            stockSplit = Stock_split.objects.filter(stock_code=stockCode)
            try:
                row = stockSplit.values()
                row = list(row)
                res = row[0] if row else {}
            except:
                res = {}    

            end_date_dt = datetime.combine(res['end_date'], datetime.min.time()) if res and res['end_date'] else ''

            if stockSplit.exists() and ( range_dt.date() <= end_date_dt.date()):
                stockQuotesLeft = Stock_quotes.objects.filter(stock_code=stockCode, price_date__range=[range_from,end_date_dt.date()])
                myStockLeft = list(stockQuotesLeft.values_list('stock', flat=True).order_by('price_date'))

                # divid stock split except 0 value and 5th idx (volume)
                stock_split = float(res['stock_split'])
                myStockLeft[:] = [[int(x / stock_split) if x > 0 and idx != 4 else x for (idx, x) in enumerate(i)] for i in myStockLeft]

                end_nextday = end_date_dt + timedelta(days=1)
                stockQuotesRight = Stock_quotes.objects.filter(stock_code=stockCode, price_date__range=[end_nextday.date(),today])
                myStockRight = list(stockQuotesRight.values_list('stock', flat=True).order_by('price_date'))

                myStock = myStockLeft + myStockRight            
            else:
                # no need to handle par value division
                myStock = list(stockQuotes.values_list('stock', flat=True).order_by('price_date'))

            myVolume = list(stockQuotes.values_list('volume', flat=True).order_by('price_date'))
            myDate = list(stockQuotes.values_list('price_date', flat=True).order_by('price_date'))
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
        
