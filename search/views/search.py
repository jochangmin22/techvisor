from utils import request_data
from django.http import JsonResponse

from ipclasses import IpSearch, IpSpecification, IpSimilar
from usclasses import UsSearch, UsSpecification, UsSimilar

def get_search(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_search, 'US': us_search, 'JP' : jp_search, 'CN' : cn_search, 'EP' : ep_search, 'PCT' : pct_search}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_search(request):
    foo = IpSearch(request, mode = 'search')
    return foo.query_execute(key = 'search')

def us_search(request):
    foo = UsSearch(request, mode = 'search')
    return foo.query_execute(key = 'search')

def jp_search(request):
    return
def cn_search(request):
    return
def ep_search(request):
    return
def pct_search(request):
    return    

def get_quote(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_quote, 'US': us_quote, 'JP' : jp_quote, 'CN' : cn_quote, 'EP' : ep_quote, 'PCT' : pct_quote}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_quote(request):
    foo = IpSearch(request, mode = 'quote')
    return foo.query_execute_paging(key = 'quote')

def us_quote(request):
    foo = UsSearch(request, mode = 'quote')
    return foo.query_execute_paging(key = 'quote')

def jp_quote(request):
    return
def cn_quote(request):
    return
def ep_quote(request):
    return
def pct_quote(request):
    return   

def get_family(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_family, 'US': us_family, 'JP' : jp_family, 'CN' : cn_family, 'EP' : ep_family, 'PCT' : pct_family}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_family(request):
    foo = IpSearch(request, mode = 'family')
    return foo.query_execute_paging(key = 'family')

def us_family(request):
    foo = UsSearch(request, mode = 'family')
    return foo.query_execute_paging(key = 'family')

def jp_family(request):
    return
def cn_family(request):
    return
def ep_family(request):
    return
def pct_family(request):
    return         

def get_legal(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_legal, 'US': us_legal, 'JP' : jp_legal, 'CN' : cn_legal, 'EP' : ep_legal, 'PCT' : pct_legal}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_legal(request):
    foo = IpSearch(request, mode='legal')
    return foo.query_execute_paging(key = 'legal')

def us_legal(request):
    foo = UsSearch(request, mode='legal')
    return foo.query_execute_paging(key = 'legal')

def jp_legal(request):
    return
def cn_legal(request):
    return
def ep_legal(request):
    return
def pct_legal(request):
    return  

def get_rnd(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_rnd, 'US': us_rnd, 'JP' : jp_rnd, 'CN' : cn_rnd, 'EP' : ep_rnd, 'PCT' : pct_rnd}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_rnd(request):
    foo = IpSearch(request, mode = 'rnd')
    return foo.query_execute_paging(key = 'rnd')

def us_rnd(request):
    foo = UsSearch(request, mode = 'rnd')
    return foo.query_execute_paging(key = 'rnd')

def jp_rnd(request):
    return
def cn_rnd(request):
    return
def ep_rnd(request):
    return
def pct_rnd(request):
    return

def get_description(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_description, 'US': us_description, 'JP' : jp_description, 'CN' : cn_description, 'EP' : ep_description, 'PCT' : pct_description}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_description(request):
    foo = IpSpecification(request, mode = 'description')
    return foo.setup_description()

def us_description(request):
    foo = UsSpecification(request, mode = 'description')
    return foo.setup_description()

def jp_description(request):
    return
def cn_description(request):
    return
def ep_description(request):
    return
def pct_description(request):
    return    

def get_wordcloud(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_wordcloud, 'US': us_wordcloud, 'JP' : jp_wordcloud, 'CN' : cn_wordcloud, 'EP' : ep_wordcloud, 'PCT' : pct_wordcloud}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_wordcloud(request):
    foo = IpSpecification(request, mode = 'wordcloud')
    return foo.setup_wordcloud()

def us_wordcloud(request):
    foo = UsSpecification(request, mode = 'wordcloud')
    return foo.setup_wordcloud()

def jp_wordcloud(request):
    return
def cn_wordcloud(request):
    return
def ep_wordcloud(request):
    return
def pct_wordcloud(request):
    return    

def get_applicant(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_applicant, 'US': us_applicant, 'JP' : jp_applicant, 'CN' : cn_applicant, 'EP' : ep_applicant, 'PCT' : pct_applicant}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_applicant(request):
    foo = IpSearch(request, mode = 'applicant')
    return foo.setup_applicant()

def us_applicant(request):
    foo = UsSearch(request, mode = 'applicant')
    return foo.setup_applicant()
    
def jp_applicant(request):
    return
def cn_applicant(request):
    return
def ep_applicant(request):
    return
def pct_applicant(request):
    return      

def application_number(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_application_number, 'US': us_application_number, 'JP' : jp_application_number, 'CN' : cn_application_number, 'EP' : ep_application_number, 'PCT' : pct_application_number}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_application_number(request):
    foo = IpSearch(request, mode = 'application_number')
    return foo.setup_application_number()

def us_application_number(request):
    foo = UsSearch(request, mode = 'application_number')
    return foo.setup_application_number()

def jp_application_number(request):
    return
def cn_application_number(request):
    return
def ep_application_number(request):
    return
def pct_application_number(request):
    return    

def get_ipc(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_ipc, 'US': us_ipc, 'JP' : jp_ipc, 'CN' : cn_ipc, 'EP' : ep_ipc, 'PCT' : pct_ipc}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_ipc(request):
    foo = IpSearch(request, mode = 'ipc')
    return foo.setup_ipc()

def us_ipc(request):
    foo = UsSearch(request, mode = 'ipc')
    return foo.setup_ipc()

def jp_ipc(request):
    return
def cn_ipc(request):
    return
def ep_ipc(request):
    return
def pct_ipc(request):
    return    

def get_similar(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_similar, 'US': us_similar, 'JP' : jp_similar, 'CN' : cn_similar, 'EP' : ep_similar, 'PCT' : pct_similar}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_similar(request):
    foo = IpSimilar(request, mode = 'similar')
    return foo.similar()

def us_similar(request):
    foo = UsSimilar(request, mode = 'similar')
    return foo.similar()

def jp_similar(request):
    return
def cn_similar(request):
    return
def ep_similar(request):
    return
def pct_similar(request):
    return 

def right_holder(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_right_holder, 'US': us_right_holder, 'JP' : jp_right_holder, 'CN' : cn_right_holder, 'EP' : ep_right_holder, 'PCT' : pct_right_holder}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_right_holder(request):
    foo = IpSearch(request, mode = 'right_holder')
    return foo.query_execute_paging( key = 'right_holder')

def us_right_holder(request):
    foo = UsSearch(request, mode = 'right_holder')
    return foo.query_execute_paging( key = 'right_holder')

def jp_right_holder(request):
    return
def cn_right_holder(request):
    return
def ep_right_holder(request):
    return
def pct_right_holder(request):
    return 

def register_fee(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_register_fee, 'US': us_register_fee, 'JP' : jp_register_fee, 'CN' : cn_register_fee, 'EP' : ep_register_fee, 'PCT' : pct_register_fee}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_register_fee(request):
    foo = IpSearch(request, mode = 'register_fee')
    return foo.query_execute_paging( key = 'register_fee')

def us_register_fee(request):
    foo = UsSearch(request, mode = 'register_fee')
    return foo.query_execute_paging( key = 'register_fee')

def jp_register_fee(request):
    return
def cn_register_fee(request):
    return
def ep_register_fee(request):
    return
def pct_register_fee(request):
    return     

def rightfull_order(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_rightfull_order, 'US': us_rightfull_order, 'JP' : jp_rightfull_order, 'CN' : cn_rightfull_order, 'EP' : ep_rightfull_order, 'PCT' : pct_rightfull_order}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_rightfull_order(request):
    foo = IpSearch(request, mode = 'rightfull_order')
    return foo.query_execute_paging( key = 'rightfull_order')

def us_rightfull_order(request):
    foo = UsSearch(request, mode = 'rightfull_order')
    return foo.query_execute_paging( key = 'rightfull_order')

def jp_rightfull_order(request):
    return
def cn_rightfull_order(request):
    return
def ep_rightfull_order(request):
    return
def pct_rightfull_order(request):
    return     

def associate_corp(request):
    params, _ = request_data(request)    
    patentOffice = params.get('patentOffice','KR') or 'KR'
    command = { 'KR': kr_associate_corp, 'US': us_associate_corp, 'JP' : jp_associate_corp, 'CN' : cn_associate_corp, 'EP' : ep_associate_corp, 'PCT' : pct_associate_corp}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_associate_corp(request):
    foo = IpSearch(request, mode = 'associate_corp')
    return foo.setup_associate_corp()

def us_associate_corp(request):
    foo = UsSearch(request, mode = 'associate_corp')
    return foo.setup_associate_corp()

def jp_associate_corp(request):
    return
def cn_associate_corp(request):
    return
def ep_associate_corp(request):
    return
def pct_associate_corp(request):
    return     
