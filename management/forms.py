from .models import Feedback
from django import forms

from config import shared_constants as s_c
from config import shared_objects as s_o

class FeedbackForm(s_o.CustomModelForm):
	class Meta:
		model = Feedback
		fields = ['feedback_text']
	feedback_text = forms.CharField(
		max_length=s_c.TextFieldMaxLength,
		label='Feedback:',
		widget=forms.Textarea(attrs={'rows': 10,}),
		error_messages={
			'required': 'Please fill out this form.',
			'max_length': s_c.max_length_error
		}
	)
