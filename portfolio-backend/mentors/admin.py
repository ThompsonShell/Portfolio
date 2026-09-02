from django.contrib import admin
from modeltranslation.admin import TranslationAdmin

from .models import Mentor


@admin.register(Mentor)
class MentorAdmin(TranslationAdmin):
    list_display = ("name", "role", "company", "is_featured", "order")
    list_editable = ("is_featured", "order")
    list_filter = ("is_featured",)
    search_fields = ("name", "role", "company")
