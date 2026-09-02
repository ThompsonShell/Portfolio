from rest_framework import serializers

from common.serializers import absolute_url

from .models import Post


class PostListSerializer(serializers.ModelSerializer):
    """Card fields for /blog. The detail serializer adds `content` on top."""

    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id", "title", "slug", "cover_image_url",
            "excerpt", "reading_time", "published_at", "views_count",
        ]

    def get_cover_image_url(self, obj: Post) -> str:
        return absolute_url(self, obj.cover_image)


class PostDetailSerializer(PostListSerializer):
    class Meta(PostListSerializer.Meta):
        fields = PostListSerializer.Meta.fields + ["content"]
