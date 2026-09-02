from django.db.models import Prefetch, Q
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser

from analytics.mixins import ViewCountMixin

from .models import Course, Lecture
from .serializers import CourseDetailSerializer, CourseSerializer, LectureSerializer


class LectureViewSet(ViewCountMixin, viewsets.ModelViewSet):
    serializer_class = LectureSerializer
    view_content_type = "lecture"

    def get_permissions(self):
        if self.action in ("list", "retrieve", "register_view"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Lecture.objects.select_related("course")
        params = self.request.query_params

        category = params.get("category")
        if category and category != "All":
            qs = qs.filter(category=category)

        course = params.get("course")
        if course:
            qs = qs.filter(course__slug=course)

        search = params.get("search")
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))

        return qs


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        # The list serializer only ever reads duration/views off each lesson, so
        # the card view prefetches just those columns. The detail view serializes
        # the lessons in full, so it prefetches whole rows in player order.
        if self.action == "retrieve":
            lectures = Prefetch(
                "lectures",
                queryset=Lecture.objects.order_by("order", "id"),
            )
        else:
            lectures = Prefetch(
                "lectures",
                queryset=Lecture.objects.only("id", "course_id", "duration_seconds", "views_count"),
            )

        qs = Course.objects.prefetch_related(lectures)
        params = self.request.query_params

        category = params.get("category")
        if category and category != "All":
            qs = qs.filter(category=category)

        if params.get("featured") is not None:
            qs = qs.filter(is_featured=True)

        return qs

    def get_serializer_class(self):
        return CourseDetailSerializer if self.action == "retrieve" else CourseSerializer
