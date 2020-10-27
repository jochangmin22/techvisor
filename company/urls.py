from django.urls import path, re_path
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요

from . import views

urlpatterns = [
    re_path(r"^api/company-app/query/$", views.get_query, name='get_query'),
    re_path(r"^api/company-app/searchs/$", views.get_companies, name='get_companies'),
    re_path(r"^api/company-app/searchs/stock$", csrf_exempt(views.get_stock), name='get_stock'),
    re_path(r"^api/company-app/searchs/companyinfo$", csrf_exempt(views.get_company_info), name='get_company_info'),    
    re_path(r"^api/company-app/searchs/financialinfo$", csrf_exempt(views.get_financial_info), name='get_financial_info'),    
    re_path(r"^api/company-app/searchs/stockinfo$", csrf_exempt(views.get_stock_info), name='get_stock_info'),
    re_path(r"^api/company-app/searchs/clinic$", csrf_exempt(views.get_clinic_test), name='get_clinic_test'),
    re_path(r"^api/company-app/searchs/disclosurereport$", csrf_exempt(views.get_disclosure_report), name='get_disclosure_report'),
    re_path(r"^api/company-app/searchs/ownedpatent$", csrf_exempt(views.get_owned_patent), name='get_owned_patent'),
    re_path(r"^api/company-app/searchs/stockfair$", csrf_exempt(views.get_stock_fair), name='get_stock_fair'),
    re_path(r"^api/company-app/searchs/wordcloud$", csrf_exempt(views.get_wordcloud), name='get_wordcloud'),
    re_path(r"^api/company-app/searchs/stocksearchtop$", csrf_exempt(views.get_stock_search_top), name='get_stock_search_top'),
    # re_path(r"^api/company-app/searchs/searchsnum$", get_companies_num, name='get_companies_num'),
    # re_path(r"^api/company-app/searchs/stock$", get_stock, name='get_stock'),
    # re_path(r"^api/company-app/searchs/vec$", get_vec, name='get_vec'),
    
    re_path(r"^api/company-app/search/stock$", csrf_exempt(views.get_stock), name='get_stock'),
    re_path(r"^api/company-app/search/companyinfo$", csrf_exempt(views.get_company), name='get_company'),
    # re_path(r"^api/company-app/search/crawlstock$", csrf_exempt(views.get_crawl), name='get_crawl'),
]
