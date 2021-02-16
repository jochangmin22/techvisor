from django.urls import re_path, path, include
from django.views.decorators.csrf import csrf_exempt  # post일 경우 필요
from . import views
from . import social

urlpatterns = [
    re_path(r"^api/auth/email$", csrf_exempt(views.email), name='email'),
    re_path(r"^api/auth/password$", csrf_exempt(views.password), name='password'),
    re_path(r"^api/auth/reset-email$", csrf_exempt(views.reset_email), name='reset_email'),
    re_path(r"^api/auth/change-password$", csrf_exempt(views.change_password), name='change_password'),
    re_path(r"^api/auth/access-token$", csrf_exempt(views.access_token), name='access_token'),
    re_path(r"^api/auth/verify-email-code$", csrf_exempt(views.verify_email_code), name='verify_email_code'),
    re_path(r"^api/auth/change-email$", csrf_exempt(views.change_email), name='change_email'),
    re_path(r"^api/auth/delete-account$", csrf_exempt(views.delete_account), name='delete_account'),
    re_path(r"^api/auth/register$", csrf_exempt(views.register), name='register'),
    re_path(r"^api/auth/user/update$", csrf_exempt(views.do_update), name='do_update'),

    re_path(r"^api/auth/verify-social$", csrf_exempt(social.verify_social), name='verify_social'),
    re_path(r"^api/auth/social-register$", csrf_exempt(social.social_register), name='social_register'),
    re_path(r"^api/auth/social-login$", csrf_exempt(social.social_login), name='social_login'),
]
