import json
import re
from itertools import islice
from konlpy.tag import Mecab
from django.conf import settings

doubleKeyword = {
    '시가총액': 'MC',
    'PER(%)': 'PER',
    'PBR(배)': 'PBR',
    'EPS(원)': 'EPS',
    'ROE(%)': 'ROE',
    'ROA(%)': 'ROA',
    '현재가(원)': 'NP',
    '영업이익(전전분기)': 'PTQ',
    '당기순이익증감(전전분기)': 'ITQ',
    '영업이익(전분기)': 'PQ',
    '당기순이익증감(전분기)': 'IQ'
}

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
    try:
        searchNum = params['searchNum']
    except:
        searchNum = ''    
    # searchNum = params['searchNum'] if hasattr(params, 'searchNum') else ''
    try:
        mainKey = "¶".join(params.values()) if searchNum == '' else searchNum
    except:
        mainKey = "¶all"

    # one more key to be used for a separated from searchParams
    try:
        subKey = mainKey + "¶".join(list(nested_dict_values(subParams))) if searchNum == '' else searchNum   
    except:
        subKey = mainKey + "¶"    


    return mainKey, subKey, params, subParams

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]    

def nested_dict_values(d):
    for v in d.values():
        if isinstance(v, dict):
            yield from nested_dict_values(v)
        else:
            yield str(v)


def remove_tags(text):
    TAG_RE = re.compile(r'<[^>]+>')
    return TAG_RE.sub('', text)


def remove_brackets(text):
    return re.sub(r"[\(\[].*?[\)\]]", "", text)

def remove_punc(text):
    return re.sub("[!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~]", ' ', text)            

def sampling(selection, offset=0, limit=None):
    return list(islice(islice(selection, offset, None), limit))

def remove_duplicates(t):
    return list(set(t))    

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


raw_len_limit = 20000

def tokenizer(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
    ''' 
    raw token화 (raw_len_limit 단어 길이로 제한; 넘으면 mecab error)
    NNG,NNP명사, SY기호, SL외국어, SH한자, UNKNOW (외래어일 가능성있음)
    '''    
    # raw = remove_punc(remove_brackets(remove_tags(raw)))    
    mecab = Mecab()
    STOPWORDS = settings.TERMS['STOPWORDS']
    try:
        return [
            word
            for word, tag in mecab.pos(raw[:raw_len_limit]) if tag in pos and word not in STOPWORDS # and len(word) > 1
            # if len(word) > 1 and tag in pos and word not in stopword
            # if tag in pos
            # and not type(word) == float
        ]
    except:
        return []


def tokenizer_phrase(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
    ''' 
    tokenizer + STOPWORDS_PHRASE 제거
    '''
    # raw = remove_punc(remove_brackets(remove_tags(raw)))
    mecab = Mecab()
    
    STOPWORDS = settings.TERMS['STOPWORDS']
    STOPWORDS_PHRASE = settings.TERMS['STOPWORDS_PHRASE']

    saving = ''
    close = None
    result = []
    for word, tag in mecab.pos(raw[:raw_len_limit]):
        if tag in pos:
            if word not in STOPWORDS: # and len(word) > 1:
                saving = saving + '_' + word if saving and close else word
                close=True
        else:
            close= False
            if saving:
                if '_' in saving and saving not in STOPWORDS_PHRASE:
                    result.append(saving)            
                saving = ''
    return result

def sampling(selection, offset=0, limit=None):
    """ apply offset limit """
    return selection[offset:(limit + offset if limit is not None else None)]      

def remove_tail(result, tail):
    if result.endswith(tail):
        tail = -len(tail)
        result = result[:tail]
    return result   