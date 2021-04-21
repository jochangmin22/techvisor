from django.urls import path, re_path
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요

from . import views
# from .views

URL = r'^api/search-app/'

urlpatterns = [
    # searchs
    re_path(URL + "searchs/$", csrf_exempt(views.searchs.get_searchs), name='get_searchs'),
    # nlp
    re_path(URL + "searchs/keywords$", csrf_exempt(views.nlp.get_keywords), name='get_keywords'),
    re_path(URL + "searchs/wordcloud$", csrf_exempt(views.nlp.get_wordcloud), name='get_wordcloud'),
    re_path(URL + "searchs/wordclouddialog$", csrf_exempt(views.nlp.get_wordcloud_dialog), name='get_wordcloud_dialog'),
    # news
    re_path(URL + "searchs/news$", csrf_exempt(views.news.get_news), name='get_news'),
    re_path(URL + "searchs/newssa$", csrf_exempt(views.news.get_news_sa), name='get_news_sa'),
    re_path(URL + "searchs/relatedcompany$", csrf_exempt(views.news.get_related_company), name='get_related_company'),
    # matrix
    re_path(URL + "searchs/matrix$", csrf_exempt(views.matrix.get_matrix), name='get_matrix'),
    re_path(URL + "searchs/matrixdialog$", csrf_exempt(views.matrix.get_matrix_dialog), name='get_matrix_dialog'),
    # visual
    re_path(URL + "searchs/indicator$", csrf_exempt(views.visual.get_indicator), name='get_indicator'),
    re_path(URL + "searchs/visual$", csrf_exempt(views.visual.get_visual), name='get_visual'),
    # search
    re_path(URL + "search/$", csrf_exempt(views.search.get_search), name='get_search'),
    re_path(URL + "search/quote$", csrf_exempt(views.search.get_quote), name='get_quote'),
    re_path(URL + "search/family$", csrf_exempt(views.search.get_family), name='get_family'),
    re_path(URL + "search/rnd$", csrf_exempt(views.search.get_rnd), name='get_rnd'),
    re_path(URL + "search/legal$", csrf_exempt(views.search.get_legal), name='get_legal'),
    re_path(URL + "search/description$", csrf_exempt(views.search.get_description), name='get_description'),
    re_path(URL + "search/wordcloud$", csrf_exempt(views.search.get_wordcloud), name='get_wordcloud'),
    re_path(URL + "search/applicant$", csrf_exempt(views.search.get_applicant), name='get_applicant'),
    re_path(URL + "search/applicationnumber$", csrf_exempt(views.search.application_number), name='application_number'),
    re_path(URL + "search/ipc$", csrf_exempt(views.search.get_ipc), name='get_ipc'),
    re_path(URL + "search/similar$", csrf_exempt(views.search.get_similar), name='get_similar'),         
    re_path(URL + "search/rightholder$", csrf_exempt(views.search.right_holder), name='right_holder'),    
    re_path(URL + "search/registerfee$", csrf_exempt(views.search.register_fee), name='register_fee'),
    re_path(URL + "search/rightfullorder$", csrf_exempt(views.search.rightfull_order), name='rightfull_order'),
    re_path(URL + "search/associatecorp$", csrf_exempt(views.search.associate_corp), name='associate_corp'),         
]
