# Generated by Django 4.1.3 on 2023-01-05 00:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timelines', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='episode',
            name='link',
            field=models.URLField(blank=True, default='', null=True),
        ),
    ]
