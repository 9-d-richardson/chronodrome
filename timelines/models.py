import copy

from django.contrib.auth import get_user_model
from django.db import models
from django.urls import reverse

from accounts.models import CustomUser
from config import shared_constants as s_c
from config import shared_objects as s_o

#Where to save images. Same folder for both, just accessed a different way
def header_image_directory_path(instance, filename):
	return 'timeline_images/{0}/{1}'.format(instance.id, filename)
def image_directory_path(instance, filename):
	return 'timeline_images/{0}/{1}'.format(instance.timeline.id, filename)


class Timeline(models.Model):
	title = models.CharField(max_length=s_c.CharFieldMaxLength)
	header_image = models.ImageField(
		upload_to=header_image_directory_path,
		null=True,
		blank=True
	)
	description = copy.deepcopy(s_o.default_textfield)
	created = models.DateTimeField(auto_now_add=True)
	updated = models.DateTimeField(auto_now=True)
	creator = models.ForeignKey(
		get_user_model(),
		on_delete=models.CASCADE,
		related_name='creator'
	)
	bookmarks = models.ManyToManyField(
		CustomUser, 
		blank=True,
		related_name='bookmarks'
	)
	hidden = models.BooleanField(default=False)

	class Meta:
		ordering = ['-updated',]
		# indexes = [models.Index(fields=['title',]),]

	''' Save function is modified to save the timeline before saving the image
	because for new TLs you have to get the TL's pk first to know which folder
	to save the images to. '''
	def save(self, *args, **kwargs):
		if self.id is None:
			saved_header_image = self.header_image
			self.header_image = None
			super(Timeline, self).save(*args, **kwargs)
			self.header_image = saved_header_image
		super(Timeline, self).save(*args, **kwargs)

	def __str__(self):
		return self.title

	def get_absolute_url(self):
		return reverse('timeline_detail', args=[str(self.id)])


# Do we want to limit just the number of entries to 1000, or entries plus dividers?
def restrict_items(value):
    if TimelineItem.objects.filter(pk=value).count() > 1000:
        raise ValidationError('Each timeline can only have up to 1000 entries.')


class Entry(models.Model):
	timeline = models.ForeignKey(
		Timeline, 
		on_delete=models.CASCADE,
		related_name='entry',
	)
	name = models.CharField(max_length=s_c.CharFieldMaxLength)
	author = copy.deepcopy(s_o.default_charfield)
	section = copy.deepcopy(s_o.default_charfield)
	date = copy.deepcopy(s_o.default_charfield)
	link = models.URLField(
		max_length = 200,
		default='',
		blank=True,
		null=True
	)
	comment = copy.deepcopy(s_o.default_textfield)
	position = models.IntegerField(default=s_c.extra_form_position)

	class Meta:
		ordering = ['position',]

	def __str__(self):
		return self.name

	def get_absolute_url(self):
		return reverse('timeline_list')


class Episode(models.Model):
	entry = models.ForeignKey(
		Entry, 
		on_delete=models.CASCADE,
		related_name='episode',
	)
	name = models.CharField(max_length=s_c.CharFieldMaxLength)
	date = copy.deepcopy(s_o.default_charfield)
	position = models.IntegerField(default=s_c.extra_form_position)

	class Meta:
		ordering = ['position',]

	def __str__(self):
		return self.name


class Divider(models.Model):
	timeline = models.ForeignKey(
		Timeline, 
		on_delete=models.CASCADE,
		related_name='divider',
	)
	name = copy.deepcopy(s_o.default_charfield)
	subheading = copy.deepcopy(s_o.default_charfield)
	comment = copy.deepcopy(s_o.default_textfield)
	position = models.IntegerField(default=s_c.extra_form_position)

	class Meta:
		ordering = ['position',]

	def __str__(self):
		return self.name

	def get_absolute_url(self):
		return reverse('timeline_list')


class Image(models.Model):
	timeline = models.ForeignKey(
		Timeline, 
		on_delete=models.CASCADE,
		related_name='image',
	)
	image = models.ImageField(
		upload_to=image_directory_path,
		null=True,
	)
	caption = copy.deepcopy(s_o.default_charfield)
	position = models.IntegerField(default=s_c.extra_form_position)

	class Meta:
		ordering = ['position',]


class UserHasReadTracker(models.Model):
	user = models.ForeignKey(
		CustomUser,
		on_delete=models.CASCADE,
		related_name='user_tracker'
	)
	timeline = models.ForeignKey(
		Timeline, 
		on_delete=models.CASCADE,
		related_name='timeline_tracker',
	)
	mark_as_read = models.ManyToManyField(Entry, blank=True)

	def __str__(self):
		return 'User: ' + str(self.user) + " TL: " + str(self.timeline)


class UserHasReadEpisodeTracker(models.Model):
	user = models.ForeignKey(
		CustomUser,
		on_delete=models.CASCADE,
		related_name='episode_tracker'
	)
	entry = models.ForeignKey(
		Entry, 
		on_delete=models.CASCADE,
		related_name='entry_tracker',
	)
	mark_as_read = models.ManyToManyField(Episode, blank=True)

	def __str__(self):
		return 'User: ' + str(self.user) + " Entry: " + str(self.entry)