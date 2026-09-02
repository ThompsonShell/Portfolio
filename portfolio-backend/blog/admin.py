from django.contrib import admin
from modeltranslation.admin import TranslationAdmin

from .models import Post


@admin.register(Post)
class PostAdmin(TranslationAdmin):
    list_display = ("title", "slug", "published_at", "reading_time", "views_count")
    readonly_fields = ("views_count",)
    prepopulated_fields = {"slug": ("title",)}
    list_filter = ("published_at",)
    search_fields = ("title", "content")
