import requests
import json

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse

# from iamporter import Iamporter

# iamport = Iamporter(
#     imp_key = '8620374806320572',
#     imp_secret = 'HaeE0q8O4oOn9jbc0At2abkT6GuqwlZeweTxE1mJqb6AuiMuSfx3rRXxxrY4NXjjccRRedAEoGfTZ1nR'
#     )
# @csrf_exempt
# def get_access_token(*args):
#     print('WHO?? ', args)
#     access_data = iamport.create_billkey(
#         customer_uid="your_customer_uid",
#         card_number="1234-1234-1234-1234",
#         expiry="2022-06",
#         birth="960712",
#         pwd_2digit="12",
#         customer_info={
#             'name': "소유자 이름",
#             'tel': "01000000000",
#             'email': "someone@example.com",
#             'addr': "사는 곳 주소",
#             'postcode': "06604",
#         },
#     )
#     # access_data = iamport._get_token()
#     # access_res = access_data.json()
#     print('get_token data : ', access_data)
#     return JsonResponse({ 'Data' : access_data }, status = 200)
#     # if access_data:
#     #     return access_data
#     # else:
#     #     return None

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
    print('token : ', access_res)

    if access_res['code'] == 0:
        return JsonResponse({ 'Token' : access_res['response']['access_token'] }, status = 200)
    else:
        return None

@csrf_exempt
def payments_prepare(order_id, amount, *args, **kwargs):
    access_token = get_access_token()

    if access_token:
        access_data = {
            # 'merchant_uid' : order_id,
            # 'amount' : amount
            'merchant_uid' : 'imp79353885',
            'amount' : 1000
        }

        url = "https://api.iamport.kr/payments/prepare"

        headers = {
            'Authorization' : access_token
        }

        req = requests.post(url, data = access_data, headers = headers)
        res = req.json()
        print('input data : ', res)

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

        req = request.post(url, headers = headers)
        res = req.json()

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

        