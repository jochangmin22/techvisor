from django.urls import path, re_path
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요

from . import views
# from search.views import get_wordcloud

URL = r"^api/company-app/"

urlpatterns = [
    # companies
    re_path(URL+ "query/$", views.companies.get_query, name='get_query'),
    re_path(URL+ "searchs/$", csrf_exempt(views.companies.get_companies), name='get_companies'),
    re_path(URL+ "searchs/trash-search$", csrf_exempt(views.companies.trash_search), name='trash_search'),
    re_path(URL+ "searchs/trash-searchs$", csrf_exempt(views.companies.trash_searchs), name='trash_searchs'),
    re_path(URL+ "searchs/stock$", csrf_exempt(views.companies.get_stock), name='get_stock'),
    re_path(URL+ "searchs/financialinfo$", csrf_exempt(views.companies.get_financial_info), name='get_financial_info'),    
    # related_info
    re_path(URL+ "searchs/clinic$", csrf_exempt(views.related_info.get_clinic_test), name='get_clinic_test'),
    re_path(URL+ "searchs/corpreport$", csrf_exempt(views.related_info.get_corp_report), name='get_corp_report'),
    # visual
    re_path(URL+ "searchs/ownedpatent$", csrf_exempt(views.visual.get_owned_patent), name='get_owned_patent'),
    re_path(URL+ "searchs/wordcloud$", csrf_exempt(views.visual.get_wordcloud), name='get_wordcloud'),
    re_path(URL+ "searchs/visual$", csrf_exempt(views.visual.get_visual), name='get_visual' ),

    # crawler
    re_path(URL+ "searchs/stocksearchtop$", csrf_exempt(views.crawler.get_stock_search_top), name='get_stock_search_top'),
    re_path(URL+ "searchs/stockupper$", csrf_exempt(views.crawler.get_stock_upper), name='get_stock_upper'),
    re_path(URL+ "searchs/stocklower$", csrf_exempt(views.crawler.get_stock_lower), name='get_stock_lower'),
    re_path(URL+ "searchs/stocksector$", csrf_exempt(views.crawler.get_stock_sector), name='get_stock_sector'),
    re_path(URL+ "searchs/stocktheme$", csrf_exempt(views.crawler.get_stock_theme), name='get_stock_theme'),

    # favorite
    re_path(URL+ "toggle-starred$", csrf_exempt(views.favorite.toggle_searchs_starred), name='toggle_searchs_starred'),
    re_path(URL+ "set-searchs-starred$", csrf_exempt(views.favorite.set_searchs_starred), name='set_searchs_starred'),
    re_path(URL+ "set-searchs-unstarred$", csrf_exempt(views.favorite.set_searchs_unstarred), name='set_searchs_unstarred'),
    re_path(URL+ "update-searchs-labels$", csrf_exempt(views.favorite.update_searchs_labels), name='update_searchs_labels'),
    re_path(URL+ "update-labels$", csrf_exempt(views.favorite.update_labels), name='update_labels'),
    re_path(URL+ "update-searchs-filters$", csrf_exempt(views.favorite.update_searchs_filters), name='update_searchs_filters'),
    re_path(URL+ "update-filters$", csrf_exempt(views.favorite.update_filters), name='update_filters'),
    
    # ?
    re_path(URL+ "search/stock$", csrf_exempt(views.companies.get_stock), name='get_stock'),
]
