from django.db import models
from django.contrib.postgres.fields import JSONField
import uuid

# Create your models here.

class stock_quotes(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False
    )
    kiscode = models.CharField(max_length=255)
    price_date = models.DateField()
    stock = JSONField(default=list, null=True)
    # volume = models.DecimalField(max_digits=15, decimal_places=1)
    volume = models.IntegerField()
    # volume = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"stock_quotes"'
