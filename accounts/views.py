from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib import messages
from django.contrib.auth.hashers import check_password
from django.db import IntegrityError, transaction

from django.views.generic import CreateView, DetailView, ListView, FormView
from django.views.generic.base import TemplateView
from django.contrib.auth import views
from django.contrib.auth.mixins import LoginRequiredMixin

from .forms import (CustomUserCreationForm, CustomUserChangeForm, 
	CustomUserDeleteForm)
from .models import CustomUser
from timelines.models import Timeline

class SignUpView(CreateView):
	form_class = CustomUserCreationForm
	success_url = reverse_lazy('login')
	template_name = 'accounts/signup.html'

	def form_invalid(self, form):
		return super().form_invalid(form)

	def form_valid(self, form):
		messages.success(self.request, 'Account created!')
		return super().form_valid(form)


class EditProfile(LoginRequiredMixin, FormView):
	template_name = 'accounts/edit_profile.html'
	form_class = CustomUserChangeForm
	success_url = 'timeline_search'	

	def get_initial(self):
		initial = super().get_initial()
		user = self.request.user
		initial['username'] = user.username
		initial['email'] = user.email
		initial['user_description'] = user.user_description
		return initial

	def form_invalid(self, form):
		'''This adds changed_input to the context, so the template knows to 
		warn of unsaved changes'''
		return self.render_to_response(self.get_context_data(
			form=form, 
			changed_input=True
		))

	def post(self, request, *args, **kwargs):
		user = self.request.user
		form = CustomUserChangeForm(request.POST, instance=user)
		if form.is_bound and form.is_valid():
			with transaction.atomic():
				form.save()
				messages.success(request, 'Changes saved!')
				return HttpResponseRedirect(reverse_lazy('view_user', 
					kwargs={"username":user.username}))
		messages.error(request, 'There were problems updating your profile.')
		return self.form_invalid(form)


class DeleteProfile(LoginRequiredMixin, TemplateView):
	template_name = 'accounts/delete_profile.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['form'] = CustomUserDeleteForm()
		return context

	def post(self, request, **kwargs):
		user = self.request.user
		form = CustomUserDeleteForm(request.POST, user=user)
		if form.is_bound and form.is_valid():
			with transaction.atomic():
				user.is_active = False
				user.save()
				if form.cleaned_data['delete_timelines'] == 'yes':
					user_timelines = Timeline.objects.filter(creator=user)
					user_timelines.delete()
				messages.success(request, 'Account deleted.')
				return HttpResponseRedirect(reverse_lazy('timeline_search'))
		messages.error(request, 'There were problems deleting your account.')
		return render(self.request, self.template_name, {'form': form})


#Custom views which just set a different template location
class CustomLoginView(views.LoginView):
	template_name = 'accounts/login.html'
class CustomPasswordChangeView(views.PasswordChangeView):
	template_name = 'accounts/password_change_form.html'
class CustomPasswordChangeDoneView(views.PasswordChangeDoneView):
	template_name = 'accounts/password_change_done.html'
class CustomPasswordResetView(views.PasswordResetView):
	template_name = 'accounts/password_reset_form.html'
class CustomPasswordResetDoneView(views.PasswordResetDoneView):
	template_name = 'accounts/password_reset_done.html'
class CustomPasswordResetConfirmView(views.PasswordResetConfirmView):
	template_name = 'accounts/password_reset_confirm.html'
class CustomPasswordResetCompleteView(views.PasswordResetCompleteView):
	template_name = 'accounts/password_reset_complete.html'