import jwt
import datetime
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from django.http import HttpResponse, JsonResponse

# caching with redis
from django.core.cache import cache

now = datetime.datetime.utcnow()
secret_key = settings.SECRET_KEY
algorithm = settings.JWT_AUTH['JWT_ALGORITHM']
expiresIn = settings.JWT_AUTH['JWT_EXPIRATION_DELTA']

def handleRedis(redisKey, keys, result="", mode="r"):
    """ read or write to redis """
    context = cache.get(redisKey) 
    if mode == 'r':
        if context and context[keys]:
            return context[keys]
            # return JsonResponse(context[keys], safe=False)
        else:            
            return None          
    if mode == 'w':
        if context is None:
            context = {}
        context[keys] = result
        cache.set(redisKey, context, 300)
        return JsonResponse(result, safe=False)        
    return
    
def google_client_json_exist(client_json):    
    if not client_json:
        content = { "please check ENVVAR" : "Google ENVVAR is missing"}
        return Response(content, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return      

def generate_token(foo):
    payload = {
        'iat': now,
        'exp': now + datetime.timedelta(days=expiresIn)
    }
    payload.update(foo)

    result = jwt.encode(payload, secret_key, algorithm=algorithm) # .decode('utf-8')
    return result