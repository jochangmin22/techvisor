from utils import request_data, redis_key, remove_tail, add_orderby, dictfetchall, frequency_count, sampling
from django.core.cache import cache
from django.db import connection
from django.conf import settings
from django.http import JsonResponse
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
import re
import operator

import asyncio
from concurrent.futures import ThreadPoolExecutor

import os
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"

class UsSearchs:

    def __init__(self, request, mode):
        self._request = request
        self._mode = mode
        self._emptyRows = []
        self._queryCols = f"""'' AS 등록사항, 발명의명칭, 출원번호, 출원일, 출원인1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일, 공개일, "IPC코드", 요약, 청구항"""
        
        self.set_up()
        self._executor = ThreadPoolExecutor(1)
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        result = self.loop.run_until_complete(self.run_query())
        self.loop.close()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)
        mainKey, subKey = redis_key(self._request)

        self.load_params() 

        self._rowsKey = f'{mainKey}¶rows'
        self._queryKey = f'{mainKey}¶query'
        self._mainKey = f'{mainKey}¶{self._mode}'
        self._subKey = f'{subKey}¶{self._mode}'

        self.redis_rows()

        print('mode is ...', self._mode)
        
        command = {
            'searchs' : self.redis_rows,
            'query' : self.redis_query,
            'nlp' : self.redis_sub,
            'wordcloud' : self.redis_sub,
            'keywords' : self.redis_sub,
            'matrix' : self.redis_sub,
            'indicator' : self.redis_sub,            
            'visualNum' : self.redis_sub,
            'visualIpc' : self.redis_sub,
            'visualPerson' : self.redis_sub,
            'visualClassify' : self.redis_sub,
        }   
        return command[self._mode]()          

    def load_params(self):
        self._searchVolume = self._params.get('searchVolume','요약·청구항') or '요약·청구항'
        for key in ['searchNum','searchText','inventor','assignee','dateType','startDate','endDate','status','ipType']:
            setattr(self, '_%s' % key, self._params.get(key,None) or None)
        return    

    def redis_rows(self):
        try:
            result = cache.get(self._rowsKey)            
            if result:
                print(f'load {self.__class__.__name__} rowsKey redis')
                self._rows = result
        except (KeyError, NameError, UnboundLocalError):
            pass

    def redis_sub(self):
        try:
            result = cache.get(self._subKey)
            if result:
                print(f'load {self.__class__.__name__} subKey redis', self._mode)
                setattr(self, '_%s' % self._mode, result)
        except (KeyError, NameError, UnboundLocalError):
            pass

    def redis_nlp(self):
        try:
            result = cache.get(f'{self._subKey}_nlp_rows')            
            if result:
                print(f'load {self.__class__.__name__} subKey_nlp_rows redis', self._mode)
                self._nlp_rows = result
        except (KeyError, NameError, UnboundLocalError):
            pass                               

    def redis_mtx(self):
        try:
            result = cache.get(f'{self._subKey}_mtx_rows')            
            if result:
                print(f'load {self.__class__.__name__} subKey_mtx_rows redis', self._mode)
                self._mtx_rows = result
        except (KeyError, NameError, UnboundLocalError):
            pass                               

    def redis_query(self):
        try:
            result = cache.get(self._queryKey)            
            if result:
                print(f'load {self.__class__.__name__} mainKey query redis', self._mode)
                self._query = result
        except (KeyError, NameError, UnboundLocalError):
            pass                               

    async def run_query(self):
        try:
            getattr(self, '_rows')
            print(' _rows exist', self._mode)
        except AttributeError:
            await self.loop.run_in_executor(self._executor, self.query_execute)
            print('still execute query ', self._mode)
            return 
        else:
            return 

    def create_empty_rows(self):
        self._emptyRows = [dict() for x in range(len(self._rows))]
        return self._emptyRows

    def make_paging_rows(self, result):
        try:
            rowsCount = self._rows[0]["cnt"]
        except (KeyError, IndexError):        
            rowsCount = 0

        for i in range(len(result)):
            result[i]['id'] = self._rows[i]['출원번호'] # add id key for FE's ids
            for key in ['출원번호','출원일','등록사항','발명의명칭','출원인1','발명자1','ipc코드']:
                result[i][key] = self._rows[i][key]

        return { 'rowsCount': rowsCount, 'rows': sampling(result, self._offset, self._limit)}

    def table_options(self):
        foo = self._subParams["menuOptions"]["tableOptions"]["mainTable"]
        pageIndex = foo.get('pageIndex', 0)
        pageSize = foo.get('pageSize', 10)
        self._offset = pageIndex * pageSize
        self._limit = pageSize        
        self._sortBy = foo.get('sortBy', [])    
        return 

    def query_chioce(self):
        return self.generate_num_query() if self._searchNum else self.generate_text_query()

    def query_execute(self):
        query = self.query_chioce()  
        print(query)
        cache.set(self._queryKey, query, CACHE_TTL)

        with connection.cursor() as cursor:
            cursor.execute(
                "SET work_mem to '100MB';"
                + query
            )
            self._rows = dictfetchall(cursor)

        cache.set(self._rowsKey, self._rows, CACHE_TTL)
        print('query execute: ', self._mode)
        return

    def load_rows_first(self):
        try:
            getattr(self, '_rows')
            print('_rows exist')
        except AttributeError:
            self._rows = self.query_execute()  
            print('_rows not exist to execute query')        

    def searchs(self):

        self.table_options()

        self._orderby_clause = add_orderby(self._sortBy)

        self.load_rows_first()

        return self.paging_rows()

    def wordcloud(self):
        self.load_rows_first()

        self.redis_nlp()

        try:
            getattr(self, '_nlp_rows')
            print('_nlp_rows exist')
        except AttributeError:
            print('nlp_rows execute')
            return self.nlp_rows()           
        else:
            return self._nlp_rows   

    def keywords(self):
        self.load_rows_first()

        self.redis_nlp()

        try:
            getattr(self, '_nlp_rows')
            print('_nlp_rows exist')
        except AttributeError:
            print('nlp_rows execute')
            return self.nlp_rows()           
        else:
            return self._nlp_rows  

    def matrix(self):
        self.load_rows_first()

        self.redis_mtx()

        try:
            getattr(self, '_mtx_rows')
            print('_mtx_rows exist')
        except AttributeError:
            print('mtx_rows execute')
            return self.mtx_rows()           
        else:
            return self._mtx_rows  

    def paging_rows(self):
        result = self.make_paging_rows(self.create_empty_rows()) 
        return self.save_redis_sub(result)

    def nlp_rows(self):
        result = self.make_nlp_rows(self.create_empty_rows())
        return self.save_redis_sub_nlp_rows(result)

    def mtx_rows(self):
        result = self.make_mtx_rows(self.create_empty_rows())
        return self.save_redis_sub_mtx_rows(result)        

    def vis_num(self):
        result = self.make_vis_num(self.create_empty_rows())          
        return self.save_redis_main(result)

    def vis_ipc(self):
        result = self.make_vis_ipc(self.create_empty_rows())          
        return self.save_redis_main(result)

    def vis_cla(self):
        result = self.make_vis_cla(self.create_empty_rows())          
        return self.save_redis_sub(result)

    def vis_per(self):
        result = self.make_vis_per(self.create_empty_rows())          
        return self.save_redis_main(result)

    def vis_ind(self):
        result = self.make_vis_ind(self.create_empty_rows())
        return self.save_redis_main(result)


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
        PN = make_each_category_dict(flag=None)
        PP = make_each_category_dict(flag='1')
        UP = make_each_category_dict(flag='2')
        key = '등록일'
        RN = make_each_category_dict(flag=None)
        PR = make_each_category_dict(flag='1')
        UR = make_each_category_dict(flag='2')   

        entities = [ PN, RN, PP, UP, PR, UR ]
        res = { 'mode' : 'visualNum', 'entities' : entities }
        return res

    def make_vis_ipc(self, result):
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

    def make_vis_cla(self, result):
        ''' visual applicant classify '''

        GOVERNMENT = settings.TERMS['APPLICANT_CLASSIFY']['GOVERNMENT']

        def classify_swap(x,c):
            if c == '4':
                return '개인'        
            if any(s in x for s in GOVERNMENT):    
                return '공공'        
            else:
                return '기업'

        def make_dic_to_list_of_dict_cla(bar):
            return [{ '출원인명' : k, '건수' : v} for k,v in bar.items()]          

        def make_each_table_rows(flag):
            foo = [i['이름'] for i in result if i['이름'] and i['구분'] == flag]
            bar = frequency_count(foo)
            baz = make_dic_to_list_of_dict_cla(bar)

            quux = self._subParams["menuOptions"]["tableOptions"]["visualClassify"]
            pageIndex = quux.get('pageIndex', 0)
            pageSize = quux.get('pageSize', 10)
            sortBy = quux.get('sortBy', [])             

            # Add sort by
            if sortBy:
                for s in sortBy:
                    reverse = True if s['desc'] else False
                    baz.sort(key=operator.itemgetter(s['_id']), reverse=reverse)

            # Add offset limit
            offset = pageIndex * pageSize
            limit = pageSize

            result_paging = sampling(baz, offset, limit)       

            return { 'rowsCount': len(bar), 'rows' : result_paging }                  
    
        for i in range(len(result)):        
            name = str(self._rows[i]['출원인1'])

            code = str(self._rows[i]['출원인코드1'])[0]


            result[i]['이름'] = name
            result[i]['구분'] = classify_swap(name, code)

        G = make_each_table_rows(flag='공공')
        C = make_each_table_rows(flag='기업')
        P = make_each_table_rows(flag='개인')

        entities = [ G, C, P ]
        res = { 'mode' : 'visualClassify', 'entities' : entities }
        return res

    def make_vis_per(self, result):
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

    def make_nlp_rows(self, result):
        # nlp는 요약, 청구항 만 사용
        for i in range(len(result)):
            abstract = str(self._rows[i]['요약'])

            claim = str(self._rows[i]['청구항'])

            result[i]['요약'] = abstract
            result[i]['청구항'] = claim
            result[i]['요약·청구항'] = abstract + ' ' + claim
        return result        

    def make_mtx_rows(self, result):
        # matrix는 출원번호, 출원일, 출원인1, ipc코드, 요약, 청구항만 사용
        for i in range(len(result)):
            for key in ['출원번호','출원인1','ipc코드']:
                result[i][key] = self._rows[i][key]            

            result[i]['출원일'] =  str(self._rows[i]['출원일'])[:-4]

            abstract = str(self._rows[i]['요약'])
            claim = str(self._rows[i]['청구항'])
            result[i]['요약'] = abstract
            result[i]['청구항'] = claim
            result[i]['요약·청구항'] = abstract + ' ' + claim      
        return result

    def make_vis_ind(self, result):
        # indicater는 ['출원번호','출원인코드1','출원인1','등록일'] 만 사용
        for i in range(len(result)):
            for key in ['출원번호','출원인코드1','출원인1','등록일']:
                result[i][key] = self._rows[i][key]
        
        return [i for i in result if not (i['등록일'] == None)] # 등록건만                



    def save_redis_main(self, result):
        cache.set(self._mainKey, result)
        return result

    def save_redis_sub(self, result):
        cache.set(self._subKey, result)
        return result

    def save_redis_sub_nlp_rows(self, result):
        cache.set(f'{self._subKey}_nlp_rows', result)
        return result

    def save_redis_sub_mtx_rows(self, result):
        cache.set(f'{self._subKey}_mtx_rows', result)
        return result

    def generate_num_query(self):
        query = 'select count(*) over () as cnt, ' + self._queryCols + \
        " FROM kr_tsv_view WHERE num_search like '%" + self._searchNum.replace("-","") + "%'"
        return query

    def generate_text_query(self): 
        queryTextTerms = self.tsquery_keywords(self._searchText, 'terms')
        whereTerms = f'"{self._searchVolume}tsv" @@ to_tsquery(\'{queryTextTerms}\') and ' if queryTextTerms else ""

        queryTextInventor = self.tsquery_keywords(self._inventor, 'person')
        whereInventor = f'"발명자tsv" @@ to_tsquery(\'{queryTextInventor}\') and ' if queryTextInventor else ""

        queryTextAssignee = self.tsquery_keywords(self._assignee, 'person')
        whereAssignee = f'"출원인tsv" @@ to_tsquery(\'{queryTextAssignee}\') and ' if queryTextAssignee else ""

        whereDate = self.date_query()
        whereStatus = self.status_query()
        whereIptype = self.iptype_query()

        whereAll = whereTerms
        whereAll += whereDate
        whereAll += whereInventor
        whereAll += whereAssignee
        whereAll += whereStatus
        whereAll += whereIptype

        whereAll = remove_tail(whereAll," and ")

        query = f'select count(*) over () as cnt, ts_rank("{self._searchVolume}tsv",to_tsquery(\'{queryTextTerms}\')) AS rank, {self._queryCols} FROM ({self.searchs_query()}) AS us_tsv_view WHERE ({whereAll})'

        return query

    def searchs_query(self):
        result = f"""
        SELECT
        A.출원번호,
        'Live' AS 상태,
        A.문헌번호,
        A.출원일자 AS 출원일,
        A.등록일자 AS 등록일,
        A.공개일자 AS 공개일,
        A.발명의명칭,
        K.우번1 AS 우선권주장출원일1,
        trim(regexp_replace(regexp_replace(regexp_replace(regexp_replace(B.요약, '<[^>]+>', '', 'g'), '[\(\[].*?[\)\]]','', 'g'), '[^[:alnum:],/.;:]',' ','g'),'\s+',' ','g')) AS 요약,
        trim(regexp_replace(regexp_replace(regexp_replace(regexp_replace(C.청구항, '<[^>]+>', '', 'g'), '[\(\[].*?[\)\]]','', 'g'), '[^[:alnum:],/.;:]',' ','g'),'\s+',' ','g')) AS 청구항,
        D."출원인1", D."출원인국가코드1", F."발명자1", F."발명자국가코드1",
        H."IPC코드",
        "요약tsv",
        "청구항tsv",
        ( 'english', coalesce(D.출원인1,'')) || to_tsvector ( 'simple', coalesce(D.출원인1,'')) || to_tsvector ( 'english', coalesce(E.출원인2,'')) || to_tsvector ( 'simple', coalesce(E.출원인2,'')) AS "출원인tsv", 
        to_tsvector ( 'english', coalesce(F.발명자1,'')) || to_tsvector ( 'english', coalesce(G.발명자2,'')) || to_tsvector ( 'simple', coalesce(F.발명자1,'')) || to_tsvector ( 'simple', coalesce(G.발명자2,'')) AS "발명자tsv", 
        요약·청구항tsv, 
        concat_ws(' ', A.문헌번호, A.공보번호,  A.등록번호, A.공개번호, A.출원번호,  A.국제공개번호, K.우번1, K.우번2, K.우번3, K.우번4, K.우번5, K.우번6, K.우번7, K.우번8, K.우번9, K.우번10) AS NUM_SEARCH 
        FROM
           "US_BIBLIO" 
            A LEFT JOIN ( SELECT 문헌번호, 초록 AS 요약 FROM "US_ABSTRACT") B ON A.문헌번호 = B.문헌번호
            LEFT JOIN ( SELECT 문헌번호, 청구항 FROM "US_CLAIM") C ON A.문헌번호 = C.문헌번호
            LEFT JOIN ( SELECT 문헌번호, 이름 AS "출원인1", 국적 AS "출원인국가코드1" FROM "US_REL_PSN" WHERE "구분" = '출원인' AND "일련번호" = 1 ) D ON A.문헌번호 = D.문헌번호
            LEFT JOIN ( SELECT 문헌번호, 이름 AS "출원인2", 국적 AS "출원인국적2" FROM "US_REL_PSN" WHERE "구분" = '출원인' AND "일련번호" = 2 ) E ON A.문헌번호 = E.문헌번호	
            LEFT JOIN ( SELECT 문헌번호, 이름 AS "발명자1", 국적 AS "발명자국가코드1" FROM "US_REL_PSN" WHERE "구분" = '발명자' AND "일련번호" = 1 ) F ON A.문헌번호 = F.문헌번호
            LEFT JOIN ( SELECT 문헌번호, 이름 AS "발명자2", 국적 AS "발명자국적2" FROM "US_REL_PSN" WHERE "구분" = '발명자' AND "일련번호" = 2 ) G ON A.문헌번호 = G.문헌번호
            LEFT JOIN ( SELECT 문헌번호, "IPC코드" FROM "US_IPC" WHERE 일련번호 = 1 ) H ON A.문헌번호 = H.문헌번호
            LEFT JOIN ( SELECT 문헌번호, "CPC코드" FROM "US_CPC" WHERE 일련번호 = 1 ) I ON A.문헌번호 = I.문헌번호
            LEFT JOIN ( SELECT 문헌번호, "UPC코드" FROM "US_UPC" WHERE 일련번호 = 1 ) J ON A.문헌번호 = J.문헌번호
            LEFT JOIN "US_TSV" I ON A.문헌번호 = I.문헌번호
            LEFT JOIN ( select * from crosstab(
        'SELECT 문헌번호, 일련번호, 우선권주장출원번호 FROM "US_PRIR" order by 1,2'
        ) as ct(문헌번호 varchar, 우번1 varchar, 우번2 varchar, 우번3 varchar, 우번4 varchar, 우번5 varchar, 우번6 varchar, 우번7 varchar, 우번8 varchar, 우번9 varchar, 우번10 varchar) ) K ON A.문헌번호 = K.문헌번호        
        """
        return result        

    def date_query(self):

        if not self._dateType or not (self._startDate or self._endDate):
            return ""

        result = ""
        foo = { 'PRD': '우선권주장출원일1', 'PD': '공개일' , 'FD': '등록일', 'AD': '출원일' }
        dateType = foo[self._dateType]

        if self._startDate and self._endDate:
            result += (self._dateType + " >= '" + self._startDate + "' and " + self._dateType + " <= '" + self._endDate + "' and ")
        if self._startDate and not self._endDate:
            result += (self._dateType + " >= '" + self._startDate + "' and ")
        if not self._startDate and self._endDate:
            result += (self._dateType + " <= '" + self._endDate + "' and ")

        return result

    def status_query(self):

        if not self._status or self._status == '전체':
            return ""

        result = " ("
        for k in re.split(r' and | or ', self._status): # 출원 or 공개 ...
            result += "등록사항 ='" + k + "' or "

        result = remove_tail(result, " or ")

        return result + ") and "

    def iptype_query(self):     
        # 특허공개 or 특허등록
        if not self._ipType or self._ipType == '전체':
            return ""    

        result = " ("
        # 등록db가 없으므로 공개로 통일
        if "특허" in self._ipType:
            result += "cast(출원번호 as text) LIKE '1%' or "
        if "실용" in self._ipType:
            result += "cast(출원번호 as text) LIKE '2%' or "

        result = remove_tail(result, " or ")

        return result + ") and "        

    def tsquery_keywords(self, keyword="", mode="terms"):

        if not keyword:
            return None    

        adjHaveOnlyZero='( adj[0]\d* )'
        adjOnly = '( adj )'
        adjZeroGroup = r'|'.join((adjHaveOnlyZero,adjOnly))
        adjHaveNumberExecptZero=r' adj([1-9]\d*) '
        adjSpace = r'(\([-!:*ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+) ([-!:*ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+\))'

        nearHaveNumberExecptZero = '([-!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+) near([1-9]\d*) ([-!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+)'
        nearHaveOnlyZero='([-!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+) near[0]\d* ([-!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+)'
        nearOnly='([-!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+) near ([-!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+)' 

        removeDate = r'( and \(\@[PRD|AD|PD|FD].*\d{8}\))'
        removeAP = r'( and \([ -!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+\).AP)'
        removeINV = r'( and \([ -!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+\).INV)'
        removeGroup = r'|'.join((removeDate,removeAP,removeINV))

        _removeDate = r'(\(\@[PRD|AD|PD|FD].*\d{8}\))'
        _removeAP = r'(\([ -!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+\).AP)'
        _removeINV = r'(\([ -!:*|ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+\).INV)'
        _removeGroup = r'|'.join((_removeDate,_removeAP,_removeINV))      

        def convert_symbols(v):
            result = v
            if v.startswith("-") or ' or -' in v:
                result = v.replace("-", "!")
            # convert nagative not to !
            if v.startswith("not ") or ' or not ' in v:
                result = v.replace("not ", "!")
            # convert wildcard * to :*
            if v.endswith("*") or '*' in v:
                result = v.replace("*", ":*")
            return result

        def re_sub(reg, to, val):
            return re.sub(reg, to, val, flags=re.IGNORECASE)

        def removeOuterParentheses(S: str) -> str:
            stack = []
            res = ''
            for i in range(len(S)):
                stack.append(S[i])
                if stack.count('(') == stack.count(')'):
                    res+=''.join(stack[1:-1])
                    stack = []
            if res == '':
                return S               
            return res

        def keepParantheses(v):
            pattern = re.compile("\||\<[\d+|-]\>")
            return re.search(pattern, v)


        # caller
        if mode == 'terms':
            keyword = re_sub(removeGroup, r"", keyword)
            keyword = re_sub(_removeGroup, r"", keyword)

        elif mode == 'person':
            keyword = re_sub(removeDate, r"", keyword)
            keyword = re_sub(_removeDate, r"", keyword)

        result = ''
        
        for v in re.split(" and ", keyword, flags=re.IGNORECASE):
            v = convert_symbols(v)
            v = re_sub(' or ', r"|", v)
            if '|' in v:
                v = removeOuterParentheses(v)
                strOr = '('
                for _v in re.split("\|", v):
                    _v = re_sub(adjZeroGroup, r"<->", _v)
                    _v = re_sub(adjHaveNumberExecptZero, r"<\1>", _v)
                    _v = re_sub(nearHaveNumberExecptZero, r"(\1<\2>\3|\3<\2>\1)", _v)
                    _v = re_sub(nearHaveOnlyZero, r"(\1<->\2|\2<->\1)", _v)
                    _v = re_sub(nearOnly, r"(\1<->\2|\2<->\1)", _v)
                    _v = re_sub(adjSpace, r"\1<->\2", _v)
                    _v = removeOuterParentheses(_v) if not keepParantheses(_v) else _v
                    _v = re_sub(' ', r"&", _v)
                    strOr += ("".join(str(_v)) + "|")
                strOr = remove_tail(strOr,"|")
                result += ("".join(str(strOr)) + ")&")
            else:
                v = re_sub(adjZeroGroup, r"<->", v)
                v = re_sub(adjHaveNumberExecptZero, r"<\1>", v)
                v = re_sub(nearHaveNumberExecptZero, r"(\1<\2>\3|\3<\2>\1)", v)
                v = re_sub(nearHaveOnlyZero, r"(\1<->\2|\2<->\1)", v)
                v = re_sub(nearOnly, r"(\1<->\2|\2<->\1)", v)                            
        
                v = re_sub(adjSpace, r"\1<->\2", v)
                v = removeOuterParentheses(v) if not keepParantheses(v) else v
                v = re_sub(' ', r"&", v)
                result += ("".join(str(v)) + "&")

        result = remove_tail(result,"&")

        if not result:
            return None

        return result         
         
        
   