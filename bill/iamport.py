import requests
import json
# import datetime  + datetime.now().strftime('%Y%m%d%H%M%S')

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse

# @csrf_exempt
def get_access_token(*args):
    access_data = {
        # 'imp_key' : settings.IAMPORT_KEY,
        # 'imp_secret' : settings.IAMPORT_SECRET
        'imp_key' : '8620374806320572',
        'imp_secret' : 'HaeE0q8O4oOn9jbc0At2abkT6GuqwlZeweTxE1mJqb6AuiMuSfx3rRXxxrY4NXjjccRRedAEoGfTZ1nR'
    }

    url = "https://api.iamport.kr/users/getToken"
    req = requests.post(url, data = access_data)
    access_res = req.json()

    if access_res['code'] == 0:
        return access_res['response']['access_token']
    else:
        return None

@csrf_exempt
def payments_prepare(order_id, amount, *args, **kwargs):
    # order_id = 'bd8bd067-40dd-47ac-92b2-a64f15459c38', amount = 3000
    access_token = get_access_token()

    if access_token:
        access_data = {
            'merchant_uid' : order_id,
            'amount' : amount
            # 'merchant_uid' : 'imp79353885',
            # 'amount' : 1000
        }

        url = "https://api.iamport.kr/payments/prepare"

        headers = {
            'Authorization' : access_token
        }

        req = requests.post(url, data = access_data, headers = headers)
        res = req.json()
        print('res Error222222222222222 : ', res)

        if res['code'] is not 0:
            raise ValueError("API 연결에 문제가 생겼습니다.")       
    else:
        raise ValueError("인증 토큰이 없습니다.")

def find_transaction(order_id, *args, **kwargs):
    access_token = get_access_token()
    if access_token:
        url = "https://api.iamport.kr/payments/find/" + order_id

        headers = {
            'Authorization' : access_token
        }

        req = requests.post(url, headers = headers)
        res = req.json()
        print('res is : ', res)
        
        if res['code'] is 0:
            context = {
                'imp_id' : res['response']['imp_uid'],
                'merchant_order_id' : res['response']['merchant_uid'],
                'amount' : res['response']['amount'],
                'status' : res['response']['status'],
                'type' : res['response']['pay_method'],
                'receipt_url' : res['response']['receipt_url']
            }
            return context
        else:
            return None
    else:
        raise ValueError("인증 토큰이 없습니다.")

        