from django.contrib import admin
from .models import Lecture


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "duration_seconds", "order")
    list_editable = ("order",)
    list_filter = ("category",)
    search_fields = ("title",)
