import json
import requests
import weasyprint

from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, get_object_or_404
from django.template.loader import render_to_string
from django.views.generic.base import View
from django.contrib.admin.views.decorators import staff_member_required

from .forms import *
from .models import *


def order_create(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # form = OrderCreateForm(request.POST)
            # form = OrderCreateForm()
            print('data is : ', data)
            order_id = data['order']
            order = Order.objects.get(id = order_id)
            print('order is : ', order)
            # if form.is_valid():
            #     order = form.save()
            #     print('data is : ', order)

                # OrderItem.objects.create(
                #     order = order,
                #     product = data['product'],
                #     price = data['price'],
                #     quantity = data['quantity']
                # )
            # return render(request, 'bill/created.html', {'order' : order})
            return render(request, 'bill/create.html', {'form' : data})
        except Exception as e:
            print('Error', e)
    return HttpResponse(status = 400)
    # else:
    #     return render(request, 'bill/create.html', {'form' : data})

@staff_member_required
def admin_order_detail(request, order_id):
    order = get_object_or_404(Order, id = order_id)
    return render(request, 'bill/admin/detail.html', {'order' : order})

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
    # order = Order.objects.get(id = order_id)
    # return render(request, 'bill/created.html', {'order' : order})

class OrderCreateAjaxView(View):
    def post(self, request, *args, **kwargs):
        # if not request.user.is_authenticated:
        #     return JsonResponse({"authenticated" : False}, status = 403)
        
        form = OrderCreateForm(request.POST)
        # print('request data : ', request.POST)
        print('request data : ', form)

        if form.is_valid():
            order = form.save()
            print("form date : ", form)

            OrderItem.objects.create(
                    order = order,
                    product = data['product'],
                    price = data['price'],
                    quantity = data['quantity']
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

        try:
            merchant_order_id = OrderTransaction.objects.create_new(
                order = order,
                amount = amount
            )
        except:
            merchant_order_id = None

        if merchant_order_id is not None:
            data = {
                "works" : True,
                "merchant_id" : merchant_order_id
            }
            return JsonResponse(data)
        
        else:
            return JsonResponse({}, status = 401)

class OrderImpAjaxView(View):
    def post(self, request, *args, **kwargs):
        # if not request.user.is_authenticated:
        #     return JsonResponse({"authenticated" : False}, status = 403)

        order_id = request.POST.get('order_id')
        order = Order.objects.get(id = order_id)
        merchant_id = request.POST.get('merchant_id')
        imp_id = request.POST.get('imp_id')
        amount = request.POST.get('amount')

        try:
            trans = OrderTransaction.objects.get(
                order = order,
                merchant_order_id = merchant_id,
                amount = amount
            )
        except:
            trans = None

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