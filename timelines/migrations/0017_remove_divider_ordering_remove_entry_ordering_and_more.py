# Generated by Django 4.0.6 on 2022-09-19 04:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('timelines', '0016_alter_entry_timeline_timelineordering_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='divider',
            name='ordering',
        ),
        migrations.RemoveField(
            model_name='entry',
            name='ordering',
        ),
        migrations.RemoveField(
            model_name='image',
            name='ordering',
        ),
        migrations.DeleteModel(
            name='TimelineOrdering',
        ),
    ]
