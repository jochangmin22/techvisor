from django.urls import path, re_path
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요

from . import views

urlpatterns = [
    re_path(r"^api/company-app/query/$", views.get_query, name='get_query'),
    re_path(r"^api/company-app/searchs/$", views.get_companies, name='get_companies'),
    re_path(r"^api/company-app/searchs/stock$", csrf_exempt(views.get_stock), name='get_stock'),
    re_path(r"^api/company-app/searchs/companyinfo$", csrf_exempt(views.get_company_info), name='get_company_info'),    
    re_path(r"^api/company-app/searchs/stockinfo$", csrf_exempt(views.get_stock_info), name='get_stock_info'),
    re_path(r"^api/company-app/searchs/clinic$", csrf_exempt(views.get_clinic_test), name='get_clinic_test'),
    # re_path(r"^api/company-app/searchs/searchsnum$", get_companies_num, name='get_companies_num'),
    # re_path(r"^api/company-app/searchs/stock$", get_stock, name='get_stock'),
    # re_path(r"^api/company-app/searchs/vec$", get_vec, name='get_vec'),
    
    re_path(r"^api/company-app/search/stock$", csrf_exempt(views.get_stock), name='get_stock'),
    re_path(r"^api/company-app/search/companyinfo$", csrf_exempt(views.get_company), name='get_company'),
    # re_path(r"^api/company-app/search/crawlstock$", csrf_exempt(views.get_crawl), name='get_crawl'),
]
