from django.contrib import admin
from modeltranslation.admin import TranslationStackedInline, TranslationTabularInline, TranslationAdmin

from .models import Work, WorkChallenge, WorkFeature, WorkStat


class WorkStatInline(TranslationTabularInline):
    model = WorkStat
    extra = 1


class WorkFeatureInline(TranslationStackedInline):
    model = WorkFeature
    extra = 1


class WorkChallengeInline(TranslationStackedInline):
    model = WorkChallenge
    extra = 1


@admin.register(Work)
class WorkAdmin(TranslationAdmin):
    list_display = ("title", "work_type", "status", "is_featured", "order", "created_at")
    list_editable = ("is_featured", "order")
    list_filter = ("work_type", "status", "is_featured")
    search_fields = ("title", "description", "tech_tags")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [WorkStatInline, WorkFeatureInline, WorkChallengeInline]
    fieldsets = (
        ("Asosiy", {
            "fields": ("title", "slug", "subtitle", "description", "overview"),
        }),
        ("Turkum", {
            "fields": ("work_type", "status", "tech_tags", "is_featured", "order"),
        }),
        ("Ko'rinish", {
            "fields": ("cover_image", "accent_color"),
        }),
        ("Havolalar", {
            "fields": ("github_url", "live_url", "sponsor_url"),
        }),
        ("Loyiha ma'lumotlari", {
            "fields": ("role", "duration", "team_size", "architecture"),
        }),
    )
