import json
import re
from itertools import permutations
from konlpy.tag import Mecab

from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

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
        params = data['params']
        subParams = data['subParams']
    else:
        params = request.GET.get('params','')
        subParams = request.GET.get('subParams','')
        params = json.loads(params)
        subParams = json.loads(subParams)

    searchNum = params['searchNum'] if hasattr(params, 'searchNum') else ''
    mainKey = "¶".join(params.values()) if searchNum == '' else searchNum

    # one more key to be used for a separated from searchParams
    subKey = mainKey + "¶".join(list(NestedDictValues(subParams))) if searchNum == '' else searchNum   

    return mainKey, subKey, params, subParams

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

TAG_RE = re.compile(r'<[^>]+>')

def remove_tags(text):
    return TAG_RE.sub('', text)


def remove_brackets(text):
    return re.sub("[\(\[].*?[\)\]]", "", text)


def remove_punc(text):
    return re.sub("[!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~]", ' ', text)            

def str2round(value, num=1):
    try:
        value = float(value)
        return round(value, num)
    except ValueError:
        pass
    
    try:
        res = round(float(value.replace(",","")),num)
    except:
        res = 0
    return res

def str2int(value):
    try:
        value = int(value)
        return value
    except ValueError:
        pass
    
    try:
        res = int(value.replace(",",""))
    except:
        res = 0
    return res     


raw_len_limit = 20000

def tokenizer(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
    ''' 
    raw token화 (raw_len_limit 단어 길이로 제한; 넘으면 mecab error)
    NNG,NNP명사, SY기호, SL외국어, SH한자, UNKNOW (외래어일 가능성있음)
    '''    
    raw = remove_punc(remove_brackets(remove_tags(raw)))    
    mecab = Mecab()
    STOPWORDS = getattr(settings, 'STOPWORDS', DEFAULT_TIMEOUT)
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
    raw = remove_punc(remove_brackets(remove_tags(raw)))
    mecab = Mecab()
    STOPWORDS = getattr(settings, 'STOPWORDS', DEFAULT_TIMEOUT)
    STOPWORDS_PHRASE = getattr(settings, 'STOPWORDS_PHRASE', DEFAULT_TIMEOUT)
    saving = ''
    close = None
    raw_list = []
    for word, tag in mecab.pos(raw[:raw_len_limit]):
        if tag in pos:
            if word not in STOPWORDS: # and len(word) > 1:
                saving = saving + '_' + word if saving and close else word
                close=True
        else:
            close= False
            if saving:
                if '_' in saving and saving not in STOPWORDS_PHRASE:
                    raw_list.append(saving)            
                saving = ''
    return raw_list  

def like_parse(keyword=""):
    """ like query 생성 """

    # (기업이름 and 기업이름2) and (업종).BD and (주요제품).MP and (@PER>=1111<=2222) and (@PBR>=3333<=4444) ...
    if not keyword:
        return ""

    result = ""  # unquote(keyword) # ; issue fix
    # for val in keyword.split(" AND "):
    for val in re.split(" and ", keyword, flags=re.IGNORECASE):  # case insentitive
        # temporarily continue they were not implemented
        # if val.startswith("(@") or val.endswith(").RK") or val.endswith(").CC"):
        if val.startswith("(@") or val.endswith(").CC"):
            continue
        # CN, BD, MP, MC, PER, PBR, EPS, ROE, ROA, NP, PTQ, ITQ, PQ, IQ
        fieldName = '회사명' # default    
        # res += "("  # not add paranthesis when above terms
        # select fieldName and remove initial symbol
        if val.endswith(".BD"):
            val = val.replace(".BD", "")
            fieldName ='업종'                
        if val.endswith(".MP"):
            val = val.replace(".MP", "")
            fieldName = '주요제품'
        

        for key, value in doubleKeyword.items():
        # for key in [MC, PER, PBR, EPS, ROE, ROA, NP, PTQ, ITQ, PQ, IQ]:
            if val.endswith("."+value):
                val = val.replace("."+value, "")                           
                fieldName = "정보 ->> '" + key + "'"
        # if val.endswith(".IN"):
        #     val = val.replace(".IN", "")
        #     res += '산업'    
        
        val = re.sub('[()]', '', val)
         

        
        # 전체 조합에서 + 기준으로 like query 만들기
        items = []
        notItems = []
        mylength = 1
        # for val in re.split("(\\W+)", keyword): #  not a word (\w)
        for newVal in re.split(r' and | or ', val):  # and | or
            newVal = newVal.replace("_", " ")
            if "not " in newVal or "-" in newVal:  # collect negative word
                newVal = newVal.replace("-", "").replace("not ", "")
                notItems.append(newVal)
            else:
                items.append(newVal)

        temp = list(map("%".join, permutations(items, mylength)))

        res = ""
        for k in temp:
           res += '"' + fieldName + "\" like '%" + k + "%' or "

        if res.endswith(" or "):
            res = res[:-4]

        # append collect negative word
        res2 = ""
        # if not notItems:
        temp2 = list(map("%".join, permutations(notItems, mylength)))

        for k in temp2:
            res2 += '"' + fieldName + "\" not like '%" + k + "%' and "

        if res2.endswith(" and "):
            res2 = res2[:-5]

        # merge result
        if res:
            result += ("(" + res + ") and " + res2) if res2 else res
        else:
            result += res2 if res2 else ""
        result += ') and ('

    if result.endswith(" and ("):
        result = result[:-6]

    return result
