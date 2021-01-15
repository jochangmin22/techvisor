"""techvisor URL Configuration

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

from callback.views import (redirect_google_login, google_callback)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('search.urls')),
    path('', include('company.urls')),
    path('', include('users.urls')),
    path('', include('bill.urls', namespace = 'bill')),

    path("auth/google/login", redirect_google_login),
    path("auth/google", google_callback),    
]
