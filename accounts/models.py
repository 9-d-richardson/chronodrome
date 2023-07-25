import copy
import shortuuid
from shortuuid.django_fields import ShortUUIDField

from django.db import models
from django.contrib.auth.models import AbstractUser

from config import shared_objects as s_o

def avatar_directory_path(instance, filename):
	new_filename = shortuuid.uuid()[:10]
	filetype = filename.split('.')[-1]
	return 'avatars/{0}/{1}.{2}'.format(
		instance.user_url, new_filename, filetype)

class CustomUser(AbstractUser):
	user_description = copy.deepcopy(s_o.default_textfield)
	email = models.EmailField(unique=True)
	avatar = models.ImageField(
		upload_to=avatar_directory_path,
		null=True,
		blank=True
	)
	user_url = ShortUUIDField(
		length=10,
	)
	REQUIRED_FIELDS = ['email']

	''' Have to override the save function to make sure avatars are saved to the 
	right folder '''
	def save(self, *args, **kwargs):
		if self.user_url is None:
			saved_avatar = self.saved_avatar
			self.saved_avatar = None
			super(CustomUser, self).save(*args, **kwargs)
			self.saved_avatar = saved_avatar
		super(CustomUser, self).save(*args, **kwargs)


	class Meta:
		ordering = ['username',]
