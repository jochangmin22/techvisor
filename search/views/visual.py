from django.http import JsonResponse
from utils import request_data

from ipclasses import IpSearchs, IpVisual, IpIndicator

def get_visual(request):
    params, _ = request_data(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_visual, 'US': us_visual, 'JP' : jp_visual, 'CN' : cn_visual, 'EP' : ep_visual, 'PCT' : pct_visual}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_visual(request):
    foo = IpVisual(request)
    return foo.visual()

def us_visual(request):
    return

def jp_visual(request):
    return

def cn_visual(request):
    return

def ep_visual(request):
    return

def pct_visual(request):
    return

def get_indicator(request):
    params, _ = request_data(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_indicator, 'US': us_indicator, 'JP' : jp_indicator, 'CN' : cn_indicator, 'EP' : ep_indicator, 'PCT' : pct_indicator}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)   
   
def kr_indicator(request):
    foo = IpSearchs(request, mode='indicator')
    indRow = foo.vis_ind()

    bar = IpIndicator(request, indRow)
    return bar.indicator()

def us_indicator(request):
    return    

def jp_indicator(request):
    return 

def cn_indicator(request):
    return 

def ep_indicator(request):
    return 

def pct_indicator(request):
    return 