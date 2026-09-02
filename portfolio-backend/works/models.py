from django.db import models
from django.utils.text import slugify


class Work(models.Model):
    """A piece of work — a project, an open-source tool, a client build, anything shippable.

    Replaces the old `projects.Project`: same idea, wider scope, and everything a
    detail page renders (features, architecture, problem/solution pairs) lives here.
    """

    WORK_TYPE_CHOICES = [
        ("web_app", "Web App"),
        ("mobile", "Mobile"),
        ("api", "API"),
        ("open_source", "Open Source"),
        ("other", "Boshqa"),
    ]

    STATUS_CHOICES = [
        ("production", "Production"),
        ("beta", "Beta"),
        ("archived", "Archived"),
        ("in_progress", "Ishlanmoqda"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    subtitle = models.CharField(
        max_length=300, blank=True, default="",
        help_text="Sarlavha ostidagi qisqa izoh",
    )
    description = models.TextField(help_text="Karta uchun qisqa tavsif")
    overview = models.TextField(
        blank=True, default="",
        help_text="'Loyiha haqida' bo'limi — to'liq tavsif",
    )

    work_type = models.CharField(max_length=30, choices=WORK_TYPE_CHOICES, default="web_app")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="production")

    cover_image = models.ImageField(
        upload_to="work_covers/", blank=True, null=True,
        help_text="Tavsiya: 1920x1080 yoki 1280x720 gorizontal rasm",
    )
    accent_color = models.CharField(
        max_length=7, blank=True, default="#7C3AED",
        help_text="Karta gradienti uchun HEX rang, masalan #7C3AED",
    )

    tech_tags = models.CharField(
        max_length=500, blank=True, default="",
        help_text="Vergul bilan ajrating: React, Node.js, PostgreSQL",
    )

    github_url = models.URLField(blank=True, default="")
    live_url = models.URLField(blank=True, default="")
    sponsor_url = models.URLField(blank=True, default="")

    # Sidebar meta — "Loyiha ma'lumotlari"
    role = models.CharField(max_length=150, blank=True, default="", help_text="Masalan: Fullstack Developer")
    duration = models.CharField(max_length=100, blank=True, default="", help_text="Masalan: 6 oy")
    team_size = models.CharField(max_length=100, blank=True, default="", help_text="Masalan: 4 kishi")

    architecture = models.TextField(
        blank=True, default="",
        help_text="Arxitektura diagrammasi — ASCII/matn ko'rinishida",
    )

    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0, help_text="Kichik raqam = yuqorida")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Ish"
        verbose_name_plural = "Ishlar"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or "work"
            slug, i = base, 2
            while Work.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def tech_tag_list(self) -> list[str]:
        return [t.strip() for t in self.tech_tags.split(",") if t.strip()]


class WorkStat(models.Model):
    """A single number in the sidebar's "Raqamlar" grid — 5k+ Users, 99.9% Uptime, …"""

    work = models.ForeignKey(Work, on_delete=models.CASCADE, related_name="stats")
    value = models.CharField(max_length=50, help_text="Masalan: 5k+")
    label = models.CharField(max_length=100, help_text="Masalan: Users")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Raqam"
        verbose_name_plural = "Raqamlar"

    def __str__(self) -> str:
        return f"{self.value} {self.label}"


class WorkFeature(models.Model):
    """A card under "Asosiy funksiyalar"."""

    work = models.ForeignKey(Work, on_delete=models.CASCADE, related_name="features")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    icon = models.CharField(
        max_length=50, blank=True, default="",
        help_text="Ikonka nomi: video, check, book, users, code, star",
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Funksiya"
        verbose_name_plural = "Funksiyalar"

    def __str__(self) -> str:
        return self.title


class WorkChallenge(models.Model):
    """A "Muammo → Yechim" pair."""

    work = models.ForeignKey(Work, on_delete=models.CASCADE, related_name="challenges")
    problem_title = models.CharField(max_length=250, help_text="Masalan: Video streaming tezligi")
    problem_description = models.TextField(blank=True, default="")
    solution = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Muammo va yechim"
        verbose_name_plural = "Muammolar va yechimlar"

    def __str__(self) -> str:
        return self.problem_title
