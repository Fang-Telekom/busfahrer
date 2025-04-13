# Generated by Django 5.2 on 2025-04-12 20:22

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Card',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('symbol', models.CharField(choices=[('H', 'Hearts'), ('D', 'Diamonds'), ('C', 'Clubs'), ('S', 'Spades')], max_length=1)),
                ('value', models.IntegerField(choices=[(2, '2'), (3, '3'), (4, '4'), (5, '5'), (6, '6'), (7, '7'), (8, '8'), (9, '9'), (10, '10'), (11, 'Jack'), (12, 'Queen'), (13, 'King'), (1, 'Ace')])),
                ('is_dealt', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Deck',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cards', models.ManyToManyField(to='play.card')),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20)),
                ('lvl', models.IntegerField(choices=[(0, 'Guest'), (1, 'Master')], default=0)),
                ('cards', models.ManyToManyField(to='play.card')),
            ],
        ),
        migrations.CreateModel(
            name='Party',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('code', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('gameCards', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='deck', to='play.deck')),
                ('player', models.ManyToManyField(to='play.user')),
            ],
        ),
    ]
