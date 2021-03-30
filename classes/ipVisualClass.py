from utils import get_redis_key, dictfetchall
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from gensim.models import Word2Vec
from gensim.models import FastText
import pandas as pd
from django.db import connection

from classes import IpSearchs

class IpVisual:
    
    def __init__(self, request):
        self._request = request
        self._indicatorEmpty = { "name": [], "피인용수": [], "총등록건": [], "CPP": [], "PII": [], "TS": [], "PFS": [] }
        self._visualNumEmpty = { 'mode' : 'visualNum', 'entities' : [] }
        self._visualClassifyEmpty = { 'mode' : 'visualClassify', 'entities' : [] }
        self._visualIpcEmpty = { 'mode' : 'visualIpc', 'entities' : [] }
        self._visualPersonEmpty = { 'mode' : 'visualPerson', 'entities': [] }
        self._indicator = {}
        self.set_up()

    def set_up(self):
        _, subKey, params, subParams = get_redis_key(self._request)

        mode = subParams.get('mode',None)

        newSubKey = f'{subKey}¶{mode}'
        
        context = cache.get(newSubKey)


        try:
            if context and context[mode]:
                setattr(self, '_%s' % mode, context[mode])
                return
        except (KeyError, NameError, UnboundLocalError):
            pass

        if not params.get('searchText',None):
            return getattr(self, '_%sEmpty' % mode)

        foo = IpSearchs(self._request, mode=mode)
        foo.query_execute()
        foo.create_empty_rows()

        command = { 
            'indicator' : foo.make_vis_ind,
            'visualNum' : foo.make_vis_num,
            'visualClassify' : foo.make_vis_cla,
            'visualIpc' : foo.make_vis_ipc,
            'visualPerson' : foo.make_vis_per
        }        

        setattr(self, '_%s' % mode, command[mode](foo._emptyRows))       

        if not getattr(self, '_%s' % mode):
            return getattr(self, '_%sEmpty' % mode)

        self._newSubKey = newSubKey

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
            return get_sum_query(query)

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
            return get_sum_query(query)

        def count_granted(grantedList, code):            
            # granted count (using grantedList, code)            
            try:
                return [item['value'] for item in grantedList if item["code"] == code][0]
            except:
                return 0
        def get_cpp():
            try:
                return citing / granted
            except:
                return 0              
        def get_pii():
            try:
                return  cpp / total_citing / total_granted
            except:
                return 0             

        def count_family(appNos):                                                 
            # family count (using appNo)
            query= 'SELECT sum(패밀리수) cnt from 특허실용심사피인용수패밀리수 where 출원번호 IN (' + appNos + ')'
            return get_sum_query(query)   

        def get_pfs():
            try:
                return family / total_family             
            except:
                return 0

        def count_total_family():                                                 
            # total family count (using appNo)
            query= 'SELECT sum(패밀리수) cnt from 특허실용심사피인용수패밀리수 where 출원번호 IN (' + appNoList + ')'                                
            return get_sum_query(query)        
            
        d = self._indRows
        grantedList = get_granted_list()
        total_granted, appNoList = get_total_granted_appno_list()
        total_citing = get_total_citing()
        total_family_cnt = int(count_total_family())

        companyLimit = 1000 
        dataList = get_appno_list_of_applicant()


        res = [dict() for x in range(len(dataList))]
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

        rcpp = [round(num,2) for num in cpp]
        rpii = [round(num,2) for num in pii]
        rts = [round(num,2) for num in ts]
        rpfs = [round(num,2) for num in pfs]
        self._indicator = { 'name': name, '피인용수' : citing, '총등록건': granted, 'CPP' : rcpp, 'PII' : rpii, 'TS' : rts, 'PFS' : rpfs }
        cache.set(self._newSubKey, {'indicator' : self._indicator } , CACHE_TTL)

