import requests
import time
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'techvisor.settings')

import django
django.setup()

from company.models import Corp_intrinsic_value
from search.models import *
from django.conf import settings

def main_def():
    url = 'https://api.kisline.com/nice/sb/api/btowin/emEprOtlIfo/kiscode?stockcd='

    headers = {
        'x-ibm-client-id' : settings.NICE_ID,
        'x-ibm-client-secret' : settings.NICE_KEY,
        'accept' : 'application/json'
    }

    corp_data_list = Listed_corp.objects.all()
    for corp_data in corp_data_list:
        time.sleep(0.3)
        req = requests.get(url + corp_data.종목코드, headers = headers)
        res = req.json()

        kiscode = res['items']['item'][0]['kiscode']
        print('API data : ', kiscode)

        if not kiscode:
            pass

        else:
            if Listed_corp.objects.get(종목코드 = corp_data.종목코드).kiscode:
                pass
            else:
                Listed_corp.objects.filter(종목코드 = corp_data.종목코드).update(
                    kiscode = kiscode
                )

if __name__ == '__main__':
    start_time = time.time()
    sys.setrecursionlimit(5000)
    main_def()
    print('----------------------')
    print('done')
    print('실행 시간 : ', (time.time() - start_time))