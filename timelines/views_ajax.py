from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Timeline, Entry, UserHasReadTracker

def bookmarkChange(request):
	if (request.headers.get('X-Requested-With') == 'XMLHttpRequest' and 
		request.method == 'POST'):
		action = request.POST.get('action')
		timeline_id = request.POST.get('timelineID')
		timeline = get_object_or_404(Timeline, pk = timeline_id)
		user = request.user
		if action == 'add-bookmark':
			timeline.bookmarks.add(user)
		elif action == 'remove-bookmark':
			timeline.bookmarks.remove(user)
		else:
			return JsonResponse({}, status = 400)
		return JsonResponse({}, status = 200)
	return JsonResponse({}, status = 400)


def userHasReadChange(request):
	if (request.headers.get('X-Requested-With') == 'XMLHttpRequest' and 
		request.method == 'POST'):
		action = request.POST.get('action')
		entry = get_object_or_404(Entry, pk=request.POST.get('entryID'))
		tracker_object = get_object_or_404(UserHasReadTracker, 
			user=request.user, timeline=entry.timeline)
		tracker = tracker_object.mark_as_read
		if action == 'mark-as-unread':
			tracker.remove(entry)
		elif action == 'mark-as-read':
			tracker.add(entry)
		elif action == 'mark-all-above-as-read':
			prev_entries = Entry.objects.filter(
				Q(timeline=entry.timeline) & Q(position__lte=entry.position))
			tracker.add(*prev_entries)
		else:
			return JsonResponse({}, status = 400)
		return JsonResponse({}, status = 200)
	return JsonResponse({}, status = 400)