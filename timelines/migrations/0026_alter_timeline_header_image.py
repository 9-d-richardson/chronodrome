# Generated by Django 4.0.6 on 2022-10-03 23:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timelines', '0025_timeline_header_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='timeline',
            name='header_image',
            field=models.ImageField(blank=True, null=True, upload_to='images/'),
        ),
    ]
