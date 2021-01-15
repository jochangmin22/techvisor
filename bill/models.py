from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

from users.models import Users

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
    user = models.ForeignKey(Users, on_delete = models.CASCADE)
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


class OrderTransaction(models.Model):
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False
    )
    order = models.ForeignKey(Order, on_delete = models.CASCADE, null = True)
    merchant_uid = models.CharField(max_length = 120, null = True, blank = True)
    imp_uid = models.CharField(max_length = 120, null = True, blank = True)
    amount = models.PositiveIntegerField(default = 0)
    success = models.BooleanField(default = False)
    transaction_status = models.CharField(max_length = 220, null = True, blank = True)
    pay_type = models.CharField(max_length = 120)
    created = models.DateTimeField(auto_now_add = True, auto_now = False)

    def __str__(self):
        return str(self.order_id)

    class Meta:
        db_table = 'order_transaction'
        ordering = ['-created']