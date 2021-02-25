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

from .models import Users, Email_auth
# from .serializers import UsersSerializer, EmailAuthSerializer

from .utils import find_user, getNamebyEmail, check_user_exists, sendmail

secret_key = settings.SECRET_KEY
algorithm = settings.JWT_AUTH['JWT_ALGORITHM']
expiresIn = settings.JWT_AUTH['JWT_EXPIRATION_DELTA']
verifyExpiresIn = settings.JWT_AUTH['JWT_EMAIL_CODE_EXPIRATION_DELTA']
verifyExpiresInSecs = settings.JWT_AUTH['JWT_EMAIL_CODE_EXPIRATION_SECS']

now = datetime.datetime.utcnow()

errMsg = {
    'INVAILED_CODE': '존재하지 않은 인증코드입니다.',
    'EXPIRED_CODE': '인증코드가 만료되었습니다.',
    'USED_CODE': '이미 처리되었거나 비활성화된 인증코드입니다.',
    'ERROR': '잘못된 요청입니다.',
    '': ''
} 

def email(request):
    ''' 
    Check if the email is in db :
        send [signed-in] mail and create new row in [Email_auth] db and return false 
        : call from Login.js
    '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        email = data["data"].get('email')

        result = {}

        user = find_user('data__email', email)

        # notify if you have signed up with sns 
        if not user:
            result = { 'signedIn' : False }
        else:
            if not user.password and user.my_from in ['google','naver','kakao']:
                result = { 'signedIn' : True, 'isSocial' : True, 'error' : { 'email' : user.my_from + ' 계정으로 가입된 이메일입니다.' }}
                return JsonResponse(result, status=202, safe=False)
            else:                
                result = { 'signedIn' : True }

        if email:
            shortid = shortuuid.ShortUUID().random(length=8)
            if not user:
                # sendmail
                keywords = {
                    'type': 'invite',
                    'text': '회원가입'
                }
                sendmail(shortid, email, keywords)

            # create row in email_auth for certify
            newVerify = {
                'id': str(uuid.uuid4()),
                'code': shortid,
                'email': email,
            }
            Email_auth.objects.create(**newVerify)

        return JsonResponse(result, status=200, safe=False)

def password(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        email = data["data"].get('email')
        password = data["data"].get('password')

        users = Users.objects.filter(data__email=email)
        row = list(users.values())

        userData = row[0] if row else {}#dict
        original_password = userData.get('password')

        if users:
            error = {}
            error['password'] = None if bcrypt.checkpw(password.encode('utf-8'), original_password.encode('utf-8')) else '암호가 잘못되었습니다.'

        if any(value != None for value in error.values()):
            return JsonResponse({"error": error}, status=202, safe=False)


        payload = {
            'id': str(userData['id']),
            'iat': now,
            'exp': now + datetime.timedelta(days=expiresIn)
        }

        access_token = jwt.encode(payload, secret_key, algorithm=algorithm).decode('utf-8')

        # save updated_at to db
        userData['updated_at'] = now
        users.update(**userData)  

        userData['emptyPassword'] = False if userData['password'] else True

        del userData['password'] # deleted for security

        response = { "user" : userData, "access_token" : access_token }
        res = JsonResponse(response, status=200, safe=False)
        res.set_cookie('access_token', access_token)

        return res

def reset_email(request):
    ''' 
        if wantChangeEmail:
            send [change-email] mail and create new row in [Email_auth] and return true
            : called from profilePage.js        
        else:
            send [change-password] mail and create new row in [Email_auth] and return true
            : called from ResetPassword.js
    '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        email = data.get('email')
        want_change_email = data.get('wantChangeEmail')

        shortid = shortuuid.ShortUUID().random(length=8)
        displayName = getNamebyEmail(email)

        if displayName:
            if want_change_email:
                keywords = {
                    'type': 'change-email',
                    'text': '이메일 변경',
                    'displayName' : displayName,
                }
            else:                
                keywords = {
                    'type': 'change-password',
                    'text': '비밀번호 재설정',
                    'displayName' : displayName,
                }

            sendmail(shortid, email, keywords)
        else:
            # not exist user in db
            keywords = {
                'type': 'invite',
                'text': '회원가입'
            }
            sendmail(shortid, email, keywords)            

        # save database with orm
        newVerify = {
            'id': str(uuid.uuid4()),
            'code': shortid,
            'email': email,
        }
        Email_auth.objects.create(**newVerify)

        return JsonResponse({'signedIn' : True if displayName else False}, status=200, safe=False)

def change_email(request):
    ''' change email from profile page'''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        email = data.get('email')
        code = data.get('code')
        display_name = data.get('displayName')
        final = data.get('final')


        emailExists = check_user_exists('email',email)
        errCode = isCodeValidate(code, email)

        if emailExists or errCode:
            error = {}
            error['email'] = '이 이메일은 이미 사용중입니다' if emailExists else None
            error['code'] = errMsg[errCode]

            if any((value != None or value != '')  for value in error.values()):
                return JsonResponse({'error': error}, status=202, safe=False)

        shortid = shortuuid.ShortUUID().random(length=8)
        
        keywords = {
            'type': 'change-email',
            'text': '이메일 변경',
            'displayName' : display_name,
        }
        sendmail(shortid, email, keywords)

        # save database with orm
        newVerify = {
            'id': str(uuid.uuid4()),
            'code': shortid,
            'email': email,
        }
        Email_auth.objects.create(**newVerify)

        email_code_now_expired(code)

        if final:
            # send change notice email to both email addresses
            previous_email = data.get('previousEmail')

            keywords = {
                'type': 'notice-change-email-to-previous',
                'text': '로그인 이메일이 변경됐습니다.',
                'displayName' : display_name,
                'email' : email,
            }           
            sendmail('', previous_email, keywords)                

            keywords = {
                'type': 'notice-change-email-to-new',
                'text': '계정 설정을 편집했습니다.',
                'displayName' : display_name,
                'previous_email' : previous_email,
            }           
            sendmail('', email, keywords)                
        
        return JsonResponse({'success': True, 'final' : final }, status=200, safe=False)          

def change_password(request):
    ''' 
        check if the password to be changed is valid
            1. matches the old password
            2. the code has expired
        if no_code_check_required:
            change password from profilePage
        else
            ... from login     
    '''

    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        email = data.get('email')
        password = data.get('password').encode('utf-8')
        no_code_check_required = data.get('noCodeCheckRequired')
        no_password_check_required = data.get('noPasswordCheckRequired', False)

        if no_code_check_required:
            password_old = data.get('password-old').encode('utf-8') if not no_password_check_required else None
            res = isPasswordValidate(password, password_old, None, email)
        else:
            code = data.get('code')
            res = isPasswordValidate(password, None, code, email)

        if 'user' in res:
            result = JsonResponse(res, status=200, safe=False)
            result.set_cookie('access_token', res['access_token'])
            return result
        else:
            return JsonResponse({'error' : res}, status=202, safe=False)    

def delete_account(request):
    ''' delete account from profile page '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        email = data.get('email')
        display_name = data.get('displayName')
        
        try:
            Users.objects.filter(data__email=email).delete()
            
            keywords = {
                'type': 'delete-account',
                'text': '계정 삭제',
                'displayName' : display_name,
            }
            sendmail('', email, keywords)
        
            return JsonResponse({'success': True }, status=200, safe=False) 
        except:
            return JsonResponse({'error': '계정 삭제를 할 수 없습니다.' }, status=202, safe=False) 

       

def register(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        email = data.get('email')
        code = data.get('code')
        displayName = data.get('displayName')

        foo = data.get('password').encode('utf-8')           
        foo = bcrypt.hashpw(foo, bcrypt.gensalt())
        password = foo.decode('utf-8')         
        emailExists = check_user_exists('email',email)
        errCode = isCodeValidate(code, email)

        if emailExists or errCode:
            error = {}
            error['email'] = '이 이메일은 이미 사용중입니다' if emailExists else None 
            error['code'] = errMsg[errCode]
            error['displayName'] = '이름을 입력하세요' if not displayName else None
            if any((value != None or value != '') for value in error.values()):
                return JsonResponse({'error': error}, status=404, safe=False) 

        # new register                
        newUid = str(uuid.uuid4())
        newUser = {
            'id': newUid,
            'my_from': 'local',
            'password': password,
            'role': 'user',
            'data': {
                'displayName': displayName,
                'photoURL': 'assets/images/avatars/profile.jpg',
                'email': email,
                'settings': {},
                'shortcuts': [],
                'starred': [],
                'trashed' : {},
                'labels' : {},
                'filters' : {},
                'first_pay' : True
            },
            'is_certified': True
        }

        Users.objects.create(**newUser)
        del newUser['password']

        email_code_now_expired(code)

        payload = {
            'id': newUid,
            'iat': now,
            'exp': now + datetime.timedelta(days=expiresIn)
        }
        access_token = jwt.encode(payload, secret_key , algorithm=algorithm).decode('utf-8')

        # send welcome email
        keywords = {
            'type': 'welcome',
            'text': '가입을 환영합니다.',
            'displayName' : displayName,
        }            
        sendmail('', email, keywords)            

        return JsonResponse({ "user": newUser, "access_token" : access_token}, status=200, safe=False)
    
def verify_email_code(request):
    '''return isCodeValidate HttpResponse'''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        code = data['data'].get('code')

        http_status_codes = { 'INVAILED_CODE' : 404, 'USED_CODE' : 409, 'EXPIRED_CODE': 409, 'ERROR': 500, 'OK': 204}
        result = isCodeValidate(code, email)
        return HttpResponse(result, status=http_status_codes[result])


def email_code_now_expired(code):
    ''' update that the email code was used once in the DB '''
    try:
        ea_instance = Email_auth.objects.filter(code=code)
        row = list(ea_instance.values())
        ea_data = row[0]
        ea_data['logged'] = True
        ea_data['updated_at'] = now
        ea_instance.update(**ea_data)
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
            updated_access_token = jwt.encode(payload, secret_key, algorithm=algorithm).decode('utf-8')

            userData['emptyPassword'] = False if userData['password'] else True

            del userData['password'] # deleted for security

            return JsonResponse({ "user" : userData, "access_token" : updated_access_token}, status=200, safe=False)            
        except:
            return JsonResponse({ "error" :"Invalid access token detected"}, status=500, safe=False)        

def isCodeValidate(code, email):
    '''email code validate check in [Email_auth]'''
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
        return ''
    except:
        return 'ERROR'

def isPasswordValidate(password, password_old, code, email):
    ''' password exist check in [Users] and return status code'''
    # try:
    user_instance = Users.objects.filter(data__email=email)
    row = list(user_instance.values())
    userData = row[0]
    user_password = userData['password'].encode('utf-8')

    if userData and userData['password']: # db password is empty then pass check
        error = {}
        error['password'] ='이전 비밀번호와 동일합니다.' if bcrypt.checkpw(password, user_password) else None        
        error['password-old'] = '이전 비밀번호가 잘못입력되었습니다.' if password_old and not bcrypt.checkpw(password_old, user_password) else None
        if code:
            error['code'] = isCodeValidate(code, email)

        if any(value != None and value != '' for value in error.values()):
            return error     

    foo = bcrypt.hashpw(password, bcrypt.gensalt())
    hashed_password = foo.decode('utf-8')   

    # update password in db
    userData['password'] = hashed_password
    userData['updated_at'] = now
    user_instance.update(**userData)

    if code:
        # expired emailAuth code
        email_code_now_expired(code)

    userData['emptyPassword'] = False if userData['password'] else True        

    del userData['password'] # deleted for security

    payload = {
        'id': str(userData['id']),
        'iat': now,
        'exp': now + datetime.timedelta(days=expiresIn)
    }

    access_token = jwt.encode(payload, secret_key, algorithm=algorithm).decode('utf-8')

    result = { "user" : userData, "access_token" : access_token }

    return result

    # except:
        # return 'ERROR'   

def update_user_data(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_id = data["user"].get('id')

        newData = {
            'data' : data["user"]["data"]
        }
        Users.objects.filter(id  = received_id).update(**newData)
        return JsonResponse({ "user": data}, status = 200, safe = False)
