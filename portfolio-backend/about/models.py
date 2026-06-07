from django.db import models
from cloudinary.models import CloudinaryField


class Bio(models.Model):
    """Singleton model — only one bio record should exist."""
    photo = models.ImageField(upload_to="bio_photos/", blank=True, null=True)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True, help_text="Upload PDF resume")
    bio_text = models.TextField(help_text="Markdown-formatted bio")
    github_url = models.URLField(blank=True, default="")
    linkedin_url = models.URLField(blank=True, default="")
    telegram_url = models.URLField(blank=True, default="")
    youtube_url = models.URLField(blank=True, default="")
    email = models.EmailField(blank=True, default="")

    class Meta:
        verbose_name = "Bio"
        verbose_name_plural = "Bio"

    def __str__(self) -> str:
        return "Site Bio"

    def save(self, *args, **kwargs):
        # Enforce singleton: always use pk=1
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls) -> "Bio":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Experience(models.Model):
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True, help_text="Leave blank if current")
    description = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-start_date"]

    def __str__(self) -> str:
        return f"{self.title} at {self.company}"


class Skill(models.Model):
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self) -> str:
        return self.name
