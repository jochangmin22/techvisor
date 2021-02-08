# app
import requests
from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
import json
import operator
from datetime import datetime

from .utils import dictfetchall, get_redis_key, tokenizer, tokenizer_phrase
from .crawler import update_today_disclosure_report, update_today_crawl_mdcline

from .models import Mdcin_clinc_test_info, Disclosure_report
from search.models import Listed_corp, Disclosure



# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
COMPANY_ASSIGNE_MATCHING = settings.TERMS['COMPANY_ASSIGNE_MATCHING']

def clinic_test(request):
    ''' If there is no corpName, the last 100 rows are displayed '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        corpName = data['corpName']

         # crawl today report
        weekno = datetime.today().weekday()
        if weekno<5: # On weekends, the clinical server does not work, so the crawl passes
            update_today_crawl_mdcline()

        if corpName:
            isExist = Mdcin_clinc_test_info.objects.filter(신청자__contains=corpName).exists()
            if not isExist:
                return JsonResponse([], safe=False)

            rows = Mdcin_clinc_test_info.objects.filter(신청자__contains=corpName).order_by('-승인일').values()
        else:
            rows = Mdcin_clinc_test_info.objects.all().order_by('-승인일')[:100].values()            

        rows = list(rows)
        result = [dict(row, **{
                '신청자': row['신청자'],
                '승인일': row['승인일'],
                '제품명': row['제품명'],
                '시험제목': row['시험제목'],
                '연구실명': row['연구실명'],
                '임상단계': row['임상단계'],
            }) for row in rows]
            
        return JsonResponse(result, safe=False) 

def get_disclosure_report(request):
    ''' If there is no corpName, the last 100 rows are displayed '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        corpName = data['corpName']

        # crawl today report
        weekno = datetime.today().weekday()
        if weekno<5: # On weekends, the opendart server does not work, so the crawl passes        
            update_today_disclosure_report()

        if corpName:
            isExist = Disclosure_report.objects.filter(종목명__contains=corpName).exists()
            if not isExist:
                return JsonResponse([], safe=False)

            rows = Disclosure_report.objects.filter(종목명__contains=corpName).order_by('-접수번호').values()
        else:
            # rows = Disclosure_report.objects.all().order_by('-접수일자')[:100].values()            
            rows = Disclosure_report.objects.exclude(종목코드__exact='').order_by('-접수번호')[:100].values()            

        rows = list(rows)
        result = [dict(row, **{
                '공시대상회사': row['종목명'],
                '보고서명': row['보고서명'],
                '제출인': row['공시제출인명'],
                '접수일자': row['접수일자'],
                '비고': row['비고'],
            }) for row in rows]
            
        return JsonResponse(result, safe=False)         

def get_owned_patent(request, mode="begin"): # mode : begin, nlp 
    ''' If there is no corpName, the last 100 rows are displayed '''
    
    mainKey, _, params, _ = get_redis_key(request)

    context = cache.get(mainKey)

    if mode == "begin":
        try:
            return JsonResponse(context['raw'], safe=False)
        except:
            pass          

    selecting_columns = 'SELECT count(*) over () as cnt, A.등록사항, A."발명의명칭(국문)", A."발명의명칭(영문)", A.출원번호, A.출원일자, A.출원인1, A.출원인코드1, A.출원인국가코드1, A.발명자1, A.발명자국가코드1, A.등록일자, A.공개일자, A.ipc요약, A.요약token, A.전체항token FROM '

    try:
        with connection.cursor() as cursor:
            if params['corpName']:
                corpName = params['corpName']
                for k, v in COMPANY_ASSIGNE_MATCHING.items():
                    if k == params['corpName']:
                        corpName = v
                        break

                foo =  '"성명" like $$%' + corpName + '%$$'
                query = f'{selecting_columns} ( SELECT 출원번호 FROM ( SELECT 출원번호 FROM 공개인명정보 WHERE {foo} ) K GROUP BY 출원번호 ) V, 공개공보 A WHERE V.출원번호 = A.출원번호 order by A.출원일자 desc offset 0 rows fetch next 1001 rows only;' 
            else:                    
                query = f'{selecting_columns} where 출원일자 is not null order by 출원일자 desc limit 100'

            cursor.execute(query)
            data = dictfetchall(cursor)
        # return HttpResponse(json.dumps(query, ensure_ascii=False))
        # wordcloud에 쓰일 nlp 만들기
        raw_abstract = ''
        raw_claims = ''
        total = data[0]["cnt"] if data[0]["cnt"] else 0
        for i in range(len(data)):
            raw_abstract += data[i]["요약token"] if data[i]["요약token"] else "" + " "
            raw_claims += data[i]["전체항token"] if data[i]["전체항token"] else "" + " "   

            del data[i]["요약token"]
            del data[i]["전체항token"]
            del data[i]["cnt"]

        result = { 'total': total, 'data': data}            

        # redis 저장 {
        new_context = {}
        new_context['raw'] = result
        new_context['raw_abstract'] = raw_abstract
        new_context['raw_claims'] = raw_claims            
        cache.set(mainKey, new_context, CACHE_TTL)
        # redis 저장 }                

        if mode == "begin":
            return JsonResponse(result, safe=False)
        elif mode == "nlp":
            return raw_abstract, raw_claims
    except:
        if mode == "begin":
            return JsonResponse([], safe=False)
        elif mode == "nlp":
            return '', ''

def parse_nlp(request, analType):
    """
       analType : wordCloud
    """

    _, subKey, _, subParams = get_redis_key(request)

    #### Create a new SubKey to distinguish each analysis type 
    newSubKey = subKey + '¶' + analType

    sub_context = cache.get(newSubKey)

    try:
        return sub_context['nlp_token']
    except:
        pass

    raw_abstract, raw_claims = get_owned_patent(request, mode="nlp")

    nlp_raw = ''
    nlp_token = ''

    analType = analType + 'Options'

    if subParams['menuOptions'][analType]['volume'] == '요약':
        nlp_raw = raw_abstract
    elif subParams['menuOptions'][analType]['volume'] == '청구항':
        nlp_raw = raw_claims        

    # tokenizer
    if subParams['menuOptions'][analType]['unit'] == '구문':
        try:
            nlp_token = tokenizer_phrase(nlp_raw)
        except:
            nlp_token = []
    elif subParams['menuOptions'][analType]['unit'] == '워드':            
        try:
            nlp_token = tokenizer(nlp_raw)
        except:
            nlp_token = []        

    new_sub_context = {}
    new_sub_context['nlp_token'] = nlp_token
    cache.set(newSubKey, new_sub_context, CACHE_TTL)

    return nlp_token                            

def wordcloud(request):
    _, subKey, _, subParams = get_redis_key(request)

    # Redis {
    sub_context = cache.get(subKey)    

    try:
        return HttpResponse(sub_context['wordcloud'])
    except:
        pass        
    # Redis }


    try:
        unitNumber = subParams['menuOptions']['wordCloudOptions']['output']
    except:
        unitNumber = 50        

    try:  # handle NoneType error
        taged_docs = parse_nlp(request, analType="wordCloud")
        taged_docs = [w.replace('_', ' ') for w in taged_docs]
        if taged_docs == [] or taged_docs == [[]]:  # result is empty
            return HttpResponse( "[]", content_type="text/plain; charset=utf-8")
    except:
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
