from rest_framework import serializers

from common.serializers import absolute_url

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    tech_tags = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id", "title", "description", "category", "cover_image_url",
            "tech_tags", "github_url", "live_url", "sponsor_url", "is_featured",
            "stat1_value", "stat1_label", "stat2_value", "stat2_label",
            "stat3_value", "stat3_label", "order", "created_at",
        ]

    def get_cover_image_url(self, obj: Project) -> str:
        return absolute_url(self, obj.cover_image)

    def get_tech_tags(self, obj: Project) -> list[str]:
        if not obj.tech_tags:
            return []
        # Support both old JSON format (if any remain) and new comma-separated format
        if isinstance(obj.tech_tags, list):
            return obj.tech_tags
        return [tag.strip() for tag in obj.tech_tags.split(",") if tag.strip()]
