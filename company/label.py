from django.http import JsonResponse
import json

def get_labels():
    labels = [
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
    return JsonResponse(labels, safe=False)

def update_labels(request):
	if request.method == 'POST':
		data = json.loads(request.body.decode('utf-8'))
		labels = data['labels']
		return JsonResponse(labels, safe=False)
	return JsonResponse([], safe=False)		