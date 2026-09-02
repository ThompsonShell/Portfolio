from django.contrib import admin
from modeltranslation.admin import TranslationAdmin

from .models import Course, Lecture


class LectureInline(admin.TabularInline):
    model = Lecture
    extra = 0
    fields = ("title", "category", "duration_seconds", "order")
    show_change_link = True


@admin.register(Course)
class CourseAdmin(TranslationAdmin):
    list_display = ("title", "category", "lesson_count", "is_featured", "order")
    list_editable = ("is_featured", "order")
    list_filter = ("category", "is_featured")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [LectureInline]


@admin.register(Lecture)
class LectureAdmin(TranslationAdmin):
    list_display = ("title", "course", "category", "duration_seconds", "views_count", "order")
    list_editable = ("order",)
    list_filter = ("course", "category")
    search_fields = ("title",)
    readonly_fields = ("views_count",)
