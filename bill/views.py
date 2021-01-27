import json
import requests
from iamport import Iamport

from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.views.generic.base import View
from django_user_agents.utils import get_user_agent

from .forms import *
from .models import *
from .iamport import *
from users.models import *


iamport = Iamport(
    imp_key = settings.IAMPORT_KEY,
    imp_secret = settings.IAMPORT_SECRET
    )
imp_code = settings.IAMPORT_CODE

def order_create(request):
    price = 100
    Order.objects.create(user_id = '87b0466f-06ee-458e-bb5c-c5c65002bca4')

    if request.user_agent.is_pc:
        print('PC 접속')
        return render(request, 'bill/create.html', {'imp_code' : imp_code, 'price' : price})
         # return render(
        #     request,
        #     'bill/create.html',
        #     {
        #         'user_data' : user_data,
        #         'product_data' : product_data,
        #         'imp_code' : imp_code
        #     })

    elif request.user_agent.is_mobile:
        print('Mobile 접속')
        return render(request, 'bill/create_mobile.html', {'imp_code' : imp_code})
         # return render(
        #     request,
        #     'bill/create_mobile.html',
        #     {
        #         'user_data' : user_data,
        #         'product_data' : product_data,
        #         'imp_code' : imp_code
        #     })

    else:
        return request.user_agent.browser.family

    # return JsonResponse( user_agent.is_pc, status = 200)
    # data = json.loads(request.body)
    
    # if request.method == "POST":

        # Order.objects.create(user_id = data['userId'])

        # user_data = Users.objects.get(id = data['userId'])
        # product_data = Product.objects.get(id = data['productId'])
        # product_data = data['due']

        # return render(
        #     request,
        #     'bill/create.html',
        #     {
        #         'user_data' : user_data,
        #         'product_data' : product_data,
        #         'imp_code' : imp_code
        #     })
    # return render(request, 'bill/create.html', {'imp_code' : imp_code, 'amount' : '100'})


class SubscribeScheduleView(View):
    def get(self, request):
        access_token = get_access_token()
        data = json.loads(request.body)

        url = "https://api.iamport.kr/subscribe/payments/schedule/" + data['merchant_uid']
        
        headers = {
            'Authorization' : access_token
        }

        req = requests.get(url, headers = headers)
        res = req.json()

        if res['code'] == 0:
            result = {
                'customer_uid' : res['response']['customer_uid'],
                'imp_uid' : res['response']['imp_uid'],
                'amount' : res['response']['amount']
            }
            return JsonResponse({ 'Message' : result }, status = 200)

        else:
            return JsonResponse({ 'Message' : '예약된 결제 정보가 없습니다.'}, status = 400)
    

class OrderCancelView(View):
    def post(self, request):
        data = json.loads(request.body)

        try:
            response = iamport.cancel(data['reason'], imp_uid = data['imp_uid'])
            return HttpResponse(status = 200)

        except Iamport.ResponseError as e:
            return JsonResponse({ 'Message' : e.message}, status = 400)

        except Iamport.HttpError as http_error:
            return JsonResponse({ 'Message' : http_error.reason}, status = 400)


class OrderTransactionView(View):
    def get(self, request):
        data = json.loads(request.body)

        result = find_transaction(data['imp_uid'])

        user_data = {
            'paid_at' : datetime.datetime.fromtimestamp(result['paid_at']).strftime('%Y-%m-%d'),
            'amount' : result['amount'],
            'type' : result['type'],
            'status' : result['status'],
            'receipt_url' : result['receipt_url']
        }
        return JsonResponse({ 'result' : user_data }, status = 200)