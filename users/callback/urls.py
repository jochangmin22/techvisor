from django.urls import re_path
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요
from . import callback

urlpatterns = [
    re_path(r"^api/auth/callback/google/login", csrf_exempt(callback.redirect_google_login), name='redirect_google_login'),
    re_path(r"^api/auth/callback/google", csrf_exempt(callback.google_callback), name='google_callback'),
    re_path(r"^api/auth/callback/naver/login", csrf_exempt(callback.redirect_naver_login), name='redirect_naver_login'),
    re_path(r"^api/auth/callback/naver", csrf_exempt(callback.naver_callback), name='naver_callback'),
    re_path(r"^api/auth/callback/kakao/login", csrf_exempt(callback.redirect_kakao_login), name='redirect_kakao_login'),
    re_path(r"^api/auth/callback/kakao", csrf_exempt(callback.kakao_callback), name='kakao_callback'),
    re_path(r"^api/auth/callback/facebook/login", csrf_exempt(callback.redirect_facebook_login), name='redirect_facebook_login'),
    re_path(r"^api/auth/callback/facebook", csrf_exempt(callback.facebook_callback), name='facebook_callback'),
    re_path(r"^api/auth/callback/token", csrf_exempt(callback.get_token), name='get_token'),
]
