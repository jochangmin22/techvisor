from django.urls import path, re_path
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요
from . import views

urlpatterns = [
    re_path(r"^api/auth/$", csrf_exempt(views.do_auth), name='do_auth'),
    re_path(r"^api/auth/start$", csrf_exempt(views.do_auth_start), name='do_auth_start'),
    # re_path(r"^api/auth/verify$", csrf_exempt(views.do_auth_start), name='do_auth_start'),
    # re_path(r"^api/auth/verify/$", csrf_exempt(views.do_verify), name='do_verify'),
    re_path(r"^api/auth/accesstoken$", csrf_exempt(views.do_access_token), name='do_access_token'),
    re_path(r"^api/auth/register$", csrf_exempt(views.do_register), name='do_register'),
    re_path(r"^api/auth/user/update$", csrf_exempt(views.do_update), name='do_update'),
    path("api/auth/verify/<str:code>", views.do_verify, name='do_verify'),
]
