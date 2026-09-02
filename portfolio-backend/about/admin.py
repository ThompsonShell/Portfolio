from django.contrib import admin
from modeltranslation.admin import TranslationAdmin

from .models import Bio, Experience, Skill


@admin.register(Bio)
class BioAdmin(TranslationAdmin):
    list_display = ("__str__",)

    def has_add_permission(self, request):
        # Prevent adding more than one Bio
        return not Bio.objects.exists()


@admin.register(Experience)
class ExperienceAdmin(TranslationAdmin):
    list_display = ("title", "company", "start_date", "end_date", "order")
    list_editable = ("order",)


@admin.register(Skill)
class SkillAdmin(TranslationAdmin):
    list_display = ("name", "order")
    list_editable = ("order",)
