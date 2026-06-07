from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_featured", "order", "created_at")
    list_editable = ("is_featured", "order", "category")
    list_filter = ("is_featured", "category")
    search_fields = ("title", "description")
    fieldsets = (
        (None, {"fields": ("title", "description", "category", "cover_image", "tech_tags")}),
        ("Links", {"fields": ("github_url", "live_url")}),
        ("Stats (ko'rsatma uchun)", {"fields": (
            ("stat1_value", "stat1_label"),
            ("stat2_value", "stat2_label"),
            ("stat3_value", "stat3_label"),
        )}),
        ("Settings", {"fields": ("is_featured", "order")}),
    )
