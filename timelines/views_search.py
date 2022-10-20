from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView

from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404, redirect
from django.db.models import Q, Count
from django.core.paginator import Paginator
from django.db.models.functions import Lower

from .models import Timeline, Entry, UserHasReadTracker
from accounts.models import CustomUser

TLs_per_page = 25

class TimelineSearchBase(TemplateView):
	'''
	Contains some shared functions for different views which search through
	timelines, such as TimelineSearchView, UserDetailView, and BookmarksView.
	The child classes filter the timeline while the functions here do the rest.
	'''
	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['page'] = self.request.GET.get('page', '')
		context['sort'] = self.request.GET.get('sort', '')
		return context
	
	'''
	Takes the filtered timeline provided by the child class, and returns it
	properly sorted, paginated, and with how many entries the user has read
	'''
	def return_final_search(self, timelines, sort, user, page):
		timelines = self.sort_entries(timelines, sort)
		timelines = self.get_user_relation_to_TL(timelines, user)
		paginator = Paginator(timelines, per_page=TLs_per_page)
		page_object = paginator.get_page(page)
		return page_object

	'''
	Returns lists of timeline entries sorted in a particular way. Default is
	by most recently updated
	'''
	def sort_entries(self, timelines, sort):
		if sort == 'alpha':
			timelines = timelines.order_by(Lower('title'))
		elif sort == 'bookmarks':
			timelines = timelines.annotate(total_bookmarks = Count(
				'bookmarks')).order_by('-total_bookmarks')
		return timelines

	#Counts how many entries per timeline the user has finished.  
	def get_user_relation_to_TL(self, timelines, user):
		TL_plus_entry_count = []
		for timeline in timelines:
			timeline_dict = {'current_TL': timeline}
			total_entries = len(Entry.objects.filter(timeline=timeline))
			timeline_dict['total_entries'] = total_entries
			try:
				tracker_object = UserHasReadTracker.objects.get(
					user=user, timeline=timeline)
				total_read = len(tracker_object.mark_as_read.all())
				timeline_dict['total_read'] = total_read
			except:
				total_read = 0
				timeline_dict['total_read'] = total_read
			timeline_dict['user_has_finished'] = (
				total_entries > 0 and total_read == total_entries)
			timeline_dict['is_bookmarked'] = user in timeline.bookmarks.all()
			TL_plus_entry_count.append(timeline_dict)
		return TL_plus_entry_count


class UserDetailView(TimelineSearchBase):
	'''
	A page for each account, showing username, self-description, and how
	many timelines that user has finished, as well as showing how many
	timelines they've created, similar to TimelineSearchView.
	'''
	template_name = 'timelines/user_view.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		viewed_user = get_object_or_404(CustomUser, 
			username=self.kwargs['username'])
		context['viewed_user'] = viewed_user
		if viewed_user.is_active:
			filtered_TLs = Timeline.objects.filter(
				creator__username=viewed_user,
				hidden=False
			)
		else:
			filtered_TLs = []

		# Finds how many TLs the user you're looking at has finished
		finished_TLs = []
		for timeline in Timeline.objects.all():
			entries = Entry.objects.filter(timeline=timeline)
			total_entries = len(entries)
			if total_entries > 0:
				try:
					tracker_object = UserHasReadTracker.objects.get(
						user=viewed_user, timeline=timeline)
					total_read = len(tracker_object.mark_as_read.all())
					if total_read == total_entries:
						finished_TLs.append(timeline)
				except:
					pass
		context['finished_TLs'] = finished_TLs

		context['page_obj'] = self.return_final_search(
			filtered_TLs, context['sort'], self.request.user, context['page'])
		return context


class HiddenTimelinesView(LoginRequiredMixin, TimelineSearchBase):
	'''
	A page for each account, showing username, self-description, and how
	many timelines that user has finished, as well as showing how many
	timelines they've created, similar to TimelineSearchView.
	'''
	template_name = 'timelines/timeline_hidden.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		user = self.request.user
		filtered_TLs = Timeline.objects.filter(
			creator__username=user,
			hidden=True
		)

		context['page_obj'] = self.return_final_search(
			filtered_TLs, context['sort'], self.request.user, context['page'])
		return context


class BookmarksView(LoginRequiredMixin, TimelineSearchBase):
	'''
	A page where users can see all of the timelines they've bookmarked.
	'''
	template_name = 'timelines/bookmarks.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		'''
		There's some sort of weird bug (?) in Django where if you filter the
		timeline by whether or not the user has bookmarked it, then trying to 
		sort it based on total number of bookmarks doesn't work right. 
		Therefore in this special case I had to do the sort before the filter, 
		although that's less efficient. 
		'''
		user = self.request.user
		if context['sort'] == "bookmarks":
			filtered_TLs = Timeline.objects.all()
			filtered_TLs = self.sort_entries(filtered_TLs, context['sort'])
			filtered_TLs = filtered_TLs.filter(bookmarks=user, hidden=False)
		else:
			filtered_TLs = Timeline.objects.filter(bookmarks=user, hidden=False)
			filtered_TLs = self.sort_entries(filtered_TLs, context['sort'])

		context['page_obj'] = self.return_final_search(
			filtered_TLs, None, user, context['page'])
		return context


class TimelineSearchView(TimelineSearchBase):
	'''
	Searches through timelines, as well as serving as the "show all" page.
	Breaks up the user's query first by quotation marks, to search for exact
	quotes, then breaks up the remainder into individual words. These
	separate queries are then used to filter timelines by searching through 
	title, description, and the username of the creator.
	Also shows how many entries in each timeline the user has finished.
	'''
	template_name = 'timelines/timeline_search.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		query = self.request.GET.get('query', '')
		context['query'] = query

		filtered_TLs = Timeline.objects.filter(hidden=False)
		queries = []
		in_quotes = False
		prev_quote_location = 0
		for i in range(len(query)):
			if query[i] == '"':
				if in_quotes == False:
					queries += query[prev_quote_location:i].split()
					in_quotes = True
				else:
					queries.append(query[prev_quote_location:i])
					in_quotes = False
				prev_quote_location = i + 1
		queries += query[prev_quote_location:].split()
		if queries:
			for query in queries:
				query = query.strip()
				filtered_TLs = filtered_TLs.filter(
					Q(title__icontains=query) | 
					Q(description__icontains=query) | 
					Q(creator__username__icontains=query)
				)

		context['page_obj'] = self.return_final_search(
			filtered_TLs, context['sort'], self.request.user, context['page'])
		return context