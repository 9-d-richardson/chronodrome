# Generated by Django 4.0.6 on 2022-09-16 02:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timelines', '0006_timelineitem_alter_entry_options_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='entry',
            options={'ordering': ['position']},
        ),
        migrations.AddField(
            model_name='entry',
            name='comment',
            field=models.TextField(blank=True, default='', max_length=10000, null=True),
        ),
        migrations.AddField(
            model_name='entry',
            name='date',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AddField(
            model_name='entry',
            name='name',
            field=models.CharField(default='q', max_length=500),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='entry',
            name='position',
            field=models.IntegerField(default=1000),
        ),
        migrations.DeleteModel(
            name='Divider',
        ),
        migrations.DeleteModel(
            name='TimelineItem',
        ),
    ]