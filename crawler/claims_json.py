
import psycopg2
from contextlib import contextmanager
import re
from bs4 import BeautifulSoup
import json

import sys
import time
import threading
import psutil

# 시작 기준값 1009880005251

#       21.03.09    /   21.03.15     /    21.03.17
# 시작    09:50           09:39             08:53
# 종료    14:58           14:58             14:09
# 개수  4,050,200       3,989,470         4,151,977

class ClaimJson:

    def __init__(self):
        self._chioce_server = 'main'
        self._limit_block = 1000
        self._filepath = '/home/btowin/techvisor-backend/crawler/claim_number.txt'
        
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
                query = "select 출원번호, 청구항 from 공개청구항 WHERE 출원번호 > " + str(self._appno) + "ORDER BY 출원번호 ASC LIMIT " + str(self._limit_block) + " OFFSET 0"
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
                 
    def parse_claims(self, xmlStr=""):
        """ 비정형 청구항을 bs를 이용하여 처리 """

        if not xmlStr:
            return None

        def parse_typo(result):
            """ 오타 정리 """
            result = re.sub(r"<EMIID=", "<EMI ID=", result)  # tag 오타
            result = re.sub(r"<EMI .*?>", "", result)  # attribute 에 따옴표 없는 tree 에러 방지 - <EMI ID=8 HE=24 WI=164 FILE="kpo00008.TIF">
            result = re.sub(r"(<SB>|</SB>|<SP>|</SP>|<AP>|<U>|</U>|<SB\.| >|<PS>|</Sb>|)", "", result)  # <P></P> 사이에 문제되는 태그, 오타 태그 정리
            result = re.sub(r"(</SB)", "", result)  # <P></P> 사이에 문제되는 태그, 오타 태그 정리 2
            result = re.sub(r"</p>", "</P>", result)
            result = re.sub(r".TIF<", '.TIF"><', result)  # FILE="kpo00001.TIF</P>
            return result

        def cliam_type_check(idx, val):
            """ 독립항, 종속항, 삭제항 판단 """
            re_range = idx + 1
            test1 = re.findall("제\s?[0-9]{1,3}\s?항에", val)
            test2 = re.findall("청구항\s?[0-9]{1,3}\s?에", val)
            test3 = re.findall("[0-9]{1,3}\s?항에", val)
            test4 = re.findall("제\s?[0-9]{1,3}\s?항의", val)
            test5 = re.findall("삭제", val)
            
            if re_range == 1 or len(test1 + test2 + test3 + test4 + test5) == 0:
                return "ind"

            elif test5 or val in '삭제':
                return "del"

            elif re_range not in test1 or re_range not in test2 or re_range not in test3 or re_range not in test4:
                return "dep"

            else:
                return "ind"

        def claim_type_a():
            my_claim = []
            my_claim_type = []

            bs1 = bs.find("sdocl").find_all("claim")
            bs4 = bs.find("sdocl").find_all("p")  # 첫 p tag가 1항임
                
            if bs1:
                for idx, soup in enumerate(bs1):
                    p_txt = ""
                    t_txt = ""
                    soup_text = ""
                    t_txt = cliam_type_check(idx, soup.get_text())

                    for soup2 in soup.find_all("p"):
                        if '참고사항' not in soup2.text:
                            if p_txt:
                                p_txt += "\n" + soup2.get_text()
                            else:
                                p_txt += soup2.get_text()
                    my_claim.append(p_txt)
                    my_claim_type.append(t_txt)
            
            elif bs4:
                for idx, soup in enumerate(bs4):
                    p_txt = ""
                    t_txt = ""
                    soup_text = ""
                    soup_text = soup.get_text()
                    t_txt = cliam_type_check(idx, soup_text)
                    if "참고사항" not in soup_text:
                        if p_txt:
                            p_txt += "\n" + soup_text
                        else:
                            p_txt += soup_text
                        my_claim.append(p_txt)
                        my_claim_type.append(t_txt)
            return my_claim_type, my_claim


        def claim_type_b():
            my_claim = []
            my_claim_type = []

            bs1 = bs.find("claims").find_all("claim")
            for idx, soup in enumerate(bs1):
                p_txt = ""
                t_txt = ""
                t_txt = cliam_type_check(idx, soup.get_text())

                for soup2 in soup.find_all("p"):
                    if soup2:
                        if p_txt:
                            p_txt += "\n" + soup2.get_text()
                        else:
                            p_txt += soup2.get_text()
                
                my_claim.append(p_txt)
                my_claim_type.append(t_txt)
            return my_claim_type, my_claim


        def claim_type_c():
            my_claim = []
            my_claim_type = []

            temp = bs.find_all("claim", {"num": 1})
            bs1 = bs.find("claim-text") if temp else None
            bs2 = bs.find("p") if temp else None
            bs3 = bs.find_all("claim", {"n": 1})
            bs_list = bs.find_all("claim")
            if bs1:
                for idx, soup in enumerate(bs_list):
                    
                    bs_text = soup.find("claim-text")
                    # bs_amend = soup.find("claim_amend-text")
                    bs_amend = soup.find("amendstatus")
                    t_txt = ""

                    if bs_text:
                        my_claim.append(bs_text.get_text())
                        t_txt = cliam_type_check(idx, soup.get_text())
                        my_claim_type.append(t_txt)
                    elif bs_amend:
                        my_claim.append(bs_amend.get_text())
                        t_txt = cliam_type_check(idx, soup.get_text())
                        my_claim_type.append(t_txt)
            elif bs2:
                for idx, soup in enumerate(bs_list):
                    
                    p_txt = ""
                    t_txt = ""
                    bs_p = soup.find_all("p")
                    bs_amend = soup.find_all("amendstatus")
                    
                    if bs_p:
                        for soup2 in bs_p:
                            if soup2:
                                if p_txt:
                                    p_txt += "\n" + soup2.get_text()
                                else:
                                    p_txt += soup2.get_text()
                        t_txt = cliam_type_check(idx, p_txt)
                        my_claim.append(p_txt)
                        my_claim_type.append(t_txt)
                    # p 태그가 청구항내 복수개
                    else:
                        for soup2 in bs_amend:
                            if soup2:
                                if p_txt:
                                    p_txt += "\n" + soup2.get_text()
                                else:
                                    p_txt += soup2.get_text()
                        t_txt = cliam_type_check(idx, p_txt)
                        my_claim.append(p_txt)
                        my_claim_type.append(t_txt)
                    
            elif bs3:
                for idx, soup in enumerate(bs_list):
                    
                    p_txt = ""
                    t_txt = ""
                    bs_p = soup.find_all("p")
                    bs_amend = soup.find_all("amendstatus")

                    if bs_p:
                        for soup2 in bs_p:
                            if soup2:
                                if p_txt:
                                    p_txt += "\n" + soup2.get_text()
                                else:
                                    p_txt += soup2.get_text()
                                t_txt = cliam_type_check(idx, p_txt)            
                        my_claim.append(p_txt)
                        my_claim_type.append(t_txt)
                    # p 태그가 청구항내 복수개
                    else:
                        for soup2 in bs_amend:
                            if soup2:
                                if p_txt:
                                    p_txt += "\n" + soup2.get_text()
                                else:
                                    p_txt += soup2.get_text()
                                t_txt = cliam_type_check(idx, p_txt)            
                        my_claim.append(p_txt)
                        my_claim_type.append(t_txt)
                                            
            return my_claim_type, my_claim

        def dict_to_str(result):
            return json.dumps(result, ensure_ascii = False)
        # caller start                
        
        newStr = parse_typo(xmlStr) # typo
        bs = BeautifulSoup(newStr, "lxml")  # case-insensitive

        result = {"type": [], "claims": []}

        try:
            if bs.find("sdocl") and len(bs.find("sdocl")) != 0 and '참고사항' not in bs.find("sdocl").find("p").text:
                result["type"], result["claims"] = claim_type_a()
                return dict_to_str(result)
            elif bs.find("claims") and len(bs.find("claims")) != 0:

                result["type"], result["claims"] = claim_type_b()
                return dict_to_str(result)
            elif bs.find("claim") and len(bs.find("claim")) != 0:

                result["type"], result["claims"] = claim_type_c()
                return dict_to_str(result)
            else:
                return None
        except AttributeError:
            return None

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



           

