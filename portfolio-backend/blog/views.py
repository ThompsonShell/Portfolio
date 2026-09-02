from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from analytics.mixins import ViewCountMixin

from .models import Post
from .serializers import PostDetailSerializer, PostListSerializer


class PostViewSet(ViewCountMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    lookup_field = "slug"
    view_content_type = "post"

    def get_queryset(self):
        return Post.objects.filter(published_at__isnull=False)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PostDetailSerializer
        return PostListSerializer
