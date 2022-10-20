from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from .models import CustomUser

from config import shared_constants as s_c
from config import shared_objects as s_o

#Shared fields
username = forms.CharField(
	required=True,
	label="Username*:",
	max_length=150,
)
email = forms.EmailField(
	required = True,
	label="Email*:",
	error_messages={
		'required': 'Please enter an email address.',
		'unique': 'A user with that email already exists.',
	}
)
check_password = forms.CharField(
	widget=forms.PasswordInput(),
	label="Verify password*:"
)


class CustomUserCreationForm(UserCreationForm):
	template_name = "widgets/form_template.html"
	class Meta(UserCreationForm):
		model = CustomUser
		fields = ('username', 'email', 'password1', 'password2')
	username = username
	email = email
	password1 = forms.CharField(
		widget=forms.PasswordInput(),
		label="Password*:"
	)
	password2 = forms.CharField(
		widget=forms.PasswordInput(),
		label="Confirm Password*:"
	)

class CustomUserChangeForm(s_o.CustomModelForm):
	'''This init is necessary to access the user when checking the password. 
	Unlike with the delete form, the ModelForm here allows an object to be
	passed as "instance", so we don't need to remove "instance" from the
	dictionary. That way the form will know that it's updating an existing
	model instead of creating a new one.'''
	def __init__(self, *args, **kwargs):
		self.user = kwargs.get('instance',None)
		super(CustomUserChangeForm, self).__init__(*args, **kwargs)

	class Meta:
		model = CustomUser
		fields = ('username', 'email', 'user_description', 'check_password')

	username = username
	email = email
	user_description = forms.CharField(
		max_length=s_c.TextFieldMaxLength,
		widget=forms.Textarea(), 
		required=False,
		error_messages={'max_length': s_c.max_length_error},
		label="Describe yourself:"
	)
	check_password = check_password

	def clean_check_password(self):
		cleaned_data = super().clean()
		password = self.cleaned_data['check_password']
		if self.user.check_password(password):
			return password
		else:
			raise ValidationError("This password is incorrect.")


class CustomUserDeleteForm(forms.Form):
	'''This init is necessary to access the user when checking the password. 
	The user kwarg has to be popped/removed from the dictionary because the 
	form isn't a ModelForm and so isn't expecting any extra keys. Basically 
	you're passing an extra key for use in this class which can't be passed back
	up to the parent class. '''
	def __init__(self, *args, **kwargs):
		self.user = kwargs.pop('user',None)
		super(CustomUserDeleteForm, self).__init__(*args, **kwargs)

	template_name = "widgets/form_template.html"
	delete_timelines = forms.ChoiceField(
		choices=[('no', 'No'), ('yes', 'Yes')], 
		required=True,
		widget=forms.RadioSelect(),
		label="Do you want to delete all your timelines as well?"
	)
	check_password = check_password

	def clean_check_password(self):
		cleaned_data = super().clean()
		password = self.cleaned_data['check_password']
		if self.user.check_password(password):
			return password
		else:
			raise ValidationError("This password is incorrect.")
	