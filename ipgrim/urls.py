"""ipgrim URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요

from search.views import (
    get_searchs,
    get_searchs_num,
    get_query,
    get_search,
    get_search_quote,
    get_search_family,
    get_search_ipc_cpc,
    get_search_rnd,
    get_search_legal,
    get_search_registerfee,
    get_search_rightfullorder,
    get_search_rightholder,
    get_search_applicant,
    get_search_applicant_trend,
    get_search_similar,
    get_wordcloud,
    get_topic,
    get_vec,
    get_news,
    get_news_sa,
    get_news_nlp,
    get_related_company,
    get_matrix,
    get_matrix_dialog,
)
from company.views import (
    get_companies, get_companies_query, get_companies_num, get_company, get_stock, get_crawl, get_company_info)
from users.views import (do_auth, do_auth_start, do_verify,
                         do_access_token, do_register, do_update)
from callback.views import (redirect_google_login, google_callback)

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r"^api/auth$", csrf_exempt(do_auth)),
    re_path(r"^api/auth_start$", csrf_exempt(do_auth_start)),
    re_path(r"^api/auth/verify$", csrf_exempt(do_auth_start)),
    re_path(r"^api/auth/accesstoken$", csrf_exempt(do_access_token)),
    re_path(r"^api/auth/register$", csrf_exempt(do_register)),
    re_path(r"^api/auth/user/update$", csrf_exempt(do_update)),
    path("api/auth/verify/<str:code>/", do_verify),
    path("auth/google/login", redirect_google_login),
    path("auth/google", google_callback),
    re_path(r"^api/search-app/query/$", get_query),
    re_path(r"^api/search-app/searchs/$", csrf_exempt(get_searchs)),
    re_path(r"^api/search-app/searchs/num$", get_searchs_num),
    re_path(r"^api/search-app/searchs/wordcloud$", get_wordcloud),
    re_path(r"^api/search-app/searchs/vec$", get_vec),
    re_path(r"^api/search-app/searchs/topic$", get_topic),
    re_path(r"^api/search-app/searchs/news$", get_news),
    re_path(r"^api/search-app/searchs/newssa$", csrf_exempt(get_news_sa)),
    re_path(r"^api/search-app/searchs/newsnlp$", csrf_exempt(get_news_nlp)),
    re_path(r"^api/search-app/searchs/relatedcompany$", csrf_exempt(get_related_company)),
    re_path(r"^api/search-app/searchs/matrix$", get_matrix),
    re_path(r"^api/search-app/searchs/matrixdialog$", get_matrix_dialog),
    # path("api/search-app/thsrs/<str:keyword>/", get_thsrs),
    # path("api/search-app/applicant", get_applicant),
    # path("api/search-app/applicant/<str:keyword>/", get_applicant),
    # path("api/search-app/test/<str:keyword>/", test),

    re_path(r"^api/search-app/search/$", csrf_exempt(get_search)),
    re_path(r"^api/search-app/search/quote$", csrf_exempt(get_search_quote)),
    re_path(r"^api/search-app/search/family$", csrf_exempt(get_search_family)),
    re_path(r"^api/search-app/search/ipccpc$", csrf_exempt(get_search_ipc_cpc)),
    re_path(r"^api/search-app/search/rnd$", csrf_exempt(get_search_rnd)),
    re_path(r"^api/search-app/search/legal$", csrf_exempt(get_search_legal)),
    re_path(r"^api/search-app/search/registerfee$", csrf_exempt(get_search_registerfee)),
    re_path(r"^api/search-app/search/rightfullorder$", csrf_exempt(get_search_rightfullorder)),
    re_path(r"^api/search-app/search/rightholder$", csrf_exempt(get_search_rightholder)),
    re_path(r"^api/search-app/search/applicant$", csrf_exempt(get_search_applicant)),
    re_path(r"^api/search-app/search/applicanttrend$", csrf_exempt(get_search_applicant_trend)),
    re_path(r"^api/search-app/search/similar$", csrf_exempt(get_search_similar)),         

    re_path(r"^api/company-app/query$", get_companies_query),
    re_path(r"^api/company-app/searchs/$", get_companies),
    re_path(r"^api/company-app/searchs/num$", get_companies_num),
    re_path(r"^api/company-app/searchs/stock$", get_stock),
    re_path(r"^api/company-app/searchs/vec$", get_vec),
    re_path(r"^api/company-app/searchs/topic$", get_topic),
    
    re_path(r"^api/company-app/search/stock$", csrf_exempt(get_stock)),
    re_path(r"^api/company-app/search/companyinfo$", csrf_exempt(get_company_info)),
    re_path(r"^api/company-app/search/crawlstock$", csrf_exempt(get_crawl)),
    # path("api/company-app/search", get_company),
    # path("api/company-app/search/<str:companyId>/", get_company),
    # path("api/extract-app/extract_topic/<str:keyword>/", get_extract_topic),
    # path("api/extract-app/extract_count/<str:keyword>/", get_extract_count),
    # path("api/extract-app/extract_vec/<str:keyword>/<str:keywordre>/", get_extract_vec),
    # path("api/extract-app/morp/<str:patNo>/<str:mode>", get_morp),
    # path("api/extract-app/tag/<str:mode>", get_tag),
    # path("api/classify-app/category", category),
    # path("api/classify-app/dictionary/<str:value>", dictionary),
]
