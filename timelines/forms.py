from django.core.exceptions import ValidationError
from django import forms

from .models import Timeline, Entry, Episode, Divider, Image
from config import shared_constants as s_c
from config import shared_objects as s_o

### Fields that are shared between two or more types of items ###
date_field = forms.CharField(
	max_length=s_c.CharFieldMaxLength,
	widget=forms.TextInput(attrs={
		'placeholder': 'E.g. 435-411 BC or Third Age 2941', 
	}),
	required=False,
	label="Date:"
)
comment_field = forms.CharField(
	max_length=s_c.TextFieldMaxLength,
	widget=forms.Textarea(attrs={'rows': s_c.TextAreaRows,}), 
	required=False,
	label="Comment:",
	error_messages={
		'max_length': s_c.max_length_error,
	}
)
position_field = forms.IntegerField(
	widget = forms.HiddenInput(), 
	required=False,
	initial=s_c.extra_form_position
)


class TimelineForm(s_o.CustomModelForm):
	class Meta:
		model = Timeline
		fields = ['title', 'description', 'header_image', 'header_caption', 
			'header_source', 'hidden']
	title = forms.CharField(
		max_length=s_c.CharFieldMaxLength, 
		label="Title*:"
	)
	header_image = forms.ImageField(
		required=False,
		label="Header image:",
		widget=s_o.CustomImageInput
	)
	header_caption = forms.CharField(
		max_length=s_c.CharFieldMaxLength,
		required=False,
		label="Image caption:"
	)
	header_source = forms.URLField(
		widget=forms.TextInput(attrs={
			'placeholder': "Link to the image's source", 
		}),
		required=False,
		label="Image source:",
		error_messages={
			'invalid': 'This URL is invalid.',
		}
	)
	description = forms.CharField(
		max_length=s_c.TextFieldMaxLength,
		widget=forms.Textarea(attrs={'rows': s_c.TextAreaRows,}), 
		required=False, 
		label="Description:",
		error_messages={
			'max_length': s_c.max_length_error,
		}

	)
	hidden = forms.BooleanField(
		required=False, 
		label="Hide timeline:",
		help_text='(Hide this timeline for everyone but you. For timelines still under construction.)'
	)


### FORMS FOR TIMELINE ITEMS ###
class EntryForm(s_o.CustomModelForm):
	class Meta:
		model = Entry
		fields = ['name', 'author', 'section', 'date', 'link', 'comment', 
			'position',]
	name = forms.CharField(
		max_length=s_c.CharFieldMaxLength, 
		label="Name*:",
		error_messages={
			'required': 'Each entry needs a name.',
		}
	)
	author = forms.CharField(
		max_length=s_c.CharFieldMaxLength,
		required=False,
		label="Author(s):"
	)
	section = forms.CharField(
		max_length=s_c.CharFieldMaxLength,
		widget=forms.TextInput(attrs={
			'placeholder': 'E.g. Chapter 1 or Episodes 9-13', 
		}),
		required=False,
		label="Section:"
	)
	date = date_field
	link = forms.URLField(
		widget=forms.TextInput(attrs={
			'placeholder': 'E.g. link to a preferred edition', 
		}),
		required=False,
		label="Link:",
		error_messages={
			'invalid': 'This URL is invalid.',
		}
	)
	comment = comment_field
	position = position_field


class DividerForm(s_o.CustomModelForm):
	class Meta:
		model = Divider
		fields = ['name', 'subheading', 'comment', 'position']
	name = forms.CharField(
		max_length=s_c.CharFieldMaxLength,
		required=False,
		label="Name:",
		error_messages={
			'required': 'Each entry needs a name.',
		}
	)
	subheading = forms.CharField(
		max_length=s_c.CharFieldMaxLength,
		required=False,
		label="Date/subheading:"
	)
	comment = comment_field
	position = position_field


class ImageForm(s_o.CustomModelForm):
	class Meta:
		model = Image
		fields = ['image', 'caption', 'source', 'position']
	image = forms.ImageField(
		widget=s_o.CustomImageInput,
		label="Image*:",
		error_messages={
			'required': 'Please add an image.',
		}
	)
	caption = forms.CharField(
		max_length=s_c.CharFieldMaxLength,
		required=False,
		label="Caption:"
	)
	source = forms.URLField(
		widget=forms.TextInput(attrs={
			'placeholder': "Link to the image's source", 
		}),
		required=False,
		label="Image source:",
		error_messages={
			'invalid': 'This URL is invalid.',
		}
	)
	position = position_field


class EpisodeForm(s_o.CustomModelForm):
	class Meta:
		model = Episode
		fields = ['name', 'date', 'position', 'position_episode']
	name = forms.CharField(
		max_length=s_c.CharFieldMaxLength, 
		label="Name*:",
		error_messages={
			'required': 'Each episode needs a name.',
		}
	)
	date = date_field
	position = position_field
	position_episode = position_field


### IMPORT FORMS ###
class ImportForm(forms.Form):
	template_name = "widgets/form_template.html"
	import_form = forms.CharField(
		max_length=s_c.ImportFieldMaxLength,
		label='Copy here*:',
		widget=forms.Textarea(attrs={'rows': s_c.TextAreaRows,}),
		error_messages={
			'max_length': s_c.max_length_error,
		}
	)

	def clean_import_form(self):
		data = self.cleaned_data['import_form']
		split_data = data.split('\r\n')
		filtered_data = [line for line in split_data if line.strip() != ""]
		num_lines = len(filtered_data)
		if num_lines > s_c.ImportFieldMaxLines:
			raise ValidationError("Too many lines: " + str(num_lines) + '/' + 
				str(s_c.ImportFieldMaxLines) + '.')
		return filtered_data


class ImportEpisodesForm(forms.Form):
	template_name = "widgets/form_template.html"
	import_episodes_form = forms.CharField(
		label='List of episodes*:',
		widget=forms.Textarea(attrs={
			'rows': s_c.TextAreaRows,
		}),
	)
	position = position_field

	def clean_import_episodes_form(self):
		data = self.cleaned_data['import_episodes_form']
		split_data = data.split('\r\n')
		filtered_data = [line for line in split_data if line.strip() != ""]
		num_lines = len(filtered_data)
		if num_lines > s_c.MaxEpsPerEntry:
			raise ValidationError("Too many lines: " + str(num_lines) + '/' + 
				str(s_c.MaxEpsPerEntry) + '.')
		return filtered_data


### FORMSETS ###
# Modifies the normal formset class so that the delete button is hidden
class BaseItemFormSet(forms.BaseFormSet):
	deletion_widget = forms.HiddenInput

# Modifies the normal inline formset class so that the delete button is hidden
class BaseItemInlineFormSet(forms.BaseInlineFormSet):
	deletion_widget = forms.HiddenInput

EntryFormSet = forms.inlineformset_factory(
	Timeline, 
	Entry, 
	form=EntryForm, 
	formset=BaseItemInlineFormSet,
	max_num=s_c.MaxNumEntries, 
	validate_max=True,
	extra=0, 
	can_delete=True, 
)

DividerFormSet = forms.inlineformset_factory(
	Timeline, 
	Divider, 
	form=DividerForm, 
	formset=BaseItemInlineFormSet,
	max_num=s_c.MaxNumDividers, 
	validate_max=True,
	extra=0, 
	can_delete=True, 
)

ImageFormSet = forms.inlineformset_factory(
	Timeline, 
	Image, 
	form=ImageForm, 
	formset=BaseItemInlineFormSet,
	max_num=s_c.MaxNumImages, 
	validate_max=True,
	extra=0, 
	can_delete=True, 
)

EpisodeFormSet = forms.inlineformset_factory(
	Timeline, 
	Episode, 
	form=EpisodeForm, 
	formset=BaseItemInlineFormSet,
	max_num=10000, 
	validate_max=True,
	extra=0, 
	can_delete=True, 
)

ImportEpisodesFormSet = forms.formset_factory(
	ImportEpisodesForm, 
	formset=BaseItemFormSet,
	max_num=s_c.MaxNumEntries, 
	validate_max=True,
	extra=0,
	can_delete=True,
)
