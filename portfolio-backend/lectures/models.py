import re
from urllib.parse import parse_qs, urlparse

from django.core.exceptions import ValidationError
from django.db import models


def extract_youtube_video_id(value: str) -> str:
    """Accepts either a bare YouTube video ID or a full YouTube URL and returns the bare ID."""
    value = value.strip()
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", value):
        return value

    parsed = urlparse(value)
    if parsed.netloc.endswith("youtu.be"):
        return parsed.path.lstrip("/").split("/")[0]
    if "youtube.com" in parsed.netloc:
        query_id = parse_qs(parsed.query).get("v")
        if query_id:
            return query_id[0]
        parts = parsed.path.strip("/").split("/")
        if len(parts) >= 2 and parts[0] in ("embed", "shorts", "v"):
            return parts[1]
    return value


class Lecture(models.Model):
    CATEGORY_CHOICES = [
        ("database", "Database"),
        ("networking", "Networking"),
        ("backend", "Backend"),
        ("frontend", "Frontend"),
        ("devops", "DevOps"),
        ("algorithms", "Algorithms"),
        ("general", "General"),
    ]

    title = models.CharField(max_length=300)
    youtube_video_id = models.CharField(max_length=500, help_text="YouTube video ID or full YouTube URL (e.g. dQw4w9WgXcQ)", blank=True, null=True)
    lecture_video = models.FileField(upload_to="lectures/videos/", blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default="general")
    duration_seconds = models.PositiveIntegerField(default=0, help_text="Video duration in seconds")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if self.youtube_video_id:
            self.youtube_video_id = extract_youtube_video_id(self.youtube_video_id)
        super().save(*args, **kwargs)

    def clean(self):
        super().clean()
        if not self.youtube_video_id and not self.lecture_video:
            raise ValidationError("Either youtube_video_id or lecture_video must be provided.")