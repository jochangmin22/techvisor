from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.utils.http import urlencode
# from django.middleware.csrf import _compare_masked_tokens
from rest_framework import status
from rest_framework.response import Response
import json
from google_auth_oauthlib.flow import Flow
from oauthlib.oauth2.rfc6749.errors import InvalidGrantError
import requests


# caching with redis
from django.core.cache import cache

import secrets

from ..utils import handleRedis, social_login_infos_exist, generate_token, get_payload_from_token

base_url = settings.SOCIAL_LOGIN['base_url']
redirect_url = settings.SOCIAL_LOGIN['redirect_url']
providers = settings.SOCIAL_LOGIN['provider']

google_scopes = ['https://www.googleapis.com/auth/userinfo.email','openid','https://www.googleapis.com/auth/userinfo.profile']


def get_token(request):
    data = json.loads(request.body.decode('utf-8'))
    key = data['key']
    type = data['type']

    result = { 'token' : handleRedis(key, type)}
    return JsonResponse(result, safe=False)

def redirect_google_login(request):
    next = request.GET.get('next', '/landing')

    social_login_infos_exist(providers['google'])

    flow = Flow.from_client_config(
        providers['google'],
        scopes=google_scopes,
        state=json.dumps({ "next": next }) )

    flow.redirect_uri = redirect_url + 'api/auth/callback/google'
    auth_uri, _ = flow.authorization_url(access_type='offline', prompt='consent', include_granted_scopes='true')

    return redirect(auth_uri)

    # ["https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=915435922483-ekbq9k08jiofkbu8v4af8biioad9kq3t.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Fv.techvisor.co.kr%3A8001%2Fapi%2Fauth%2Fcallback%2Fgoogle&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&state=%7B%22next%22%3A+%22%2Flanding%22%7D&prompt=consent&access_type=offline"]

def google_callback(request):
    if request.method == 'GET':
        code = request.GET.get('code', None)
        state = request.GET.get('state', None)

        if not code:
            return redirect(base_url + '?callback?error=1')

        social_login_infos_exist(providers['google'])          

        flow = Flow.from_client_config(
            providers['google'],
            scopes=google_scopes)

        flow.redirect_uri = redirect_url + 'api/auth/callback/google'

        # auth_uri, _ = flow.authorization_url(prompt='consent')            

        try:
            flow.fetch_token(code=code)
        except InvalidGrantError as ex:
            content = { "Authentication has failed : " + str(ex)}
            return HttpResponse(content, content_type="text/plain; charset=utf-8")
        
        redisKey = secrets.token_hex(16)

        handleRedis(redisKey, 'google', flow.credentials.token, mode="w")
        nextUrl = base_url + 'callback?type=google&key=' + redisKey

        if state:
            next = urlencode(json.loads(state))
            nextUrl += '&' + next
        return redirect(nextUrl)
    pass    

def redirect_naver_login(request):
    next = request.GET.get('next', '/landing')

    social_login_infos_exist(providers['naver'])

    # for csrf
    token = generate_token({ 'next' : next })
    redisKey = secrets.token_hex(16)
    handleRedis(redisKey, 'naver', token, mode="w")    

    auth_uri = providers['naver']['auth_uri'] + '?response_type=code&client_id=' + providers['naver']['client_id'] + '&state=' + redisKey + '&redirect_uri=' + redirect_url + 'api/auth/callback/naver'

    return redirect(auth_uri)    
    # http://v.techvisor.co.kr:8001/api/auth/callback/naver?code=iziVTPWyf0YSHgTkqK&state=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MTM4MzAyNDgsImV4cCI6MTYxMzkxNjY0OCwibmV4dCI6Ii9sYW5kaW5nIn0.EN8FLtwhl4DRJvteZyoFfSAn7hS3wIUpjGaGAYg2jzg

def naver_callback(request):
    if request.method == 'GET':
        code = request.GET.get('code', None)
        state = request.GET.get('state', None)

        if not code:
            return redirect(base_url + '?callback?error=1')

        # csrf check
        csrftoken = handleRedis(state, 'naver')
        if not csrftoken:
            return redirect(base_url + '?callback?error=1')

        # get next url
        next = get_payload_from_token(csrftoken, 'next')

        # if not _compare_masked_tokens(state, request.COOKIES.get('csrftoken')):
        #     return redirect(base_url + '?callback?error=1')

        social_login_infos_exist(providers['naver'])

        is_success, token_infos = get_naver_access_token(state, code)

        # is_success, error = login_with_naver(state, code)

        if not is_success:
            content = { "Authentication has failed" }
            return HttpResponse(content, content_type="text/plain; charset=utf-8")

        access_token = token_infos.get('access_token')

        redisKey = secrets.token_hex(16)

        handleRedis(redisKey, 'naver', access_token, mode="w")
        nextUrl = base_url + 'callback?type=naver&key=' + redisKey

        if next:
            nextUrl += '&next=' + next

        return redirect(nextUrl)


def get_naver_access_token(state, code):
    res = requests.get(providers['naver']['token_uri'], params={'client_id': providers['naver']['client_id'], 'client_secret': providers['naver']['client_secret'], 'grant_type': 'authorization_code', 'state': state, 'code': code})
    return res.ok, res.json()

