from django.urls import path

from . import views, views_edit, views_search, views_ajax

urlpatterns = [
	# Creating/modifying timelines
	path('timelines/import/', 
		views_edit.TimelineImportView.as_view(), name = 'timeline_import'),
	path('timelines/new/', 
		views_edit.TimelineEditView.as_view(), name = 'timeline_new'),
	path('timelines/<int:pk>/edit/',
		views_edit.TimelineEditView.as_view(), name='timeline_edit'),
	path('timelines/<int:pk>/delete/',
		views_edit.TimelineDeleteView.as_view(), name='timeline_delete'),	

	# Pages which use search_template.html
	path('users/<str:username>/', 
		views_search.UserDetailView.as_view(), name='view_user'),
	path('bookmarks/', 
		views_search.BookmarksView.as_view(), name='bookmarks'),
	path('search/',
		views_search.TimelineSearchView.as_view(), name='timeline_search'),
	path('accounts/hidden_timelines/', 
		views_search.HiddenTimelinesView.as_view(), name='hidden_timelines'),
	
	# Other
	path('timelines/<int:pk>/saved/',
		views_edit.TimelineSavedView.as_view(), name='timeline_saved'),
	path('timelines/<int:pk>/',
		views.TimelineDetailView.as_view(), name='timeline_detail'),

	#Ajax pages
	path('timelines/ajax/bookmark_change', 
		views_ajax.bookmarkChange, name='bookmark_change'),
	path('timelines/ajax/user_has_finished_change', 
		views_ajax.userHasFinishedChange, name='user_has_finished_change'),
]