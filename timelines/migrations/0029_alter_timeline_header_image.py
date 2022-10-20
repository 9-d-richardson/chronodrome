# Generated by Django 4.0.6 on 2022-10-18 04:02

from django.db import migrations, models
import timelines.models


class Migration(migrations.Migration):

    dependencies = [
        ('timelines', '0028_alter_image_image_alter_timeline_header_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='timeline',
            name='header_image',
            field=models.ImageField(blank=True, null=True, upload_to=timelines.models.header_image_directory_path),
        ),
    ]
