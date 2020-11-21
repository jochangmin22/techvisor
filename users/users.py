from .models import users, email_auth, user_profiles, auth_tokens
# from .serializers import UsersSerializer, EmailAuthSerializer
from django.http import JsonResponse, HttpResponse
from django.db import connection
from django.conf import settings
import json
import jwt
# from django.utils import timezone
import datetime
import time
import uuid
import shortuuid

# import datetime
from psycopg2.extensions import AsIs
from django.core.mail import send_mail
# from django.core.mail import EmailMultiAlternatives
# from django.template import Context
from django.template.loader import render_to_string
from django.utils.html import strip_tags
# from django.core import mail

# from django.conf import settings
# from django.template import loader
# from rest_framework.response import Response
# from django.utils.translation import ugettext_lazy as _
# from rest_framework import status

secret_key = settings.SECRET_KEY
expiresIn = settings.JWT_AUTH['JWT_EXPIRATION_DELTA']
algorithm = settings.JWT_AUTH['JWT_ALGORITHM']
verifyExpiresIn = settings.JWT_AUTH['JWT_EMAIL_CODE_EXPIRATION_DELTA']
verifyExpiresInSecs = settings.JWT_AUTH['JWT_EMAIL_CODE_EXPIRATION_SECS']

now = datetime.datetime.utcnow()
# now = timezone.now()

def email(request):
    ''' 
    1. Check if the email is in db or not and return boolean
    2. add new row in [email_auth] db
    '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_email = data["data"].get('email')

        signedAlready = users.objects.filter(data__email=received_email).exists()

        shortid = shortuuid.ShortUUID().random(length=8)

        if not signedAlready:
            # sendmail
            keywords = {
                'type': 'invite',
                'text': '회원가입'
            }
            sendmail(shortid, received_email, keywords)

        # save database with orm
        newVerify = {
            'id': str(uuid.uuid4()),
            'code': shortid,
            'email': received_email,
        }
        email_auth.objects.create(**newVerify)

        return JsonResponse({'signedIn' : signedAlready}, status=200, safe=False)

def password(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_email = data["data"].get('email')
        received_password = data["data"].get('password')


        row = users.objects.filter(data__email=received_email).values()
        row = list(row)

        userData = row[0] if row else {}#dict
        password = userData.get('password')

        error = {}
        error['password'] = None if userData and received_password == password else '암호가 잘못되었습니다'

        if not error['password']:
            del userData['password'] # deleted for security

            payload = {
                'id': str(userData['id']),
                'iat': now,
                'exp': now + datetime.timedelta(days=expiresIn)
            }

            access_token = jwt.encode(payload, secret_key, algorithm=algorithm)

            response = { "user" : userData, "access_token" : access_token.decode('utf-8') }

            return JsonResponse(response, status=200, safe=False)

        return JsonResponse({"error": error}, status=202, safe=False)


def sendmail(shortid, received_email, keywords):
    # aws ses : ep026
    subject = 'techvisor ' + keywords['text']
    html_message = render_to_string('mailTemplate.html', {'code': shortid, 'keywords': keywords, 'received_email': received_email, 'url': 'http://btowin.synology.me:4000'})
    plain_message = strip_tags(html_message)
    from_email = settings.DEFAULT_FROM_EMAIL 
    to = received_email
    send_mail(subject, plain_message, from_email, [to], fail_silently=False, html_message=html_message)

def register(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_displayName = data.get('displayName')
        received_password = data.get('password')
        received_email = data.get('email')
        received_code = data.get('code')

        isEmailExists = users.objects.filter(data__email=received_email).count()

        isCodeValidate = email_code_verify(received_code, received_email)

        error = {}
        error['email'] = '이 이메일은 이미 사용중입니다' if isEmailExists else None
        error['displayName'] = '이름을 입력하세요' if not received_displayName else None
        error['code'] = '잘못된 인증메일 입니다' if not isCodeValidate else None
        error['password'] = None

        if not error['displayName'] and not error['password'] and not error['email'] and not error['code']:
            newUid = str(uuid.uuid4())
            newUser = {
                'id': newUid,
                'my_from': 'custom-db',
                'password': received_password,
                'role': 'user',
                'data': {
                    'displayName': received_displayName,
                    'photoURL': 'assets/images/avatars/profile.jpg',
                    'email': received_email,
                    'settings': {},
                    'shortcuts': []
                },
                'is_certified': True
            }

            users.objects.create(**newUser)
            del newUser['password']

            email_code_now_expired(received_code)

            payload = {
                'id': newUid,
                'iat': now,
                'exp': now + datetime.timedelta(days=expiresIn)
            }
            access_token = jwt.encode(payload, secret_key , algorithm=algorithm)
        
            return JsonResponse({ "user": newUser, "access_token" : access_token.decode('utf-8')}, status=200, safe=False)
        return JsonResponse({'error': error}, status=200, safe=False)

def email_code_verify(code, email):
    '''email code validate check'''
    try:
        # code not exist?
        emailAuth = email_auth.objects.filter(code=code)
        if not emailAuth.exists():
            return False

        row = list(emailAuth.values())
        emailAuthData = row[0]
        # used?
        if emailAuthData['logged']:
            return False

        # expried? 
        timestamp = emailAuthData['created_at'].timestamp()
        # valid_period_secs = verifyExpiresIn.total_seconds()
        # if time.time() - timestamp > valid_period_secs:
        if time.time() - timestamp > verifyExpiresInSecs:
            return False
        # # new user?
        # row = users.objects.filter(data__email=emailAuthData['email'])
        # if not row.exists():
        #     newData = {
        #         'is_certified' : True
        #     }
        #     row.update(**newData) 
        return True
    except:
        return False

def email_code_now_expired(code):
    ''' update that the email code was used once in the DB '''
    try:
        emailAuth = email_auth.objects.filter(code=code)
        row = list(emailAuth.values())
        emailAuthData = row[0]
        emailAuthData['logged'] = True
        emailAuthData['updated_at'] = now
        emailAuth.update(**emailAuthData)
        return True
    except:
        return False      

# def auth_verify(request, code):
#     # 404 : 코드없음
#     # 403 : 코드사용
#     # 410 : 코드만료
#     # 200 : 사용자 없음 -> send email, register_token
#     # 201 : 사용자 있음 인증메일 -> email_auth ㅣlogged 갱신 -> user, profile, token
#     try:
#         # code not exist?
#         # 4XX : check code
#         emailAuth = email_auth.objects.filter(code=code)
#         if not emailAuth.exists():
#             return HttpResponse('Not Found', status=404)

#         row = list(emailAuth.values())
#         emailAuthData = row[0]
#         # used?
#         if emailAuthData['logged']:
#             # return JsonResponse({'name': 'TOKEN_ALREADY_USED'}, status=403, safe=False)
#             return HttpResponse('TOKEN_ALREADY_USED', status=403)

#         # expried? 
#         timestamp = emailAuthData['created_at'].timestamp()
#         valid_period_secs = verifyExpiresIn.total_seconds()
#         if time.time() - timestamp > valid_period_secs:
#             # return HttpResponseGone('EXPIRED_CODE') # 410
#             return HttpResponse('EXPIRED_CODE', status=410)

#         # new user?
#         # 2XX : check user with code
#         row = users.objects.filter(data__email=emailAuthData['email'])
#         if not row.exists():
#             # generate register token
#             payload = {'id': str(emailAuthData['id']),
#                 'email': emailAuthData['email'],
#                 'sub': 'email-register',
#                 'iat': now.timestamp(),
#                 'exp': now + verifyExpiresIn
#             }
#             register_token = jwt.encode(payload, secret_key , algorithm=algorithm)
#             register_token = register_token.decode('utf-8')
#             # https://stackoverflow.com/questions/40059654/python-convert-a-bytes-array-into-json-format
#             response = {'email': emailAuthData['email'], 'register_token' : register_token} # .decode('utf8').replace("'", '"')}
#             return JsonResponse(response, status=200, safe=False)

#         # user exists
#         row = list(row.values())
#         userData = row[0]

#         # no userProfiles
#         userProfiles = user_profiles.objects.filter(fk_user_id=userData['id'])
#         if not userProfiles.exists():
#             return HttpResponse('no profile', content_type="text/plain; charset=utf-8")
            
#         row = list(userProfiles.values())
#         profileData = row[0]

#         tokens  = generate_user_token(userData['id'])
#         emailAuthData['logged'] = True
#         emailAuthData['updated_at'] = now
#         emailAuth.update(**emailAuthData)

#         response = { 'user': userData, 'profile': profileData, 'token': tokens}
#         return JsonResponse(response,status=201, safe=False)
       
#     except:
#         return HttpResponse() # 500
#         # return JsonResponse({},status='500', safe=False)



def access_token(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        access_token = data["data"].get('access_token')
        try:
            payload = jwt.decode(access_token, secret_key, algorithms=[algorithm])
            # jwt.decode('JWT_STRING', 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return JsonResponse({ "error" :"Token Expired"}, status=401, safe=False)
            # Signature has expired
        received_id = payload.get("id")
        try:
            # Loading user data
            row = users.objects.filter(id=received_id).values()
            row = list(row)
            userData = row[0] if row else {}
            del userData['password'] # deleted for security

            # update user token
            payload = {
                'id': str(userData['id']),
                'iat': now,
                'exp': now + datetime.timedelta(days=expiresIn)
            }
            updated_access_token = jwt.encode(payload, secret_key, algorithm=algorithm)

            return JsonResponse({ "user" : userData, "access_token" : updated_access_token.decode('utf-8')}, status=200, safe=False)            
        except:
            return JsonResponse({ "error" :"Invalid access token detected"}, status=500, safe=False)        

      
def update_user_data(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_id = data["user"].get('id')

        newData = {
            'data' : data["user"]["data"]
        }
        users.objects.filter(id=received_id).update(**newData)
        return JsonResponse({ "user": data}, status=200, safe=False)

def generate_user_token(id):
    # save db
    newData = {
        'fk_user_id' : id
    }
    authTokens = auth_tokens.objects.create(**newData)
    # authTokens=auth_tokens.objects.filter(fk_user_id=id)
    # authTokens.update(**newData)
    # row = list(authTokens.values())
    # authTokensData = row[0] if row else {}

    # newUid = str(uuid.uuid4())
    # newToken = {
    #     'id': newUid,
    #     'fk_user_id': id,
    # }
    # return JsonResponse(newToken,safe=False)
    # auth_tokens.objects.create(**newToken)

    payload = {
        'user_id': str(id),
        'token_id': str(authTokens.id),
        'sub': 'refresh_token',
        'iat': now,
        'exp': now + datetime.timedelta(days=expiresIn)
    }
    refreshToken = jwt.encode(payload, secret_key , algorithm=algorithm)

    payload = {
        'user_id': str(id),
        'sub': 'access_token',
        'iat': now,
        'exp': now + datetime.timedelta(days=verifyExpiresIn)        
    }    
    accessToken = jwt.encode(payload, secret_key , algorithm=algorithm)
    # return JsonResponse({ refreshToken, accessToken},safe=False)
    return { 'accessToken' : accessToken.decode('UTF-8'), 'refreshToken' : refreshToken.decode('UTF-8') }
    # return refreshToken

# def refresh_user_token(tokenId: string, refreshTokenExp: number, originalRefreshToken: string):
#     return { refreshToken, accessToken}

# def dictfetchall(cursor):
#     "Return all rows from a cursor as a dict"
#     columns = [col[0] for col in cursor.description]
#     return [dict(zip(columns, row)) for row in cursor.fetchall()]
  
