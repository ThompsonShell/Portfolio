from django.contrib import admin
from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "published_at", "reading_time")
    prepopulated_fields = {"slug": ("title",)}
    list_filter = ("published_at",)
    search_fields = ("title", "content")
