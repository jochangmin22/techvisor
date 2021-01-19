from django.http import JsonResponse
import json

from users.models import Users

def toggle_starred(request):
	if request.method == 'POST':
		data = json.loads(request.body.decode('utf-8'))
		received_user_id = data["userId"]
		received_search_id = data["searchId"]

		user_query = Users.objects.get(id = received_user_id)
		[
			user_query.data['starred'].remove(received_search_id) if received_search_id in user_query.data['starred']
			else user_query.data['starred'].append(received_search_id)
		]
		user_query.save()
	return JsonResponse( user_query.data['starred'], status = 200, safe = False)

def set_starred(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_user_id = data["userId"]
        received_search_ids = data["searchIds"]
        user_query = Users.objects.get(id = received_user_id)
        user_query.data['starred'] = list(set(received_search_ids + user_query.data['starred'])) 
        user_query.save()
    return JsonResponse( user_query.data['starred'], status = 200, safe = False)

def set_unstarred(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_user_id = data["userId"]
        received_search_ids = data["searchIds"]
        user_query = Users.objects.get(id = received_user_id)
        user_query.data['starred'] = list(set(user_query.data['starred']) - set(received_search_ids)) 
        user_query.save()
    return JsonResponse( user_query.data['starred'], status = 200, safe = False)

def update_searchs_labels(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_user_id = data["userId"]
        received_selected_labels = data["selected"]
        received_deselected_labels = data["deSelected"]
        received_search_ids = data["searchIds"]

        user_query = Users.objects.get(id = received_user_id)

        user_labels = user_query.data['labels'] if user_query.data['labels'] else {}

        for labelId in received_selected_labels:
            d = next(item for key, item in user_labels.items() if key == labelId)
            d['searchIds'] = list(set(received_search_ids + d['searchIds']))

        for labelId in received_deselected_labels:
            d = next(item for key, item in user_labels.items() if key == labelId)
            d['searchIds'] = list(set(d['searchIds']) - set(received_search_ids)) 

        ### list version 
        # row = user_query.data['labels']
        # row = list(row)
        # user_labels = row if row else {}
        
        # for labelId in received_selected_labels:
        #     d = next(item for item in user_labels if item['id'] == labelId)
        #     d['searchIds'] = list(set(received_search_ids + d['searchIds']))

        # for labelId in received_deselected_labels:
        #     d = next(item for item in user_labels if item['id'] == labelId)
        #     d['searchIds'] = list(set(d['searchIds']) - set(received_search_ids)) 

        user_query.data['labels'] = user_labels
        user_query.save()

    return JsonResponse( user_query.data['labels'], status = 200, safe = False)    

def update_labels(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_user_id = data["userId"]
        received_labels = data["_labels"]

        user_query = Users.objects.get(id = received_user_id)

        user_query.data['labels'] = received_labels
        user_query.save()

    return JsonResponse( user_query.data['labels'], status = 200, safe = False)     
 
def update_filters(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_user_id = data["userId"]
        received_filters = data["_filters"]

        user_query = Users.objects.get(id = received_user_id)

        for key, value in received_filters.items():
            user_query.data['filters'].update({
                key : value
            })
        user_query.save()
        return JsonResponse( user_query.data['filters'], status = 200, safe = False)

def update_searchs_filters(request):
    if request.method == 'POST':
        # deselected의 부분으로 들어온 값은 selectedFilters에서 빼고
        # selected의 부분으로 들어온 값은 selectedFilters에서 더한다
        
        data = json.loads(request.body.decode('utf-8'))
        received_user_id = data["userId"]
        received_selected_filters = data["selected"]
        received_deselected_filters = data["deselected"]
        received_selected_data = data["selectedFilters"]

        user_query = Users.objects.get(id = received_user_id)
        
        # user_query.data['filters'].get(received_filters)['selectedFilters'].clear()
        
        # user_query.data['filters'].get(received_filters)['selectedFilters'].append(
        #     user_query.data['filters'].get(received_deselected_filters)['selectedFilters']
        # )
        # user_query.save()

        user_filters = user_query.data['filters'] if user_query.data['filters'] else {}
        # print('user_filter : ', user_filters.items())
        for filterId in received_selected_filters:
            d = next(value for key, value in user_filters.items() if key == filterId)
            # d['selectedFilters'] = list(set(received_search_ids + d['searchIds']))
            print('D data : ', d['selectedFilters'])

        # for labelId in received_deselected_labels:
        #     d = next(item for key, item in user_labels.items() if key == labelId)
        #     d['searchIds'] = list(set(d['searchIds']) - set(received_search_ids))
        # return JsonResponse( user_query.data['filters'].get(received_filters), status = 200, safe = False)
        return JsonResponse({ 'Test' : 'Success'}, status = 200)

# trash 휴지통 기능 관심없는 기업을 휴지통에 넣어두면 그 기업은 조회가 되지 않음
def trash(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_user_id = data["userId"]
        received_trash_list = data["searchId"]

        user_query = Users.objects.get(id = received_user_id)
        user_query.data['trashed'] = list(set(received_trash_list + user_query.data['trashed']))
        user_query.save()
    return JsonResponse( user_query.data['trashed'], status = 200, safe = False )