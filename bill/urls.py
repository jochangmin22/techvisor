from django.urls import path

from .views import *
from .iamport import *
from .forms import *

app_name = 'bill'

urlpatterns = [
    path('api/auth/admin/order/<int:order_id>', admin_order_detail, name='admin_order_detail'),
    path('api/auth/admin/order/<int:order_id>/pdf', admin_order_pdf, name='admin_order_pdf'),
    path('api/auth/user/create', order_create, name='order_create'),
    path('api/auth/user/order/create_ajax', OrderCreateAjaxView.as_view(), name='order_create'),
    path('api/auth/user/order/checkout', OrderCheckoutAjaxView.as_view(), name='order_checkout'),
    path('api/auth/user/order/validation', OrderImpAjaxView.as_view(), name='order_validation'),
    path('api/auth/user/order/complete', order_complete, name='order_complete'),
    
    path('api/auth/user/order', payments_prepare, name='get_access_token'),
    path('api/auth/user/order/form', OrderCreateForm, name='create_form'),
]