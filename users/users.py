from .models import Users, Email_auth, User_profiles, Auth_tokens
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
import bcrypt

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
    Check if the email is in db :
        send [signed-in] mail and create new row in [email_auth] db and return false 
        : call from Login.js
    '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_email = data["data"].get('email')

        userData = Users.objects.filter(data__email=received_email)
        signedAlready = userData.exists()

        if received_email:
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
            Email_auth.objects.create(**newVerify)

        return JsonResponse({'signedIn' : signedAlready}, status=200, safe=False)

def password(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_email = data["data"].get('email')
        received_password = data["data"].get('password')           

        users = Users.objects.filter(data__email=received_email)
        row = list(users.values())

        userData = row[0] if row else {}#dict
        password = userData.get('password')

        error = {}
        error['password'] = None if userData and bcrypt.checkpw(received_password.encode('utf-8'), password.encode('utf-8')) else '암호가 잘못되었습니다'

        if not error['password']:

            payload = {
                'id': str(userData['id']),
                'iat': now,
                'exp': now + datetime.timedelta(days=expiresIn)
            }

            access_token = jwt.encode(payload, secret_key, algorithm=algorithm).decode('utf-8')

            # save updated_at to db
            userData['updated_at'] = now
            users.update(**userData)  

            del userData['password'] # deleted for security

            response = { "user" : userData, "access_token" : access_token }
            res = JsonResponse(response, status=200, safe=False)
            res.set_cookie('access_token', access_token)

            return res

        return JsonResponse({"error": error}, status=202, safe=False)

def reset_email(request):
    ''' 
        send [change-password] mail and create new row and return true
        : called from ResetPassword.js
    '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_email = data["data"].get('email')

        userData = Users.objects.filter(data__email=received_email)
        signedUser = userData.exists()

        shortid = shortuuid.ShortUUID().random(length=8)

        if signedUser:
            # extracted nested displayName from users db
            row = userData.values()
            row = list(row)
            data = row[0] if row else {}
            displayName = data["data"].get('displayName')

            keywords = {
                'type': 'change-password',
                'text': '비밀번호 재설정',
                'displayName' : displayName,
            }            
            sendmail(shortid, received_email, keywords)
        else:
            # not exist user in db
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
        Email_auth.objects.create(**newVerify)

        return JsonResponse({'signedIn' : signedUser}, status=200, safe=False)

def change_password(request):
    ''' 
        check if the password to be changed is valid
            1. matches the old password
            2. the code has expired
    '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_email = data.get('email')
        received_code = data.get('code')
        received_password = data.get('password').encode('utf-8')

        userData = Users.objects.filter(data__email=received_email)
        row = userData.values()
        row = list(row)

        userData = row[0] if row else {}
        password = userData.get('password').encode('utf-8')

        isCodeValidate = email_code_verify(received_code, received_email)

        error = {}
        error['password'] ='passwordUsedBefore' if userData and bcrypt.checkpw(received_password, password) else None

        error['code'] = None if isCodeValidate == 'OK' else isCodeValidate

        if not error['password'] and not error['code']:

            # update password in db
            userData['password'] = received_password
            userData['updated_at'] = now
            userData.update(**userData)

            # expired emailAuth code
            email_code_now_expired(received_code)

            del userData['password'] # deleted for security

            payload = {
                'id': str(userData['id']),
                'iat': now,
                'exp': now + datetime.timedelta(days=expiresIn)
            }

            access_token = jwt.encode(payload, secret_key, algorithm=algorithm).decode('utf-8')

            response = { "user" : userData, "access_token" : access_token }
            res = JsonResponse(response, status=200, safe=False)
            res.set_cookie('access_token', access_token)

            return res

        return JsonResponse({"error": error}, status=202, safe=False)                        

def sendmail(shortid, received_email, keywords):
    # aws ses : ep026
    subject = 'TechVisor ' + keywords['text']
    html_message = render_to_string('mailTemplate-' + keywords['type'] + '.html', {'code': shortid, 'keywords': keywords, 'received_email': received_email, 'url': 'http://techvisor.co.kr'})
    plain_message = strip_tags(html_message)
    from_email = settings.DEFAULT_FROM_EMAIL 
    to = received_email
    send_mail(subject, plain_message, from_email, [to], fail_silently=False, html_message=html_message)

def register(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_displayName = data.get('displayName')
        received_email = data.get('email')
        received_code = data.get('code')

        
        password = data.get('password').encode('utf-8')           
        received_password = bcrypt.hashpw(password, bcrypt.gensalt())
        received_password = received_password.decode('utf-8')         

        isEmailExists = Users.objects.filter(data__email=received_email).count()

        isCodeValidate = email_code_verify(received_code, received_email)

        errMsg = {
            'INVAILED_CODE': '존재하지 않은 토큰입니다.',
            'EXPIRED_CODE': '인증토큰이 만료되었습니다.',
            'USED_CODE': '이미 처리되었거나 비활성화된 인증토큰입니다.',
            'ERROR': '잘못된 요청입니다.',
            'OK': ''
        }  

        error = {}
        error['email'] = '이 이메일은 이미 사용중입니다' if isEmailExists else None
        error['displayName'] = '이름을 입력하세요' if not received_displayName else None
        error['code'] = errMsg[isCodeValidate]
        error['password'] = None

        if not error['displayName'] and not error['password'] and not error['email'] and error['code'] == '':
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
                    'shortcuts': [],
                    'starred': [],
                    'interests' : [],  # 여기에서 미리 빈 배열을 만들어 놔야 할 것 같음
                    'labels' : []
                },
                'is_certified': True
            }

            Users.objects.create(**newUser)
            del newUser['password']

            email_code_now_expired(received_code)

            payload = {
                'id': newUid,
                'iat': now,
                'exp': now + datetime.timedelta(days=expiresIn)
            }
            access_token = jwt.encode(payload, secret_key , algorithm=algorithm)

            # send welcome email
            # keywords = {
            #     'type': 'welcome',
            #     'text': '가입을 환영합니다.',
            #     'displayName' : received_displayName,
            # }            
            # sendmail('', received_email, keywords)            

            return JsonResponse({ "user": newUser, "access_token" : access_token.decode('utf-8')}, status=200, safe=False)
        return JsonResponse({'error': error}, status=200, safe=False)
    
def email_code_verify(code, email):
    '''email code validate check'''
    try:
        # code not exist?
        emailAuth = Email_auth.objects.filter(code=code)
        if not emailAuth.exists():
            return 'INVAILED_CODE'

        row = list(emailAuth.values())
        emailAuthData = row[0]
        # used?
        if emailAuthData['logged']:
            return 'USED_CODE'

        # expried? 
        timestamp = emailAuthData['created_at'].timestamp()
        # valid_period_secs = verifyExpiresIn.total_seconds()
        # if time.time() - timestamp > valid_period_secs:
        if time.time() - timestamp > verifyExpiresInSecs:
            return 'EXPIRED_CODE'
        # # new user?
        # row = Users.objects.filter(data__email=emailAuthData['email'])
        # if not row.exists():
        #     newData = {
        #         'is_certified' : True
        #     }
        #     row.update(**newData) 
        return 'OK'
    except:
        return 'ERROR'

def verify_email_code(request):
    '''email code validate check'''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        code = data['data'].get('code')
        try:
            # code not exist?
            emailAuth = Email_auth.objects.filter(code=code)
            if not emailAuth.exists():
                return HttpResponse('INVAILED_CODE', status=404)

            row = list(emailAuth.values())
            emailAuthData = row[0]
            # used?
            if emailAuthData['logged']:
                return HttpResponse('USED_CODE', status=409)

            # expried? 
            timestamp = emailAuthData['created_at'].timestamp()
            if time.time() - timestamp > verifyExpiresInSecs:
                return HttpResponse('EXPIRED_CODE', status=409)

            # # new user?
            # row = Users.objects.filter(data__email=emailAuthData['email'])
            # if not row.exists():
            #     newData = {
            #         'is_certified' : True
            #     }
            #     row.update(**newData) 
            return HttpResponse('OK', status=204)
        except:
            return HttpResponse()

def email_code_now_expired(code):
    ''' update that the email code was used once in the DB '''
    try:
        emailAuth = Email_auth.objects.filter(code=code)
        row = list(emailAuth.values())
        emailAuthData = row[0]
        emailAuthData['logged'] = True
        emailAuthData['updated_at'] = now
        emailAuth.update(**emailAuthData)
        return True
    except:
        return False      

def access_token(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        access_token = data["data"].get('access_token')
        try:
            payload = jwt.decode(access_token, secret_key, algorithms=[algorithm])
            # jwt.decode('JWT_STRING', 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return JsonResponse({ "error" :"Token Expired"}, status=401, safe=False)
        except jwt.exceptions.InvalidTokenError:
            return JsonResponse({ "error" "Invalid Token Error"}, status=401, safe=False)

        received_id = payload.get("id")
        # decoded = json.loads(json.dumps(jwt.decode(token, JWT_SECRET, JWT_ALGORITHM)))
        try:
            # Loading user data
            row = Users.objects.filter(id=received_id).values()
            row = list(row)
            userData = row[0] if row else {}


            # update user token
            payload = {
                'id': str(userData['id']),
                'iat': now,
                'exp': now + datetime.timedelta(days=expiresIn)
            }
            updated_access_token = jwt.encode(payload, secret_key, algorithm=algorithm)

            del userData['password'] # deleted for security

            return JsonResponse({ "user" : userData, "access_token" : updated_access_token.decode('utf-8')}, status=200, safe=False)            
        except:
            return JsonResponse({ "error" :"Invalid access token detected"}, status=500, safe=False)        

# def verify_token(request, code):
#     # 404 : 코드없음
#     # 403 : 코드사용
#     # 410 : 코드만료
#     # 200 : 사용자 없음 -> send email, register_token
#     # 201 : 사용자 있음 인증메일 -> Email_auth ㅣlogged 갱신 -> user, profile, token
#     try:
#         # code not exist?
#         # 4XX : check code
#         emailAuth = Email_auth.objects.filter(code=code)
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
#         row = Users.objects.filter(data__email=emailAuthData['email'])
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
#         userProfiles = User_profiles.objects.filter(fk_user_id=userData['id'])
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
  
def update_user_data(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_id = data["user"].get('id')

        newData = {
            'data' : data["user"]["data"]
        }
        Users.objects.filter(id=received_id).update(**newData)
        return JsonResponse({ "user": data}, status=200, safe=False)
       
