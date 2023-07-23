from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Timeline, Entry, Episode, UserHasFinishedTracker

# Adds or removes a bookmarked TL for a given user
def bookmarkChange(request):
	if (request.headers.get('X-Requested-With') == 'XMLHttpRequest' and 
		request.method == 'POST'):
		action = request.POST.get('action')
		timeline_url = request.POST.get('timelineID')
		timeline = get_object_or_404(Timeline, url = timeline_url)
		user = request.user
		if action == 'add-bookmark':
			timeline.bookmarks.add(user)
		elif action == 'remove-bookmark':
			timeline.bookmarks.remove(user)
		else:
			return JsonResponse({}, status = 400)
		return JsonResponse({}, status = 200)
	return JsonResponse({}, status = 400)

''' Marks an entry as finished/unfinished for a given user, along with all that
entry's episodes. Called by timeline_detail.js ''' 
def userHasFinishedChange(request):
	if (request.headers.get('X-Requested-With') == 'XMLHttpRequest' and 
		request.method == 'POST'):
		action = request.POST.get('action')
		entry = get_object_or_404(Entry, pk=request.POST.get('entryID'))
		matching_eps = Episode.objects.filter(timeline=entry.timeline, 
			position=entry.position)
		tracker_object = get_object_or_404(UserHasFinishedTracker, 
			user=request.user, timeline=entry.timeline)
		tracker = tracker_object.mark_as_finished
		ep_tracker = tracker_object.mark_ep_as_finished
		if action == 'mark-as-unfinished':
			tracker.remove(entry)
			for episode in matching_eps:
				ep_tracker.remove(episode)
		elif action == 'mark-as-finished':
			tracker.add(entry)
			for episode in matching_eps:
				ep_tracker.add(episode)
		else:
			return JsonResponse({}, status = 400)
		return JsonResponse({}, status = 200)
	return JsonResponse({}, status = 400)

''' Marks an episode as finished/unfinished, and if necessary changes the 
episode's parent entry to finished/unfinished as well '''
def userHasFinishedEpChange(request):
	if (request.headers.get('X-Requested-With') == 'XMLHttpRequest' and 
		request.method == 'POST'):
		action = request.POST.get('action')
		episode = get_object_or_404(Episode, pk=request.POST.get('episodeID'))
		timeline, position = episode.timeline, episode.position
		matching_entry = get_object_or_404(Entry, timeline=timeline, 
			position=position)
		tracker_object = get_object_or_404(UserHasFinishedTracker, 
			user=request.user, timeline=timeline)
		tracker = tracker_object.mark_as_finished
		ep_tracker = tracker_object.mark_ep_as_finished
		if action == 'mark-ep-as-unfinished':
			ep_tracker.remove(episode)
			tracker.remove(matching_entry)
		elif action == 'mark-ep-as-finished':
			ep_tracker.add(episode)
			matching_eps = Episode.objects.filter(timeline=timeline, 
				position=position)
			need_to_mark_entry_finished = True
			for episode in matching_eps:
				if episode not in ep_tracker.all():
					need_to_mark_entry_finished = False
					break
			if need_to_mark_entry_finished == True:
				tracker.add(matching_entry)
		else:
			return JsonResponse({}, status = 400)
		return JsonResponse({}, status = 200)
	return JsonResponse({}, status = 400)

