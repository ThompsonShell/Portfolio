from rest_framework import serializers

from common.serializers import absolute_url

from .models import Work, WorkChallenge, WorkFeature, WorkStat


class WorkStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkStat
        fields = ["id", "value", "label", "order"]


class WorkFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkFeature
        fields = ["id", "title", "description", "icon", "order"]


class WorkChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkChallenge
        fields = ["id", "problem_title", "problem_description", "solution", "order"]


class WorkListSerializer(serializers.ModelSerializer):
    """What a card on /ishlar needs — no heavy detail fields."""

    cover_image_url = serializers.SerializerMethodField()
    tech_tags = serializers.SerializerMethodField()
    stats = WorkStatSerializer(many=True, read_only=True)
    work_type_display = serializers.CharField(source="get_work_type_display", read_only=True)

    class Meta:
        model = Work
        fields = [
            "id", "slug", "title", "subtitle", "description",
            "work_type", "work_type_display", "status",
            "cover_image_url", "accent_color", "tech_tags",
            "github_url", "live_url", "is_featured", "stats",
            "order", "created_at",
        ]

    def get_cover_image_url(self, obj: Work) -> str:
        return absolute_url(self, obj.cover_image)

    def get_tech_tags(self, obj: Work) -> list[str]:
        return obj.tech_tag_list


class WorkDetailSerializer(WorkListSerializer):
    features = WorkFeatureSerializer(many=True, read_only=True)
    challenges = WorkChallengeSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta(WorkListSerializer.Meta):
        fields = WorkListSerializer.Meta.fields + [
            "overview", "role", "duration", "team_size", "architecture",
            "sponsor_url", "status_display", "features", "challenges", "updated_at",
        ]
