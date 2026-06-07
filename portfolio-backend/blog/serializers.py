from rest_framework import serializers
from .models import Post


class PostListSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id", "title", "slug", "cover_image_url",
            "excerpt", "reading_time", "published_at",
        ]

    def get_cover_image_url(self, obj: Post) -> str:
        if not obj.cover_image:
            return ""
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.cover_image.url)
        return obj.cover_image.url


class PostDetailSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id", "title", "slug", "cover_image_url",
            "content", "excerpt", "reading_time", "published_at",
        ]

    def get_cover_image_url(self, obj: Post) -> str:
        if not obj.cover_image:
            return ""
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.cover_image.url)
        return obj.cover_image.url
