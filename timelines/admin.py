from django.contrib import admin
from .models import Timeline, Entry

class EntryInline(admin.StackedInline):
	model = Entry
	extra = 0
	

class TimelineAdmin(admin.ModelAdmin):
	inlines = [
		EntryInline,
	]

	list_display = ('title', 'creator', 'url', 'slug')

admin.site.register(Timeline, TimelineAdmin)
admin.site.register(Entry)