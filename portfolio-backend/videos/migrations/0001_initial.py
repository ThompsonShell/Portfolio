import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("lectures", "0004_alter_lecture_youtube_video_id"),
    ]

    operations = [
        migrations.CreateModel(
            name="VideoUpload",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("upload_id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True)),
                ("original_filename", models.CharField(max_length=500)),
                ("content_type", models.CharField(blank=True, default="", max_length=100)),
                ("title", models.CharField(blank=True, default="", max_length=300)),
                ("category", models.CharField(default="general", max_length=30)),
                ("total_size", models.BigIntegerField(help_text="Full file size in bytes (tus Upload-Length)")),
                ("bytes_received", models.BigIntegerField(default=0)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("uploading", "Uploading"),
                            ("pending_processing", "Pending processing"),
                            ("completed", "Completed"),
                            ("failed", "Failed"),
                        ],
                        default="uploading",
                        max_length=32,
                    ),
                ),
                ("storage_path", models.CharField(blank=True, default="", max_length=1000)),
                ("error_message", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "lecture",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="source_uploads",
                        to="lectures.lecture",
                    ),
                ),
                (
                    "owner",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="video_uploads",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
