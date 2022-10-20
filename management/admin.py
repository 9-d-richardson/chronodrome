from django.contrib import admin
from .models import Feedback, Changelog

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
	model = Feedback
	list_display = (
		'created', 
		'feedback_text', 
		'feedback_creator', 
		'dealt_with'
	)

@admin.register(Changelog)
class ChangelogAdmin(admin.ModelAdmin):
	model = Changelog
	list_display = (
		'created', 
		'changelog_text', 
		'changelog_creator',
	)