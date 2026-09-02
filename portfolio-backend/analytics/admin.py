from django.contrib import admin

from .models import ViewRecord


@admin.register(ViewRecord)
class ViewRecordAdmin(admin.ModelAdmin):
    list_display = ("content_type", "object_id", "created_at")
    list_filter = ("content_type", "created_at")
    readonly_fields = ("content_type", "object_id", "visitor_hash", "created_at")

    def has_add_permission(self, request):
        # Views are recorded by the API, never by hand.
        return False
