# app
import requests
from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
from copy import deepcopy
import json
import operator
from datetime import datetime, timedelta

from utils import dictfetchall, get_redis_key, tokenizer, tokenizer_phrase, remove_duplicates, sampling, remove_tail, frequency_count, add_orderby
from .crawler import update_today_corp_report, update_today_crawl_mdcline

from ..models import Mdcin_clinc_test_info, Disclosure_report
from search.models import Listed_corp, Disclosure

from cpclasses import CpRelatedInfo

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
COMPANY_ASSIGNE_MATCHING = settings.TERMS['COMPANY_ASSIGNE_MATCHING']

def save_crawl_time(key):
    now = datetime.utcnow()
    return cache.set(key, now, 3600)

def more_then_an_hour_passed(last_updated):    
    try:
        if (datetime.utcnow() - last_updated) > timedelta(1):
            return True
        else:
            return False            
    except:
        return True

def get_clinic_test(request):
    result = clinic_test(request)
    return JsonResponse(result, safe=False)

def clinic_test(request):
    foo = CpRelatedInfo(request, mode='clinic_test')
    return foo.clinic_test()

def get_corp_report(request):
    result = corp_report(request)
    return JsonResponse(result, safe=False)

def corp_report(request):
    foo = CpRelatedInfo(request, mode='corp_report')
    return foo.corp_report()

# def xxget_clinic_test(request):
#     ''' If there is no corpName, the last 100 rows are displayed '''
#     if request.method == 'POST':
#         data = json.loads(request.body.decode('utf-8'))
#         corpName = data.get('corpName','')
#         pageIndex = data.get('pageIndex', 0)
#         pageSize = data.get('pageSize', 10)
#         sortBy = data.get('sortBy', [])        

#         # Add sort by
#         orderClause = ','.join('-'+ s['_id'] if s['desc'] else s['_id'] for s in sortBy) if sortBy else '-승인일'
        
#         # check one hour or more has passed from latest crawl
#         last_updated = cache.get('clinic_text_crawl') if cache.get('clinic_text_crawl') else None

#          # crawl today report
#         weekno = datetime.today().weekday()
#         if weekno<5 and more_then_an_hour_passed(last_updated): # On weekends, the clinical server does not work, so the crawl passes
#             update_today_crawl_mdcline()
#             save_crawl_time('clinic_text_crawl')

#         if corpName:
#             isExist = Mdcin_clinc_test_info.objects.filter(신청자__contains=corpName).exists()
#             if not isExist:
#                 return JsonResponse({ 'rowsCount': 0, 'rows': [] } , safe=False)

#             rows = Mdcin_clinc_test_info.objects.filter(신청자__contains=corpName).order_by(orderClause).values()
#         else:
#             rows = Mdcin_clinc_test_info.objects.all().order_by(orderClause)[:100].values()            

#         # Add offset limit
#         offset = pageIndex * pageSize
#         limit = pageSize

#         rowsCount = len(rows)
#         rows = sampling(list(rows), offset, limit)
#         # rows = list(rows)
#         res = [dict(row, **{
#                 '신청자': row['신청자'],
#                 '승인일': row['승인일'],
#                 '제품명': row['제품명'],
#                 '시험제목': row['시험제목'],
#                 '연구실명': row['연구실명'],
#                 '임상단계': row['임상단계'],
#             }) for row in rows]
#         result = { 'rowsCount': rowsCount, 'rows': res }            
#         return JsonResponse(result, safe=False) 

# def xxget_corp_report(request):
#     ''' If there is no corpName, the last 100 rows are displayed '''
#     if request.method == 'POST':
#         data = json.loads(request.body.decode('utf-8'))
#         corpName = data.get('corpName','')
#         pageIndex = data.get('pageIndex', 0)
#         pageSize = data.get('pageSize', 10)
#         sortBy = data.get('sortBy', [])  

#         # Add sort by
#         orderClause = ','.join('-'+ s['_id'] if s['desc'] else s['_id'] for s in sortBy) if sortBy else '-접수번호'        

#         # check one hour or more has passed from latest crawl
#         last_updated = cache.get('corp_report_crawl') if cache.get('corp_report_crawl') else None

#         # crawl today report
#         weekno = datetime.today().weekday()
#         if weekno<5 and more_then_an_hour_passed(last_updated): # On weekends, the opendart server does not work, so the crawl passes        
#             update_today_corp_report()
#             save_crawl_time('corp_report_crawl')

#         if corpName:
#             isExist = Disclosure_report.objects.filter(종목명__contains=corpName).exists()
#             if not isExist:
#                 return JsonResponse({ 'rowsCount': 0, 'rows': [] }, safe=False)

#             rows = Disclosure_report.objects.filter(종목명__contains=corpName).order_by(orderClause).values()
#         else:
#             # rows = Disclosure_report.objects.all().order_by('-접수일자')[:100].values()            
#             rows = Disclosure_report.objects.exclude(종목코드__exact='').order_by(orderClause)[:100].values()            

#         # Add offset limit
#         offset = pageIndex * pageSize
#         limit = pageSize

#         rowsCount = len(rows)
#         rows = sampling(list(rows), offset, limit)            
#         # rows = list(rows)
#         res = [dict(row, **{
#                 '공시대상회사': row['종목명'],
#                 '보고서명': row['보고서명'],
#                 '제출인': row['공시제출인명'],
#                 '접수일자': row['접수일자'],
#                 '비고': row['비고'],
#             }) for row in rows]

#         result = { 'rowsCount': rowsCount, 'rows': res }            
#         return JsonResponse(result, safe=False)             

# def xxget_searchs(request, mode="begin"): # mode : begin, nlp 
#     ''' If there is no corpName, the last 100 rows are displayed '''
    
#     mainKey, subKey, params, subParams = get_redis_key(request)

#     context = cache.get(mainKey)
#     context_paging = cache.get(subKey)

#     redis_map = { 
#         'begin' : 'raw',
#         'nlp' : 'nlp_raw',
#         'visualNum' : 'visualNum',
#         'visualClassify' : 'visualClassify',
#         'visualIpc' : 'visualIpc',
#         'visualPerson' : 'visualPerson',        
#     }

#     try: 
#         if context and context[redis_map[mode]]:
#             return context[redis_map[mode]]
#         if context_paging and context_paging[redis_map[mode]]:
#             return context_paging[redis_map[mode]]                    
#     except (KeyError, NameError, UnboundLocalError):
#         pass    

#     def make_paging_rows():
#         try:
#             rowsCount = rows[0]["cnt"]
#         except IndexError:        
#             rowsCount = 0

#         foo = [dict() for x in range(len(rows))]
#         for i in range(len(rows)):
#             foo[i]['id'] = rows[i]['출원번호'] # add id key for FE's ids
#             for key in ['출원번호','출원일','등록사항','발명의명칭','출원인1','발명자1','ipc코드']:
#                 foo[i][key] = rows[i][key]

#         # Add offset limit
#         offset = pageIndex * pageSize
#         limit = pageSize

#         return { 'rowsCount': rowsCount, 'rows': sampling(foo, offset, limit)}

#     def make_nlp_raw():
#         # nlp는 요약, 청구항 만 사용
#         result = [dict() for x in range(len(rows))]
#         for i in range(len(rows)):
#             abstract = str(rows[i]['요약'])
#             claim = str(rows[i]['청구항'])
#             result[i]['요약'] = abstract
#             result[i]['청구항'] = claim
#             result[i]['요약·청구항'] = abstract + ' ' + claim
#         return result 

#     def make_vis_num():
#         ''' visual application number '''
#         if not rows:
#             return { 'mode' : 'visualNum', 'entities' : [{ 'data' : [], 'labels' : []}]}
#         _rows = [dict() for x in range(len(rows))]
#         for i in range(len(rows)):
#             _rows[i]['출원일'] = str(rows[i]['출원일'])[:-4]
#             _rows[i]['등록일'] = str(rows[i]['등록일'])[:-4]
#             _rows[i]['구분'] = str(rows[i]['출원번호'])[0]

#         def make_each_category_dict(flag):
#             if flag:
#                 foo = [i[key] for i in _rows if i[key] and i['구분'] == flag]
#             else:            
#                 foo = [i[key] for i in _rows if i[key]]
#             bar = frequency_count(foo)        
#             labels = [key for key in sorted(bar)]
#             data = [bar[key] for key in sorted(bar)]  
#             return { 'labels': labels, 'data' : data }         

#         key = '출원일'
#         PU = make_each_category_dict(flag=None)
#         PP = make_each_category_dict(flag='1')
#         UP = make_each_category_dict(flag='2')
#         key = '등록일'
#         PR = make_each_category_dict(flag='1')
#         UR = make_each_category_dict(flag='2')    

#         # entities = {'PU' : PU, 'PP' : PP,'UP' : UP, 'PR' : PR, 'UR' : UR}
#         entities = [ PU, PP, UP, PR, UR ]
#         result = { 'mode' : 'visualNum', 'entities' : entities }
#         return result

#     def make_vis_ipc():
#         ''' visual ipc '''
#         def make_dic_to_list_of_dic():
#             try:
#                 return { 'name' : list(bar.keys()), 'value' : list(bar.values())}
#             except AttributeError:
#                 return { 'name' : [], 'value' : []}

#         entities = []
#         foo = [i['ipc코드'][0:4] for i in rows if i['ipc코드']]
#         bar = frequency_count(foo,20)
#         entities.append(make_dic_to_list_of_dic())

#         foo = [i['ipc코드'][0:3] for i in rows if i['ipc코드']]
#         bar = frequency_count(foo,20)
#         entities.append(make_dic_to_list_of_dic())

#         result = { 'mode' : 'visualIpc', 'entities' : entities }

#         return result         

#     def make_vis_per():
#         ''' visual related person '''
#         # relatedperson는 ['출원인1','출원인국가코드1','발명자1','발명자국가코드1] 만 사용
        
#         NATIONALITY = settings.TERMS['NATIONALITY']

#         entities = []
#         def nat_swap(x):
#             return NATIONALITY.get(x,x)

#         def make_dic_to_list_of_dic(baz):
#             try:
#                 return { 'name' : list(baz.keys()), 'value' : list(baz.values())}
#             except AttributeError:
#                 return { 'name' : [], 'value' : []}

#         # caller
#         for key in ['출원인1','발명자1']:
#             foo = [i[key] for i in rows if i[key]]
#             bar = frequency_count(foo,20)
#             entities.append(make_dic_to_list_of_dic(bar))        

#         for key in ['출원인국가코드1','발명자국가코드1']:
#             foo = [nat_swap(i[key]) for i in rows if i[key]]
#             bar = frequency_count(foo,20)
#             entities.append(make_dic_to_list_of_dic(bar))   

#         result = { 'mode' : 'visualPerson', 'entities': entities }
#         return result  

#     # caller                          

#     pageIndex = subParams.get('pageIndex', 0)
#     pageSize = subParams.get('pageSize', 10)
#     sortBy = subParams.get('sortBy', [])                 

#     selecting_columns = 'SELECT count(*) over () as cnt, A.등록사항, A."발명의명칭", A.출원번호, A.출원일, A.출원인1, A.출원인코드1, A.출원인국가코드1, A.발명자1, A.발명자국가코드1, A.등록일, A.공개일, A.ipc코드, A.요약, A.청구항 FROM '

#     orderby_clause = add_orderby(sortBy)
#     if not orderby_clause:
#         orderby_clause = ' order by A.출원일 desc'

#     if params['commonCorpName']:
#         commonCorpName = params['commonCorpName']
#         for k, v in COMPANY_ASSIGNE_MATCHING.items():
#             if k == params['commonCorpName']:
#                 commonCorpName = v
#                 break

#         foo =  '"성명" like $$%' + commonCorpName + '%$$'
#         query = f'{selecting_columns} ( SELECT 출원번호 FROM ( SELECT 출원번호 FROM 공개인명정보 WHERE {foo} ) K GROUP BY 출원번호 ) V, kr_tsv_view A WHERE V.출원번호 = A.출원번호 {orderby_clause} offset 0 rows fetch next 1001 rows only;' 
#     else:                    
#         query = f'{selecting_columns} where 출원일 is not null {orderby_clause} limit 100'

#     with connection.cursor() as cursor:
#         cursor.execute(
#             "SET work_mem to '100MB';"
#             + query
#         )
#         rows = dictfetchall(cursor)

    
#     res = {}
#     res_sub = {}
#     # if rows:
#     res['nlp_raw'] = make_nlp_raw()
#     res['visualNum'] = make_vis_num()
#     res['visualIpc'] = make_vis_ipc()
#     res['visualPerson'] = make_vis_per()

#     result = make_paging_rows()
#     res_sub['raw'] = result
#     # else:
#     #     res['nlp_raw'] = []
#     #     res['visualNum'] = []
#     #     res['visualIpc'] = []
#     #     res['visualPerson'] = []

#     #     result = { 'rowsCount': 0, 'rows': []} 
#     #     res_sub['raw'] = result

#     cache.set(mainKey, res, CACHE_TTL)
#     cache.set(subKey, res_sub, CACHE_TTL)  

#     if mode == "begin":
#         return JsonResponse(result, safe=False)
#     return res[redis_map[mode]]  

def get_visual(request):
    ''' application_number, applicant_classify, ipc, related_person '''
    
    _, subKey, _, subParams = get_redis_key(request)

    # Redis {
    sub_context = cache.get(subKey)

    key = subParams['mode'] # visualNum, visualClassify, visualIpc, visualPerson

    try:
        if sub_context[key]:        
            return HttpResponse(json.dumps(sub_context[key], ensure_ascii=False))
    except:
        pass
    # Redis }    

    result = get_searchs(request, mode=key)

    if not result:
        return HttpResponse(json.dumps(result, ensure_ascii=False))
        
    # Redis {
    try:
        sub_context[key] = result
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }

    return JsonResponse(result, safe=False)

def get_wordcloud(request):

    _, subKey, _, subParams = get_redis_key(request)

    # Redis {
    sub_context = cache.get(subKey)

    key = subParams['mode'] # visualNum, visualClassify, visualIpc, visualPerson

    try:
        if sub_context[key]:        
            return HttpResponse(json.dumps(sub_context[key], ensure_ascii=False))
    except:
        pass
    # Redis }    

    foo = NlpToken(self._request, menu='wordcloud')
    nlpRows = get_searchs(request, mode='nlp')    
    bar = foo.nlp_token(nlpRows)

    baz = subParams['menuOptions']['wordcloudOptions']
    output = baz.get('output',50)   

    return JsonResponse(result, safe=False)

def wordcloud_extract(request):
    foo = NlpToken(request, menu='wordcloud')
    nlpRows = get_searchs(request, mode='nlp')    
    bar = foo.nlp_token(nlpRows)

    baz = subParams['menuOptions']['wordcloudOptions']
    output = baz.get('output',50)    

    return frequency_count(bar, self._output)

def wordcloud(self):
    def make_dic_to_list_of_dic():
        try:
            return { 'name' : list(foo.keys()), 'value' : list(foo.values())}
        except AttributeError:
            return self._wordcloudEmpty    
    foo = wordcloud_extract(request)
    result = []
    result.append(make_dic_to_list_of_dic())
    cache.set(self._newSubKey, result , CACHE_TTL)
    return result    

# def get_nlp(request, analType):
#     """
#        analType : wordcloud
#     """

#     _, subKey, _, subParams = get_redis_key(request)

#     #### Create a new SubKey to distinguish each analysis type 
#     newSubKey = subKey + '¶' + analType

#     sub_context = cache.get(newSubKey)

#     try:
#         if sub_context['nlp_token']:        
#             return sub_context['nlp_token']
#     except:
#         pass

#     nlp_raw = get_searchs(request, mode="nlp")

#     result = []

#     # option
#     foo = subParams['menuOptions'][analType + 'Options']
#     volume = foo.get('volume','')
#     unit = foo.get('unit','')
#     emergence = foo.get('emergence','빈도수')    

#     nlp_list = [d[volume] for d in nlp_raw] # '요약·청구항', '요약', '청구항', 

#     nlp_str = ' '.join(nlp_list) if nlp_list else None            

#     def phrase_frequncy_tokenizer():
#         return tokenizer_phrase(nlp_str)

#     def phrase_individual_tokenizer():
#         for foo in nlp_list:
#             bar = remove_duplicates(tokenizer_phrase(foo))
#             result.extend(bar)
#         return result            

#     def word_frequncy_tokenizer():
#         return tokenizer(nlp_str)

#     def word_individual_tokenizer():
#         for foo in nlp_list:
#             bar = remove_duplicates(tokenizer(foo))
#             result.extend(bar)
#         return result   

#     command = { '구문': { '빈도수':phrase_frequncy_tokenizer, '건수':phrase_individual_tokenizer }, '워드': { '빈도수' :word_frequncy_tokenizer, '건수':word_individual_tokenizer } }
    
#     result = command[unit][emergence]() 

#     cache.set(newSubKey, { 'nlp_token' : result } , CACHE_TTL)

#     return result                 
                       
