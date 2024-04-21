# Generated by Django 5.0.4 on 2024-04-21 06:25

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Group",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=32)),
                ("location", models.CharField(max_length=32)),
                ("description", models.CharField(max_length=256)),
                ("what", models.CharField(blank=True, max_length=23)),
            ],
            options={
                "unique_together": {("name", "location")},
            },
        ),
    ]
