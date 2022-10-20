# Generated by Django 4.0.6 on 2022-09-16 22:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('timelines', '0014_image_remove_divider_image_remove_timeline_order_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='image',
            name='caption',
            field=models.TextField(blank=True, default='', max_length=10000, null=True),
        ),
        migrations.AddField(
            model_name='image',
            name='timeline',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='image', to='timelines.timeline'),
            preserve_default=False,
        ),
    ]