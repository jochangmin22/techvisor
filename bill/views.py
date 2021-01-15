import json
import requests
import weasyprint

from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, get_object_or_404
from django.template.loader import render_to_string
from django.views.generic.base import View
<<<<<<< HEAD
from django.contrib.admin.views.decorators import staff_member_required
=======
from django.views.decorators.http import require_http_methods
>>>>>>> 502c007... merge전 저장

from .forms import *
from .models import *


<<<<<<< HEAD
=======
iamport = Iamport(
    imp_key = settings.IAMPORT_KEY,
    imp_secret = settings.IAMPORT_SECRET
    )
imp_code = settings.IAMPORT_CODE

# @require_http_methods(["POST"])
>>>>>>> 502c007... merge전 저장
def order_create(request):
    data = json.loads(request.body)
    
    if request.method == "POST":
        form = OrderCreateForm(request.POST)

        if form.is_valid():
            order = form.save()

            OrderItem.objects.create(
                order_id = order.id,
                product_id = data['product'],
                price = data['price'],
                quantity = data['quantity']
            )
            return render(request, 'bill/created.html', {'order' : order})
    else:
        form = OrderCreateForm()
    return render(request, 'bill/create.html', {'data' : data, 'form' : form})

@staff_member_required
def admin_order_detail(request, order_id):
    order = get_object_or_404(Order, id = order_id)
    return JsonResponse({ 'Order' : order }, status = 200)
    # return render(request, 'bill/admin/detail.html', {'order' : order})

@staff_member_required
def admin_order_pdf(request, order_id):
    order = get_object_or_404(Order, id = order_id)
    html = render_to_string('bill/admin/pdf.html', {'order' : order})
    response = HttpResponse(content_type = 'application/pdf')
    response['Content-Disposition'] = 'filename = order_{}.pdf'.format(order.id)
    weasyprint.HTML(string = html).write_pdf(
        response,
        stylesheets = [weasyprint.CSS(settings.STATICFILES_DIRS[0]+'/css/pdf.css')]
        )
    return response

def order_complete(request):
    order_id = request.Get.get('order_id')
    order = Order.objects.get(id = order_id)
    # return JsonResponse({ 'Order' : order }, status = 200)
    return render(request, 'bill/created.html', {'order' : order})

class OrderCreateAjaxView(View):
    def post(self, request, *args, **kwargs):
        # if not request.user.is_authenticated:
        #     return JsonResponse({"authenticated" : False}, status = 403)
        
<<<<<<< HEAD
        if request.method == "POST":
            body_data = json.loads(request.body)
            form = OrderCreateForm(body_data)
            print("form date : ", form)

            if form.is_valid():
                order = form.save()
            
                OrderItem.objects.create(
                        order_id = order.id,
                        product_id = body_data['product'],
                        price = body_data['price'],
                        quantity = body_data['quantity']
                    )
                data = {
                    "order_id" : order.id
                }
                return JsonResponse(data)
            
            else:
                return JsonResponse({}, status = 401)

class OrderCheckoutAjaxView(View):
    def post(self, request, *args, **kwargs):
        # if not request.user.is_authenticated:
        #     return JsonResponse({"authenticated" : False}, status = 403)

        order_id = request.POST.get('order_id')
        order = Order.objects.get(id = order_id)
        amount = request.POST.get('amount')

        # print('order_id : ', order)
        # print('amount : ', amount)

        try:
            merchant_order_id = OrderTransaction.trans_objects.create_new(
                order = order,
                amount = amount
            )
            print('merchantID : ', merchant_order_id)
        except:
            merchant_order_id = None

        if merchant_order_id is not None:
            data = {
                "works" : True,
                "merchant_id" : merchant_order_id
=======
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
>>>>>>> 502c007... merge전 저장
            }
            return JsonResponse(data)
        
        else:
            # print('amount : ', merchant_order_id)
            return JsonResponse({}, status = 401)

<<<<<<< HEAD
class OrderImpAjaxView(View):
    def post(self, request, *args, **kwargs):
        # if not request.user.is_authenticated:
        #     return JsonResponse({"authenticated" : False}, status = 403)

        order_id = request.POST.get('order_id')
        order = Order.objects.get(id = order_id)
        merchant_id = request.POST.get('merchant_id')
        imp_id = request.POST.get('imp_id')
        amount = request.POST.get('amount')
=======
        except Iamport.ResponseError as e:
            return JsonResponse({ 'Message' : e.message}, status = 400)

        except Iamport.HttpError as http_error:
            return JsonResponse({ 'Message' : http_error.reason}, status = 400)
>>>>>>> 502c007... merge전 저장

        try:
            trans = OrderTransaction.trans_objects.get(
                order = order,
                merchant_order_id = merchant_id,
                amount = amount
            )
        except:
            trans = None

        print('Trans : ' ,trans)

        if trans is not None:
            trans.transaction_id = imp_id
            trans.success = True
            trans.save()
            order.paid = True
            order.save()

            data = {
                "works" : True
            }

            return JsonResponse(data)

        else:
            return JsonResponse({}, status = 401)