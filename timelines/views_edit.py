from urllib.parse import urlparse
from PIL import Image 

from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic.base import TemplateView
from django.views.generic.edit import DeleteView

from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from django.db import IntegrityError, transaction
from django.contrib import messages

from .models import Timeline, Entry, Episode, Divider, Image
from .forms import (TimelineForm, EntryForm, EntryFormSet, ImportForm, 
	DividerForm, DividerFormSet, ImageForm,	ImageFormSet, ImportEpisodesFormSet)

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
		# import_episodes_formset = ImportEpisodesFormSet()

		return self.assembleContext(timeline_form, entry_formset, 
			divider_formset, image_formset)

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

		if (timeline_form.is_bound and timeline_form.is_valid() and 
			entry_formset.is_bound and entry_formset.is_valid() and 
			divider_formset.is_bound and divider_formset.is_valid() and 
			image_formset.is_bound and image_formset.is_valid()):
			with transaction.atomic():
				timeline_form.save()
				entry_formset.save()
				divider_formset.save()
				image_formset.save()
				messages.success(request, 'Timeline saved!')
				return HttpResponseRedirect(reverse_lazy('timeline_detail', 
					kwargs={"pk":timeline_form.instance.id}))

		messages.error(request, 'There were problems saving your timeline.')
		context = self.assembleContext(timeline_form, entry_formset, 
			divider_formset, image_formset)
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
		image_formset):
		context = {}
		context['timeline_form'] = timeline_form
		context['title'] = timeline_form['title'].value()
		context['entry_formset'] = entry_formset
		context['divider_formset'] = divider_formset
		context['image_formset'] = image_formset
		context['items'] = self.assembleTimelineItems(entry_formset, 
			divider_formset, image_formset)
		# context['episode_items'] = self.assembleTimelineEpisodes(
		# 	import_episodes_formset)
		context['MaxNumEntries'] = s_c.MaxNumEntries
		context['MaxNumDividers'] = s_c.MaxNumDividers
		context['MaxNumImages'] = s_c.MaxNumImages
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
		image_formset):
		items = []
		for i, entry in enumerate(entry_formset):
			items.append({'item': entry, 'type': 'entry', 'count': i})
		for i, divider in enumerate(divider_formset):
			items.append({'item': divider, 'type': 'divider', 'count': i})
		for i, image in enumerate(image_formset):
			items.append({'item': image, 'type': 'image', 'count': i})
		items = sorted(items, key=lambda item: item['item']['position'].value())
		items.append({
			'item': entry_formset.empty_form, 
			'type': 'entry', 
			'count': s_c.extra_form_position,
			'hidden': True
		})
		items.append({
			'item': divider_formset.empty_form, 
			'type': 'divider', 
			'count': s_c.extra_form_position,
			'hidden': True
		})
		items.append({
			'item': image_formset.empty_form, 
			'type': 'image', 
			'count': s_c.extra_form_position,
			'hidden': True
		})
		return items

	# def assembleTimelineEpisodes(self, import_episodes_formset):
	# 	episode_items = []
	# 	episode_items.append({
	# 		'item': import_episodes_formset.empty_form, 
	# 		'type': 'import-episodes', 
	# 		'position': s_c.extra_form_position,
	# 	})
	# 	return episode_items


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