from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.utils.http import urlencode
from rest_framework import status
from rest_framework.response import Response
import json
from google_auth_oauthlib.flow import Flow
from oauthlib.oauth2.rfc6749.errors import InvalidGrantError

# caching with redis
from django.core.cache import cache

import secrets

from ..utils import handleRedis, google_client_json_exist

base_url = settings.GOOGLE['base_url']
redirect_url = settings.GOOGLE['redirect_url']
client_json = settings.GOOGLE['client_json']

google_scopes = ['https://www.googleapis.com/auth/userinfo.email','openid','https://www.googleapis.com/auth/userinfo.profile']

 
def get_token(request):
    data = json.loads(request.body.decode('utf-8'))
    result = { 'token' : handleRedis(data['key'], 'social')}
    return JsonResponse(result, safe=False)

def redirect_google_login(request):
    next = request.GET.get('state', '/landing')

    google_client_json_exist(client_json)

    flow = Flow.from_client_config(
        client_json,
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

        google_client_json_exist(client_json)          

        flow = Flow.from_client_config(
            client_json,
            scopes=google_scopes)

        flow.redirect_uri = redirect_url + 'api/auth/callback/google'

        # auth_uri, _ = flow.authorization_url(prompt='consent')            

        try:
            flow.fetch_token(code=code)
        except InvalidGrantError as ex:
            content = { "Authentication has failed : " + str(ex)}
            return HttpResponse(content, content_type="text/plain; charset=utf-8")
        
        redisKey = secrets.token_hex(16)

        handleRedis(redisKey, 'social', flow.credentials.token, mode="w")
        nextUrl = base_url + 'callback?type=google&key=' + redisKey

        if state:
            next = urlencode(json.loads(state))
            nextUrl += '&' + next
        return redirect(nextUrl)

        # return JsonResponse(data, safe=False)
        # return HttpResponse(code, content_type="text/plain; charset=utf-8")
    pass    

def redirect_naver_login(request):
    return

def naver_login(request):
    return

# Variable	Value
# state	
# 'fG49Qac9Va9SjlRghD6YuDxoB0DU1Q'
# code	
# '4/zQGrxol11T5PPay46sfJNMNUhunBFPheRXvdwDWmqfJW0OcgRnrhampop5RHDEHCUB1uL8wyQHGuvWDRshZNRJ0'
# scope	
# ('email profile https://www.googleapis.com/auth/userinfo.profile '
#  'https://www.googleapis.com/auth/userinfo.email openid')
# authuser	
# '0'
# prompt	
# 'consent'
