from django.urls import re_path
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요
from . import views

urlpatterns = [
    re_path(r"^api/auth/email$", csrf_exempt(views.email), name='email'),
    re_path(r"^api/auth/password$", csrf_exempt(views.password), name='password'),
    re_path(r"^api/auth/access-token$", csrf_exempt(views.access_token), name='access_token'),
    re_path(r"^api/auth/register$", csrf_exempt(views.register), name='register'),
    re_path(r"^api/auth/user/update$", csrf_exempt(views.do_update), name='do_update'),
]
