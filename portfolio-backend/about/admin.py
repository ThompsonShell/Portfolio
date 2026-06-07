from django.contrib import admin
from .models import Bio, Experience, Skill


@admin.register(Bio)
class BioAdmin(admin.ModelAdmin):
    list_display = ("__str__",)

    def has_add_permission(self, request):
        # Prevent adding more than one Bio
        return not Bio.objects.exists()


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "start_date", "end_date", "order")
    list_editable = ("order",)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "order")
    list_editable = ("order",)
