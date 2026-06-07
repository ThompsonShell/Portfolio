from django.contrib import admin
from .models import CoffeeRequest


@admin.register(CoffeeRequest)
class CoffeeRequestAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "preferred_datetime", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "email", "topic")
    readonly_fields = ("created_at",)
