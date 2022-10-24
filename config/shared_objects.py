from django.forms import ModelForm, ClearableFileInput
from django.db.models import CharField, TextField

from config import shared_constants as s_c

'''
A file storing some odds and ends that are shared across several Django apps
'''

# Custom template for all user forms
class CustomModelForm(ModelForm):
	template_name = "widgets/form_template.html"

#For various models.py - default fields for non-required fields
default_charfield = CharField(
	max_length=s_c.CharFieldMaxLength, 
	default='', 
	blank=True,
	null=True
)
default_textfield = TextField(
	max_length=s_c.TextFieldMaxLength,
	default='', 
	blank=True, 
	null=True
) 

# Custom widget for image uploads, to change the styling
class CustomImageInput(ClearableFileInput):
	template_name = 'widgets/custom_image_input.html'
	initial_text = 'Current:'
	input_text = 'Upload new:'
	clear_checkbox_label = 'Delete:'
