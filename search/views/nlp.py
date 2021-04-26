from django.http import JsonResponse

from utils import get_redis_key

from ipclasses import NlpToken, IpKeywords, IpWordcloud, IpWordcloudDialog

def get_nlp(request, analType):
    _, _, params, _ = get_redis_key(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'    
    command = { 'KR': kr_nlp, 'US': us_nlp, 'JP' : jp_nlp, 'CN' : cn_nlp, 'EP' : ep_nlp, 'PCT' : pct_nlp}
    result = command[patentOffice](request, analType)
    return JsonResponse(result, safe=False)

def kr_nlp(request, analType):
    return NlpToken(request, analType)
def us_nlp(request, analType):
    return
def jp_nlp(request, analType):
    return
def cn_nlp(request, analType):
    return
def ep_nlp(request, analType):
    return
def pct_nlp(request, analType):
    return

def get_wordcloud(request):
    _, _, params, _ = get_redis_key(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'    
    command = { 'KR': kr_wordcloud, 'US': us_wordcloud, 'JP' : jp_wordcloud, 'CN' : cn_wordcloud, 'EP' : ep_wordcloud, 'PCT' : pct_wordcloud}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)   

def kr_wordcloud(request):
    foo = IpWordcloud(request)
    return foo.wordcloud()
def us_wordcloud(request):
    return
def jp_wordcloud(request):
    return
def cn_wordcloud(request):
    return
def ep_wordcloud(request):
    return
def pct_wordcloud(request):
    return

def get_keywords(request):
    _, _, params, _ = get_redis_key(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'    
    command = { 'KR': kr_keywords, 'US': us_keywords, 'JP' : jp_keywords, 'CN' : cn_keywords, 'EP' : ep_keywords, 'PCT' : pct_keywords}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)   

def kr_keywords(request):
    foo = IpKeywords(request)
    return foo.keywords()
def us_keywords(request):
    return
def jp_keywords(request):
    return
def cn_keywords(request):
    return
def ep_keywords(request):
    return
def pct_keywords(request):
    return

def get_wordcloud_dialog(request):
    _, _, params, _ = get_redis_key(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'    
    command = { 'KR': kr_wordcloud_dialog, 'US': us_wordcloud_dialog, 'JP' : jp_wordcloud_dialog, 'CN' : cn_wordcloud_dialog, 'EP' : ep_wordcloud_dialog, 'PCT' : pct_wordcloud_dialog}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_wordcloud_dialog(request):
    foo = IpWordcloudDialog(request)
    return foo.wordcloud_dialog()
def us_wordcloud_dialog(request):
    return
def jp_wordcloud_dialog(request):
    return
def cn_wordcloud_dialog(request):
    return
def ep_wordcloud_dialog(request):
    return
def pct_wordcloud_dialog(request):
    return    
