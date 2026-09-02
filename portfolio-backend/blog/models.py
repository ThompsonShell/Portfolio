from django.db import models
from cloudinary.models import CloudinaryField


class Post(models.Model):
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True)
    cover_image = models.ImageField(upload_to="blog_covers/", blank=True, null=True)
    content = models.TextField(help_text="Markdown content")
    excerpt = models.CharField(max_length=500, blank=True, default="")
    reading_time = models.PositiveIntegerField(default=5, help_text="Estimated reading time in minutes")
    views_count = models.PositiveIntegerField(
        default=0, editable=False,
        help_text="Avtomatik hisoblanadi — har bir tashrifchi bir marta",
    )
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-published_at"]

    def __str__(self) -> str:
        return self.title
