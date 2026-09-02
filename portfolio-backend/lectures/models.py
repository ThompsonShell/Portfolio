import re
from urllib.parse import parse_qs, urlparse

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify


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
    course = models.ForeignKey(
        "Course", on_delete=models.SET_NULL, blank=True, null=True,
        related_name="lectures", help_text="Qaysi kursga tegishli (ixtiyoriy)",
    )
    views_count = models.PositiveIntegerField(
        default=0, editable=False,
        help_text="Avtomatik hisoblanadi — har bir tashrifchi bir marta",
    )
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


class Course(models.Model):
    """A series of lectures taken in order — "JS Async/Await", "React Hooks".

    Lectures still carry their own `category` for cross-course filtering; a
    course is the ordered container the lesson player walks through.
    """

    title = models.CharField(max_length=250)
    slug = models.SlugField(max_length=270, unique=True, blank=True)
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=30, choices=Lecture.CATEGORY_CHOICES, default="general")
    accent_color = models.CharField(
        max_length=7, blank=True, default="#7C3AED",
        help_text="Karta gradienti uchun HEX rang",
    )
    cover_image = models.ImageField(upload_to="course_covers/", blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0, help_text="Kichik raqam = yuqorida")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Kurs"
        verbose_name_plural = "Kurslar"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or "course"
            slug, i = base, 2
            while Course.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def lesson_count(self) -> int:
        return self.lectures.count()

    @property
    def total_seconds(self) -> int:
        return sum(l.duration_seconds for l in self.lectures.all())
