# from django.shortcuts import render
# from django.http import HttpResponse

# from .companies import parse_companies, parse_query, parse_companies_num
# from .company import parse_company
# from .finance import parse_stock, crawl_stock, crawl_dart

from . import companies
from . import related_info
# from . import company
from . import crawler
from . import favorite
# from . import company_info

# companies 
def get_companies(request):
    return companies.get_companies(request)

def get_query(request):
    return companies.parse_query(request)

def get_financial_info(request):
    return companies.parse_financial_info(request)

def get_stock(request):
    return companies.parse_stock(request)

def get_crawl(request):
    return companies.crawl_stock(request)    

def get_clinic_test(request):
    return related_info.clinic_test(request)    

def get_disclosure_report(request):
    return related_info.get_disclosure_report(request)    

def get_owned_patent(request):
    return related_info.get_owned_patent(request)    

def get_wordcloud(request):
    return related_info.wordcloud(request)        

def get_stock_search_top(request):
    return crawler.crawl_stock_search_top()

def get_stock_upper(request):
    return crawler.crawl_stock_upper()

def get_stock_lower(request):
    return crawler.crawl_stock_lower()

#favorite
def get_labels(request):
    return favorite.get_labels()

def update_labels(request):
    return favorite.update_labels(request)

def toggle_searchs_starred(request):
    return favorite.toggle_starred(request)

def set_searchs_starred(request):
    return favorite.set_starred(request)

def set_searchs_unstarred(request):
    return favorite.set_unstarred(request)

def set_searchs_labels(request):
    return favorite.set_labels(request)

def set_searchs_unlabels(request):
    return favorite.set_unlabels(request)

def create_label(request):
    return favorite.create_label(request)

def remove_label(request):
    return favorite.remove_label(request)

def labeling(request):
    return favorite.user_labeling(request)

def remove_labeling(request):
    return favorite.user_remove_labeling(request)