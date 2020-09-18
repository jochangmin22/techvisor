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
    stock_code = models.CharField(max_length=10)
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


class nice_corp(models.Model):
    objects = models.Manager()
    사업자등록번호 = models.CharField(max_length=12, primary_key = True)
    업체명 = models.CharField(max_length=50)
    대표자 = models.CharField(max_length=50)
    개업일자 = models.IntegerField()
    기업주체구분 = models.CharField(max_length=10)
    기업규모 = models.CharField(max_length=10)
    종업원수 = models.IntegerField()
    종업원수기준일 = models.IntegerField()
    본점사업자번호 = models.CharField(max_length=12)
    주소 = models.CharField(max_length=255)
    우편번호 = models.CharField(max_length=10)
    전화번호 = models.CharField(max_length=20)
    팩스번호 = models.CharField(max_length=20)
    주요제품 = models.CharField(max_length=255)
    홈페이지URL = models.CharField(max_length=100)
    휴폐업여부 = models.CharField(max_length=10)
    업종코드 = models.CharField(max_length=10)
    업종명 = models.CharField(max_length=255)
    상장일 = models.IntegerField()
    상장구분 = models.CharField(max_length=20)
    주식코드 = models.CharField(max_length=10)
    최근결산년도 = models.IntegerField()
    매출액 = models.CharField(max_length=15)
    영업이익 = models.CharField(max_length=15)
    당기순이익 = models.CharField(max_length=15)
    자산총계 = models.CharField(max_length=15)
    자본총계 = models.CharField(max_length=15)
    부채총계 = models.CharField(max_length=15)

    class Meta:
        db_table = '"nice_corp"'