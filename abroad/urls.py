from django.urls import path, re_path
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요

from . import views

urlpatterns = [
    re_path(r"^api/abroad-app/query/$", views.get_query, name='get_query'),
    re_path(r"^api/abroad-app/searchs/$", csrf_exempt(views.get_searchs), name='get_searchs'),
    # re_path(r"^api/abroad-app/searchs/wordcloud$", csrf_exempt(views.get_wordcloud), name='get_wordcloud'),
    # re_path(r"^api/abroad-app/searchs/vec$", views.get_vec, name='get_vec'),
    # re_path(r"^api/abroad-app/searchs/news$", views.get_news, name='get_news'),
    # re_path(r"^api/abroad-app/searchs/newssa$", csrf_exempt(views.get_news_sa), name='get_news_sa'),
    # re_path(r"^api/abroad-app/searchs/newsnlp$", csrf_exempt(views.get_news_nlp), name='get_news_nlp'),
    # re_path(r"^api/abroad-app/searchs/relatedcompany$", csrf_exempt(views.get_related_company), name='get_related_company'),
    # re_path(r"^api/abroad-app/searchs/matrix$", views.get_matrix, name='get_matrix'),
    # re_path(r"^api/abroad-app/searchs/matrixdialog$", views.get_matrix_dialog, name='get_matrix_dialog'),
    # re_path(r"^api/abroad-app/searchs/indicator$", csrf_exempt(views.get_indicator), name='get_indicator'),

    # re_path(r"^api/abroad-app/search/$", csrf_exempt(views.get_search), name='get_search'),
    # re_path(r"^api/abroad-app/search/quote$", csrf_exempt(views.get_search_quote), name='get_search_quote'),
    # re_path(r"^api/abroad-app/search/family$", csrf_exempt(views.get_search_family), name='get_search_family'),
    # re_path(r"^api/abroad-app/search/ipccpc$", csrf_exempt(views.get_search_ipc_cpc), name='get_search_ipc_cpc'),
    # re_path(r"^api/abroad-app/search/rnd$", csrf_exempt(views.get_search_rnd), name='get_search_rnd'),
    # re_path(r"^api/abroad-app/search/legal$", csrf_exempt(views.get_search_legal), name='get_search_legal'),
    # re_path(r"^api/abroad-app/search/registerfee$", csrf_exempt(views.get_search_registerfee), name='get_search_registerfee'),
    # re_path(r"^api/abroad-app/search/rightfullorder$", csrf_exempt(views.get_search_rightfullorder), name='get_search_rightfullorder'),
    # re_path(r"^api/abroad-app/search/rightholder$", csrf_exempt(views.get_search_rightholder), name='get_search_rightholder'),
    # re_path(r"^api/abroad-app/search/applicant$", csrf_exempt(views.get_search_applicant), name='get_search_applicant'),
    # re_path(r"^api/abroad-app/search/applicanttrend$", csrf_exempt(views.get_search_applicant_trend), name='get_search_applicant_trend'),
    # re_path(r"^api/abroad-app/search/applicantipc$", csrf_exempt(views.get_search_applicant_ipc), name='get_search_applicant_ipc'),
    # re_path(r"^api/abroad-app/search/similar$", csrf_exempt(views.get_search_similar), name='get_search_similar'),         
]
