# Generated by Django 3.2.3 on 2021-12-11 18:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('CheckersGame', '0002_auto_20211211_2033'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='turn',
            field=models.BooleanField(default=True),
        ),
    ]