from utils import request_data, menu_redis_key, dictfetchall, sampling
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
import pandas as pd

from django.db import connection

class IpIndicator:
    
    def __init__(self, request, indRow):
        self._request = request
        self._indRow = indRow
        self._indicatorEmpty = { "name": [], "피인용수": [], "총등록건": [], "CPP": [], "PII": [], "TS": [], "PFS": [], "table" : { 'rowsCount': 0, 'rows': [] }}

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)

        self._menuKey = menu_redis_key(self._request, 'indicator')        

        self.table_options()

        try:
            result = cache.get(self._menuKey)
            if result:
                print('load ind redis')
                self._indicator = result
        except (KeyError, NameError, UnboundLocalError):
            pass

    def table_options(self):
        foo = self._subParams["menuOptions"]["tableOptions"]['indicatorTable']
        pageIndex = foo.get('pageIndex', 0)
        pageSize = foo.get('pageSize', 10)
        self._sortBy = foo.get('sortBy', [])            

        self._offset = pageIndex * pageSize
        self._limit = pageSize
        return                

    def get_sum_query(self, query):
        try:
            with connection.cursor() as cursor:
                cursor.execute(query)
                row = dictfetchall(cursor)
            result = row[0]['cnt']
            if not result:
                return 0
            return result                
        except:
            return 0        

    def indicator(self):
        def get_granted_list():
            # 개별 등록건수 count
            df = pd.DataFrame(d).reindex(columns=['출원인코드1','등록일'])
            df['출원인코드1'] = df['출원인코드1'].astype(str)
            return (df
                .value_counts(['출원인코드1'])
                .reset_index(name='value')
                .rename(columns={'출원인코드1':'code'})
                .to_dict('r'))

        def get_total_granted_appno_list():
            # 전체 row 등록건수 · 출원번호 list
            df = pd.DataFrame(d).reindex(columns=['출원번호','등록일'])
            df = df.reindex(columns=['출원번호']).출원번호.astype(str).tolist()      
            cnt = len(df)
            alist = ', '.join(df)
            return cnt, alist

        def get_total_citing():
            # 전체 등록특허의 피인용수
            query= 'SELECT sum(피인용수) cnt from 특허실용심사피인용수패밀리수 where 출원번호 IN (' + appNoList + ')'
            return self.get_sum_query(query)

        def get_appno_list_of_applicant():
            # 출원인 groupby 출원번호 concat
            df = pd.DataFrame(d).reindex(columns=['출원인1','출원인코드1','출원번호'])
            df['출원인코드1'] = df['출원인코드1'].astype(str)
            df['출원번호'] = df['출원번호'].astype(str)
            df = (df
                .groupby(['출원인1','출원인코드1'])
                .출원번호
                .agg(list)
                .reset_index()
                .to_dict('r')
                )
            # TODO : list of dict 출원번호 sort desc로 자르기
            # return [{'name' : dic['출원인1'], 'code' : dic['출원인코드1'], 'appNo' : dic['출원번호']} for dic in df][:companyLimit]   
            return [{'name' : dic['출원인1'], 'code' : dic['출원인코드1'], 'appNo' : dic['출원번호']} for dic in df]

        def count_citing(appNos):
            # citing count (using appNo)
            query= 'SELECT sum(피인용수) cnt from 특허실용심사피인용수패밀리수 where 출원번호 IN (' + appNos + ')'
            return self.get_sum_query(query)
 

        def count_family(appNos):                                                 
            # family count (using appNo)
            query= 'SELECT sum(패밀리수) cnt from 특허실용심사피인용수패밀리수 where 출원번호 IN (' + appNos + ')'
            return self.get_sum_query(query)   


        def count_total_family():                                                 
            # total family count (using appNo)
            query= 'SELECT sum(패밀리수) cnt from 특허실용심사피인용수패밀리수 where 출원번호 IN (' + appNoList + ')'                                
            return self.get_sum_query(query)        

        d = self._indRow           
            
        grantedList = get_granted_list()
        total_granted, appNoList = get_total_granted_appno_list()
        total_citing = get_total_citing()
        total_family_cnt = int(count_total_family())

        companyLimit = 1000 
        dataList = get_appno_list_of_applicant()


        res = [{} for x in range(len(dataList))]
        for i in range(len(dataList)):
            # if len(dataList[i]['appNo']) == 1:
            #     continue
            res[i]['name'] = dataList[i]['name']
            res[i]['code'] = dataList[i]['code']
            res[i]['appNo'] = dataList[i]['appNo']

        appNos = [', '.join(item['appNo']) for item in res]
        name = [item['name'] for item in res]
        citing = [int(count_citing(appNo)) for appNo in appNos]   
        granted = []
        for x in res:
            granted.append([item['value'] for item in grantedList if item["code"] == x['code']][0])
        cpp = [int(i) / int(j) for i, j in zip(citing, granted)]

        # pii = [i / int(total_citing) / total_granted for i in cpp]
        pii = []
        for i in cpp:
            try:  
                pii.append(i / int(total_citing) / total_granted)
            except ZeroDivisionError:
                pii.append(0)

        ts = [i * j for i, j in zip(pii, granted)]  

        # pfs = [int(count_family(', '.join(item['appNo']))) /  int(total_family_cnt)  for item in res]
        pfs = []
        for item in res:
            try:
                pfs.append(int(count_family(', '.join(item['appNo']))) /  total_family_cnt)
            except ZeroDivisionError:
                pfs.append(0)

        _cpp = [round(num,2) for num in cpp]
        _pii = [round(num,2) for num in pii]
        _ts = [round(num,2) for num in ts]
        _pfs = [round(num,2) for num in pfs]
        result = { 'name': name, '피인용수' : citing, '총등록건': granted, 'CPP' : _cpp, 'PII' : _pii, 'TS' : _ts, 'PFS' : _pfs }

        rows = []
        for (idx, foo) in enumerate(result['name']):
            rows.append({ 'name': result["name"][idx], '피인용수' : result['피인용수'][idx] , '총등록건' : result['총등록건'][idx], 'CPP': result["CPP"][idx], 'PII' : result['PII'][idx], 'TS' : result['TS'][idx], 'PFS' : result['PFS'][idx]})
        try:
            rowsCount = len(rows)
        except IndexError:        
            rowsCount = 0                  

        tableData = { 'rowsCount': rowsCount, 'rows': sampling(rows, self._offset, self._limit)}           

        result.update({ "table" : tableData})

        cache.set(self._menuKey, result , CACHE_TTL)

        return result
