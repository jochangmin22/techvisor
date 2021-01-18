from django.urls import path, re_path
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요

from . import views

urlpatterns = [
    re_path(r"^api/company-app/query/$", views.get_query, name='get_query'),
    re_path(r"^api/company-app/searchs/$", csrf_exempt(views.get_companies), name='get_companies'),
    re_path(r"^api/company-app/searchs/stock$", csrf_exempt(views.get_stock), name='get_stock'),
    re_path(r"^api/company-app/searchs/financialinfo$", csrf_exempt(views.get_financial_info), name='get_financial_info'),    
    re_path(r"^api/company-app/searchs/clinic$", csrf_exempt(views.get_clinic_test), name='get_clinic_test'),
    re_path(r"^api/company-app/searchs/disclosurereport$", csrf_exempt(views.get_disclosure_report), name='get_disclosure_report'),
    re_path(r"^api/company-app/searchs/ownedpatent$", csrf_exempt(views.get_owned_patent), name='get_owned_patent'),
    re_path(r"^api/company-app/searchs/wordcloud$", csrf_exempt(views.get_wordcloud), name='get_wordcloud'),
    re_path(r"^api/company-app/searchs/stocksearchtop$", csrf_exempt(views.get_stock_search_top), name='get_stock_search_top'),
    re_path(r"^api/company-app/searchs/stockupper$", csrf_exempt(views.get_stock_upper), name='get_stock_upper'),
    re_path(r"^api/company-app/searchs/stocklower$", csrf_exempt(views.get_stock_lower), name='get_stock_lower'),

    # starred, labels
    re_path(r"^api/company-app/toggle-starred$", csrf_exempt(views.toggle_searchs_starred), name='toggle_searchs_starred'),
    re_path(r"^api/company-app/set-searchs-starred$", csrf_exempt(views.set_searchs_starred), name='set_searchs_starred'),
    re_path(r"^api/company-app/set-searchs-unstarred$", csrf_exempt(views.set_searchs_unstarred), name='set_searchs_unstarred'),
    re_path(r"^api/company-app/update-searchs-labels$", csrf_exempt(views.update_searchs_labels), name='update_searchs_labels'),
    re_path(r"^api/company-app/update-labels$", csrf_exempt(views.update_labels), name='update_labels'),
    re_path(r"^api/company-app/update-searchs-filters$", csrf_exempt(views.update_searchs_filters), name='update_searchs_filters'),
    re_path(r"^api/company-app/update-filters$", csrf_exempt(views.update_filters), name='update_filters'),

    re_path(r"^api/company-app/search/stock$", csrf_exempt(views.get_stock), name='get_stock'),

]
