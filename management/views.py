from django.shortcuts import render
from django.views.generic.base import TemplateView
from django.views.generic import FormView
from django.urls import reverse_lazy
from django.http import HttpResponseRedirect
from django.contrib import messages

from .forms import FeedbackForm
from .models import Feedback, Changelog

class HomeView(TemplateView):
	'''
	Home page/FAQ page
	'''
	template_name = 'management/home.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['changelog'] = Changelog.objects.all()[:3]
		return context


class CreateFeedbackView(FormView):
	form_class = FeedbackForm
	success_url = reverse_lazy('timeline_search')
	template_name = 'management/feedback_create.html'

	def form_valid(self, form):
		feedback = form.save(commit=False)
		if self.request.user.is_authenticated:
			feedback.feedback_creator=self.request.user
		feedback.save()
		messages.success(self.request, 'Feedback sent!')
		return super().form_valid(feedback)

	def form_invalid(self, form):
		'''This adds changed_input to the context, so the template knows to 
		warn of unsaved changes'''
		return self.render_to_response(self.get_context_data(
			form=form, 
			changed_input=True
		))

class ChangelogView(TemplateView):
	'''
	Shows basic list of all the major changes on the site. Will have to add
	pagination if the changelog gets too long, but fine without for now.
	'''
	template_name = 'management/changelog.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['changelog'] = Changelog.objects.all()
		return context