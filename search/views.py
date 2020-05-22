# from django.shortcuts import render
# from django.http import HttpResponse

from .searchs import parse_searchs, parse_query, parse_searchs_num
from .search import parse_search, parse_search_quote, parse_search_family, parse_search_legal, parse_search_registerfee, parse_search_rightfullorder, parse_search_rightholder, parse_search_applicant, parse_search_applicant_trend
# from .test import parse_test
from .nlp import kr_nlp
from .news import parse_news
from .matrix import parse_matrix

# # caching with redis
# from django.core.cache import cache
# from django.conf import settings
# from django.core.cache.backends.base import DEFAULT_TIMEOUT

# CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)


def get_searchs(request):
    return parse_searchs(request)


def get_searchs_num(request):
    return parse_searchs_num(request)


def get_query(request):
    return parse_query(request)


def get_search(request, patNo=""):
    return parse_search(request, patNo)


def get_search_quote(request, patNo=""):
    return parse_search_quote(request, patNo)


def get_search_family(request, patNo=""):
    return parse_search_family(request, patNo)


def get_search_legal(request, patNo=""):
    return parse_search_legal(request, patNo)


def get_search_registerfee(request, rgNo=""):
    return parse_search_registerfee(request, rgNo)


def get_search_rightfullorder(request, patNo=""):
    return parse_search_rightfullorder(request, patNo)


def get_search_rightholder(request, rgNo=""):
    return parse_search_rightholder(request, rgNo)


def get_search_applicant(request, cusNo=""):
    return parse_search_applicant(request, cusNo)


def get_search_applicant_trend(request, cusNo=""):
    return parse_search_applicant_trend(request, cusNo)


def get_wordcloud(request):
    return kr_nlp(request, "wordcloud")


def get_topic(request):
    return kr_nlp(request, "topic")


def get_vec(request):
    return kr_nlp(request, "vec")


def get_news(request):
    return parse_news(request)


def get_matrix(request):
    return parse_matrix(request)


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
