from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

from users.models import users

# Create your models here.
class Product(models.Model):
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False
    )
    name = models.CharField(max_length = 255)
    price = models.IntegerField()

    def __str__(self):
        return str(self.name)

    class Meta:
        db_table = "products"

class Order(models.Model):
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False
    )
    user = models.ForeignKey(users, on_delete = models.CASCADE)
    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now = True)
    paid = models.BooleanField(default = False)
    discount = models.IntegerField(
        default = 0,
        validators = [MinValueValidator(0), MaxValueValidator(100000)]
    )

    class Meta:
        ordering = ['-created_at']
        db_table = 'orders'

    def __str__(self):
        return 'Order {}'.format(self.id)

    def get_total_price(self):
        return self.get_item_price() - self.discount

class OrderItem(models.Model):
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False
    )
    order = models.ForeignKey(Order, on_delete = models.CASCADE)
    product = models.ForeignKey(Product, on_delete = models.PROTECT)
    price = models.IntegerField()
    quantity = models.PositiveIntegerField(default = 1)
        
    def __str__(self):
        return '{}'.format(self.id)

    def get_item_price(self):
        return self.price * self.quantity
    
    class Meta:
        db_table = 'order_items'

import hashlib
from .iamport import *
class OrderTransactionManager(models.Manager):
    def create_new(self, order, amount, success = None, transaction_status = None):
        if not order:
            raise ValueError("주문 오류")
        user_data = users.objects.get(id = order.user_id)
        order_hash = hashlib.sha256(str(order.id).encode('utf-8')).hexdigest()
        email_hash = user_data.data["email"].split("@")[0]
        final_hash = hashlib.sha256((order_hash + email_hash).encode('utf-8')).hexdigest()[:10]
        merchant_order_id = "%s"%(final_hash)

        payment_prepare(merchant_order_id, amount)

        transaction = self.model(
            order = order,
            merchant_order_id = merchant_order_id,
            amount = amount
        )

        if success is not None:
            transaction.success = success
            transaction.transaction_status = transaction_status
        
        try:
            transaction.save()
        except Exception as e:
            print("Save Error", e)
        
        return transaction.merchant_order_id
    
    def get_transaction(self, merchant_order_id):
        result = find_transaction(merchant_order_id)
        if result['status'] == 'paid':
            return result
        else:
            return None

class OrderTransaction(models.Model):
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False
    )
    user = models.ForeignKey(users, on_delete = models.CASCADE, null = True)
    merchant_order_id = models.CharField(max_length = 120, null = True, blank = True)
    transaction_id = models.CharField(max_length = 120, null = True, blank = True)
    amount = models.PositiveIntegerField(default = 0)
    success = models.BooleanField(default = False)
    transaction_status = models.CharField(max_length = 220, null = True, blank = True)
    type = models.CharField(max_length = 120)
    created = models.DateTimeField(auto_now_add = True, auto_now = False)

    def __str__(self):
        return self.order_id

    class Meta:
        db_table = 'order_transaction'
        ordering = ['-created']

def order_payment_validation(sender, instance, created, *args, **kwargs):
    if instance.transaction_id:
        import_transaction = OrderTransaction.objects.get_transaction(merchant_order_id = instance.merchant_order_id)

        merchant_order_id = import_transaction["merchant_order_id"]
        imp_id = import_transaction["imp_id"]
        amount = import_transaction["amount"]

        local_transaction = OrderTransaction.objects.filter(merchant_order_id = merchant_order_id, transaction_id = imp_id, amount = amount).exists()

        if not import_transaction or not local_transaction:
            raise ValueError("비정상 거래입니다.")

from django.db.models.signals import post_save
post_save.connect(order_payment_validation, sender = OrderTransaction)