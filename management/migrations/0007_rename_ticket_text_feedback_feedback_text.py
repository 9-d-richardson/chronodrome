# Generated by Django 4.0.6 on 2022-08-07 20:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('management', '0006_alter_feedback_ticket_creator'),
    ]

    operations = [
        migrations.RenameField(
            model_name='feedback',
            old_name='ticket_text',
            new_name='feedback_text',
        ),
    ]