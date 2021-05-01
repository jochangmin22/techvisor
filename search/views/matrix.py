from django.http import JsonResponse
from utils import request_data

from ipclasses import IpSearchs, IpMatrix, IpMatrixDialog

def get_matrix(request):
    params, _ = request_data(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'    
    command = { 'KR': kr_matrix, 'US': us_matrix, 'JP' : jp_matrix, 'CN' : cn_matrix, 'EP' : ep_matrix, 'PCT' : pct_matrix}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_matrix(request):
    foo = IpSearchs(request, mode="matrix")
    mtxRows = foo.matrix()

    bar = IpMatrix(request, mtxRows)
    return bar.matrix() 

def us_matrix(request):
    foo = IpSearchs(request, mode="matrix")
    mtxRows = foo.matrix()

    bar = IpMatrix(request, mtxRows)
    return bar.matrix() 

def jp_matrix(request):
    return
def cn_matrix(request):
    return
def ep_matrix(request):
    return
def pct_matrix(request):
    return

def get_matrix_dialog(request):
    params, _ = request_data(request)
    patentOffice = params.get('patentOffice','KR') or 'KR'    
    command = { 'KR': kr_matrix_dialog, 'US': us_matrix_dialog, 'JP' : jp_matrix_dialog, 'CN' : cn_matrix_dialog, 'EP' : ep_matrix_dialog, 'PCT' : pct_matrix_dialog}
    result = command[patentOffice](request)
    return JsonResponse(result, safe=False)

def kr_matrix_dialog(request):
    foo = IpMatrixDialog(request)
    return foo.matrix_dialog()
def us_matrix_dialog(request):
    foo = IpMatrixDialog(request)
    return foo.matrix_dialog()
def jp_matrix_dialog(request):
    return
def cn_matrix_dialog(request):
    return
def ep_matrix_dialog(request):
    return
def pct_matrix_dialog(request):
    return
