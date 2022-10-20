from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm
from.models import CustomUser

class CustomUserAdmin(UserAdmin):
	add_form = CustomUserCreationForm
	model = CustomUser
	list_display = ['id', 'email', 'username', 'is_staff',]
	fieldsets = UserAdmin.fieldsets + (
		(None, {'fields': ('description',)}), # In order to access new fields from the admin page, add them here
	)
	add_fieldsets = UserAdmin.add_fieldsets + (
		(None, {'fields': ('description',)}),
	)

admin.site.register(CustomUser, CustomUserAdmin)