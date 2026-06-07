from rest_framework import serializers
from .models import Lecture


class LectureSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.SerializerMethodField()
    prev_id = serializers.SerializerMethodField()
    next_id = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        fields = [
            "id", "title", "description", "youtube_video_id", "category",
            "duration_seconds", "thumbnail_url", "order", "created_at",
            "prev_id", "next_id"
        ]

    def get_thumbnail_url(self, obj: Lecture) -> str:
        return f"https://img.youtube.com/vi/{obj.youtube_video_id}/hqdefault.jpg"

    def get_prev_id(self, obj: Lecture) -> int | None:
        prev = Lecture.objects.filter(
            category=obj.category
        ).filter(order__lte=obj.order).exclude(id=obj.id).order_by("-order", "-id").first()
        return prev.id if prev else None

    def get_next_id(self, obj: Lecture) -> int | None:
        nxt = Lecture.objects.filter(
            category=obj.category
        ).filter(order__gte=obj.order).exclude(id=obj.id).order_by("order", "id").first()
        return nxt.id if nxt else None
