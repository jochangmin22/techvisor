# from django.shortcuts import render
# from django.http import HttpResponse

# from .companies import parse_companies, parse_query, parse_companies_num
# from .company import parse_company
# from .finance import parse_stock, crawl_stock, crawl_dart

from . import companies
from . import company
from . import finance
# from . import company_info

# companies 
def get_companies(request):
    return companies.parse_companies(request)

def get_query(request):
    return companies.parse_query(request)

def get_company_info(request):
    return companies.parse_company_info(request)

def get_stock(request):
    return companies.parse_stock(request)

def get_stock_info(request):
    return companies.crawl_stock_info(request)

def get_crawl(request):
    return companies.crawl_stock(request)    

def get_clinic_test(request):
    return companies.clinic_test(request)    

# company
# def get_company(request, companyId=""):
#     return company.parse_company(request, companyId)


# def get_stock(request):
#     return company.parse_stock(request)



def get_company(request):
    return finance.crawl_dart(request)

# def get_topic(request):
#     return kr_nlp(request, "topic")


# def get_vec(request):
#     return kr_nlp(request, "vec")
