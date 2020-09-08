from .models import stock_quotes, financial_statements
from search.models import listed_corp
from django.http import HttpResponse, JsonResponse

import json

# caching with redis
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT


def parse_company_info(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        kiscode = data['kiscode']

        isExist = listed_corp.objects.filter(종목코드=kiscode).exists()
        if not isExist:
            return HttpResponse('Not Found', status=404)

        row = listed_corp.objects.filter(종목코드=kiscode).values()
        row = list(row)
        res = row[0] if row else {} #dict

    return JsonResponse(res, safe=False)
      
