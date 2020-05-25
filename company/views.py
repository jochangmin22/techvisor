# from django.shortcuts import render
# from django.http import HttpResponse

from .companies import parse_companies, parse_companies_query, parse_companies_num
from .company import parse_company
from .nlp import kr_nlp

def get_companies(request):
    return parse_companies(request)

def get_companies_query(request):
    return parse_companies_query(request)

def get_companies_num(request):
    return parse_companies_num(request)


def get_company(request, companyId=""):
    return parse_company(request, companyId)

def get_wordcloud(request):
    return kr_nlp(request, "wordcloud")


def get_topic(request):
    return kr_nlp(request, "topic")


def get_vec(request):
    return kr_nlp(request, "vec")

