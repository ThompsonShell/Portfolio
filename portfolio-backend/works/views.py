from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Work
from .serializers import WorkDetailSerializer, WorkListSerializer


class WorkViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        qs = Work.objects.prefetch_related("stats", "features", "challenges")
        params = self.request.query_params

        work_type = params.get("type")
        if work_type and work_type.lower() not in ("all", "hammasi"):
            qs = qs.filter(work_type=work_type)

        tag = params.get("tag")
        if tag:
            qs = qs.filter(tech_tags__icontains=tag)

        if params.get("featured") is not None:
            qs = qs.filter(is_featured=True)

        return qs

    def get_serializer_class(self):
        return WorkDetailSerializer if self.action == "retrieve" else WorkListSerializer
