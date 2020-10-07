import json
import re
from itertools import islice

def get_redis_key(request):
    "Return mainKey, subKey, params, subParams"
    params = request.GET.get('params','')
    params = json.loads(params)

    mainKey = "¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']

    subParams = request.GET.get('subParams','')
    subParams = json.loads(subParams)


    # one more key to be used for a separated from searchParams
    subKey = mainKey + "¶".join(list(NestedDictValues(subParams))) if params['searchNum'] == '' else params['searchNum']   

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


def remove_tags(text):
    TAG_RE = re.compile(r'<[^>]+>')
    return TAG_RE.sub('', text)


def remove_brackets(text):
    return re.sub("[\(\[].*?[\)\]]", "", text)


def remove_punc(text):
    return re.sub("[!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~]", ' ', text)            

def sampling(selection, offset=0, limit=None):
    return list(islice(islice(selection, offset, None), limit))  