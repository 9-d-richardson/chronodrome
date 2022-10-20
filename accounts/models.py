import copy

from django.db import models
from django.contrib.auth.models import AbstractUser

from config import shared_objects as s_o

class CustomUser(AbstractUser):
	user_description = copy.deepcopy(s_o.default_textfield)
	email = models.EmailField(unique=True)
	REQUIRED_FIELDS = ['email']

	class Meta:
		ordering = ['username',]
