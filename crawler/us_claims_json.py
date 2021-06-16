
import psycopg2
from psycopg2.extensions import register_adapter
from psycopg2.extras import Json
register_adapter(dict, Json)

from contextlib import contextmanager
import re
from bs4 import BeautifulSoup
import json

from timeout_decorator import timeout, TimeoutError

import sys
import time
import threading
import psutil

# 000003781913A1

class ClaimJson:

    def __init__(self):
        self._chioce_server = 'main'
        self._limit_block = 1000
        self._filepath = '/home/btowin/techvisor-backend/crawler/us_claim_number.txt'
        self._presumed_list = ['according to claim','in any one of the preceding claims',' any one of claims','in either claim','as in claim', 'in any of the preceding cliams','in one of claims','in any preceding claim','in any of claims','in any one of claims','as claimed in claim','The structure of claim', 'as defined in claim','The device of claim', 'of claim', 'in claim']

        
        self.set_up()

    def set_up(self):
        self.load_appno_from_file()

        self.bulk_data_execute()
        
        self._last_appno = str(self._rowdata[-1][0])

        self.enrich_claim()

        self.update_db()

        self.save_appno_to_file()

    @contextmanager
    def connect(self):
        if self._chioce_server == 'sub':
            new_params = {
            "host": "192.168.0.50",
            "database": "techvisor",
            "user": "postgres",
            "password": "btw*0302",
            "port": "5433"
            }
        if self._chioce_server == 'main':
            new_params = {
            "host": "192.168.0.40",
            "database": "techvisor",
            "user": "postgres",
            "password": "btw*0302",
            "port": "5433"
            }
        conn_params = {k: v for k, v in new_params.items() if v}
        connection = psycopg2.connect(**conn_params)        
        try:
            yield connection
        finally:
            connection.close()
        return

    def load_appno_from_file(self):
        f = open(self._filepath, 'r')
        self._appno = f.read()
        f.close()
        return

    def save_appno_to_file(self):
        f = open(self._filepath, 'w')
        f.write(str(self._last_appno))
        f.close()
        return

    def bulk_data_execute(self):
        with self.connect() as connection:
            with connection.cursor() as cursor:
                query = f"""select 문헌번호, 청구항 from "US_CLAIM" WHERE 문헌번호 > $${str(self._appno)}$$ ORDER BY 문헌번호 ASC LIMIT {str(self._limit_block)} OFFSET 0"""
                cursor.execute(query)
                self._rowdata = cursor.fetchall()
        return
 
    def update_db(self):
        with self.connect() as connection:
            with connection.cursor() as cursor:
                # CONFLICT관련 오류 ; 청구항 field unique 해야함
                upsert_sql = '''
                    INSERT INTO "US_CLAIM_JSON" (문헌번호, 청구항)
                    VALUES (%s, %s::JSON)
                    ON CONFLICT (문헌번호) DO UPDATE SET
                    청구항 = EXCLUDED.청구항;
                    '''
                cursor.executemany(upsert_sql, self._records)
                connection.commit()
        return

    def enrich_claim(self):
        self._records = [[x if i == 0 else Json(self.parse_claims(x)) for i, x in enumerate(row)] for row in self._rowdata]
        return
                 
    def parse_claims(self, text):
        def remove_tags(text):
            TAG_RE = re.compile(r'<[^>]+>')
            return TAG_RE.sub('', str(text))

        def trimming(data):
            return [x.strip() for x in data]
            
        # @timeout(0.4, use_signals=False)
        def cutting_claim(data):
            # ([0-9]+. [A-Z])을 기준으로 자름.
            # result = list(re.findall(r'\d+.*?(?=[0-9]+[\.]|\.$)', data, re.MULTILINE))
            result = list(re.findall(r'\d+.*?(?=[0-9]+[\.] [A-Z]|\.$)', data, re.MULTILINE))
            return trimming(result)        

        def claim_type_check(data):
            if any(x in data for x in self._presumed_list):
                return "dep"
            else:
                if self._rep:
                    self._rep = False            
                    return "rep"
                return 'ind'

        def claim_num_check(data):
            result = re.search('^([0-9]+)[\.]', data)
            if result:
                return result.group(1)
            return None

        def header_exist():                
            # header split if exist
            # if ":" in text:
            #     header, data = text.split(":",1)
            #     return [header + ':', data]
            if text[0] != "1" and "1" in text:
                header, data = text.split("1",1)
                return [header, '1' + data]
            return [None, text]

        def dict_to_str(self, result):
            return json.dumps(result, ensure_ascii = False)            

        def claim_structure(data):
            try:
                if bs.find("CLM"):
                    result["type"], result["claims"] = self.claim_type_a()
                    return self.dict_to_str(result)
                # elif bs.find("claims") and len(bs.find("claims")) != 0:
                #     result["type"], result["claims"] = self.claim_type_b()
                #     return dict_to_str(result)
                # elif bs.find("claim") and len(bs.find("claim")) != 0:

                #     result["type"], result["claims"] = self.claim_type_c()
                #     return dict_to_str(result)
                else:
                    return None
            except AttributeError:
                return None

        # caller start    

        if not text:
            return []

        result = []

        bs = BeautifulSoup(text, "lxml")  # case-insensitive
        
        self.claim_structure(bs)

        text = remove_tags(text)
        header, data = header_exist()

        # try:
        #     bs = cutting_claim(data)
        # except TimeoutError:
        #     print(f'{self._last_appno} REGEX TIMEOUT ERROR: can not parse CLAIM')
        #     return result

        bs = cutting_claim(data)

        self._rep = True # 첫 독립항은 'rep' 대표청구항으로 표시
        if header:
            result.append({
                'no' : 0,
                'type' : 'header',
                'claim' : header.strip()
            })
        if bs:
            for idx, foo in enumerate(bs):
                checkNo = claim_num_check(foo) if claim_num_check(foo) else idx + 1
                checkType = claim_type_check(foo)
                result.append({
                    'no' : checkNo,
                    'type' : checkType,
                    "claim": bs[idx]
                })
                
        return result



    def check_dot(data):
        ''' 마지막 숫자dot or 앞에 공백 제거 '''
        return data.strip()
        # m = re.search(r'[\d+.]$', data)
        # return re.sub('\\d+\\.$|^\\s+', '', data)
        # return re.sub(r'[\d]+\.$|^[\s]+', '', data.strip())
        # return m.group() if m is not None else data



def main_caller(repeat_cnt = 0):
    start_time = time.time()

    foo = ClaimJson()

    memoryUse = psutil.virtual_memory()[2]

    print(
        "{0}. {1} {2} {3} success --- {4} 초 ---".format(
            str(repeat_cnt),
            time.strftime('%H:%M', time.localtime(time.time())), 
            str(memoryUse)+'%',
            str(foo._last_appno),
            round(time.time() - start_time)
        )
    )
    repeat_cnt += 1

    time.sleep(0.2)
    threading.Timer(1, main_caller(repeat_cnt)).start()
            
    print('----------------------')
    print('done')
    return

if __name__ == "__main__":
    sys.setrecursionlimit(5000)
    main_caller()



           

