# Generated by Django 4.0.6 on 2022-08-07 02:21

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('management', '0004_alter_feedback_ticket_creator'),
    ]

    operations = [
        migrations.AlterField(
            model_name='feedback',
            name='ticket_creator',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, related_name='feedback_creator', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
