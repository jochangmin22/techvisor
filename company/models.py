from django.db import models
import uuid

# Create your models here.

class stock_quotes(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False
    )
    kiscode = models.CharField(max_length=10)
    price_date = models.DateField()
    stock = models.JSONField(default=list, null=True)
    # volume = models.DecimalField(max_digits=15, decimal_places=1)
    volume = models.IntegerField()
    # volume = models.CharField(max_length=255)
    # created_at = models.DateTimeField(auto_now_add=True, editable=False)
    # updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"stock_quotes"'

class financial_statements(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False
    )
    kiscode = models.CharField(max_length=10)
    corpcode = models.CharField(max_length=10)
    corpinfo = models.JSONField(default=dict, null=True)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"financial_statements"'  

class mdcin_clinc_test_info(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False
    )
    신청자 = models.CharField(max_length=100)
    승인일 = models.IntegerField()
    제품명 = models.CharField(max_length=255)
    정보 = models.JSONField(default=dict, null=True)
    # 연구실명 = models.CharField(max_length=255)
    # 시험제목 = models.CharField(max_length=255)
    # 임상단계 = models.CharField(max_length=50)
    # created_at = models.DateTimeField(auto_now_add=True, editable=False)

    class Meta:
        db_table = '"mdcin_clinc_test_info"'          