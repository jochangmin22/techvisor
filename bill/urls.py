from django.urls import path

from .views import order_create, SubscribeScheduleView, payments_unschedule, OrderTransactionView, OrderCancelView
from .iamport import payments_prepare, schedule_webhook
# from .forms import *

app_name = 'bill'

urlpatterns = [
    path('api/auth/user/order/create', order_create, name='order_create'),
    path('api/auth/user/order/subscribe', SubscribeScheduleView.as_view(), name='subscribe'),
    path('api/auth/user/order/billings', payments_prepare, name='payments_prepare'),    
    path('api/auth/user/order/unschedule', payments_unschedule, name='payments_unschedule'),
    path('api/auth/user/order/webhook', schedule_webhook, name='schedule_webhook'),
    path('api/auth/user/order/verification', OrderTransactionView.as_view(), name='order_transaction'),
    path('api/auth/user/order/cancel', OrderCancelView.as_view(), name='order_cancel'),
    # path('api/auth/user/order/schedule', payments_schedule, name='payments_schedule'),
]