from django.urls import path
from .views import CreateFeedbackView, ChangelogView, HomeView

urlpatterns = [
	path('feedback/', CreateFeedbackView.as_view(), name = 'feedback'),
	path('changelog/', ChangelogView.as_view(), name = 'changelog'),
	path('', HomeView.as_view(), name='home'),
]