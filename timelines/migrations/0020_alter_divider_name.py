# Generated by Django 4.0.6 on 2022-09-19 22:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timelines', '0019_alter_image_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='divider',
            name='name',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
    ]