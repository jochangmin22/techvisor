from utils import request_data, redis_key, snake_to_camel, sampling 

from django.core.cache import cache

from datetime import datetime, timedelta

from company.models import Mdcin_clinc_test_info, Disclosure_report

from company.views.crawler import update_today_corp_report, update_today_crawl_mdcline


class CpRelatedInfo:

    def __init__(self, request, mode):
        self._request = request
        self._mode = mode
        self._emtpyRows = { 'rows': [], 'rowsCount': 0 }

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)
        self._corpName = self._params.get('corpName','')  
        
        mainKey, subKey = redis_key(self._request)
        self._searchKey = f'{mainKey}¶search'
        self._mainKey = f'{mainKey}¶{self._mode}'
        self._subKey = f'{subKey}¶{self._mode}'

        try:
            result = cache.get(self._searchKey)
            if result:
                print(f'load {self.__class__.__name__} searchKey redis')
                self._rows = result
                return result
            res = cache.get(self._subKey)
            if res:
                print(f'load {self.__class__.__name__} subKey redis')
                setattr(self, '_%s' % self._mode, res)
                return res
        except (KeyError, NameError, UnboundLocalError):
            pass

    def more_then_an_hour_passed(self, last_updated):    
        try:
            if (datetime.utcnow() - last_updated) > timedelta(1):
                return True
            else:
                return False            
        except:
            return True        

    def save_crawl_time(self,key):
        now = datetime.utcnow()
        return cache.set(key, now, 3600)  

    def table_options(self):
        mode = snake_to_camel(self._mode)
        foo = self._subParams["menuOptions"]["tableOptions"][mode]
        pageIndex = foo.get('pageIndex', 0)
        pageSize = foo.get('pageSize', 10)
        self._sortBy = foo.get('sortBy', [])    

        # Add offset limit
        self._offset = pageIndex * pageSize
        self._limit = pageSize        
        return

    def clinic_test(self):
        ''' If there is no corpName, the last 100 rows are displayed instead'''

        self.table_options()           

        # Add sort by
        orderClause = ','.join('-'+ s['_id'] if s['desc'] else s['_id'] for s in self._sortBy) if self._sortBy else '-승인일'
            
        # check one hour or more has passed from latest crawl
        last_updated = cache.get('clinic_text_crawl') if cache.get('clinic_text_crawl') else None

        # crawl today report
        weekno = datetime.today().weekday()
        if weekno<5 and self.more_then_an_hour_passed(last_updated): # On weekends, the clinical server does not work, so the crawl passes
            update_today_crawl_mdcline()
            self.save_crawl_time('clinic_text_crawl')

        if self._corpName:
            isExist = Mdcin_clinc_test_info.objects.filter(신청자__contains=self._corpName).exists()
            if not isExist:
                return self._emtpyRows

            rows = Mdcin_clinc_test_info.objects.filter(신청자__contains=self._corpName).order_by(orderClause).values()
        else:
            rows = Mdcin_clinc_test_info.objects.all().order_by(orderClause)[:100].values()            

        rowsCount = len(rows)
        rows = sampling(list(rows), self._offset, self._limit)
        # rows = list(rows)
        res = [dict(row, **{
                '신청자': row['신청자'],
                '승인일': row['승인일'],
                '제품명': row['제품명'],
                '시험제목': row['시험제목'],
                '연구실명': row['연구실명'],
                '임상단계': row['임상단계'],
            }) for row in rows]
        result = { 'rowsCount': rowsCount, 'rows': res }            
        return result

    def corp_report(self):
        ''' If there is no corpName, the last 100 rows are displayed instead'''

        self.table_options()  

        # Add sort by
        orderClause = ','.join('-'+ s['_id'] if s['desc'] else s['_id'] for s in self._sortBy) if self._sortBy else '-접수번호'        

        # check one hour or more has passed from latest crawl
        last_updated = cache.get('corp_report_crawl') if cache.get('corp_report_crawl') else None

        # crawl today report
        weekno = datetime.today().weekday()
        if weekno<5 and self.more_then_an_hour_passed(last_updated): # On weekends, the opendart server does not work, so the crawl passes        
            update_today_corp_report()
            self.save_crawl_time('corp_report_crawl')

        if self._corpName:
            isExist = Disclosure_report.objects.filter(종목명__contains=self._corpName).exists()
            if not isExist:
                return self._emtpyRows

            rows = Disclosure_report.objects.filter(종목명__contains=self._corpName).order_by(orderClause).values()
        else:
            # rows = Disclosure_report.objects.all().order_by('-접수일자')[:100].values()            
            rows = Disclosure_report.objects.exclude(종목코드__exact='').order_by(orderClause)[:100].values()            

        rowsCount = len(rows)
        rows = sampling(list(rows), self._offset, self._limit)            
        # rows = list(rows)
        res = [dict(row, **{
                '공시대상회사': row['종목명'],
                '보고서명': row['보고서명'],
                '제출인': row['공시제출인명'],
                '접수일자': row['접수일자'],
                '비고': row['비고'],
            }) for row in rows]

        result = { 'rowsCount': rowsCount, 'rows': res }            
        return result
