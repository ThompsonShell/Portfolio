from django.db import models
from cloudinary.models import CloudinaryField


class Project(models.Model):
    CATEGORY_CHOICES = [
        ("backend", "Backend"),
        ("frontend", "Frontend"),
        ("fullstack", "Fullstack"),
        ("infrastructure", "Infrastructure"),
        ("devops", "Devops"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default="backend")
    cover_image = models.ImageField(upload_to="project_covers/", blank=True, null=True, help_text="Tafsiya: 1920x1080 yoki 1280x720 o'lchamdagi gorizontal .webp, .jpg, .png rasm yuklang")
    tech_tags = models.CharField(max_length=500, blank=True, default="", help_text="Technologies separated by commas, e.g. Django, React, Tailwind")
    github_url = models.URLField(blank=True, default="")
    live_url = models.URLField(blank=True, default="")
    sponsor_url = models.URLField(blank=True, default="", help_text="Optional: GitHub Sponsors or similar link. Leave blank to hide the button.")
    is_featured = models.BooleanField(default=False)
    stat1_value = models.CharField(max_length=50, blank=True, default="", help_text="e.g. 50k+")
    stat1_label = models.CharField(max_length=100, blank=True, default="", help_text="e.g. requests / second")
    stat2_value = models.CharField(max_length=50, blank=True, default="", help_text="e.g. ~38ms")
    stat2_label = models.CharField(max_length=100, blank=True, default="", help_text="e.g. avg response time")
    stat3_value = models.CharField(max_length=50, blank=True, default="", help_text="e.g. 99.97%")
    stat3_label = models.CharField(max_length=100, blank=True, default="", help_text="e.g. uptime last 12 months")
    order = models.PositiveIntegerField(default=0, help_text="Lower number = higher priority")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self) -> str:
        return self.title
