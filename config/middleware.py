import uuid

'''Adds a unique key to the HTML header of each page, which can be used to 
ensure idempotency (that multiple POST submissions don't create the same
object multiple times). Currently not in use. '''
class CustomHeaderMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		request.META['HTTP_IDEMPOTENCY_KEY'] = str(uuid.uuid4())
		response = self.get_response(request)
		return response