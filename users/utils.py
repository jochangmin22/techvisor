import jwt
import datetime
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from django.http import HttpResponse, JsonResponse

from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.template.loader import render_to_string

# caching with redis
from django.core.cache import cache

from .models import Users, Social_accounts

now = datetime.datetime.utcnow()
secret_key = settings.SECRET_KEY
algorithm = settings.JWT_AUTH['JWT_ALGORITHM']
expiresIn = settings.JWT_AUTH['JWT_EXPIRATION_DELTA']

def readRedis(redisKey, keys):
    context = cache.get(redisKey)
    if context and keys in context:
        return context[keys]
    else:
        return None

def writeRedis(redisKey, keys, data=""):
    return cache.set(redisKey, { keys : data }, 300)

# def handleRedis(redisKey, keys, result="", mode="r"):
#     """ read or write to redis """
#     context = cache.get(redisKey) 
#     if mode == 'r':
#         if context and context[keys]:
#             return context[keys]
#             # return JsonResponse(context[keys], safe=False)
#         else:            
#             return None          
#     if mode == 'w':
#         if context is None:
#             context = {}
#         context[keys] = result
#         cache.set(redisKey, context, 300)
#         return JsonResponse(result, safe=False)        
#     return
    
def social_login_infos_exist(client_json):    
    ''' does provider client_json information exist? '''
    if not client_json:
        content = { "please check ENVVAR" : "Google ENVVAR is missing"}
        return Response(content, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return      

def generate_token(foo=None):
    ''' generate token '''
    payload = {
        'iat': now,
        'exp': now + datetime.timedelta(days=expiresIn)
    }
    if foo:
        payload.update(foo)

    return jwt.encode(payload, secret_key, algorithm=algorithm).decode('utf-8')

def get_payload_from_token(token, name)    :
    ''' get payload from jwt token '''
    payload = jwt.decode(token, secret_key, algorithms=[algorithm])
    result = payload.get(name, None)
    return result

def check_user_exists(key,value):
    ''' user exists check by email or displayName... '''
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

def getNamebyEmail(email):
    try:
        users = Users.objects.get(data__email=email)
        return users.data['displayName']
    except:
        return None

def sendmail(shortid, email, keywords):
    subject = 'TechVisor ' + keywords['text']
    html_message = render_to_string('mailTemplate-' + keywords['type'] + '.html', {'code': shortid, 'keywords': keywords, 'email': email, 'url': 'http://techvisor.co.kr'})
    plain_message = strip_tags(html_message)
    from_email = settings.DEFAULT_FROM_EMAIL 
    to = email
    send_mail(subject, plain_message, from_email, [to], fail_silently=False, html_message=html_message)  
      