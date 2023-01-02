from django.urls import path
from .views import CreateFeedbackView, ChangelogView, HomeView
# from .views_ajax import checkIdempotencyKey

urlpatterns = [
	path('feedback/', CreateFeedbackView.as_view(), name = 'feedback'),
	path('changelog/', ChangelogView.as_view(), name = 'changelog'),
	path('', HomeView.as_view(), name='home'),

	# Ajax pages
	# path('ajax/check_idempotency', 
	# 	checkIdempotencyKey, name='check_idempotency'),
]