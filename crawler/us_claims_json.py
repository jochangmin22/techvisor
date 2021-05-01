
import psycopg2
from contextlib import contextmanager
import re
from bs4 import BeautifulSoup
import json

import sys
import time
import threading
import psutil

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
            "database": "dj11000",
            "user": "postgres",
            "password": "btw160302*",
            "port": "5432"
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

    def load_appno_from_file(self):
        f = open(self._filepath, 'r')
        self._appno = f.read()
        f.close()

    def save_appno_to_file(self):
        f = open(self._filepath, 'w')
        f.write(str(self._last_appno))
        f.close()

    def bulk_data_execute(self):
        with self.connect() as connection:
            with connection.cursor() as cursor:
                query = "select 문헌번호, 청구항 from US_CLAIM WHERE 문헌번호 > " + str(self._appno) + "ORDER BY 문헌번호 ASC LIMIT " + str(self._limit_block) + " OFFSET 0"
                cursor.execute(query)
                self._rowdata = cursor.fetchall()
 
    def enrich_claim(self):
        self._records = [[x if i == 0 else self.parse_claims(x) for i, x in enumerate(row)] for row in self._rowdata]

    def update_db(self):
        with self.connect() as connection:
            with connection.cursor() as cursor:
                upsert_sql = '''
                    INSERT INTO claims (출원번호, 청구항)
                    VALUES (%s, %s)
                    ON CONFLICT (출원번호) DO UPDATE SET
                    청구항 = EXCLUDED.청구항;
                    '''
                cursor.executemany(upsert_sql, self._records)
                connection.commit()
                 
    def parse_claims(self, appNo, text):
        def analyze_claim(data):
            result = list(re.findall(r'\d+.*?(?=[0-9]+[\.]|\.$)', data, re.MULTILINE))
            return [x.strip() for x in result]        

        def depenency_claim(data):
            result = []
            for foo in data:
                if any(x in foo for x in presumed_list):
                    result.append("dep.")
                    continue
                else:            
                    result.append("ind.")        
                    continue
            return result         

        result = {"count": 0, "claims" : [], "type" : []}
        
        if text:
            # header split
            if ":" in text:
                [ header, data ] = text.split(":",1)
            elif text[0] != "1":
                [ header, data ] = text.split("1",1)
            else:
                data = text            
                header = None

            bs = analyze_claim(data)
            if bs:
                result['count'] = len(bs)
                result['claims'] = bs
                result['type'] = depenency_claim(bs)

            if header:
                result['claims'].insert(0, header)            
                result['type'].insert(0, "header")            
                
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
            str(repeat_cnt), time.strftime('%H:%M', time.localtime(time.time())), 
            str(memoryUse)+'%',
            str(foo._last_appno), round(time.time() - start_time)
        )
    )
    repeat_cnt += 1

    time.sleep(0.2)
    threading.Timer(1, main_caller(repeat_cnt)).start()
            
    print('----------------------')
    print('done')

if __name__ == "__main__":
    sys.setrecursionlimit(5000)
    main_caller()



           

