from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
import json
from google_auth_oauthlib.flow import InstalledAppFlow

base_url = settings.GOOGLE['base_url']
redirect_url = settings.GOOGLE['redirect_url']
client_id = settings.GOOGLE['client_id']
client_secret = settings.GOOGLE['client_secret']
client_json = settings.GOOGLE['client_json']


# Create your views here.
def redirect_google_login(request):
    if not client_id or not client_secret:
        content = { "please check ENVVAR" : "Google ENVVAR is missing"}
        return Response(content, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    flow = InstalledAppFlow.from_client_secrets_file(
        client_json,
        scopes=['profile', 'email'])
    flow.redirect_uri = redirect_url + 'auth/google'
    auth_uri, _ = flow.authorization_url(prompt='consent')
    # flow.run_local_server()
    return redirect(auth_uri)

    # ["https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=915435922483-ekbq9k08jiofkbu8v4af8biioad9kq3t.apps.googleusercontent.com&scope=profile+email&state=0sWZHzJ7RwWVLW4Jcu5kRl6RGLqFxV&access_type=offline", "0sWZHzJ7RwWVLW4Jcu5kRl6RGLqFxV"]

def google_callback(request):
    if request.method == 'GET':
        code = request.GET.get('code', None)
        if not code:
            return redirect(base_url + '/?callback?error=1')

        if not client_id or not client_secret:
            content = { "please check ENVVAR" : "Google ENVVAR is missing"}
            return Response(content, status=status.HTTP_500_INTERNAL_SERVER_ERROR)            

        flow = InstalledAppFlow.from_client_secrets_file(
            client_json,
            scopes=['profile', 'email'])
        flow.redirect_uri = redirect_url + 'auth/google'

        flow.fetch_token(code=code)
        auth_uri, _ = flow.authorization_url(prompt='consent')            

        
        # return JsonResponse(data, safe=False)
        return HttpResponse(code, content_type="text/plain; charset=utf-8")
    pass    

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
