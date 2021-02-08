from django.db import models
import uuid

# Create your models here.

class Disclosure(models.Model):
    objects = models.Manager()
    corp_code = models.CharField(max_length=10, primary_key = True)
    corp_name = models.CharField(max_length=255)
    stock_code = models.CharField(max_length=10,null=True)
    modify_date = models.DateField()

    class Meta:
        db_table = '"disclosure"'

class Corp_eval_grade_hist(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False
    )
    kiscode = models.CharField(max_length = 50)
    기업평가등급 = models.JSONField(default=dict, null=True)

    class Meta:
        db_table = '"corp_eval_grade_hist"'

class Listed_corp(models.Model):
    objects = models.Manager()
    회사명 = models.CharField(max_length=100, primary_key = True)
    종목코드 = models.CharField(max_length=10, null=True)
    업종 = models.CharField(max_length=150)
    주요제품 = models.CharField(max_length=255)
    상장일 = models.DateField()
    결산월 = models.CharField(max_length=10)
    대표자명 = models.CharField(max_length=100)
    홈페이지 = models.CharField(max_length=100)
    지역 = models.CharField(max_length=50)
    정보 = models.JSONField(default=dict, null=True)
    재무 = models.JSONField(default=dict, null=True)
    kiscode = models.CharField(max_length = 50)
    
    class Meta:
        db_table = '"listed_corp"'


    