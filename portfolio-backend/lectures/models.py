from django.db import models


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
    youtube_video_id = models.CharField(max_length=20, help_text="YouTube video ID (e.g. dQw4w9WgXcQ)")
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default="general")
    duration_seconds = models.PositiveIntegerField(default=0, help_text="Video duration in seconds")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self) -> str:
        return self.title
