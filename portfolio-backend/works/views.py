from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Work
from .serializers import WorkDetailSerializer, WorkListSerializer


class WorkViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        # Cards render `stats` only; `features` and `challenges` belong to the
        # detail page, so prefetching them for a list was two extra queries
        # fetching rows nothing serialized.
        related = ("stats", "features", "challenges") if self.action == "retrieve" else ("stats",)
        qs = Work.objects.prefetch_related(*related)
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
