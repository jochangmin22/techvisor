import requests
from django.db import connection
from django.http import JsonResponse
from django.http import HttpResponse
import json

from .utils import dictfetchall
from .models import mdcin_clinc_test_info, disclosure_report
from search.models import listed_corp, disclosure

def clinic_test(request):
    ''' If there is no corpName, the last 100 rows are displayed '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        corpName = data['corpName']

        if corpName:
            isExist = mdcin_clinc_test_info.objects.filter(신청자__contains=corpName).exists()
            if not isExist:
                return JsonResponse([], safe=False)

            rows = mdcin_clinc_test_info.objects.filter(신청자__contains=corpName).values()
        else:
            rows = mdcin_clinc_test_info.objects.all().order_by('-승인일')[:100].values()            

        rows = list(rows)
        res = [dict(row, **{
                '신청자': row['신청자'],
                '승인일': row['승인일'],
                '제품명': row['제품명'],
                '시험제목': row['정보']['시험제목'],
                '연구실명': row['정보']['연구실명'],
                '임상단계': row['정보']['임상단계'],
            }) for row in rows]
            
        return JsonResponse(res, safe=False) 

def get_disclosure_report(request):
    ''' If there is no corpName, the last 100 rows are displayed '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        corpName = data['corpName']

        if corpName:
            isExist = disclosure_report.objects.filter(종목명__contains=corpName).exists()
            if not isExist:
                return JsonResponse([], safe=False)

            rows = disclosure_report.objects.filter(종목명__contains=corpName).values()
        else:
            rows = disclosure_report.objects.all().order_by('-접수일자')[:100].values()            

        rows = list(rows)
        res = [dict(row, **{
                '공시대상회사': row['종목명'],
                '보고서명': row['보고서명'],
                '제출인': row['공시제출인명'],
                '접수일자': row['접수일자'],
                '비고': row['비고'],
            }) for row in rows]
            
        return JsonResponse(res, safe=False)         

def get_owned_patent(request):
    ''' If there is no corpName, the last 100 rows are displayed '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        corpName = data['corpName']

        if corpName:
            with connection.cursor() as cursor:
                query = 'select 등록사항, "발명의명칭(국문)", "발명의명칭(영문)", 출원번호, 출원일자, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일자, 공개일자, ipc요약,등록사항, "발명의명칭(국문)", "발명의명칭(영문)", 출원번호, 출원일자, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일자, 공개일자, ipc요약, 요약token, 전체항token from 공개공보 where "출원인1" like $$%' + corpName + '%$$ order by 출원일자 desc'
                cursor.execute(query)
                row = dictfetchall(cursor)
            if not row:
                return JsonResponse([], safe=False)
            else:
                return JsonResponse(row, safe=False)
        else:
            return JsonResponse([], safe=False)                
