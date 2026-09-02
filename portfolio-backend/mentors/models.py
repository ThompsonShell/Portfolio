from django.db import models


class Mentor(models.Model):
    """Someone who taught, guided, or opened a door — the "Ustozlar" page."""

    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150, help_text="Masalan: Senior Developer")
    company = models.CharField(max_length=150, blank=True, default="", help_text="Masalan: Google")
    description = models.TextField(blank=True, default="", help_text="Nima o'rgatgani haqida")

    photo = models.ImageField(upload_to="mentor_photos/", blank=True, null=True)
    initials = models.CharField(
        max_length=4, blank=True, default="",
        help_text="Rasm bo'lmasa ko'rsatiladi. Bo'sh qoldirilsa ismdan olinadi.",
    )
    accent_color = models.CharField(
        max_length=7, blank=True, default="#7C3AED",
        help_text="Avatar va karta foni uchun HEX rang",
    )

    tags = models.CharField(
        max_length=300, blank=True, default="",
        help_text="Vergul bilan ajrating: JavaScript, Architecture",
    )
    profile_url = models.URLField(blank=True, default="", help_text="LinkedIn, GitHub yoki shaxsiy sayt")

    is_featured = models.BooleanField(default=False, help_text="Bosh sahifada ko'rsatilsinmi")
    order = models.PositiveIntegerField(default=0, help_text="Kichik raqam = yuqorida")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Ustoz"
        verbose_name_plural = "Ustozlar"

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.initials and self.name:
            parts = [p for p in self.name.split() if p]
            self.initials = "".join(p[0] for p in parts[:2]).upper()
        super().save(*args, **kwargs)

    @property
    def tag_list(self) -> list[str]:
        return [t.strip() for t in self.tags.split(",") if t.strip()]
