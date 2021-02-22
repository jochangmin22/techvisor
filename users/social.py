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
import requests

from .models import Users, Social_accounts
# from .serializers import UsersSerializer, EmailAuthSerializer

from .utils import handleRedis, social_login_infos_exist, generate_token

secret_key = settings.SECRET_KEY
algorithm = settings.JWT_AUTH['JWT_ALGORITHM']
expiresIn = settings.JWT_AUTH['JWT_EXPIRATION_DELTA']

now = datetime.datetime.utcnow()

providers = settings.SOCIAL_LOGIN['provider']

google_scopes = ['https://www.googleapis.com/auth/userinfo.email','openid','https://www.googleapis.com/auth/userinfo.profile']
naver_scopes = ['id', 'email', 'name', 'profile_image', 'nickname']


def check_user_exists(key,value):
    return True if Users.objects.filter(**{'data__{}'.format(key): value}).exists() else False

def check_user_by_social_id(social_id):
    return True if Social_accounts.objects.filter(social_id=social_id).exists() else False

def find_user(key, value):
    ''' return user rows '''
    try:
        return Users.objects.get(**{'{}'.format(key): value})        
    except:
        return None

def find_user_by_social_id(social_id):
    ''' return user rows by Social id '''
    try:
        sa = Social_accounts.objects.get(social_id=social_id)
        return find_user('id', sa.user_id)
    except:
        return None    

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

            foo = data['model']['password'].encode('utf-8')           
            foo = bcrypt.hashpw(foo, bcrypt.gensalt())
            password = foo.decode('utf-8')
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

        # TODO: username 추가하고 displayName은 중복체크
        emailExists = check_user_exists('email',fallback_email)
        # nameExists = check_user_exists('displayName',displayName)

        if emailExists: # or nameExists:
            error = {}
            error['email'] = '이 이메일은 이미 사용중입니다' if emailExists else None
            # error['code'] = errMsg[isCodeValidate(received_code, email)]
            # error['displayName'] = '이 이름은 이미 사용중입니다' if nameExists else None

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
            'password': password,
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
            'text': '가입을 환영합니다.',
            'displayName' : displayName,
        }            
        sendmail('', fallback_email, keywords)            

        return JsonResponse({ "user": newUser, "token" : token}, status=200, safe=False)

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
 
def sendmail(shortid, email, keywords):
    subject = 'TechVisor ' + keywords['text']
    html_message = render_to_string('mailTemplate-' + keywords['type'] + '.html', {'code': shortid, 'keywords': keywords, 'email': email, 'url': 'http://techvisor.co.kr'})
    plain_message = strip_tags(html_message)
    from_email = settings.DEFAULT_FROM_EMAIL 
    to = email
    send_mail(subject, plain_message, from_email, [to], fail_silently=False, html_message=html_message)   

def get_profile(access_token, token_type='Bearer'):
        res = requests.get(providers['naver']['profile_uri'], headers={'Authorization': '{} {}'.format(token_type, access_token)}).json()

        if res.get('resultcode') != '00':
            return False, res.get('message')
        else:
            return True, res.get('response')  

def get_naver_profile(access_token, token_type):
    is_success, profiles = get_profile(access_token, token_type)

    if not is_success:
        return False, profiles

    for profile in naver_scopes:
        if profile not in profiles:
            return False, '{}은 필수정보입니다. 정보제공에 동의해주세요.'.format(profile)

    return True, profiles

# def login_with_naver(self, state, code):
    
#     is_success, token_infos = get_access_token(state, code)

#     if not is_success:
#         return False, '{} [{}]'.format(token_infos.get('error_desc'), token_infos.get('error'))

#     access_token = token_infos.get('access_token')
#     refresh_token = token_infos.get('refresh_token')
#     expires_in = token_infos.get('expires_in')
#     token_type = token_infos.get('token_type')

#     # 네이버 프로필 얻기
#     is_success, profiles = self.get_naver_profile(access_token, token_type)
#     if not is_success:
#         return False, profiles

#     # 사용자 생성 또는 업데이트
#     user, created = self.model.objects.get_or_create(email=profiles.get('email'))
#     if created: # 사용자 생성할 경우
#         user.set_password(None)
#     user.name = profiles.get('name')
#     user.is_active = True
#     user.save()

#     # 로그인
#     login(self.request, user, 'user.oauth.backends.NaverBackend')  # NaverBackend 를 통한 인증 시도

#     # 세션데이터 추가
#     self.set_session(access_token=access_token, refresh_token=refresh_token, expires_in=expires_in, token_type=token_type)

#     return True, user          