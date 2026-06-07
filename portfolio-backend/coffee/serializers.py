from rest_framework import serializers
from .models import CoffeeRequest


class CoffeeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoffeeRequest
        fields = ["id", "name", "email", "preferred_datetime", "location", "topic", "created_at"]
        read_only_fields = ["id", "created_at"]
