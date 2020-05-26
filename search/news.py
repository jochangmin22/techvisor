
import urllib.request
import json
import re
from konlpy.tag import Mecab

from django.http import JsonResponse
from django.http import HttpResponse

from .models import disclosure, listed_corp
from .searchs import parse_searchs, parse_searchs_num
from .nlp import kr_nlp

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

client_id = settings.NAVER_NEWS_CLIENT_ID
client_secret = settings.NAVER_NEWS_CLIENT_SECRET
API_URL = settings.NAVER_NEWS_API_URL

display = 100 # 각 키워드 당 검색해서 저장할 기사 수


def clean_keyword(keyword):
    """ 불필요한 단어 제거 """
    res = keyword.replace(" and","").replace( " or","")
    return res 

def parse_news(request, mode="needJson"): # mode : needJson, noJson
    """ 쿼리 실행 및 결과 저장 """
    # redis key
    params = {}
    for value in [
        "searchText",
        "searchNum",
        # "dateType",
        # "startDate",
        # "endDate",
        # "inventor",
        # "assignee",
        # "patentOffice",
        # "language",
        # "status",
        # "ipType",
    ]:
        params[value] = request.GET.get(value) if request.GET.get(value) else ""
    apiParams = "news¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']


    context = cache.get(apiParams)    
    # is there data in redis?
    # yes
    if context and context['news']:
       return JsonResponse(context['news'], safe=False)

    # No     
    min_name = clean_keyword(params['searchText'])
    # min_name = "하이브리드 자동차"
    encText = urllib.parse.quote(min_name)
    url = API_URL + encText + \
        "&display=" + str(display) + "&sort=sim"
    request = urllib.request.Request(url)
    request.add_header("X-Naver-Client-Id", client_id)
    request.add_header("X-Naver-Client-Secret",client_secret)        

    response = urllib.request.urlopen(request)
    rescode = response.getcode()
    if(rescode==200):
        response_body_str = response.read().decode('utf-8')
        json_acceptable_string = response_body_str.replace("'", "\"")
        response_body = json.loads(response_body_str)
        title_link = {}
        link_description = {}
        for i in range(0, len(response_body['items'])):
            # strip b tag
            response_body['items'][i]['title'] = re.sub('<[^<]+?>', '', response_body['items'][i]['title'].replace('&quot;', '\"'))
            response_body['items'][i]['description'] = re.sub('<[^<]+?>', '', response_body['items'][i]['description'].replace('&quot;', '\"'))
            # link_description[response_body['items'][i]['link']] = response_body['items'][i]['description']
            # title_link[response_body['items'][i]['title']] = \
            #     response_body['items'][i]['link']
        # return HttpResponse(title_link, content_type="text/plain; charset=utf-8")                
        # return HttpResponse(link_description, content_type="text/plain; charset=utf-8")                
        # return JsonResponse(title_link, safe=False)                
        # return JsonResponse(link_description, safe=False)                

        # redis 저장 {
        new_context = {}
        new_context['news'] = response_body['items']
        new_context['news_nlp'] = []
        new_context['company'] = {}
        cache.set(apiParams, new_context, CACHE_TTL)
        # redis 저장 }
        if mode == "needJson":
            return JsonResponse(response_body['items'], safe=False)
        elif mode == "noJson":
            return response_body['items']
        # return title_link

    else:
        return JsonResponse("Error Code:" + rescode, safe=False)
        # print("Error Code:" + rescode)    

def parse_news_nlp(request, mode="needJson"):
    """ news title description tokenization """

    # redis key
    params = {}
    for value in [
        "searchText",
        "searchNum",
    ]:
        params[value] = request.GET.get(value) if request.GET.get(value) else ""
    apiParams = "news¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']

    # is there data in Redis
    context = cache.get(apiParams)
    # yes
    if context and context['news_nlp']:
        return JsonResponse(context['news_nlp'], safe=False)
    
    # no
    news = context['news'] if  context and context['news'] else parse_news(request, mode="noJson")
    # return JsonResponse(news, safe=False)
    news_nlp = ""
    if news:
        for i in range(len(news)):
            news_nlp += news[i]['title'] + " " if news[i]['title'] else ""
            news_nlp += news[i]['description'] + " " if news[i]['description'] else ""
        # news_nlp = ' '.join(tokenizer(news_nlp) if news_nlp else '')
        news_nlp = tokenizer(news_nlp) if news_nlp else ''
    else:
        news_nlp = []  

    news_nlp= remove_duplicate(news_nlp)

    # redis 저장 {
    new_context = {}
    new_context['news'] = news
    new_context['news_nlp'] = news_nlp
    new_context['company'] = {}
    cache.set(apiParams, new_context, CACHE_TTL)
    # redis 저장 }      
         
    if mode == "needJson":
        return JsonResponse(news_nlp, safe=False)
    elif mode == "noJson":
        return news_nlp        

def parse_related_company(request, mode="needJson"):
    ''' search news_nlp list in discloure db '''

    # redis key
    params = {}
    for value in [
        "searchText",
        "searchNum",
    ]:
        params[value] = request.GET.get(value) if request.GET.get(value) else ""
    apiParams = "news¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']

    # is there data in Redis
    context = cache.get(apiParams)
    # yes
    if context and context['company']:
        return JsonResponse(context['company'], safe=False)
    
    # no
    news = context['news'] if context and context['news'] else parse_news(request, mode="noJson")
    news_nlp = context['news_nlp'] if context and context['news_nlp'] else parse_news_nlp(request, mode="noJson")
    # return JsonResponse(news, safe=False)

    # redis 저장 {
    new_context = {}
    new_context['news'] = news
    new_context['news_nlp'] = news_nlp
    new_context['company'] = {}
    cache.set(apiParams, new_context, CACHE_TTL)
    # redis 저장 }       

    try:
        isExist = disclosure.objects.filter(corp_name__in=news_nlp).exists()
        if not isExist:
            return HttpResponse('Not Found', status=404)

        disClosure = disclosure.objects.filter(corp_name__in=news_nlp)

        myCorpName = list(disClosure.values_list('corp_name', flat=True).order_by('corp_name'))
        myCorpCode = list(disClosure.values_list('corp_code', flat=True).order_by('corp_name'))
        myStockCode = list(disClosure.values_list('stock_code', flat=True).order_by('corp_name'))

        response = { 'corpName': myCorpName, 'corpCode' : myCorpCode, 'stockCode': myStockCode}

        # redis update before leave {
        new_context['company'] = response
        cache.set(apiParams, new_context, CACHE_TTL)
        # redis update before leave }  

        return JsonResponse(response, status=200, safe=False)
    except:
        return HttpResponse() # 500        
    # select * from table where value ~* 'foo|bar|baz';

    # ob_list = data.objects.filter(name__in=my_list)

    # redis 저장 {
    new_context = {}
    new_context['news'] = news
    new_context['news_nlp'] = news_nlp
    cache.set(apiParams, new_context, CACHE_TTL)
    # redis 저장 }            
    return JsonResponse(news_nlp, safe=False)    


# NNG일반명사 ,NNP고유명사, SY기호, SL외국어, SH한자, UNKNOW (외래어일 가능성있음)
# def tokenizer(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
def tokenizer(raw, pos=["NNP","UNKNOWN"]):
    mecab = Mecab()
    STOPWORDS = getattr(settings, 'STOPWORDS', DEFAULT_TIMEOUT)
    try:
        return [
            word
            for word, tag in mecab.pos(raw) if len(word) > 1 and tag in pos and word not in STOPWORDS
            # if len(word) > 1 and tag in pos and word not in stopword
            # if tag in pos
            # and not type(word) == float
        ]
    except:
        return []        

def remove_duplicate(seq):
    seen = set()
    seen_add = seen.add
    return [x for x in seq if not (x in seen or seen_add(x))]