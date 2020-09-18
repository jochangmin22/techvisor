from .models import stock_quotes, financial_statements, nice_corp
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
        corpNo = data['corpNo']

        isExist = nice_corp.objects.filter(사업자등록번호=corpNo).exists()
        if not isExist:
            return HttpResponse('Not Found', status=404)

        row = nice_corp.objects.filter(사업자등록번호=corpNo).values()
        row = list(row)
        res = row[0] if row else {} #dict

    return JsonResponse(res, safe=False)
      
