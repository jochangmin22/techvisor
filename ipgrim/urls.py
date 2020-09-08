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

# from users.views import (do_auth, do_auth_start, do_verify, do_access_token, do_register, do_update)
from callback.views import (redirect_google_login, google_callback)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('search.urls')),
    path('', include('company.urls')),
    path('', include('users.urls')),

    path("auth/google/login", redirect_google_login),
    path("auth/google", google_callback),    

    # path("api/search-app/thsrs/<str:keyword>/", get_thsrs),
    # path("api/search-app/applicant", get_applicant),
    # path("api/search-app/applicant/<str:keyword>/", get_applicant),
    # path("api/search-app/test/<str:keyword>/", test),

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
