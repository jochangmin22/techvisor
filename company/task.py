from __future__ import absolute_import, unicode_literals
from celery import shared_task
from .crawler import update_today_crawl_mdcline, crawl_mdcline

@shared_task
def update_today_crawl_mdcline_celery():
    update_today_crawl_mdcline()
    return True