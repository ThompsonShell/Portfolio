from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import Lecture
from .serializers import LectureSerializer


class LectureViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LectureSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Lecture.objects.all()
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        if category:
            qs = qs.filter(category=category)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        return qs
