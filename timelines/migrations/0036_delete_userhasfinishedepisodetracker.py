# Generated by Django 4.1.2 on 2022-11-01 01:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('timelines', '0035_rename_userhasreadepisodetracker_userhasfinishedepisodetracker_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='UserHasFinishedEpisodeTracker',
        ),
    ]
