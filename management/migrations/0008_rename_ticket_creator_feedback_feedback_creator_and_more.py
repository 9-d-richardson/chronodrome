# Generated by Django 4.0.6 on 2022-08-07 21:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('management', '0007_rename_ticket_text_feedback_feedback_text'),
    ]

    operations = [
        migrations.RenameField(
            model_name='feedback',
            old_name='ticket_creator',
            new_name='feedback_creator',
        ),
        migrations.AddField(
            model_name='feedback',
            name='dealt_with',
            field=models.BooleanField(default=False),
        ),
    ]
