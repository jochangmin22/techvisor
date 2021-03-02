from django.http import JsonResponse
import json

from users.models import Users

def toggle_searchs_starred(request):
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

def set_searchs_starred(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_user_id = data["userId"]
        received_search_ids = data["searchIds"]
        user_query = Users.objects.get(id = received_user_id)
        user_query.data['starred'] = list(set(received_search_ids + user_query.data['starred'])) 
        user_query.save()
    return JsonResponse( user_query.data['starred'], status = 200, safe = False)

def set_searchs_unstarred(request):
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
        received_selected = data["selected"]
        received_deselected = data["deselected"]
        received_search_ids = data["searchIds"]

        user_query = Users.objects.get(id = received_user_id)

        user_labels = user_query.data['labels'] if user_query.data['labels'] else {}

        for labelId in received_selected:
            d = next(item for key, item in user_labels.items() if key == labelId)
            d['searchIds'] = list(set(received_search_ids + d['searchIds']))

        for labelId in received_deselected:
            d = next(item for key, item in user_labels.items() if key == labelId)
            d['searchIds'] = list(set(d['searchIds']) - set(received_search_ids)) 

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

## label
# deselected: []
# searchIds: ["083450", "023910", "006620"]
# selected: ["edcccaf5"]
# userId: "4c79021d-8981-4a3e-9cea-59c4187aca0d"

## filter
# deselected: []
# selected: ["af085032"]
# selectedFilters: [{id: "시가총액(억)", value: [500, null]}, {id: "PER갭(%)", value: [0.1, 50]},…]
# userId: "4c79021d-8981-4a3e-9cea-59c4187aca0d"    
 
def update_searchs_filters(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_user_id = data["userId"]
        received_selected = data["selected"]
        received_deselected = data["deselected"]        
        received_selected_filters = data["selectedFilters"]

        user_query = Users.objects.get(id = received_user_id)

        user_filters = user_query.data['filters'] if user_query.data['filters'] else {}        

        for filterId in received_selected:
            d = next(item for key, item in user_filters.items() if key == filterId)
            d['selectedFilters'] = list([x for x in received_selected_filters])

        for filterId in received_deselected:
            d = next(item for key, item in user_filters.items() if key == filterId)
            d['selectedFilters'] = []


        user_query.data['filters'] = user_filters
        user_query.save()
         
        return JsonResponse( user_query.data['filters'], status = 200, safe = False)

def update_filters(request):
    if request.method == 'POST':
        
        data = json.loads(request.body.decode('utf-8'))
        received_user_id = data["userId"]
        received_filters = data["_filters"]

        user_query = Users.objects.get(id = received_user_id)
        
        user_query.data['filters'] = received_filters        
        user_query.save()
        return JsonResponse( user_query.data['filters'], status = 200, safe = False)
