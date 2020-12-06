from __future__ import print_function
import argparse 
from bs4 import BeautifulSoup
import requests
import time
import sys
from datetime import date, timedelta
import psycopg2
import psutil



DATABASES = {
    "default": {
        "ENGINE": "postgresql",
        "NAME": "ipgrim",
        "USER": "ipgrim",
        "PASSWORD": "btw*0302",
        "HOST": "localhost",
        "PORT": "5433"
    }
}
def get_db_date_count(date):
    try:
        with connect() as connection:
            with connection.cursor() as cursor:      
                query ="select count(출원번호) cnt from 공개공보 where 공개일자::int = " + str(date) + ";"  
                cursor.execute(query)
                connection.commit()
                row = dictfetchall(cursor)
                return row[0]['cnt']

    except (Exception, psycopg2.Error) as error :
        if(connection):
            print("Failed", error)

    finally:
        if(connection):
            cursor.close()
            connection.close()
    return                     

def daterange(date1, date2):
    for n in range(int ((date2 - date1).days)+1):
        yield date1 + timedelta(n)       

def str2bool(v):
    if isinstance(v, bool):
       return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]    
      
def connect():
    connection = psycopg2.connect(
        host="localhost", database="ipgrim", user="ipgrim", password="btw*0302", port="5433"
    )
    return connection 
# 전체검색 
count_url = "http://plus.kipris.or.kr/kipo-api/kipi/patUtiModInfoSearchSevice/getAdvancedSearch"
# 서지
biblo_url = "http://plus.kipris.or.kr/kipo-api/kipi/patUtiModInfoSearchSevice/getBibliographyDetailInfoSearch"
service_key = "aPmTnAjtr4j82WWmpgi=DrmRSiJXXaxHZs1W34pssBQ="

def get_api_date_count(date):
    # url = count_url + '?applicationDate=' + str(date) + '~' + str(date) + '&patent=true&utility=true&numOfRows=1&ServiceKey=' + service_key
    url = count_url + '?openDate=' + str(date) + '~' + str(date) + '&patent=true&utility=true&numOfRows=1&ServiceKey=' + service_key
    html = requests.get(url)
    soup = BeautifulSoup(html.content, 'xml')
    totalCount = soup.find('totalCount').get_text()
    return totalCount

def get_public_application(date, count):


    # url = count_url + '?applicationDate=' + str(date) + '~' + str(date) + '&patent=true&utility=true&numOfRows=1&ServiceKey=' + service_key
    # count 228 / 20
    totalPage = int(count / 20)
    
    url = count_url + '?openDate=' + str(date) + '~' + str(date) + '&patent=true&utility=true&numOfRows=1&ServiceKey=' + service_key
    html = requests.get(url)
    soup = BeautifulSoup(html.content, 'xml')

    items = ['applicationNumber','applicationDate','openNumber','openDate','registerDate','registerNumber','publicationDate','publicationNumber','inventionTitle']
    item_names = ['출원번호','출원일자','공개번호','공개일자','등록번호','등록일자','공고번호','공고일자','발명의명칭(국문)']    
    # totalCount = soup.find('totalCount').get_text()
    # print(totalCount)
    return

# def crawl_public(date, count):
def crawl_public(**kwargs):
    keys = ['date','count']
    for key in kwargs.keys():
        if not key in keys:
            print("get_list() has no parameter \'"+key+"\'")
            return False
    # crtfc_key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&bgn_de=20200816&end_de=20201016&corp_cls=Y&page_no=1&page_count=100
    params = {**{'ServiceKey':service_key},**kwargs}
    items = ['applicationNumber','applicationDate','openNumber','openDate','registerDate','registerNumber','publicationDate','publicationNumber','','','','','','','','inventionTitle','','','registerStatus','','','','','','','']
    item_names = ['출원번호','출원일자','공개번호','공개일자','등록번호','등록일자','공고번호','공고일자','원출원번호','원출원일자','번역문제출일자','국제출원번호','국제출원일자','국제공개번호','국제공개일','발명의명칭(국문)','발명의명칭(영문)','최종처분내용','등록사항','심사청구여부','심사청구일자','청구항수','변경청구항수','출원구분','기술양도희망유무','기술지도희망유무']
    url = DART['dart_url'] + DART['oper_gong']
    res = requests.get(url,params=params)
    # print(res.text)
    json_dict = json.loads(res.text)

    data = []
    if json_dict['status'] == "000":
        for line in json_dict['list']:
            data.append([])
            for itm in items:
                if itm in line.keys():
                    data[-1].append(line[itm])
                else: data[-1].append("")
        df = pd.DataFrame(data,columns=item_names)
        return json_dict['total_page'], df
    elif json_dict['status'] == "013": # {"status":"013","message":"조회된 데이타가 없습니다."}
        return 0, None
    else:
        return 0, df # TODO

def crawl_biblo(**kwargs):
    keys = ['applicationNumber']
    for key in kwargs.keys():
        if not key in keys:
            print("get_list() has no parameter \'"+key+"\'")
            return False
    # crtfc_key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&bgn_de=20200816&end_de=20201016&corp_cls=Y&page_no=1&page_count=100
    params = {**{'ServiceKey':service_key},**kwargs}
    items = ['applicationNumber','applicationDate','openNumber','openDate','registerDate','registerNumber','publicationDate','publicationNumber','originalApplicationNumber','originalApplicationDate','translationSubmitDate','internationalApplicationNumber','internationalApplicationDate','internationOpenNumberer','internationOpenDate','inventionTitle','inventionTitleEng','finalDisposal','registerStatus','originalExaminationRequestFlag','originalExaminationRequestDate','claimCount','','applicationFlag','','']
    item_names = ['출원번호','출원일자','공개번호','공개일자','등록번호','등록일자','공고번호','공고일자','원출원번호','원출원일자','번역문제출일자','국제출원번호','국제출원일자','국제공개번호','국제공개일','발명의명칭(국문)','발명의명칭(영문)','최종처분내용','등록사항','심사청구여부','심사청구일자','청구항수','변경청구항수','출원구분','기술양도희망유무','기술지도희망유무']

    # http://plus.kipris.or.kr/kipo-api/kipi/patUtiModInfoSearchSevice/getBibliographyDetailInfoSearch?applicationNumber=1020050050026&ServiceKey=서비스키
    url = DART['dart_url'] + DART['oper_gong']
    res = requests.get(url,params=params)
    # print(res.text)
    json_dict = json.loads(res.text)

    data = []
    if json_dict['status'] == "000":
        for line in json_dict['list']:
            data.append([])
            for itm in items:
                if itm in line.keys():
                    data[-1].append(line[itm])
                else: data[-1].append("")
        df = pd.DataFrame(data,columns=item_names)
        return json_dict['total_page'], df
    elif json_dict['status'] == "013": # {"status":"013","message":"조회된 데이타가 없습니다."}
        return 0, None
    else:
        return 0, df # TODO

def main_def():
    """ 메인 def """
    parser = argparse.ArgumentParser()
    parser.add_argument('--start', type=int, default=0, help="What is the start number?")
    parser.add_argument('--end', type=int, default=0, help="What is the end number?")
    parser.add_argument('--clear', type=str2bool, nargs='?', const=True, default=False, help='Should I truncate the Table before execution?')
    parser.add_argument('--entire', type=str2bool, nargs='?', const=True, default=False, help='Do you want to crawl the entire company regardless of start, end number')          

                       
    args = parser.parse_args()

    start = args.start
    end = args.end
    clear = args.clear
    entire = args.entire


    data = str(start)
    start_dt = date(int(data[0:4]), int(data[4:6]), int(data[6:8]))

    data = str(end)
    end_dt = date(int(data[0:4]), int(data[4:6]), int(data[6:8]))

    for dt in daterange(start_dt, end_dt):
        start_time = time.time()
        my_date = dt.strftime("%Y%m%d")  
        db_count = get_db_date_count(my_date)
        api_count = get_api_date_count(my_date)
        text = 'db : ' + str(db_count) + ' api : ' + str(api_count)
        if int(db_count) >= int(api_count): # db의 출원일자 cnt와 api의 출원일자 cnt가 같으면 pass
            print(str(my_date) + ".",  text, " : 자료 일치 통과")
            continue
        # 2019-08-13
        get_public_application(my_date, api_count)
        time.sleep(1)
        # memory usage check
        memoryUse = psutil.virtual_memory()[2] 

        print(
            "{0}. {1} {2} {3} success --- {4} 초 ---".format(
                str(my_date),
                str(text),
                time.strftime('%H:%M', time.localtime(time.time())), 
                str(memoryUse)+'%',
                round(time.time() - start_time,1)
            )
        )            
            
    print('----------------------')
    print('done')


if __name__ == "__main__":
    sys.setrecursionlimit(5000)
    main_def()
