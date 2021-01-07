# from django.shortcuts import render
# from django.http import HttpResponse

from . import searchs
from . import search
from . import nlp
from . import news
from . import matrix
from . import visual

# searchs
def get_searchs(request):
    return searchs.parse_searchs(request)

def get_query(request):
    return searchs.parse_query(request)

def get_search(request):
    return search.parse_search(request)

def get_search_quote(request):
    return search.parse_search_quote(request)

def get_search_family(request):
    return search.parse_search_family(request)

def get_search_ipc_cpc(request):
    return search.parse_search_ipc_cpc(request)

def get_search_rnd(request):
    return search.parse_search_rnd(request)

def get_search_legal(request):
    return search.parse_search_legal(request)

def get_search_registerfee(request):
    return search.parse_search_registerfee(request)

def get_search_rightfullorder(request):
    return search.parse_search_rightfullorder(request)

def get_search_rightholder(request):
    return search.parse_search_rightholder(request)

def get_search_applicant(request):
    return search.parse_search_applicant(request)

def get_search_applicant_trend(request):
    return search.parse_search_applicant_trend(request)

def get_search_applicant_ipc(request):
    return search.parse_search_applicant_ipc(request)

def get_similar(request):
    return search.similar(request)

def get_associate_corp(request):
    return search.associate_corp(request)

# nlp
def get_wordcloud(request):
    return nlp.parse_wordcloud(request)

def get_vec(request):
    return nlp.parse_vec(request)

def get_indicator(request):
    return nlp.parse_indicator(request)

# news
def get_news(request):
    return news.parse_news(request)

def get_news_sa(request):
    return news.parse_news_sa(request)

def get_news_nlp(request):
    return news.parse_news_nlp(request)

def get_related_company(request):
    return news.parse_related_company(request)

# matrix
def get_matrix(request):
    return matrix.parse_matrix(request)

def get_matrix_dialog(request):
    return matrix.parse_matrix_dialog(request)

# visual
def get_applicant_classify(request):
    return visual.applicant_classify(request)



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
