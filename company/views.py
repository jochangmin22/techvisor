from . import companies
from . import related_info
from . import crawler
from . import favorite


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
def toggle_searchs_starred(request):
    return favorite.toggle_starred(request)

def set_searchs_starred(request):
    return favorite.set_starred(request)

def set_searchs_unstarred(request):
    return favorite.set_unstarred(request)

def update_searchs_labels(request):
    return favorite.update_searchs_labels(request)    

def update_labels(request):
    return favorite.update_labels(request)    

def update_filters(request):
    return favorite.update_filters(request)

def update_searchs_filters(request):
    return favorite.update_searchs_filters(request)