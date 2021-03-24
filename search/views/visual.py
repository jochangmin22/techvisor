from django.http import HttpResponse
from django.http import JsonResponse
from .searchs import get_searchs
from utils import get_redis_key
import json

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

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
