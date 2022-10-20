# Ajax views which get called by user_form_base.js
# Based on https://www.pluralsight.com/guides/work-with-ajax-django
def isFieldTaken(request):
	if (request.headers.get('X-Requested-With') == 'XMLHttpRequest' and 
		request.method == 'GET'):
		string = request.GET.get('string', None)
		field = request.GET.get('field', None)
		if field == 'username':
			is_taken = CustomUser.objects.filter(username=string).exists()
		elif field == 'email':
			is_taken = CustomUser.objects.filter(email=string).exists()
		else:
			return JsonResponse({}, status = 400)
		return JsonResponse({'taken': is_taken}, status=200)
	return JsonResponse({}, status = 400)