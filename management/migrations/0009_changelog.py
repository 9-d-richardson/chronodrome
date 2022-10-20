# Generated by Django 4.0.6 on 2022-08-07 21:44

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('management', '0008_rename_ticket_creator_feedback_feedback_creator_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Changelog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('changelog_text', models.TextField(default='')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('changelog_creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='changelog_creator', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]