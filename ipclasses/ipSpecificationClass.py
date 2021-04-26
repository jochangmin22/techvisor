from utils import request_data, redis_key, remove_tail, dictfetchall,  sampling, tokenizer, tokenizer_phrase, frequency_count
from django.core.cache import cache
from django.db import connection
from django.conf import settings
from django.http import JsonResponse
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
import re
import operator

from bs4 import BeautifulSoup

from ipclasses import IpSearch

class IpSpecification:

    def __init__(self, request, mode):
        self._request = request
        self._mode = mode

        self.set_up()

    def set_up(self):
        self._params, self._subParams = request_data(self._request)

        self._appNo = self._params.get('appNo','')  
        self._whereAppNo = f'WHERE "출원번호" = $${self._appNo}$$'

        mainKey, subKey = redis_key(self._request)
        self._mainKey = f'{mainKey}¶{self._mode}'

        try:
            context = cache.get(self._mainKey)
            if context:
                print('load mainKey redis', self._mode)
                self._rows = context
                return context
        except (KeyError, NameError, UnboundLocalError):
            pass

    def query_execute(self, key):
        command = { 'description': self.description_query, 'wordcloud': self.wordcloud_query}
        query = command[key]()

        with connection.cursor() as cursor:
            cursor.execute(
                "SET work_mem to '100MB';"
                + query
            )
            rows = dictfetchall(cursor)
            # rows = cursor.fetchall()
        try:
            result = rows[0]
        except IndexError:
            result = None    

        print('query execute: ', key)
        return result

    def setup_description(self):
        rows = self.query_execute(key = 'description')

        result = self.make_description(rows)
        cache.set(self._mainKey, result, CACHE_TTL)
        return result

    def make_description(self, result):
        try:
            rows = result["명세서"]
        except (IndexError, KeyError, TypeError ):        
            rows = None
        if not rows or rows == '<SDODE></SDODE>':
            return ['본문이 없습니다']

        text = self.typo_handle(rows) # fix typo
        bs = BeautifulSoup(text, "lxml")  # case-insensitive
        return self.description_no_attr_type(bs)  

    def setup_wordcloud(self):
        def make_dic_to_list_of_dic():
            try:
                return { 'name' : list(foo.keys()), 'value' : list(foo.values())}
            except AttributeError:
                return self._wordcloudEmpty    
        foo = self.wordcloud_extract()
        result = []
        result.append(make_dic_to_list_of_dic())
        cache.set(self._mainKey, result , CACHE_TTL)
        return result        

    def wordcloud_extract(self):
        rows = self.query_execute(key = 'wordcloud')            
        self.menu_option()
        bar = self.nlp_token(rows)         
        return frequency_count(bar, self._output)

    def menu_option(self):
        foo = self._subParams['menuOptions'][self._mode + 'Options']
        self._volume = foo.get('volume','')
        self._unit = foo.get('unit','')
        self._emergence = foo.get('emergence','빈도수')
        self._output = foo.get('output','')
        return                

    def nlp_token(self, nlpRows):

        def phrase_frequncy_tokenizer():
            return tokenizer_phrase(nlp_str)

        def phrase_individual_tokenizer():
            for foo in nlp_list:
                bar = remove_duplicates(tokenizer_phrase(foo))
                result.extend(bar)
            return result            

        def word_frequncy_tokenizer():
            return tokenizer(nlp_str)

        def word_individual_tokenizer():
            for foo in nlp_list:
                bar = remove_duplicates(tokenizer(foo))
                result.extend(bar)
            return result            

        # nlp_list = [d[self._volume] for d in nlpRows] # _voloume : '요약·청구항', '요약', '청구항',
        try:
            nlp_list = [nlpRows[self._volume]]
        except KeyError:
            nlp_list = None
        try:
            nlp_str = ' '.join(nlp_list)
        except TypeError:
            nlp_str = None

        result = []
        command = { '구문': { '빈도수':phrase_frequncy_tokenizer, '건수':phrase_individual_tokenizer }, '워드': { '빈도수' :word_frequncy_tokenizer, '건수':word_individual_tokenizer } }
        res = command[self._unit][self._emergence]()    
        res = [w.replace('_', ' ') for w in res]
 
        cache.set(self._mainKey, res, CACHE_TTL)
        return res        

       
    def description_query(self):
        return f"""SELECT 출원번호, 명세서 FROM "공개명세서" {self._whereAppNo}"""

    def wordcloud_query(self):
        result = f"""
        SELECT A.출원번호, trim(regexp_replace(regexp_replace(regexp_replace(regexp_replace(B.명세서, '<[^>]+>', '', 'g'), '[\(\[].*?[\)\]]','', 'g'), '[^[:alnum:],/.;:]',' ','g'),'\s+',' ','g')) AS 명세서, trim(regexp_replace(regexp_replace(regexp_replace(regexp_replace(C.요약, '<[^>]+>', '', 'g'), '[\(\[].*?[\)\]]','', 'g'), '[^[:alnum:],/.;:]',' ','g'),'\s+',' ','g')) AS 요약, D.청구항 FROM 
	    (SELECT 출원번호 FROM "공개서지정보" {self._whereAppNo}) A 
        LEFT JOIN 
	    (SELECT 출원번호, 명세서 FROM "공개명세서" {self._whereAppNo}) B
        ON A.출원번호 = B.출원번호        
        LEFT JOIN 
        (SELECT 출원번호, 초록 AS 요약 FROM "공개초록" {self._whereAppNo}) C 
        ON A.출원번호 = C.출원번호        
        LEFT JOIN 
        (SELECT 출원번호, 청구항 FROM "공개청구항JSON" {self._whereAppNo}) D 
        ON A.출원번호 = D.출원번호
        """
        return result        

    def typo_handle(self,result=""):
        """ 오타 정리 """
        result = re.sub(r"<EMIID=", "<EMI ID=", result)  # tag 오타
        result = re.sub(r"<EMI .*?>", "", result)  # attribute 에 따옴표 없는 tree 에러 방지 - <EMI ID=8 HE=24 WI=164 FILE="kpo00008.TIF">
        result = re.sub(r"(<SB>|</SB>|<SP>|</SP>|<AP>|<U>|</U>|<SB\.| >|<PS>|</Sb>|)", "", result
        )  # <P></P> 사이에 문제되는 태그, 오타 태그 정리
        result = re.sub(r"(</SB)", "", result)  # <P></P> 사이에 문제되는 태그, 오타 태그 정리 2
        result = re.sub(r"</p>", "</P>", result)
        result = re.sub(r".TIF<", '.TIF"><', result)  # FILE="kpo00001.TIF</P>
        return result        

    def description_no_attr_type(self, bs):
        result = []
        n_txt = ""
        soup = bs.find_all('p')
        for soup2 in soup:
            if soup2:
                s = self.replace_with_newlines(soup2)
                result.append(s)
        return result

    def replace_with_newlines(self,element):
        result = ''
        for elem in element.recursiveChildGenerator():
            if isinstance(elem, str):
                result += elem.strip()
            elif elem.name == 'br':
                result += '\n'
        return result  
