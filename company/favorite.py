from django.http import JsonResponse
import json

from users.models import Users

def get_labels():
    result = [
		{
			'id': '5725a6802d10e277a0f35739',
			'name': '관심종목',
			'handle': '관심종목',
		},
		{
			'id': '5725a6809fdd915739187ed5',
			'name': '테마종목',
			'handle': '테마종목',
		},
		{
			'id': '5725a68031fdbb1db2c1af47',
			'name': '바이오',
			'handle': '바이오',
		}
	]
    return JsonResponse(result, safe=False)

def update_labels(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        # received_user_id = data["userId"]
        # received_search_id = data["searchId"]
        result = data['labels']
        return JsonResponse(result, safe=False)
    return JsonResponse([], safe=False)		

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

def set_labels(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_user_id = data["userId"]
        received_label_id = data["labelId"]
        received_search_ids = data["searchIds"]

        user_query = Users.objects.get(id = received_user_id)
        for label in user_query.data['labels']:
            try:
                # id = user_query.data['labels'].get('id')
                id = label.get('id')
            except KeyError:
                pass                
            else:
                if id == received_label_id:
                    user_query.data['labels']['searchIds'] = list(set(received_search_ids + user_query.data['labels']['searchIds'])) 
                  
        user_query.save()
    return JsonResponse( user_query.data['labels'], status = 200, safe = False)

def set_unlabels(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_user_id = data["userId"]
        received_label_id = data["labelId"]
        received_search_ids = data["searchIds"]

        user_query = Users.objects.get(id = received_user_id)
        for label in user_query.data['labels']:
            try:
                # id = user_query.data['labels'].get('id')
                id = label.get('id')
            except KeyError:
                pass                
            else:
                if id == received_label_id:
                    user_query.data['labels']['searchIds'] = list(set(user_query.data['labels']['searchIds']) - set(received_search_ids))
        user_query.save()
    return JsonResponse( user_query.data['labels'], status = 200, safe = False)

def create_label(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_id = data["user"]
        received_label= data["labels"]

        user_query = Users.objects.get(id = received_id)
        if not user_query.data['label']:
            user_query.data['label'][received_label] = []
        else:    
            if received_label not in user_query.data['label'].keys():
                user_query.data['label'][received_label] = []

        user_query.save()
        return JsonResponse({ "users_label" : user_query.data['labels']}, status = 200, safe = False)

def remove_label(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_id = data["user"]
        received_label = data["labels"]

        user_query = Users.objects.get(id = received_id)
        if received_label in user_query.data['labels'].keys():
            del(user_query.data['labels'][received_label])
        user_query.save()
        return JsonResponse({ "users_label" : user_query.data['labels']}, status = 200, safe = False)

def user_labeling(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_id = data["user"]
        received_label = data["labels"]
        received_item_list = data["items"]

        user_query = Users.objects.get(id = received_id)
        [
            user_query.data["labels"][received_label].append(received_item)
            for received_item in received_item_list
            if received_item not in user_query.data["labels"][received_label]
        ]
        user_query.save()
        return JsonResponse({ "user_labeling_list" : user_query.data['labels']}, status = 200, safe = False)
        
def user_remove_labeling(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        received_id = data["user"]
        received_label = data["labels"]
        received_item_list = data["items"]

        user_query = Users.objects.get(id = received_id)
        if user_query.data['labels'][received_label]:
            [
                user_query.data['labels'][received_label].remove(received_item)
                for received_item in received_item_list
                if received_item in user_query.data['labels'][received_label]
            ]
            user_query.save()
        return JsonResponse({ "user_labeling_list" : user_query.data['labels']}, status = 200, safe = False)
        
