from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search, Q, Index

import pprint

def create_index(index):
    if not es.indices.exists(index = index):
        return es.indices.create(index = index)

def delete_index(index):
    if es.indices.exists(index = index):
        return es.indices.delete(index = index)

def insert(body):
    return es.index(index = index, doc_type = doc_type, body = body)

def delete(data):
    if data is None:
        data = {'match_all' : {}}
    
    else:
        data = {'match' : data}
    body = {'query' : data}
    return es.delete_by_query(index, body = body)

def delete_by_id(id):
    return es.delete(index, id = id)

def search(index, data = None):
    if data is None:
        data = {'match_all' : {}}
    
    else:
        data = {'match' : data}
    body = {'query' : data}
    res = es.search(index = index, body = body)
    print('search_res : ', index)
    return res

def update(id, doc):
    body = {
        'doc' : doc
    }
    res = es.update(index = index, id = id, body = body, doc_type = doc_type)
    return res


if __name__ == '__main__':
    url = 'localhost'
    port = '9200'
    index = 'news'
    doc_type = 'daum'
    
    es = Elasticsearch(f'{url}:{port}')
    # print('test data : ', es)
    # create_es = create_index(index)
    # delete_es = delete_index(index)
    
    # if delete_es is not None:
    #     print('delete ok')

    # else:
    #     print('delete no')
    # data = {
    #     'data' : '202008112229',
    #     'category' : 'society',
    #     'newspaper' : 'KBS',
    #     'title' : '큰 비 온다는 경보에도 수영등산 처벌은?',
    #     'content' : '집중호우와 산사태 경보가 내려졌는데도, 입산이 통제된 산에 올라가거나 바다에서 수영을 즐기던 동호회원들이 적발되거나 구조됐습니다.',
    #     'url' : 'https://news.v.daum.net/v/20200811222929678'
    # }

    # ir = insert(data)
    # print(ir)
    sr = search(index, {'category' : 'society'})
    # pprint.pprint(sr)