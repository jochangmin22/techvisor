from django.http import JsonResponse

from datetime import datetime, timedelta

from cpclasses import CpRelatedInfo

from django.core.cache import cache

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
