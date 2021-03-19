# app
import requests
from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
from copy import deepcopy
import json
import operator
from datetime import datetime, timedelta

from ..utils import dictfetchall, get_redis_key, tokenizer, tokenizer_phrase, remove_duplicates, sampling, remove_tail
from .crawler import update_today_corp_report, update_today_crawl_mdcline

from ..models import Mdcin_clinc_test_info, Disclosure_report
from search.models import Listed_corp, Disclosure



# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
COMPANY_ASSIGNE_MATCHING = settings.TERMS['COMPANY_ASSIGNE_MATCHING']

def save_crawl_time(key):
    now = datetime.utcnow()
    return cache.set(key, now, CACHE_TTL)

def more_then_an_hour_passed(last_updated):    
    try:
        if (datetime.utcnow() - last_updated) > timedelta(1):
            return True
        else:
            return False            
    except:
        return True            

def get_clinic_test(request):
    ''' If there is no corpName, the last 100 rows are displayed '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        corpName = data.get('corpName','')
        pageIndex = data.get('pageIndex', 0)
        pageSize = data.get('pageSize', 10)
        sortBy = data.get('sortBy', [])        

        # Add sort by
        orderClause = ','.join('-'+ s['_id'] if s['desc'] else s['_id'] for s in sortBy) if sortBy else '-승인일'
        
        # check one hour or more has passed from latest crawl
        last_updated = cache.get('clinic_text_crawl') if cache.get('clinic_text_crawl') else None

         # crawl today report
        weekno = datetime.today().weekday()
        if weekno<5 and more_then_an_hour_passed(last_updated): # On weekends, the clinical server does not work, so the crawl passes
            update_today_crawl_mdcline()
            save_crawl_time('clinic_text_crawl')

        if corpName:
            isExist = Mdcin_clinc_test_info.objects.filter(신청자__contains=corpName).exists()
            if not isExist:
                return JsonResponse([], safe=False)

            rows = Mdcin_clinc_test_info.objects.filter(신청자__contains=corpName).order_by(orderClause).values()
        else:
            rows = Mdcin_clinc_test_info.objects.all().order_by(orderClause)[:100].values()            

        # Add offset limit
        offset = pageIndex * pageSize
        limit = pageSize

        rowsCount = len(rows)
        rows = sampling(list(rows), offset, limit)
        # rows = list(rows)
        res = [dict(row, **{
                '신청자': row['신청자'],
                '승인일': row['승인일'],
                '제품명': row['제품명'],
                '시험제목': row['시험제목'],
                '연구실명': row['연구실명'],
                '임상단계': row['임상단계'],
            }) for row in rows]
        result = { 'rowsCount': rowsCount, 'rows': res }            
        return JsonResponse(result, safe=False) 

def get_corp_report(request):
    ''' If there is no corpName, the last 100 rows are displayed '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        corpName = data.get('corpName','')
        pageIndex = data.get('pageIndex', 0)
        pageSize = data.get('pageSize', 10)
        sortBy = data.get('sortBy', [])  

        # Add sort by
        orderClause = ','.join('-'+ s['_id'] if s['desc'] else s['_id'] for s in sortBy) if sortBy else '-접수번호'        

        # check one hour or more has passed from latest crawl
        last_updated = cache.get('corp_report_crawl') if cache.get('corp_report_crawl') else None

        # crawl today report
        weekno = datetime.today().weekday()
        if weekno<5 and more_then_an_hour_passed(last_updated): # On weekends, the opendart server does not work, so the crawl passes        
            update_today_corp_report()
            save_crawl_time('corp_report_crawl')

        if corpName:
            isExist = Disclosure_report.objects.filter(종목명__contains=corpName).exists()
            if not isExist:
                return JsonResponse([], safe=False)

            rows = Disclosure_report.objects.filter(종목명__contains=corpName).order_by(orderClause).values()
        else:
            # rows = Disclosure_report.objects.all().order_by('-접수일자')[:100].values()            
            rows = Disclosure_report.objects.exclude(종목코드__exact='').order_by(orderClause)[:100].values()            

        # Add offset limit
        offset = pageIndex * pageSize
        limit = pageSize

        rowsCount = len(rows)
        rows = sampling(list(rows), offset, limit)            
        # rows = list(rows)
        res = [dict(row, **{
                '공시대상회사': row['종목명'],
                '보고서명': row['보고서명'],
                '제출인': row['공시제출인명'],
                '접수일자': row['접수일자'],
                '비고': row['비고'],
            }) for row in rows]

        result = { 'rowsCount': rowsCount, 'rows': res }            
        return JsonResponse(result, safe=False)             

def get_owned_patent(request, mode="begin"): # mode : begin, nlp 
    ''' If there is no corpName, the last 100 rows are displayed '''
    
    mainKey, subKey, params, subParams = get_redis_key(request)

    context = cache.get(mainKey)
    context_paging = cache.get(subKey)

    if mode == "begin":
        try:
            if context_paging['raw']:
                return JsonResponse(context_paging['raw'], safe=False)
        except:
            pass    

    pageIndex = subParams.get('pageIndex', 0)
    pageSize = subParams.get('pageSize', 10)
    sortBy = subParams.get('sortBy', [])                 

    selecting_columns = 'SELECT count(*) over () as cnt, A.등록사항, A."발명의명칭", A.출원번호, A.출원일, A.출원인1, A.출원인코드1, A.출원인국가코드1, A.발명자1, A.발명자국가코드1, A.등록일, A.공개일, A.ipc코드, A.요약, A.청구항 FROM '

    try:
        with connection.cursor() as cursor:
            if params['commonCorpName']:
                commonCorpName = params['commonCorpName']
                for k, v in COMPANY_ASSIGNE_MATCHING.items():
                    if k == params['commonCorpName']:
                        commonCorpName = v
                        break

                foo =  '"성명" like $$%' + commonCorpName + '%$$'
                query = f'{selecting_columns} ( SELECT 출원번호 FROM ( SELECT 출원번호 FROM 공개인명정보 WHERE {foo} ) K GROUP BY 출원번호 ) V, kr_text_view A WHERE V.출원번호 = A.출원번호 order by A.출원일 desc offset 0 rows fetch next 1001 rows only;' 
            else:                    
                query = f'{selecting_columns} where 출원일 is not null order by 출원일 desc limit 100'

            # Add sort by
            if sortBy:
                foo =' '
                for s in sortBy:
                    foo += s['_id']
                    foo += ' ASC, ' if s['desc'] else ' DESC, '

                foo = remove_tail(foo,", ")
                # query += f' order by {foo}'

            cursor.execute(
                "SET work_mem to '100MB';"
                + query
            )
            rows = dictfetchall(cursor)
        # return HttpResponse(json.dumps(query, ensure_ascii=False))
        # wordcloud에 쓰일 nlp 만들기

        # raw_abstract = ''
        # raw_claims = ''
        # total = data[0]["cnt"] if data[0]["cnt"] else 0
        dropKeysCommon = ('cnt','등록사항','발명의명칭','출원인국가코드1','발명자1','발명자국가코드1','공개일')
        dropKeysRows = ('cnt', '요약','청구항','출원인코드1','출원인국가코드1','발명자국가코드1','등록일','공개일')
        dropKeysWordcloud = ('출원번호', '출원일', '출원인1', '출원인코드1', '등록일', 'ipc코드')

        if rows:
            # get rowsCount
            try:
                rowsCount = rows[0]["cnt"]
            except IndexError:        
                rowsCount = 0  

            # create common raw
            com_raw = deepcopy(rows)
            for i in range(len(rows)):
                for k in dropKeysCommon:
                    com_raw[i].pop(k, None)

            # copy
            nlp_raw = deepcopy(com_raw)

            # row
            for i in range(len(rows)):
                rows[i]['id'] = rows[i]['출원번호'] # add id key for FE's ids
                # row는 list of dictionaries 형태임
                for k in dropKeysRows:
                    rows[i].pop(k, None)
                    
            # Add offset limit
            offset = pageIndex * pageSize
            limit = pageSize

            rows = sampling(rows, offset, limit) 

            # nlp
            for i in range(len(nlp_raw)):
                # nlp는 요약, 청구항 만 사용
                for k in dropKeysWordcloud:
                    nlp_raw[i].pop(k, None)

                nlp_raw[i]['요약·청구항'] = ' '.join(str(x) for x in nlp_raw[i].values())

        else:
            rows = []
            rowsCount = 0    

        result = { 'rowsCount': rowsCount, 'rows': rows}                                                                            

        # for i in range(len(data)):
        #     raw_abstract += data[i]["요약token"] if data[i]["요약token"] else "" + " "
        #     raw_claims += data[i]["전체항token"] if data[i]["전체항token"] else "" + " "   

        #     del data[i]["요약token"]
        #     del data[i]["전체항token"]
        #     del data[i]["cnt"]

        # result = { 'total': total, 'data': data}            

        # redis 저장 {
        new_context = {}
        new_context['nlp_raw'] = nlp_raw
        cache.set(mainKey, new_context, CACHE_TTL)

        # new_context['raw'] = result
        # new_context['raw_abstract'] = raw_abstract
        # new_context['raw_claims'] = raw_claims            

        new_context_paging = {}
        new_context_paging['raw'] = result
        cache.set(subKey, new_context_paging, CACHE_TTL)         
        # redis 저장 }                

        if mode == "begin":
            return JsonResponse(result, safe=False)
        elif mode == "nlp":
            return nlp_raw
            
            # return raw_abstract, raw_claims
    except:
        if mode == "begin":
            return JsonResponse([], safe=False)
        elif mode == "nlp":
            return []
            # return '', ''

def get_nlp(request, analType):
    """
       analType : wordCloud
    """

    _, subKey, _, subParams = get_redis_key(request)

    #### Create a new SubKey to distinguish each analysis type 
    newSubKey = subKey + '¶' + analType

    sub_context = cache.get(newSubKey)

    try:
        if sub_context['nlp_token']:        
            return sub_context['nlp_token']
    except:
        pass

    # raw_abstract, raw_claims = get_owned_patent(request, mode="nlp")
    nlp_raw = get_owned_patent(request, mode="nlp")


    # nlp_raw = ''
    # nlp_token = ''
    result = []


    analType = analType + 'Options'
    volume = subParams['menuOptions'][analType]['volume']
    unit = subParams['menuOptions'][analType]['unit']    
    try:
        emergence = subParams['menuOptions'][analType]['emergence']
    except KeyError:
        emergence = '빈도수'

    nlp_list = [d[volume] for d in nlp_raw] # '요약·청구항', '요약', '청구항', 

    nlp_str = ' '.join(nlp_list) if nlp_list else None            

    # if subParams['menuOptions'][analType]['volume'] == '요약':
    #     nlp_raw = raw_abstract
    # elif subParams['menuOptions'][analType]['volume'] == '청구항':
    #     nlp_raw = raw_claims 
    
    # tokenizer
    if unit == '구문':
        # try:
        if emergence == '빈도수':            
            result = tokenizer_phrase(nlp_str)
        elif emergence =='건수':                
            for foo in nlp_list:
                bar = remove_duplicates(tokenizer_phrase(foo))
                result.extend(bar) 
        # except:
            # result = []
    elif unit == '워드':            
        # try:
        if emergence == '빈도수':
            result = tokenizer(nlp_str)
        elif emergence =='건수':                 
            for foo in nlp_list:
                bar = remove_duplicates(tokenizer(foo))
                result.extend(bar)
        # except:
            # result = []              

    new_sub_context = {}
    new_sub_context['nlp_token'] = result
    cache.set(newSubKey, new_sub_context, CACHE_TTL)

    return result

    # # tokenizer
    # if subParams['menuOptions'][analType]['unit'] == '구문':
    #     try:
    #         nlp_token = tokenizer_phrase(nlp_raw)
    #     except:
    #         nlp_token = []
    # elif subParams['menuOptions'][analType]['unit'] == '워드':            
    #     try:
    #         nlp_token = tokenizer(nlp_raw)
    #     except:
    #         nlp_token = []        

    # new_sub_context = {}
    # new_sub_context['nlp_token'] = nlp_token
    # cache.set(newSubKey, new_sub_context, CACHE_TTL)

    return nlp_token                            

def get_wordcloud(request):
    _, subKey, _, subParams = get_redis_key(request)

    # Redis {
    sub_context = cache.get(subKey)    

    try:
        if sub_context['wordcloud']:        
            return HttpResponse(sub_context['wordcloud'])
    except:
        pass        
    # Redis }


    try:
        unitNumber = subParams['menuOptions']['wordCloudOptions']['output']
    except:
        unitNumber = 50        

    try:  # handle NoneType error
        taged_docs = get_nlp(request, analType="wordCloud")
        taged_docs = [w.replace('_', ' ') for w in taged_docs]
        if taged_docs == [] or taged_docs == [[]]:  # result is empty
            return HttpResponse( "[]", content_type="text/plain; charset=utf-8")
    except Exception as e:
        return HttpResponse("[]", content_type="text/plain; charset=utf-8")

    sublist = dict()

    for word in taged_docs:
        if word in sublist:
            sublist[word] += 1
        else:
            sublist[word] = 1

    sublist = sorted(
        sublist.items(), key=operator.itemgetter(1), reverse=True)[:unitNumber]

    fields = ["name", "value"]
    result = [dict(zip(fields, d)) for d in sublist]

    # json 형태로 출력
    result = json.dumps(result, ensure_ascii=False, indent="\t")
    if not result:
        return HttpResponse("[]", content_type="text/plain; charset=utf-8")

    # Redis {
    try:
        sub_context['wordcloud'] = result
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }

    return HttpResponse(result)                            
