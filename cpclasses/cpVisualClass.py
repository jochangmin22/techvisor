from utils import request_data, snake_to_camel, sampling, nested_dict_values, add_orderby, dictfetchall, frequency_count

from django.core.cache import cache
from django.conf import settings
from django.db import connection
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

import asyncio
from concurrent.futures import ThreadPoolExecutor

import os
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"


class CpVisual:

    def __init__(self, request, mode):
        self._request = request
        self._mode = mode
        # self._initialRows = { 'rows': [], 'rowsCount': 0 }

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)
        self._corpName = self._params.get('corpName','')  
        foo = self._params.get('commonCorpName','')  
        self._commonCorpName = self.enrich_common_corp_name(foo)

        mainKey, subKey = self.redis_key()
        self._mainKey = f'{mainKey}¶{self._mode}'
        self._subKey = f'{subKey}¶{self._mode}'

        try:
            context = cache.get(self._mainKey)
            if context:
                print(f'load {self.__class__.__name__} mainKey redis')
                self._rows = context
                return context
            _context = cache.get(self._subKey)
            if _context:
                print(f'load {self.__class__.__name__} subKey redis')
                setattr(self, '_%s' % self._mode, _context)
                return _context
        except (KeyError, NameError, UnboundLocalError):
            pass

    def redis_key(self):
        result = self._corpName
        additional_result = result + "¶".join(list(nested_dict_values(self._subParams)))
        return result, additional_result

    def save_redis_main(self, result):
        cache.set(self._mainKey, result)
        return result

    def save_redis_sub(self, result):
        cache.set(self._subKey, result)
        return result                

    def create_empty_rows(self):
        self._emptyRows = [dict() for x in range(len(self._rows))]
        return self._emptyRows

    def make_paging_rows(self, result):
        try:
            rowsCount = self._rows[0]["cnt"]
        except IndexError:        
            rowsCount = 0

        for i in range(len(result)):
            result[i]['id'] = self._rows[i]['출원번호'] # add id key for FE's ids
            for key in ['출원번호','출원일','등록사항','발명의명칭','출원인1','발명자1','ipc코드']:
                result[i][key] = self._rows[i][key]

        return { 'rowsCount': rowsCount, 'rows': sampling(result, self._offset, self._limit)}                

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

    def enrich_common_corp_name(self, result):
        COMPANY_ASSIGNE_MATCHING = settings.TERMS['COMPANY_ASSIGNE_MATCHING']
        for k, v in COMPANY_ASSIGNE_MATCHING.items():
            if k == result:
                return v
        return result

    def query_chioce(self, key):
        command = { 'owned_patent': self.owned_patent_query, 'hundred_patents_lastest': self.hundred_patents_lastest_query }
        return command[key]()        

    def query_execute(self):
        key = 'owned_patent' if self._commonCorpName else 'hundred_patents_lastest'
        query = self.query_chioce(key)

        with connection.cursor() as cursor:
            cursor.execute(
                "SET work_mem to '100MB';"
                + query
            )
            rows = dictfetchall(cursor)

        result = rows
        cache.set(self._mainKey, result, CACHE_TTL)
        setattr(self, '_%s' % key, result)
        print('query execute: ', key)
        return result

    def owned_patent(self):
        ''' If there is no corpName, the last 100 rows are displayed instead'''

        self.table_options()

        self._orderby_clause = add_orderby(self._sortBy)
        if not self._orderby_clause:
            self._orderby_clause = ' order by A.출원일 desc'        

        self._rows = self.query_execute()            
        return self.paging_rows()

    def visual(self):
        self._orderby_clause = ' order by A.출원일 desc'        
        self._rows = self.query_execute()            
        command = {
            'wordcloud' : self.nlp_rows, 
            'visualNum' : self.vis_num,
            'visualIpc' : self.vis_ipc,
            'visualPerson' : self.vis_per
        }   
        return command[self._mode]()       

    def paging_rows(self):
        # self.is_query_ever_been_run()
        result = self.make_paging_rows(self.create_empty_rows()) 
        return self.save_redis_sub(result)        

    def nlp_rows(self):
        result = self.make_nlp_rows(self.create_empty_rows())
        return self.save_redis_main(result)

    def vis_num(self):
        result = self.make_vis_num(self.create_empty_rows())          
        return self.save_redis_main(result)

    def vis_ipc(self):
        result = self.make_vis_ipc()          
        return self.save_redis_main(result)

    def vis_per(self):
        result = self.make_vis_per()          
        return self.save_redis_main(result)                

    def make_nlp_rows(self, result):
        # nlp는 요약, 청구항 만 사용
        for i in range(len(result)):
            abstract = str(self._rows[i]['요약'])

            claim = str(self._rows[i]['청구항'])

            result[i]['요약'] = abstract
            result[i]['청구항'] = claim
            result[i]['요약·청구항'] = abstract + ' ' + claim
        return result

    def make_vis_num(self, result):
        ''' visual application number '''
        if not self._rows:
            return { 'mode' : 'visualNum', 'entities' : [{ 'data' : [], 'labels' : []}]}        

        for i in range(len(result)):
            result[i]['출원일'] = str(self._rows[i]['출원일'])[:-4]
            result[i]['등록일'] = str(self._rows[i]['등록일'])[:-4]
            result[i]['구분'] = str(self._rows[i]['출원번호'])[0]

        def make_each_category_dict(flag):
            if flag:
                foo = [i[key] for i in result if i[key] and i['구분'] == flag]
            else:            
                foo = [i[key] for i in result if i[key]]
            bar = frequency_count(foo)        
            labels = [key for key in sorted(bar)]
            data = [bar[key] for key in sorted(bar)]  
            return { 'labels': labels, 'data' : data }         

        key = '출원일'
        PU = make_each_category_dict(flag=None)
        PP = make_each_category_dict(flag='1')
        UP = make_each_category_dict(flag='2')
        key = '등록일'
        PR = make_each_category_dict(flag='1')
        UR = make_each_category_dict(flag='2')    

        entities = [ PU, PP, UP, PR, UR ]
        res = { 'mode' : 'visualNum', 'entities' : entities }
        return res

    def make_vis_ipc(self):
        ''' visual ipc '''
        def make_dic_to_list_of_dic():
            try:
                return { 'name' : list(bar.keys()), 'value' : list(bar.values())}
            except AttributeError:
                return { 'name' : [], 'value' : []}

        entities = []
        foo = [i['ipc코드'][0:4] for i in self._rows if i['ipc코드']]
        bar = frequency_count(foo,20)
        entities.append(make_dic_to_list_of_dic())

        foo = [i['ipc코드'][0:3] for i in self._rows if i['ipc코드']]
        bar = frequency_count(foo,20)
        entities.append(make_dic_to_list_of_dic())

        result = { 'mode' : 'visualIpc', 'entities' : entities }

        return result

    def make_vis_per(self):
        ''' visual related person '''
        
        NATIONALITY = settings.TERMS['NATIONALITY']

        entities = []
        def nat_swap(x):
            return NATIONALITY.get(x,x)

        def make_dic_to_list_of_dic(baz):
            try:
                return { 'name' : list(baz.keys()), 'value' : list(baz.values())}
            except AttributeError:
                return { 'name' : [], 'value' : []}

        # caller
        for key in ['출원인1','발명자1']:
            foo = [i[key] for i in self._rows if i[key]]

            bar = frequency_count(foo,20)
            entities.append(make_dic_to_list_of_dic(bar))        

        for key in ['출원인국가코드1','발명자국가코드1']:
            foo = [nat_swap(i[key]) for i in self._rows if i[key]]

            bar = frequency_count(foo,20)
            entities.append(make_dic_to_list_of_dic(bar))        

        result = { 'mode' : 'visualPerson', 'entities': entities }
        return result                                         

    def owned_patent_query(self):
        selecting_columns = 'SELECT count(*) over () as cnt, A.등록사항, A."발명의명칭", A.출원번호, A.출원일, A.출원인1, A.출원인코드1, A.출원인국가코드1, A.발명자1, A.발명자국가코드1, A.등록일, A.공개일, A.ipc코드, A.요약, A.청구항 FROM '
        foo =  '"성명" like $$%' + self._commonCorpName + '%$$'
        return f'{selecting_columns} ( SELECT 출원번호 FROM ( SELECT 출원번호 FROM 공개인명정보 WHERE {foo} ) K GROUP BY 출원번호 ) V, kr_tsv_view A WHERE V.출원번호 = A.출원번호 {self._orderby_clause} offset 0 rows fetch next 1001 rows only;' 

    def hundred_patents_lastest_query(self):
        selecting_columns = 'SELECT count(*) over () as cnt, A.등록사항, A."발명의명칭", A.출원번호, A.출원일, A.출원인1, A.출원인코드1, A.출원인국가코드1, A.발명자1, A.발명자국가코드1, A.등록일, A.공개일, A.ipc코드, A.요약, A.청구항 FROM '
        foo =  '"성명" like $$%' + self._commonCorpName + '%$$'
        return f'{selecting_columns} where 출원일 is not null {self._orderby_clause} limit 100'     

        
      

