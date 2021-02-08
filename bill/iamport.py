import requests
import json
import datetime
import time

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods

from iamport import Iamport

from bill.models import Product, Order, OrderItem, OrderTransaction
from users.models import Users

iamport = Iamport(
    imp_key = settings.IAMPORT_KEY,
    imp_secret = settings.IAMPORT_SECRET
    )
imp_code = settings.IAMPORT_CODE

def get_access_token(*args):
    access_data = {
        'imp_key' : settings.IAMPORT_KEY,
        'imp_secret' : settings.IAMPORT_SECRET
    }

    url = "https://api.iamport.kr/users/getToken"
    req = requests.post(url, data = access_data)
    access_res = req.json()

    if access_res['code'] == 0:
        return access_res['response']['access_token']
    else:
        return None

@csrf_exempt
def payments_prepare(request):
    data = json.loads(request.body)
    access_token = get_access_token()

    # Order.objects.create(user_id = data['customer_uid'])
    user_data = Users.objects.get(id = data['customer_uid'])

    if user_data.data['first_pay']:
        amount = 10
    else:
        amount = data['amount']    

    if access_token:
        access_data = {
            'customer_uid' : data['customer_uid'],
            'merchant_uid' : data['merchant_uid'] + '1',
            'amount' : amount,
            'name' : 'Techvisor 정기결제'
        }


        url = "https://api.iamport.kr/subscribe/payments/again"

        headers = {
            'Authorization' : access_token
        }

        # OrderTransaction.objects.create(
        #     order_id = last_order.id,
        #     merchant_uid = access_data['merchant_uid'],
        #     amount = access_data['amount'],
        #     pay_type = ''
        # )

        req = requests.post(url, data = access_data, headers = headers)
        res = req.json()

        if res['code'] == 0:
            if res['response']['status'] == 'paid':                
                return JsonResponse({ 'Message' : '결제 성공' }, status = 200)
            
            else:
                return JsonResponse({ 'Message' : '결제 오류' }, status = 400)
        
        elif res['code'] is not 0:
            raise ValueError("API 연결에 문제가 생겼습니다.")       
    else:
        raise ValueError("인증 토큰이 없습니다.")


def payments_schedule(**kwargs):
    access_token = get_access_token()

    if access_token:
        next_payments_date = datetime.datetime.fromtimestamp(kwargs['paid_at']) + datetime.timedelta(minutes=1)
        new_paymet_day = int(time.mktime(next_payments_date.timetuple()))
        
        order_transaction = OrderTransaction.objects.get(merchant_uid = kwargs['merchant_uid'])
        order_item = OrderItem.objects.get(order_id = order_transaction.order_id)
        order_product = Product.objects.get(id = order_item.product_id)
        
        payload = {
            'customer_uid' : kwargs['customer_uid'],
            'schedules' : [
                {
                'merchant_uid' : 'Techvisor_' + str(int(datetime.datetime.now().timestamp())),
                'schedule_at' : new_paymet_day,
                'amount' : order_product.price
                }
            ]
        }
        
        print('schedule payload : ', payload)

        user_data = Users.objects.get(id = kwargs['customer_uid'])
        user_data.merchant_uid = payload['schedules'][0]['merchant_uid']
        user_data.data['first_pay'] = False
        user_data.save()

        try:
            response = iamport.pay_schedule(**payload)
            print('schedule res : ', response)
            return response

        except KeyError:
            return JsonResponse({ 'Message' : 'INVALID KEY'}, status = 400)

        except Iamport.ResponseError as e:
            return JsonResponse({ 'Message' : e.message}, status = 400)

        except Iamport.HttpError as http_error:
            return JsonResponse({ 'Message' : http_error.reason}, status = 400)



def find_transaction(imp):
    access_token = get_access_token()
    if access_token:
        url = "https://api.iamport.kr/payments/" + imp

        headers = {
            'Authorization' : access_token
        }

        req = requests.post(url, headers = headers)
        res = req.json()                
        
        if res['code'] is 0:
            context = {
                'imp_uid' : res['response']['imp_uid'],
                'merchant_uid' : res['response']['merchant_uid'],
                'customer_uid' : res['response']['customer_uid'],
                'amount' : res['response']['amount'],
                'status' : res['response']['status'],
                'type' : res['response']['pay_method'],
                'receipt_url' : res['response']['receipt_url'],
                'paid_at' : res['response']['paid_at'],
                'name' : res['response']['name']
            }
            

            if not context['name'] == 'Techvisor 최초인증결제':
                Order.objects.create(user_id = context['customer_uid'])

                last_order = Order.objects.filter(user_id = context['customer_uid'])[0]
                OrderTransaction.objects.create(
                    order_id = last_order.id,
                    merchant_uid = context['merchant_uid'],
                    amount = context['amount'],
                    pay_type = ''
                )

            OrderTransaction.objects.filter(
                merchant_uid = res['response']['merchant_uid']
                ).update(
                    imp_uid = res['response']['imp_uid'],
                    pay_type = res['response']['pay_method'],
                    transaction_status = res['response']['status'],
                    success = True
                )

            return context
        else:
            return None
    else:
        raise ValueError("인증 토큰이 없습니다.")


@require_http_methods(["POST"])
def payments_unschedule(request):
    try:
        data = json.loads(request.body)

        last_order = Order.objects.get(id = data['user_id'])
        
        payload = {
            'customer_uid' : data['user_id'],
            'merchant_uid' : last_order.merchant_uid
        }
    
        response = iamport.pay_unschedule(**payload)
        return JsonResponse({ 'Message' : '정기 결제 취소' },status = 200)        

    except KeyError:
        return JsonResponse({ 'Message' : 'INVALID KEY'}, status = 400)

    except Iamport.ResponseError as e:
        return JsonResponse({ 'Message' : e.message}, status = 400)

    except Iamport.HttpError as http_error:
        return JsonResponse({ 'Message' : http_error.reason}, status = 400)

def schedule_webhook(request):
    data = json.loads(request.body)
    access_token = get_access_token()
    
    
    transaction_data = find_transaction(data['imp_uid'])

    if transaction_data['status'] == 'paid':
        
    
        last_order = Order.objects.filter(user_id = transaction_data['customer_uid'])[0]
        last_order.paid = True
        last_order.save()

        OrderItem.objects.create(
            price = transaction_data['amount'],
            order_id = last_order.id,
            product_id = 'ebcdd792-f289-4fd6-be2e-c4726245cefc'
            # product_id = data['product_id']
        )

        res = payments_schedule(**transaction_data)
        return JsonResponse({ 'Message' : '정기결제 성공' }, status = 200)

    else:
        payload = {
            'customer_uid' : transaction_data['customer_uid'],
            'merchant_uid' : transaction_data['merchant_uid'],
            'amount' : transaction_data['amount']
        }

        try:
            response = iamport.pay_again(**payload)
        
        except KeyError:
            return JsonResponse({ 'Message' : 'INVALID KEY'}, status = 400)

        except Iamport.ResponseError as e:
            return JsonResponse({ 'Message' : e.message}, status = 400)

        except Iamport.HttpError as http_error:
            return JsonResponse({ 'Message' : http_error.reason}, status = 400)
        