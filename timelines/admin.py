from django.contrib import admin
from .models import Timeline, Entry, Divider, Image

class EntryInline(admin.StackedInline):
	model = Entry
	extra = 0


class DividerInline(admin.StackedInline):
	model = Divider
	extra = 0


class ImageInline(admin.StackedInline):
	model = Image
	extra = 0
	

class TimelineAdmin(admin.ModelAdmin):
	inlines = [
		EntryInline, DividerInline, ImageInline
	]
	fields = ['title', 'creator', 'hidden', 'description', 'header_image', 
		'header_caption', 'header_source', 'url', 'slug']
	list_display = ('title', 'creator')

admin.site.register(Timeline, TimelineAdmin)
admin.site.register(Entry)
admin.site.register(Divider)
admin.site.register(Image)