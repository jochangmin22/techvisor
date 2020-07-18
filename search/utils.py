import json

def get_redis_key(request):
    params = {}
    for value in [
        "searchText",
        "searchNum",
        "searchVolume",
        "dateType",
        "startDate",
        "endDate",
        "inventor",
        "assignee",
        "patentOffice",
        "language",
        "status",
        "ipType",
    ]:
        params[value] = request.GET.get(value,'')

    mainKey = "¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']

    # searchScope
    param_scope = request.GET.get('searchScope')
    param_scope = json.loads(param_scope)

    for value in [
		"volume",
        "unit",
        # "output"
    ]:
        params[value] = param_scope['wordCloudScope'][value]

    # one more key to be used for a separate searchScope
    subKey = "¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']   

    return mainKey, subKey, params

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]    
  