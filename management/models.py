import copy

from django.db import models
from django.contrib.auth import get_user_model
from django.urls import reverse

from config import shared_objects as s_o


class Feedback(models.Model):
	feedback_text = copy.deepcopy(s_o.default_textfield)
	created = models.DateTimeField(auto_now_add=True)
	feedback_creator = models.ForeignKey(
		get_user_model(),
		on_delete=models.CASCADE,
		related_name='feedback_creator',
		null=True,
	)
	dealt_with = models.BooleanField(default=False)

	class Meta:
		ordering = ['-created',]

	def __str__(self):
		return self.feedback_text[:100]

	def get_absolute_url(self):
		return reverse('timeline_search')


class Changelog(models.Model):
	changelog_text = models.TextField(default='')
	created = models.DateTimeField(auto_now_add=True)
	changelog_creator = models.ForeignKey(
		get_user_model(),
		on_delete=models.CASCADE,
		related_name='changelog_creator',
	)
	def __str__(self):
		return 'Changelog ' + str(self.created)