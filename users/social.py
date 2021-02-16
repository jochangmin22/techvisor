import jwt
import json
from django.conf import settings
from django.db import connection
from django.http import JsonResponse, HttpResponse

import time
import uuid
import bcrypt
import datetime
import shortuuid

from psycopg2.extensions import AsIs
from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.template.loader import render_to_string

import google.oauth2.credentials
from googleapiclient.discovery import build


from .models import Users, Social_accounts
# from .serializers import UsersSerializer, EmailAuthSerializer

from .utils import handleRedis, google_client_json_exist, generate_token

client_json = settings.GOOGLE['client_json']

google_scopes = ['https://www.googleapis.com/auth/userinfo.email','openid','https://www.googleapis.com/auth/userinfo.profile']

def check_user_by_email(email):
    return True if Users.objects.filter(data__email=email).exists() else False

def check_user_by_social_id(social_id):
    return True if Social_accounts.objects.filter(social_id=social_id).exists() else False

def find_user_by_email(email):
    ''' return user rows '''
    user_instance = Users.objects.filter(data__email=email)
    row = list(user_instance.values())
    result = row[0] if row else {}
    return result

def find_user_by_id(id):
    ''' return user rows '''
    user_instance = Users.objects.filter(id=id)
    row = list(user_instance.values())
    result = row[0] if row else {}
    return result    

def find_user_by_social_id(social_id):
    ''' return user rows by Social id '''
    sa_instance = Social_accounts.objects.filter(social_id=social_id)
    row = list(sa_instance.values())
    if row:
        return find_user_by_id(row[0]['fk_user_id'])
    else:
        return None


def verify_social(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        access_token = data['accessToken']
        provider = data['provider']

        google_client_json_exist(client_json)

        profile = getSocialProfile(provider, access_token)
        try:
            user = check_user_by_email(profile['email'])
            social = check_user_by_social_id(str(profile['id']))

            exists = user or social
            result = { 'profile' : profile, 'exists' : exists}
            return JsonResponse(result, safe=False)
        except:
            return JsonResponse({'error': 'WRONG_CREDENTIALS'}, status=401,safe=False)            

def social_login(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        access_token = data['accessToken']
        provider = data['provider']

        google_client_json_exist(client_json)

        profile = None
        user = None
        try:
            profile = getSocialProfile(provider, access_token)
        except:
            return JsonResponse({'error' : 'WRONG_CREDENTIALS'}, status=401, safe=False)           

        if not profile:
           return JsonResponse({'error' : 'WRONG_CREDENTIALS'}, status=401, safe=False)  

        try:
            user = find_user_by_social_id(str(profile['id']))
            if not user:
                # if socialaccount not found, try find by email        
                if profile['email']:
                    user = find_user_by_email(profile['email'])

                if not user:
                    return JsonResponse({'error': 'NOT_REGISTERED'}, status=401, safe=False)    


                # if user is found, link social account    
                foo = {
                    'fk_user_id': user['id'],
                    'social_id': str(profile['id']),
                    'provider': provider,
                    'access_token': access_token
                }
                Social_accounts.objects.create(**foo)

            # user_profile = get_profile() # not yet used user_profile db

            bar = {
                'id' : str(user['id']),
            }
            token = generate_token(bar)

            photoURL = profile['thumbnail'] if  profile['thumbnail'] else user['data']['photoURL']



            newUser = {
                'id': user['id'],
                'role': 'user',
                'data': {
                    'email': user['data']['email'],
                    'displayName': user['data']['displayName'],
                    'photoURL': photoURL,
                }
            }

            res = { 'user' : newUser, 'token' : token }
            result = JsonResponse(res, status=200, safe=False)
            result.set_cookie('access_token', token)
            return result
        except:
            return JsonResponse({'error': 'SOCIAL_LOGIN'}, status=500, safe=False)             

def social_register(request):
    
    return


def getSocialProfile(provider, access_token):
    if provider == 'google':
        credentials = google.oauth2.credentials.Credentials(access_token)
        service = build('people', 'v1', credentials=credentials)

        # pylint: disable=maybe-no-member
        profile = service.people().get(resourceName='people/me', personFields='names,emailAddresses,photos').execute()

        result = { 
            'email': profile['emailAddresses'][0]['value'],
            'name': profile['names'][0]['displayName'],
            'thumbnail': profile['photos'][0]['url'],
            'id':  profile['resourceName'].replace('people/', ''),
        }
        return result     
 