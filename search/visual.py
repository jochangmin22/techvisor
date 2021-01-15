from django.http import HttpResponse
from django.http import JsonResponse
from .searchs import parse_searchs, parse_nlp
import pandas as pd
from .utils import get_redis_key, dictfetchall
from operator import itemgetter
import json

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)


def applicant_classify(request):
    """ 출원인 주체별 구분 """

    _, subKey, _, _ = get_redis_key(request)

    # Redis {
    sub_context = cache.get(subKey)

    try:
        if sub_context['classify']:        
            return HttpResponse(json.dumps(sub_context['classify'], ensure_ascii=False))
    except:
        pass
    # Redis }    

    d = parse_searchs(request, mode="classify")

    if not d:
        return HttpResponse(json.dumps(d, ensure_ascii=False))
        
    df = pd.DataFrame(d)
    l = df[df['출원인코드1'].str[0] == '4'].groupby(['출원인1']).size().reset_index(name='cnt')

    result = sorted(l, key=itemgetter('cnt'), reverse=True)

    # Redis {
    try:
        sub_context['classify'] = result
        cache.set(subKey, sub_context, CACHE_TTL)
    except:
        pass        
    # Redis }

    return JsonResponse(result, safe=False)