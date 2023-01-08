import uuid

from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic.base import TemplateView
from django.views.generic.edit import DeleteView

from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, HttpResponse
from django.db import IntegrityError, transaction
from django.contrib import messages

from .models import Timeline, Entry, Episode, Divider, Image
from .forms import (TimelineForm, EntryForm, EntryFormSet, ImportForm, 
	DividerForm, DividerFormSet, ImageForm,	ImageFormSet, EpisodeFormSet, 
	ImportEpisodesFormSet)

from config import shared_constants as s_c


class TimelineImportView(LoginRequiredMixin, TemplateView):
	"""
	For importing a timeline from a text file or another website. Takes each
	non-blank line from the imported text and turns it into a TL entry.
	"""
	template_name = "timelines/timeline_import.html" 

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		timeline = Timeline(creator=self.request.user)
		context['timeline'] = timeline
		context['timeline_form'] = TimelineForm(instance=timeline)
		context['import_form'] = ImportForm()
		return context

	def post(self, request, *args, **kwargs):
		timeline = Timeline(creator=self.request.user)
		timeline_form = TimelineForm(instance=timeline, data=request.POST, 
			files=request.FILES)
		import_form = ImportForm(data=request.POST)

		if (timeline_form.is_bound and timeline_form.is_valid() and 
			import_form.is_bound and import_form.is_valid()):
			with transaction.atomic():
				timeline_form.save()
				position = 1
				new_entries = []
				for entry_name in import_form.cleaned_data['import_form']:
					entry = Entry(
						timeline=timeline, 
						name=entry_name[:s_c.CharFieldMaxLength], 
						position=position
					)
					new_entries.append(entry)
					position += 1
				Entry.objects.bulk_create(new_entries)
				messages.success(request, 'Timeline saved! You can edit it further here.')
				return HttpResponseRedirect(reverse_lazy('timeline_edit', 
					kwargs={"pk":timeline_form.instance.id}))

		messages.error(request, 'There were problems importing your timeline.')
		return render(self.request, self.template_name, {
			'timeline_form': timeline_form, 
			'import_form': import_form,
			'changed_input': True
		})


class TimelineEditView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
	"""
	For creating and editing timelines and their items all on one page
	"""
	template_name = "timelines/timeline_edit.html" 

	def get_context_data(self, **kwargs):
		if 'pk' not in self.kwargs:
			timeline = Timeline(creator=self.request.user)
		else:
			timeline = get_object_or_404(Timeline, pk=self.kwargs['pk'])
		timeline_form = TimelineForm(instance=timeline)
		entry_formset = EntryFormSet(instance=timeline)
		divider_formset = DividerFormSet(instance=timeline)
		image_formset = ImageFormSet(instance=timeline)
		episode_formset = EpisodeFormSet(instance=timeline)
		import_episodes_formset = ImportEpisodesFormSet(prefix='importepisodes')

		context = self.assembleContext(timeline_form, entry_formset, 
			divider_formset, image_formset, episode_formset, 
			import_episodes_formset)
		return context

	def post(self, request, *args, **kwargs):
		data = request.POST 
		files = request.FILES
		if 'pk' not in self.kwargs:
			timeline = Timeline(creator=self.request.user)
		else:
			timeline = get_object_or_404(Timeline, pk=self.kwargs['pk'])
		timeline_form = TimelineForm(instance=timeline, data=data, files=files)
		entry_formset = EntryFormSet(instance=timeline, data=data)
		divider_formset = DividerFormSet(instance=timeline, data=data)
		image_formset = ImageFormSet(instance=timeline, data=data, files=files)
		episode_formset = EpisodeFormSet(instance=timeline, data=data)
		import_episodes_formset = ImportEpisodesFormSet(data=data, 
			prefix='importepisodes')

		if (timeline_form.is_bound and timeline_form.is_valid() and 
			entry_formset.is_bound and entry_formset.is_valid() and 
			divider_formset.is_bound and divider_formset.is_valid() and 
			image_formset.is_bound and image_formset.is_valid() and 
			episode_formset.is_bound and episode_formset.is_valid() and 
			import_episodes_formset.is_bound and import_episodes_formset.is_valid()):
			with transaction.atomic():
				timeline_form.save()
				entry_formset.save()
				divider_formset.save()
				image_formset.save()
				episode_formset.save()

				imported_episodes = []
				for import_formset in import_episodes_formset.cleaned_data:
					if not import_formset['DELETE']:
						position = import_formset['position']
						position_episode = 0
						for name in import_formset['import_episodes_form']:
							episode = Episode(
								timeline=timeline, 
								name=name[:s_c.CharFieldMaxLength], 
								position=position,
								position_episode=position_episode
							)
							imported_episodes.append(episode)
							position_episode += 1
				Episode.objects.bulk_create(imported_episodes)

				messages.success(request, 
					'Timeline saved! Redirecting to your timeline now!')
				return HttpResponseRedirect(reverse_lazy('timeline_detail', 
					kwargs={"pk":timeline_form.instance.id}))

		messages.error(request, 'There were problems saving your timeline.')
		context = self.assembleContext(timeline_form, entry_formset, 
			divider_formset, image_formset, episode_formset, 
			import_episodes_formset)
		context['changed_input'] = True
		return render(self.request, self.template_name, context)

	def test_func(self):
		if 'pk' not in self.kwargs:
			return True
		else:
			timeline = get_object_or_404(Timeline, pk=self.kwargs['pk'])
			return timeline.creator == self.request.user

	'''
	Assembles most of the context dictionary for this view - at least the parts
	which are shared by get_context_data and post
	'''
	def assembleContext(self, timeline_form, entry_formset, divider_formset, 
		image_formset, episode_formset, import_episodes_formset):
		context = {}
		context['timeline_form'] = timeline_form
		context['title'] = timeline_form['title'].value()
		context['entry_formset'] = entry_formset
		context['divider_formset'] = divider_formset
		context['image_formset'] = image_formset
		context['episode_formset'] = episode_formset
		context['import_episodes_formset'] = import_episodes_formset
		context['items'] = self.assembleTimelineItems(entry_formset, 
			divider_formset, image_formset, episode_formset, 
			import_episodes_formset)
		context['MaxNumEntries'] = s_c.MaxNumEntries
		context['MaxNumDividers'] = s_c.MaxNumDividers
		context['MaxNumImages'] = s_c.MaxNumImages
		context['MaxEpsPerEntry'] = s_c.MaxEpsPerEntry
		return context

	''' 
	Puts every item for a given timeline into a single list, with the 
	appropriate context data then sorts the list based on each item's position
	in the timeline. Then adds hidden empty forms for each item type at the end 
	for JS to make copies of. (empty_form works better than extra forms, which 
	can't always be relied on to be there.) Note that "position" is the item's 
	position in the timeline, while "count" is the item's position among items 
	of the same type only.
	'''
	def assembleTimelineItems(self, entry_formset, divider_formset, 
		image_formset, episode_formset, import_episodes_formset):
		episode_lists = {}
		for episode in episode_formset:
			pos = episode['position'].value()
			if pos not in episode_lists:
				episode_lists[pos] = [episode]
			else:
				episode_lists[pos].append(episode)

		items = []
		for i, entry in enumerate(entry_formset):
			pos = entry['position'].value()
			if pos in episode_lists:
				'''Checks for errors so that any episode lists which have 
				episodes with errors (and that aren't marked to be deleted) can
				be properly displayed by timeline_edit'''
				has_errors = False
				for episode in episode_lists[pos]:
					if episode.errors and not episode['DELETE'].value() == 'true':
						has_errors = True
						break
				'''Sorts the episodes in case timeline_edit has been reloaded
				due to an error, which can cause the episodes to get jumbled.'''
				sorted_episode_list = sorted(episode_lists[pos], 
					key=lambda episode: int(episode['position_episode'].value()))
				episode_dict = {
					'episodes': sorted_episode_list,
					'total_episodes': len(episode_lists[pos]),
					'has_episodes': True,
					'has_errors': has_errors,
				}
			else:
				episode_dict = {
					'episodes': [],
					'has_episodes': False,
				}
			items.append({'item': entry, 'type': 'entry', 
				'episode_dict': episode_dict})
		for i, divider in enumerate(divider_formset):
			items.append({'item': divider, 'type': 'divider'})
		for i, image in enumerate(image_formset):
			items.append({'item': image, 'type': 'image'})

		items = sorted(items, key=lambda item: int(item['item']['position'].value()))

		''' We have to do these counters in order to properly display the 
		header numbering for each item. For example, "Entry 1/100". We have to
		add the counters to each item after the whole list has been sorted, 
		because otherwise the counters can be in the wrong order '''
		entry_counter, divider_counter, image_counter = 0, 0, 0
		for item in items:
			if item['type'] == 'entry':
				item['counter'] = entry_counter
				entry_counter += 1
			if item['type'] == 'divider':
				item['counter'] = divider_counter
				divider_counter += 1
			if item['type'] == 'image':
				item['counter'] = image_counter
				image_counter += 1

		for import_form in import_episodes_formset:
			position = int(import_form['position'].value())
			marked_for_deletion = import_form['DELETE'].value() == 'true'
			import_form_dict = {
				'import_form': import_form,
				'marked_for_deletion': marked_for_deletion
			}
			items[position]['import_form_dict'] = import_form_dict

		''' Adds empty forms to the end of the list of forms, so that the JS
		will have blank forms to copy when the user adds items to the TL '''
		items.append({
			'item': entry_formset.empty_form, 
			'type': 'entry', 
			'counter': s_c.extra_form_position,
			'hidden': True
		})
		items.append({
			'item': divider_formset.empty_form, 
			'type': 'divider', 
			'counter': s_c.extra_form_position,
			'hidden': True
		})
		items.append({
			'item': image_formset.empty_form, 
			'type': 'image', 
			'counter': s_c.extra_form_position,
			'hidden': True
		})
		return items


class TimelineDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
	'''
	Deletes a timeline if you're the one who created it
	'''
	model = Timeline 
	template_name = 'timelines/timeline_delete.html'
	success_url = reverse_lazy('timeline_search')

	def test_func(self):
		obj = self.get_object()
		return obj.creator == self.request.user