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

class IpSearchs:

    def __init__(self, request, mode):
        self._request = request
        self._mode = mode
        self._emptyRows = []
        self._queryCols = '등록사항, 발명의명칭, 출원번호, 출원일, 출원인1, 출원인코드1, 출원인국가코드1, 발명자1, 발명자국가코드1, 등록일, 공개일, ipc코드, 요약, 청구항'  
        
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

        # self._redis_map = { 
        #     'searchs' : 'pagingRows',
        #     'query' : 'query',
        #     'nlp' : 'nlpRows',
        #     'matrix' : 'mtxRows',
        #     'indicator' : 'indRows',
        #     'visualNum' : 'visualNum',
        #     'visualClassify' : 'visualClassify',
        #     'visualIpc' : 'visualIpc',
        #     'visualPerson' : 'visualPerson',
        # }
        self._rowsKey = f'{mainKey}¶rows'
        self._queryKey = f'{mainKey}¶query'
        self._mainKey = f'{mainKey}¶{self._mode}'
        self._subKey = f'{subKey}¶{self._mode}'
        # self._mainKey = f'{mainKey}¶{self._redis_map[self._mode]}'
        # self._subKey = f'{subKey}¶{self._redis_map[self._mode]}'

        self.redis_rows()
        print('mode is ...', self._mode)
        command = {
            'searchs' : self.redis_rows,
            'query' : self.redis_visual,
            'nlp' : self.redis_visual,
            'matrix' : self.redis_visual,
            'indicator' : self.redis_visual,            
            'visualNum' : self.redis_visual,
            'visualIpc' : self.redis_visual,
            'visualPerson' : self.redis_visual,
            'visualClassify' : self.redis_visual,
            # 'wordcloud' : self.redis_wordcloud,
        }   
        return command[self._mode]()          

        # try:
        #     context = cache.get(self._mainKey)
        #     if context:
        #         print(f'load {self.__class__.__name__} mainkey redis', self._mode)
        #         return context
        #     _context = cache.get(self._subKey)
        #     if _context:
        #         print(f'load {self.__class__.__name__} subkey redis', self._mode)
        #         return _context
        # except (KeyError, NameError, UnboundLocalError):
        #     pass

    def load_params(self):
        self._searchVolume = self._params.get('searchVolume','요약·청구항') or '요약·청구항'
        for key in ['searchNum','searchText','inventor','assignee','dateType','startDate','endDate','status','ipType']:
            setattr(self, '_%s' % key, self._params.get(key,None) or None)
        return    

    def load_rows(self):
        ''' deprecated ...'''
        self.redis_rows()

    def redis_rows(self):
        try:
            context = cache.get(self._rowsKey)            
            if context:
                print(f'load {self.__class__.__name__} rowsKey redis')
                self._rows = context
        except (KeyError, NameError, UnboundLocalError):
            pass

    def redis_visual(self):
        try:
            context = cache.get(self._subKey)
            if context:
                print(f'load {self.__class__.__name__} subKey redis', self._mode)
                setattr(self, '_%s' % self._mode, context)
        except (KeyError, NameError, UnboundLocalError):
            pass                       



    # async def run_query(self):
    #     try:
    #         getattr(self, '_rows')
    #         print(' _rows exist', self._mode)
    #         return self._rows                
    #     except AttributeError: 
    #         if not cache.get(self._queryKey):
    #             cache.set(self._queryKey, True, CACHE_TTL)
    #             results = await sync_to_async(self.query_execute)()
    #             print('still execute query ', self._mode)
    #             self._rows = result
    #     finally:
    #         return self._rows

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

        query = f'select count(*) over () as cnt, ts_rank("{self._searchVolume}tsv",to_tsquery(\'{queryTextTerms}\')) AS rank, {self._queryCols} FROM kr_tsv_view WHERE ({whereAll})'

        return query

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
        # mode = snake_to_camel(self._mode)
        foo = self._subParams["menuOptions"]["tableOptions"]["mainTable"]
        pageIndex = foo.get('pageIndex', 0)
        pageSize = foo.get('pageSize', 10)
        self._sortBy = foo.get('sortBy', [])    

        # Add offset limit
        self._offset = pageIndex * pageSize
        self._limit = pageSize        
        return 

    def query_chioce(self):
        result = self.generate_num_querykey() if self._searchNum else self.generate_text_query()
        return result      

    def query_execute(self):
        query = self.query_chioce()  

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

    def searchs(self):

        self.table_options()

        self._orderby_clause = add_orderby(self._sortBy)

        try:
            getattr(self, '_rows')
            print('_rows exist')
        except AttributeError:
            self._rows = self.query_execute()  
            print('_rows not exist to execute query')        

        return self.paging_rows()

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
        result = self.make_vis_ipc(self.create_empty_rows())          
        return self.save_redis_main(result)

    def vis_cla(self):
        result = self.make_vis_cla(self.create_empty_rows())          
        return self.save_redis_sub(result)

    def vis_per(self):
        result = self.make_vis_per(self.create_empty_rows())          
        return self.save_redis_main(result)

    def mtx_rows(self):
        result = self.make_mtx_rows(self.create_empty_rows())
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
        PU = make_each_category_dict(flag=None)
        PP = make_each_category_dict(flag='1')
        UP = make_each_category_dict(flag='2')
        key = '등록일'
        PR = make_each_category_dict(flag='1')
        UR = make_each_category_dict(flag='2')    

        entities = [ PU, PP, UP, PR, UR ]
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
         
        
   