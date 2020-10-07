# from django.shortcuts import render
# from django.http import HttpResponse

from .searchs import parse_searchs, parse_query
# from .search import (
    # parse_search,
    # parse_search_quote,
    # parse_search_family,
    # parse_search_ipc_cpc,
    # parse_search_rnd,
    # parse_search_legal,
    # parse_search_registerfee,
    # parse_search_rightfullorder,
    # parse_search_rightholder,
    # parse_search_applicant,
    # parse_search_applicant_trend,
    # parse_search_applicant_ipc,
    # parse_search_similar
# )

# from .nlp import parse_wordcloud, parse_vec, parse_indicator
# from .news import parse_news, parse_news_nlp, parse_related_company, parse_news_sa
# from .matrix import parse_matrix, parse_matrix_dialog


def get_searchs(request):
    return parse_searchs(request)

def get_query(request):
    return parse_query(request)


# def get_search(request):
#     return parse_search(request)

# def get_search_quote(request):
#     return parse_search_quote(request)

# def get_search_family(request):
#     return parse_search_family(request)

# def get_search_ipc_cpc(request):
#     return parse_search_ipc_cpc(request)

# def get_search_rnd(request):
#     return parse_search_rnd(request)

# def get_search_legal(request):
#     return parse_search_legal(request)

# def get_search_registerfee(request):
#     return parse_search_registerfee(request)

# def get_search_rightfullorder(request):
#     return parse_search_rightfullorder(request)

# def get_search_rightholder(request):
#     return parse_search_rightholder(request)

# def get_search_applicant(request):
#     return parse_search_applicant(request)

# def get_search_applicant_trend(request):
#     return parse_search_applicant_trend(request)

# def get_search_applicant_ipc(request):
#     return parse_search_applicant_ipc(request)

# def get_search_similar(request):
#     return parse_search_similar(request)


# def get_wordcloud(request):
#     return parse_wordcloud(request)

# def get_vec(request):
#     return parse_vec(request)

# def get_news(request):
#     return parse_news(request)

# def get_news_sa(request):
#     return parse_news_sa(request)

# def get_news_nlp(request):
#     return parse_news_nlp(request)

# def get_related_company(request):
#     return parse_related_company(request)

# def get_matrix(request):
#     return parse_matrix(request)

# def get_matrix_dialog(request):
#     return parse_matrix_dialog(request)

# def get_indicator(request):
#     return parse_indicator(request)

