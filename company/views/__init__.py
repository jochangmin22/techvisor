# from . import companies
# from . import related_info
# from . import visual
# from . import crawler
# from . import favorite

from . import companies
from .related_info import save_crawl_time, more_then_an_hour_passed, get_clinic_test, clinic_test, get_corp_report, corp_report
from .visual import get_owned_patent, owned_patent, get_visual, get_wordcloud
from . import crawler
from . import favorite