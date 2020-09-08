from django.urls import path, re_path
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요

from . import views

urlpatterns = [
    re_path(r"^api/company-app/query/$", views.get_query),
    re_path(r"^api/company-app/searchs/$", views.get_companies),
    re_path(r"^api/company-app/searchs/stock$", csrf_exempt(views.get_stock)),
    re_path(r"^api/company-app/searchs/companyinfo$", csrf_exempt(views.get_company_info)),    
    # re_path(r"^api/company-app/searchs/searchsnum$", get_companies_num),
    # re_path(r"^api/company-app/searchs/stock$", get_stock),
    # re_path(r"^api/company-app/searchs/vec$", get_vec),
    
    # re_path(r"^api/company-app/search/stock$", csrf_exempt(views.get_stock)),
    # re_path(r"^api/company-app/search/companyinfo$", csrf_exempt(views.get_company_info)),
    # re_path(r"^api/company-app/search/crawlstock$", csrf_exempt(views.get_crawl)),
]
