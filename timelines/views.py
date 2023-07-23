from django.views.generic.base import TemplateView
from django.contrib.auth.mixins import UserPassesTestMixin

from django.shortcuts import get_object_or_404

from hitcount.models import HitCount
from hitcount.views import HitCountMixin
from hitcount.utils import get_hitcount_model

from .models import (Timeline, Entry, Divider, Image, Episode, 
	UserHasFinishedTracker)
from accounts.models import CustomUser

class TimelineDetailView(UserPassesTestMixin, TemplateView, HitCountMixin):
	'''
	Shows individual timelines as well as telling users whether or not
	they've finished the whole timeline
	'''
	template_name = 'timelines/timeline_detail.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		timeline = get_object_or_404(Timeline, url=self.kwargs['url'])
		entries = Entry.objects.filter(timeline=timeline)
		dividers = Divider.objects.filter(timeline=timeline)
		images = Image.objects.filter(timeline=timeline)
		episodes = Episode.objects.filter(timeline=timeline)
		total_entries = len(entries)
		context['timeline'] = timeline
		context['total_entries'] = total_entries

		''' 
		Adds a hit to the hitcount for this timeline, assuming it's a new 
		session, etc. Simplified version of 
		https://github.com/thornomad/django-hitcount/blob/master/hitcount/views.py 
		'''
		hit_count = get_hitcount_model().objects.get_for_object(timeline)
		hits = hit_count.hits
		hit_count_response = self.hit_count(self.request, hit_count)
		if hit_count_response.hit_counted:
			hits = hits + 1

		'''If user is logged in, finds or creates a list of which entries the 
		user has marked as finished, then checks if the user has finished the 
		whole TL iff the TL has at least one entry'''
		if self.request.user.is_authenticated:
			tracker_object, created = UserHasFinishedTracker.objects.get_or_create(
				user=self.request.user, timeline=timeline)
			if not created:
				tracker_object.save()
			tracker = tracker_object.mark_as_finished.all()
			ep_tracker = tracker_object.mark_ep_as_finished.all()
			total_finished = len(tracker)
			context['total_finished'] = total_finished
			context['user_has_finished_TL'] = (total_finished == total_entries 
				and total_entries > 0)
		else:
			tracker, ep_tracker = [], []

		'''Assembles all TL items into a single list with any extra info the 
		template needs, then sorts it by position'''
		items = []
		for entry in entries:
			entry_pos = entry.position
			items.append({'item': entry, 'type': 'entry', 
				'user_has_finished': entry in tracker, 
				'matching_eps_dict': self.assembleEpisodeList(episodes, 
					ep_tracker, entry_pos)})
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

	def assembleEpisodeList(self, episodes, ep_tracker, entry_pos):
		episodes = episodes.filter(position=entry_pos)
		matching_eps = []
		finished_episodes_count = 0
		for episode in episodes:
			user_has_finished = episode in ep_tracker
			if user_has_finished:
				finished_episodes_count += 1
			episode_dict = {'episode': episode, 
				'user_has_finished': episode in ep_tracker}
			matching_eps.append(episode_dict)
		matching_eps_dict = {'matching_eps': matching_eps, 
			'finished_episodes_count': finished_episodes_count}
		return matching_eps_dict

	# Makes it so that hidden timelines are only visible to their creator
	def test_func(self):
		print('f')
		timeline = get_object_or_404(Timeline, url=self.kwargs['url'])
		if timeline.hidden == True:
			return timeline.creator == self.request.user
		else:
			return True