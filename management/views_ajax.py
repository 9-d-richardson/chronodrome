from django.http import JsonResponse

from .models import IdempotencyKeys

'''Checks whether or not a post has recently been submitted with a particular
idempotency key and blocks it from being posted, to prevent duplicate 
submissions. Not currently in use.'''
def checkIdempotencyKey(request):
	if (request.headers.get('X-Requested-With') == 'XMLHttpRequest' and 
		request.method == 'GET'):
		idempotency_key = request.GET.get('idempotency_key', None)
		if idempotency_key == None:
			return JsonResponse({'valid': False}, status=200)
		elif IdempotencyKeys.objects.filter(key=idempotency_key).exists():
			return JsonResponse({'valid': False}, status=200)
		else:
			return JsonResponse({'valid': True}, status=200)
	return JsonResponse({}, status = 400)