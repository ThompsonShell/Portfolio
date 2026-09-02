from rest_framework import serializers

from .models import Mentor


class MentorSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Mentor
        fields = [
            "id", "name", "role", "company", "description",
            "photo_url", "initials", "accent_color", "tags",
            "profile_url", "is_featured", "order",
        ]

    def get_photo_url(self, obj: Mentor) -> str:
        if not obj.photo:
            return ""
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.photo.url)
        return obj.photo.url

    def get_tags(self, obj: Mentor) -> list[str]:
        return obj.tag_list
