# 해외 특허  - 대표항· 독립항 db 생성
import psycopg2
from psycopg2.extensions import AsIs
import psutil
import time
import threading
import sys
import re
import json

presumed_list = ['according to claim','in any one of the preceding claims',' any one of claims','in either claim','as in claim', 'in any of the preceding cliams','in one of claims','in any preceding claim','in any of claims','in any one of claims','as claimed in claim','The structure of claim', 'as defined in claim','The device of claim', 'of claim', 'in claim']

def connect():
    connection = psycopg2.connect(
        host="localhost", database="techvisor", user="postgres", password="btw*0302", port="5433"
    )
    return connection

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

# dt = datetime.utcnow()



def save_claims(appNo, data):
    data = json.dumps(data)
    try:
        with connect() as connection:
            with connection.cursor() as cursor:          
        
                query= f' INSERT INTO "US_CLAIM_FORM" (문헌번호, 청구항) VALUES ( $${appNo}$$, $${data}$$)'
                cursor.execute(query)
                connection.commit()

    except (Exception, psycopg2.Error) as error :
        if(connection):
            print("Failed to insert record into US_CLAIM_FORM table", error)

    finally:
        if(connection):
            cursor.close()
            connection.close()

def parse_claims(appNo, text):

    result = {"count": 0, "claims" : [], "type" : []}
    # ex. result = {"count": 11, "claims" : ['', ...rest], "type" : ['Ind.','Dep.','Dep.','Dep.','Dep.','Ind.', ...rest]}

    # TODO dependency 고도화 ; ex. result = {"count": 11, "claims" : ['', ...rest], "type" : ['0','1','2','2|3','4','5','4|5|6','7','0','2','1&9']}
       
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

def analyze_claim(data):
    # return sent_tokenize(data)
    result = list(re.findall(r'\d+.*?(?=[0-9]+[\.]|\.$)', data, re.MULTILINE))
    # result = list(re.findall(r'.*?\d+.*?(?=[0-9]+[\.]|\.$)', data, re.MULTILINE))
    # result = list(re.findall(r'\d+.*?(?=\d+\.])|\d+.*?\.$', data, re.MULTILINE))
    # result = list(re.findall(r'\d+.*?(?=[0-9]+[\.]|\.$)', data, re.MULTILINE))
    # result = list(re.findall(r'.*?[a-z].*?[0-9a-z][\?\.\!]+', data))
    # result = list(re.findall(r'[\d]+\. .*?(?=([\d]+\.)|($))', data))
    return [x.strip() for x in result]

def check_dot(data):
    ''' 마지막 숫자dot or 앞에 공백 제거 '''
    return data.strip()
    # m = re.search(r'[\d+.]$', data)
    # return re.sub('\\d+\\.$|^\\s+', '', data)
    # return re.sub(r'[\d]+\.$|^[\s]+', '', data.strip())
    # return m.group() if m is not None else data

def depenency_claim(data):
    """ 독립항, 종속항 판단 
        TODO: claim dependency 고도화 분석 필요 ex. claim no. 6 -> Depends from 2, 3, or 5 
    """

    result = []
    for foo in data:
        if any(x in foo for x in presumed_list):
            result.append("Dep.")
            continue
        else:            
            result.append("Ind.")        
            continue
    # for claim in data:
    #     for phrase in presumed_phrase:
    #         if phrase in claim:
    #             result.append("Dep.")
    #             continue

    #     return result.append("Ind.")

    return result    

def main_def(repeat_cnt = 0):
    """ 메인 def """

    start_time = time.time()

    startNo = 100 # 범위

    #######################
    # file에 endNo 읽기
    #######################
    f = open("/home/btowin/downloads/crawl_txt/appNo.txt", "r")
    appNo = f.read()
    f.close()

    with connect() as connection:
        with connection.cursor() as cursor:
            query = 'select 문헌번호, 청구항 from "US_CLAIM" WHERE 문헌번호 > $$' + str(appNo) + '$$ ORDER BY 문헌번호 ASC LIMIT ' + str(startNo) + ' OFFSET 0'
            cursor.execute(query)
            rawdata = cursor.fetchall()
            # cursor.close()
    connection.close()            

    lastAppNo = ""

    for row in rawdata:
        if row[0]:
            claims = parse_claims(row[0], row[1])

        if claims:
            save_claims(row[0], claims)

    lastAppNo = row[0]                    

    #######################
    # file에 endNo 저장
    #######################
    f = open("/home/btowin/downloads/crawl_txt/appNo.txt", "w")
    f.write(str(lastAppNo))
    f.close()

    # memory usage check
    memoryUse = psutil.virtual_memory()[2]         

    print(
        "{0}. {1} {2} {3} success --- {4} 초 ---".format(
            str(repeat_cnt), time.strftime('%H:%M', time.localtime(time.time())), 
            str(memoryUse)+'%',
            str(lastAppNo), round(time.time() - start_time)
        )
    )
    repeat_cnt += 1

    threading.Timer(1, main_def(repeat_cnt)).start()
            
    print('----------------------')
    print('done')    

if __name__ == "__main__":
    # request = int(sys.argv[1])
    # kr_tag(request)
    sys.setrecursionlimit(5000)
    main_def()