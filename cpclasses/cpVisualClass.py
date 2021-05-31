from utils import request_data, redis_key, snake_to_camel, add_orderby, dictfetchall, enrich_common_corp_name

from django.core.cache import cache
from django.conf import settings
from django.db import connection
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from ipclasses import IpSearchs

class CpVisual(IpSearchs):

    def __init__(self, request, mode):
        self._request = request
        self._mode = mode
        # self._initialRows = { 'rows': [], 'rowsCount': 0 }

        self.set_up()

        self.default_orderby()  

    def set_up(self):
        self._params, self._subParams = request_data(self._request)
        mainKey, subKey = redis_key(self._request)

        foo = self._params.get('commonCorpName','')  
        self._commonCorpName = enrich_common_corp_name(foo)

        self._rowsKey = f'{mainKey}¶owned_patent'
        self._mainKey = f'{mainKey}¶{self._mode}'
        self._subKey = f'{subKey}¶{self._mode}'

        self.redis_rows()

        command = {
            'owned_patent' : self.redis_rows,
            'visualNum' : self.redis_visual,
            'visualIpc' : self.redis_visual,
            'visualPerson' : self.redis_visual,
            'wordcloud' : self.redis_wordcloud,
        }   
        return command[self._mode]()          


    def redis_visual(self):
        try:
            result = cache.get(self._mainKey)
            if result:
                print(f'load {self.__class__.__name__} mainKey redis')
                setattr(self, '_%s' % self._mode, result)
        except (KeyError, NameError, UnboundLocalError):
            pass        

    def redis_wordcloud(self):
        try:
            result = cache.get(self._subKey)            
            if result:
                print(f'load {self.__class__.__name__} subKey redis')
                self._wordcloud = result
        except (KeyError, NameError, UnboundLocalError):
            pass        

    def redis_wordcloud_nlp_rows(self):
        try:
            result = cache.get(f'{self._subKey}_nlp_rows')            
            if result:
                print(f'load {self.__class__.__name__} subKey_nlp_rows redis')
                self._wordcloud_nlp_rows = result
        except (KeyError, NameError, UnboundLocalError):
            pass        

      
    def save_redis_sub_nlp_rows(self, result):
        cache.set(f'{self._subKey}_nlp_rows', result)
        return result                

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

    def query_chioce(self, key):
        command = { 'owned_patent': self.owned_patent_query, 'hundred_patents_lastest': self.hundred_patents_lastest_query }
        return command[key]()

    def default_orderby(self):
        try:
            getattr(self, '_sortBy')
            self._orderby_clause = add_orderby(self._sortBy)
        except AttributeError:
            self._orderby_clause = ' order by A.출원일 desc'              

    def query_execute(self):
        key = 'owned_patent' if self._commonCorpName else 'hundred_patents_lastest'
        query = self.query_chioce(key)

        with connection.cursor() as cursor:
            cursor.execute(
                "SET work_mem to '100MB';"
                + query
            )
            self._rows = dictfetchall(cursor)

        cache.set(self._rowsKey, self._rows, CACHE_TTL)
        print('query execute: ', key)
        return self._rows

    def owned_patent(self):
        ''' If there is no corpName, the last 100 rows are displayed instead'''

        self.table_options()

        self.default_orderby()        

        self.load_rows_first()

        return self.paging_rows()

    def visual(self):
        self.load_rows_first()

        try:
            print(f'_{self._mode} exist')
            return getattr(self, '_%s' % self._mode)
        except AttributeError:
            pass

        command = {
            'visualNum' : self.vis_num,
            'visualIpc' : self.vis_ipc,
            'visualPerson' : self.vis_per
        }   
        return command[self._mode]()       

    def wordcloud(self):
        self.load_rows_first()

        self.redis_wordcloud_nlp_rows()

        try:
            getattr(self, '_wordcloud_nlp_rows')
            print('_nlp_rows exist')
        except AttributeError:
            print('nlp_rows execute')
            return self.nlp_rows()           
        else:
            return self._wordcloud_nlp_rows        


    def nlp_rows(self):
        result = self.make_nlp_rows(self.create_empty_rows())
        return self.save_redis_sub_nlp_rows(result)

    def owned_patent_query(self):
        selecting_columns = 'SELECT count(*) over () as cnt, A.등록사항, A."발명의명칭", A.출원번호, A.출원일, A.출원인1, A.출원인코드1, A.출원인국가코드1, A.발명자1, A.발명자국가코드1, A.등록일, A.공개일, A.ipc코드, A.요약, A.청구항 FROM '
        foo =  '"성명" like $$%' + self._commonCorpName + '%$$'
        return f'{selecting_columns} ( SELECT 출원번호 FROM ( SELECT 출원번호 FROM 공개인명정보 WHERE {foo} ) K GROUP BY 출원번호 ) V, kr_tsv_view A WHERE V.출원번호 = A.출원번호 {self._orderby_clause} offset 0 rows fetch next 1001 rows only;' 

    def hundred_patents_lastest_query(self):
        selecting_columns = 'SELECT count(*) over () as cnt, A.등록사항, A."발명의명칭", A.출원번호, A.출원일, A.출원인1, A.출원인코드1, A.출원인국가코드1, A.발명자1, A.발명자국가코드1, A.등록일, A.공개일, A.ipc코드, A.요약, A.청구항 FROM '
        foo =  '"성명" like $$%' + self._commonCorpName + '%$$'
        return f'{selecting_columns} where 출원일 is not null {self._orderby_clause} limit 100'     

        
      

