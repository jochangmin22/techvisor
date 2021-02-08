import requests
import time
import json
import sys
import os
import argparse

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'techvisor.settings')

import django
django.setup()

from company.models import Corp_intrinsic_value
from search.models import *
from django.conf import settings

corp_data_list = Listed_corp.objects.all()[1845:1860]

def str2bool(v):
    if isinstance(v, bool):
       return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')

def get_grade():
    url = 'https://api.kisline.com/nice/sb/api/btowin/emEprCrIfo/companyEvalGradeHist?kiscode='

    headers = {
        'x-ibm-client-id' : settings.NICE_ID,
        'x-ibm-client-secret' : settings.NICE_KEY,
        'accept' : 'application/json'
    }

    # corp_data_list = Listed_corp.objects.all()
    for corp_data in corp_data_list.iterator():
        time.sleep(0.3)
        req = requests.get(url + corp_data.종목코드, headers = headers)
        res = req.json()

        grade_data = res['items']['item']

        if not grade_data:
            pass

        else:
            if corp_data.kiscode:
                if not Corp_eval_grade_hist.objects.filter(kiscode = corp_data.kiscode).exists():
                    Corp_intrinsic_value.objects.create(
                        kiscode = corp_data.kiscode,
                        기업평가등급 = grade_data
                    )
                else:
                    Corp_intrinsic_value.objects.update(
                        기업평가등급 = grade_data
                    )

## 2월치 사용횟수 다 사용함
def main_def():
    parser = argparse.ArgumentParser()
    parser.add_argument('--grade', type = str2bool, nargs = '?', const = True, default = False, help = 'Update Corp_grade Data')

    args = parser.parse_args()

    grade = args.grade

    url = 'https://api.kisline.com/nice/sb/api/btowin/emEprOtlIfo/kiscode?stockcd='

    headers = {
        'x-ibm-client-id' : settings.NICE_ID,
        'x-ibm-client-secret' : settings.NICE_KEY,
        'accept' : 'application/json'
    }

    # corp_data_list = Listed_corp.objects.all()
    for corp_data in corp_data_list.iterator():
        time.sleep(0.2)
        # print('corp_data : ', corp_data)
        if not corp_data.kiscode:
            req = requests.get(url + corp_data.종목코드, headers = headers)
            res = req.json()
            try:
                kiscode = res['items']['item'][0]['kiscode']
                # print('No Error : ', res)
                
                if not kiscode:
                    pass

                else:
                    if Listed_corp.objects.filter(kiscode = kiscode).exists():
                        pass
                    else:
                        Listed_corp.objects.filter(종목코드 = corp_data.종목코드).update(
                            kiscode = kiscode
                        )
            except KeyError as e:
                print('KeyError Message: ', e.message)
                print('Keyerror Data : ', res)
                pass
        else:
            print('Already exists Data')
            pass
        
    if grade:
        get_grade()
    else:
        pass

if __name__ == '__main__':
    start_time = time.time()
    sys.setrecursionlimit(5000)
    main_def()
    print('----------------------')
    print('done')
    print('실행 시간 : ', str(round(time.time() - start_time)) + '초')

# time.sleep 0.3초 기준 전체 다 하면 730초 걸렸었음