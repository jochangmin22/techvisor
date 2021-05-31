# app
from django.http import JsonResponse
from utils import request_data

from cpclasses import CpVisual, CpWordcloud

def get_owned_patent(request):
    result = owned_patent(request)
    return JsonResponse(result, safe=False)

def owned_patent(request):
    foo = CpVisual(request, mode='owned_patent')
    return foo.owned_patent()

def get_wordcloud(request):
    result = wordcloud(request)
    return JsonResponse(result, safe=False)

def wordcloud(request):
    foo = CpVisual(request, mode="wordcloud")
    nlpRows = foo.wordcloud()

    bar = CpWordcloud(request, nlpRows)
    return bar.wordcloud()    

def get_visual(request):
    result = visual(request)
    return JsonResponse(result, safe=False)

def visual(request):
    _, subParams = request_data(request)
    mode = subParams.get('mode','') or ''    
    foo = CpVisual(request, mode)
    return foo.visual()      
        
