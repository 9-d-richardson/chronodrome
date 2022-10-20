# Generated by Django 4.0.6 on 2022-09-16 04:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('timelines', '0011_alter_timeline_order'),
    ]

    operations = [
        migrations.CreateModel(
            name='Divider',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=500)),
                ('date', models.CharField(blank=True, default='', max_length=500)),
                ('comment', models.TextField(blank=True, default='', max_length=10000, null=True)),
                ('position', models.IntegerField(default=1000)),
                ('timeline', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='divider', to='timelines.timeline')),
            ],
            options={
                'ordering': ['position'],
            },
        ),
    ]