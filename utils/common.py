import json
import re
from itertools import islice

from konlpy.tag import Mecab
from django.conf import settings
from collections import Counter
from django.core.cache import cache

def get_redis_key(request):
    "Return mainKey, subKey, params, subParams"
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        params = data.get('params','')
        subParams = data.get('subParams','')
    else:
        params = request.GET.get('params','')
        subParams = request.GET.get('subParams','')
        params = json.loads(params)
        subParams = json.loads(subParams)
    
    searchNum = params.get('searchNum','')

    try:
        mainKey = "¶".join(params.values()) if searchNum == '' else searchNum
    except:
        mainKey = "¶all"

    # one more key to be used for a separated from searchParams
    try:
        subKey = mainKey + "¶".join(list(NestedDictValues(subParams))) if searchNum == '' else searchNum   
    except:
        subKey = mainKey + "¶"    


    return mainKey, subKey, params, subParams

def request_data(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        result = data.get('params','')
        additional_result = data.get('subParams','')
    else:
        result = json.loads(request.GET.get('params',''))
        additional_result = json.loads(request.GET.get('subParams',''))
    return result, additional_result         
    
    searchNum = params.get('searchNum','')

def readRedis(redisKey, keys, data=""):
    context = cache.get(redisKey)
    if context and keys in context:
        return context[keys]
    else:
        return None

def writeRedis(redisKey, keys, data=""):
    return cache.set(redisKey, { keys : data }, 300)   

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]    

def NestedDictValues(d):
    for v in d.values():
        if isinstance(v, dict):
            yield from NestedDictValues(v)
        else:
            yield str(v)

def remove_tags(text):
    TAG_RE = re.compile(r'<[^>]+>')
    return TAG_RE.sub('', str(text))


def remove_brackets(text):
    return re.sub(r"[\(\[].*?[\)\]]", "", text)


def remove_punc(text):
    return re.sub("[!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~]", ' ', str(text))            

def sampling(selection, offset=0, limit=None):
    return list(islice(islice(selection, offset, None), limit))

def remove_duplicates(t):
    return list(set(t))

def remove_tail(result, tail):
    if result.endswith(tail):
        tail = -len(tail)
        result = result[:tail]
    return result    

def str2round(value, num=1):
    try:
        value = float(value)
        return round(value, num)
    except ValueError:
        pass
    
    try:
        result = round(float(value.replace(",","")),num)
    except:
        result = 0
    return result

def str2int(value):
    try:
        value = int(value)
        return value
    except ValueError:
        pass
    
    try:
        result = int(value.replace(",",""))
    except:
        result = 0
    return result     

def frequency_count(data, n=None):
    if isinstance(data, list): 
        tuple_data = tuple(data)
    elif isinstance(data, tuple):
        tuple_data = data
    try:    
        count = Counter(tuple_data)
        foo = count.most_common(n)
        result = dict(foo)
    except AttributeError:
        result = {}

    return result

def unescape(s):
    s = s.replace("&lt;", "<")
    s = s.replace("&gt;", ">")
    s = s.replace('&quot;', '\"')
    # this has to be last:
    s = s.replace("&amp;", "&")
    return s  
    
