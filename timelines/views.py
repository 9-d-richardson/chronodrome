from django.views.generic.base import TemplateView
from django.contrib.auth.mixins import UserPassesTestMixin

from django.shortcuts import get_object_or_404

from .models import Timeline, Entry, Divider, Image, UserHasFinishedTracker
from accounts.models import CustomUser

class TimelineDetailView(UserPassesTestMixin, TemplateView):
	'''
	Shows individual timelines as well as telling users whether or not
	they've finished the whole timeline
	'''
	template_name = 'timelines/timeline_detail.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		timeline = get_object_or_404(Timeline, pk=self.kwargs['pk'])
		entries = Entry.objects.filter(timeline=self.kwargs['pk'])
		dividers = Divider.objects.filter(timeline=self.kwargs['pk'])
		images = Image.objects.filter(timeline=self.kwargs['pk'])
		total_entries = len(entries)
		context['timeline'] = timeline
		context['total_entries'] = total_entries

		'''If user is logged in, finds or creates a list of which entries the 
		user has marked as finished, then checks if the user has finished the 
		whole TL iff the TL has at least one entry'''
		if self.request.user.is_authenticated:
			tracker_object, created = UserHasFinishedTracker.objects.get_or_create(
				user=self.request.user, timeline=timeline)
			if not created:
				tracker_object.save()
			tracker = tracker_object.mark_as_finished.all()
			total_finished = len(tracker)
			context['total_finished'] = total_finished
			context['user_has_finished_TL'] = (total_finished == total_entries 
				and total_entries > 0)
		else:
			tracker = []

		'''Assembles all TL items into a single list with any extra info the 
		template needs, then sorts it by position'''
		items = []
		for entry in entries:
			items.append({'item': entry, 'type': 'entry', 
				'user_has_finished': entry in tracker})
		for divider in dividers:
			is_blank = (divider.name == '' and divider.subheading == '' and 
				divider.comment == '')
			items.append({'item': divider, 'type': 'divider', 
				'is_blank': is_blank})
		for image in images:
			items.append({'item': image, 'type': 'image'})
		items = sorted(items, key=lambda item: item['item'].position)

		context['items'] = items
		context['has_edit_permissions'] = timeline.creator == self.request.user
		return context

	# Makes it so that hidden timelines are only visible to their creator
	def test_func(self):
		timeline = get_object_or_404(Timeline, pk=self.kwargs['pk'])
		if timeline.hidden == True:
			return timeline.creator == self.request.user
		else:
			return True