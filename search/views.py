# from django.shortcuts import render
# from django.http import HttpResponse

from .searchs import parse_searchs, parse_query
from .search import (
    parse_search,
    parse_search_quote,
    parse_search_family,
    parse_search_ipc_cpc,
    parse_search_rnd,
    parse_search_legal,
    parse_search_registerfee,
    parse_search_rightfullorder,
    parse_search_rightholder,
    parse_search_applicant,
    parse_search_applicant_trend,
    parse_search_similar
)

# from .test import parse_test
from .nlp import kr_nlp, parse_wordcloud, parse_vec
from .news import parse_news, parse_news_nlp, parse_related_company, parse_news_sa
from .matrix import parse_matrix, parse_matrix_dialog

# # caching with redis
# from django.core.cache import cache
# from django.conf import settings
# from django.core.cache.backends.base import DEFAULT_TIMEOUT

# CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)


def get_searchs(request):
    return parse_searchs(request)


def get_query(request):
    return parse_query(request)


def get_search(request):
    return parse_search(request)


def get_search_quote(request):
    return parse_search_quote(request)


def get_search_family(request):
    return parse_search_family(request)

def get_search_ipc_cpc(request):
    return parse_search_ipc_cpc(request)

def get_search_rnd(request):
    return parse_search_rnd(request)

def get_search_legal(request):
    return parse_search_legal(request)


def get_search_registerfee(request):
    return parse_search_registerfee(request)


def get_search_rightfullorder(request):
    return parse_search_rightfullorder(request)


def get_search_rightholder(request):
    return parse_search_rightholder(request)


def get_search_applicant(request):
    return parse_search_applicant(request)


def get_search_applicant_trend(request):
    return parse_search_applicant_trend(request)

def get_search_similar(request):
    return parse_search_similar(request)


def get_wordcloud(request):
    return parse_wordcloud(request)


def get_topic(request):
    return kr_nlp(request, "topic")


def get_vec(request):
    return parse_vec(request)


def get_news(request):
    return parse_news(request)

def get_news_sa(request):
    return parse_news_sa(request)

def get_news_nlp(request):
    return parse_news_nlp(request)

def get_related_company(request):
    return parse_related_company(request)


def get_matrix(request):
    return parse_matrix(request)

def get_matrix_dialog(request):
    return parse_matrix_dialog(request)


# def test(request, keyword=""):
#     return parse_test(request, keyword)


""" def get_thsrs(request, keyword):
    # return parse_thsrs(request, keyword)

    pre = os.path.dirname(os.path.realpath(__file__))
    fname = "test_input.xlsx"
    path = os.path.join(pre, fname)

    docs = read_excel(path, "raw", "요약")
    # return HttpResponse(docs)

    docs = split_doc(docs)

    doc_topic(docs, 3, 30)
    doc_wordvec(docs, "system", 10)
    check_numdoc(docs)
    wordcloud_doc(request, docs)
    # return HttpResponse(docs) """
