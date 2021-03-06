import jwt
import json
from django.conf import settings
from django.http import JsonResponse, HttpResponse
# import time
import uuid
import bcrypt
import datetime

import google.oauth2.credentials
from googleapiclient.discovery import build
import requests

from .models import Users, Social_accounts
# from .serializers import UsersSerializer, EmailAuthSerializer

from .utils import social_login_infos_exist, generate_token, find_user, getNamebyEmail, check_user_exists, sendmail, check_user_by_social_id, find_user_by_social_id

secret_key = settings.SECRET_KEY
algorithm = settings.JWT_AUTH['JWT_ALGORITHM']
expiresIn = settings.JWT_AUTH['JWT_EXPIRATION_DELTA']

now = datetime.datetime.utcnow()

providers = settings.SOCIAL_LOGIN['providers']

google_scopes = ['https://www.googleapis.com/auth/userinfo.email','openid','https://www.googleapis.com/auth/userinfo.profile']
naver_scopes = ['id', 'email', 'name', 'profile_image', 'nickname']
kakao_scopes = ['id', 'email', 'nickname', 'thumbnail_image_url']
facebook_scopes = ['id', 'email', 'name', 'profile_picture']

def verify_social(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        access_token = data['accessToken']
        provider = data['provider']

        social_login_infos_exist(providers[provider])

        profile = getSocialProfile(provider, access_token)

        try:
            user = check_user_exists('email', profile['email'])
            social = check_user_by_social_id(str(profile['id']))

            exists = user or social
            result = { 'profile' : profile, 'exists' : exists}
            return JsonResponse(result, safe=False)
        except:
            return JsonResponse({'error': 'WRONG_CREDENTIALS'}, status=401,safe=False)            
    return JsonResponse({'error': 'WRONG_CREDENTIALS'}, status=401,safe=False)            

def social_login(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        access_token = data['accessToken']
        provider = data['provider']

        social_login_infos_exist(providers[provider])

        profile = None
        user = None
        try:
            profile = getSocialProfile(provider, access_token)
        except:
            return JsonResponse({'error' : 'WRONG_CREDENTIALS'}, status=401, safe=False)           

        if not profile:
           return JsonResponse({'error' : 'WRONG_CREDENTIALS'}, status=401, safe=False)  

        try:
            user = find_user_by_social_id(profile['id'])
            if not user:
                # if socialaccount not found, try find by email        
                if profile['email']:
                    # user = find_user_by_email(profile['email'])
                    user = find_user('data__email', profile['email'])

                if not user:
                    return JsonResponse({'error': 'NOT_REGISTERED'}, status=401, safe=False)    


                # if user is found, link social account    
                foo = {
                    'user_id': user.id,
                    'social_id': str(profile['id']),
                    'provider': provider,
                    'access_token': access_token
                }
                Social_accounts.objects.create(**foo)

            # user_profile = get_profile() # not yet used user_profile db
            token = generate_token({ 'id': str(user.id)})

            photoURL = profile['thumbnail'] if  profile['thumbnail'] else user.data['photoURL']

            newUser = {
                'id': user.id,
                'role': 'user',
                'emptyPassword': False if user.password else True,
                'data': {
                    'email': user.data['email'],
                    'displayName': user.data['displayName'],
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
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        try:
            access_token = data['accessToken']
            provider = data['provider']        
            fallback_email = data['model']['fallbackEmail']
            displayName = data['model']['displayName']

            # foo = data['model']['password'].encode('utf-8')           
            # foo = bcrypt.hashpw(foo, bcrypt.gensalt())
            # password = foo.decode('utf-8')
        except KeyError:
            return JsonResponse({'error': 'WRONG_SCHEMA'}, status=400, safe=False)                     

        social_login_infos_exist(providers[provider])

        profile = None
        user = None
        try:
            profile = getSocialProfile(provider, access_token)
        except:
            return JsonResponse({'error' : 'WRONG_CREDENTIALS'}, status=401, safe=False)           

        if not profile:
           return JsonResponse({'error' : 'WRONG_CREDENTIALS'}, status=401, safe=False)  

        # TODO: username ???????????? displayName??? ????????????
        emailExists = check_user_exists('email',fallback_email)
        # nameExists = check_user_exists('displayName',displayName)

        if emailExists: # or nameExists:
            error = {}
            error['email'] = '??? ???????????? ?????? ??????????????????' if emailExists else None
            # error['code'] = errMsg[isCodeValidate(received_code, email)]
            # error['displayName'] = '??? ????????? ?????? ??????????????????' if nameExists else None

            return JsonResponse({'error': error}, status=409, safe=False)

        socialExists = check_user_by_social_id(str(profile['id']))

        if socialExists:
            return JsonResponse({'error': 'SOCIAL_ACCOUNT_EXISTS'}, status=409, safe=False)

        # new register                
        photoURL = profile['thumbnail'] if profile['thumbnail']  else 'assets/images/avatars/profile.jpg'

        newUid = str(uuid.uuid4())
        newUser = {
            'id': newUid,
            'my_from': provider, # 'local','google','naver',...
            'password': '', # password,
            'role': 'user',
            'data': {
                'displayName': displayName,
                'photoURL': photoURL,
                'email': fallback_email,
                'settings': {},
                'shortcuts': [],
                'starred': [],
                'trashed' : {},
                'labels' : {},
                'filters' : {},
                'first_pay' : True
            },
            'is_certified': True if profile['email'] else False
        }

        Users.objects.create(**newUser)
        del newUser['password']

        if not profile['email']:
            # send cert mail
            pass

        # uploadedThumbnail = profile['thumbnail'] 
        # TODO S3 upload
                   
        # user_profile update - not yet used

        # create SocialAccount row
        foo = {
            'user_id': newUid,
            'social_id': str(profile['id']),
            'provider': provider,
            'access_token': access_token
        }
        Social_accounts.objects.create(**foo)

        payload = {
            'id': newUid,
            'iat': now,
            'exp': now + datetime.timedelta(days=expiresIn)
        }
        token = jwt.encode(payload, secret_key , algorithm=algorithm).decode('utf-8')

        # send welcome email
        keywords = {
            'type': 'welcome',
            'text': '????????? ???????????????.',
            'displayName' : displayName,
        }            
        sendmail('', fallback_email, keywords)            

        return JsonResponse({ "user": newUser, "token" : token}, status=200, safe=False)
    return JsonResponse(request.method, safe=False)


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
    if provider == 'naver':
        token_type='Bearer'
        is_success, profiles = get_naver_profile(access_token, token_type)
        if not is_success:
            return False, profiles        

        result = { 
            'email': profiles.get('email'),
            'name': profiles.get('name'),
            'thumbnail': profiles.get('profile_image'),
            'id':  profiles.get('id'),
        }
        return result

    if provider == 'kakao':
        token_type='Bearer'
        is_success, profiles = get_kakao_profile(access_token, token_type)
        if not is_success:
            return False, profiles

        result = {
            'email': profiles.get('email'),
            'name': profiles.get('nickname'),
            'thumbnail': profiles.get('thumbnail_image_url'),
            'id':  profiles.get('id'),
        }
        return result

    if provider == 'facebook':
        token_type='Bearer'
        is_success, profiles = get_facebook_profile(access_token, token_type)
        if not is_success:
            return False, profiles

        result = {
            'email': profiles.get('email'),
            'name': profiles.get('nickname'),
            'thumbnail': profiles.get('thumbnail_image_url'),
            'id':  profiles.get('id'),
        }
        return result
 
def get_profile(access_token, token_type='Bearer', provider='naver'):
        res = requests.get(providers[provider]['profile_uri'], headers={'Authorization': '{} {}'.format(token_type, access_token)}).json()
        
        if provider == 'naver':
            if res.get('resultcode') != '00':
                return False, res.get('message')
            else:
                return True, res.get('response')  
        elif provider == 'kakao': 
            if res.get('id'):
                return True, res
            else:
                return False, res.get('message')
        elif provider == 'facebook': 
            if res.get('id'):
                return True, res
            else:
                return False, res.get('message')
          

def get_naver_profile(access_token, token_type):
    is_success, profiles = get_profile(access_token, token_type, 'naver')

    if not is_success:
        return False, profiles

    for profile in naver_scopes:
        if profile not in profiles:
            return False, '{}??? ?????????????????????. ??????????????? ??????????????????.'.format(profile)

    return True, profiles

def get_kakao_profile(access_token, token_type):
    is_success, _profiles = get_profile(access_token, token_type, 'kakao')

    if not is_success:
        return False, _profiles

    foo = _profiles.get('kakao_account')
    bar = foo.get('profile')

    profiles = {
        'email': foo.get('email'),
        'nickname': bar.get('nickname'),
        'thumbnail_image_url': bar.get('thumbnail_image_url'),
        'id':  _profiles.get('id'),
    }

    for profile in kakao_scopes:
        if profile not in profiles:
            return False, '{}??? ?????????????????????. ??????????????? ??????????????????.'.format(profile)

    return True, profiles

def get_facebook_profile(access_token, token_type):
    is_success, _profiles = get_profile(access_token, token_type, 'facebook')

    if not is_success:
        return False, _profiles

    foo = _profiles.get('facebook_account')
    bar = foo.get('profile')

    profiles = {
        'email': foo.get('email'),
        'nickname': bar.get('nickname'),
        'thumbnail_image_url': bar.get('thumbnail_image_url'),
        'id':  _profiles.get('id'),
    }

    for profile in facebook_scopes:
        if profile not in profiles:
            return False, '{}??? ?????????????????????. ??????????????? ??????????????????.'.format(profile)

    return True, profiles
   
