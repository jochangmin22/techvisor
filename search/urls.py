from django.urls import path, re_path
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요

from . import views

urlpatterns = [
    re_path(r"^api/search-app/query/$", views.get_query, name='get_query'),
    re_path(r"^api/search-app/searchs/$", csrf_exempt(views.get_searchs), name='get_searchs'),
    re_path(r"^api/search-app/searchs/wordcloud$", csrf_exempt(views.get_wordcloud), name='get_wordcloud'),
    re_path(r"^api/search-app/searchs/vec$", csrf_exempt(views.get_vec), name='get_vec'),
    re_path(r"^api/search-app/searchs/news$", csrf_exempt(views.get_news), name='get_news'),
    re_path(r"^api/search-app/searchs/newssa$", csrf_exempt(views.get_news_sa), name='get_news_sa'),
    re_path(r"^api/search-app/searchs/newsnlp$", csrf_exempt(views.get_news_nlp), name='get_news_nlp'),
    re_path(r"^api/search-app/searchs/relatedcompany$", csrf_exempt(views.get_related_company), name='get_related_company'),
    re_path(r"^api/search-app/searchs/matrix$", csrf_exempt(views.get_matrix), name='get_matrix'),
    re_path(r"^api/search-app/searchs/matrixdialog$", csrf_exempt(views.get_matrix_dialog), name='get_matrix_dialog'),
    re_path(r"^api/search-app/searchs/indicator$", csrf_exempt(views.get_indicator), name='get_indicator'),
    re_path(r"^api/search-app/searchs/classify$", csrf_exempt(views.get_applicant_classify), name='get_applicant_classify'),

    re_path(r"^api/search-app/search/$", csrf_exempt(views.get_search), name='get_search'),
    re_path(r"^api/search-app/search/quote$", csrf_exempt(views.get_search_quote), name='get_search_quote'),
    re_path(r"^api/search-app/search/family$", csrf_exempt(views.get_search_family), name='get_search_family'),
    re_path(r"^api/search-app/search/ipccpc$", csrf_exempt(views.get_search_ipc_cpc), name='get_search_ipc_cpc'),
    re_path(r"^api/search-app/search/rnd$", csrf_exempt(views.get_search_rnd), name='get_search_rnd'),
    re_path(r"^api/search-app/search/legal$", csrf_exempt(views.get_search_legal), name='get_search_legal'),
    re_path(r"^api/search-app/search/registerfee$", csrf_exempt(views.get_search_registerfee), name='get_search_registerfee'),
    re_path(r"^api/search-app/search/rightfullorder$", csrf_exempt(views.get_search_rightfullorder), name='get_search_rightfullorder'),
    re_path(r"^api/search-app/search/rightholder$", csrf_exempt(views.get_search_rightholder), name='get_search_rightholder'),
    re_path(r"^api/search-app/search/applicant$", csrf_exempt(views.get_search_applicant), name='get_search_applicant'),
    re_path(r"^api/search-app/search/applicanttrend$", csrf_exempt(views.get_search_applicant_trend), name='get_search_applicant_trend'),
    re_path(r"^api/search-app/search/applicantipc$", csrf_exempt(views.get_search_applicant_ipc), name='get_search_applicant_ipc'),
    re_path(r"^api/search-app/search/similar$", csrf_exempt(views.get_similar), name='get_similar'),         
    re_path(r"^api/search-app/search/associatecorp$", csrf_exempt(views.get_associate_corp), name='get_associate_corp'),         
]
