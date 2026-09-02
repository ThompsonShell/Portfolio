from datetime import timedelta

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from blog.models import Post
from lectures.models import Course, Lecture
from mentors.models import Mentor
from works.models import Work


class SiteStatsView(APIView):
    """Real totals for the counters the design shows.

    Counting client-side off a paginated list under-reports as soon as there
    are more than PAGE_SIZE rows, so every badge on the site reads from here.
    """

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        recent_cutoff = timezone.now() - timedelta(days=30)

        # One aggregate per table rather than one per number: the five lecture
        # figures came from five separate scans of the same rows, and the two
        # post figures from two.
        lecture_stats = Lecture.objects.aggregate(
            count=Count("id"),
            total_seconds=Sum("duration_seconds"),
            views=Sum("views_count"),
            recent=Count("id", filter=Q(created_at__gte=recent_cutoff)),
        )
        post_stats = Post.objects.filter(published_at__isnull=False).aggregate(
            count=Count("id"),
            views=Sum("views_count"),
        )

        return Response({
            "works": Work.objects.count(),
            "courses": Course.objects.count(),
            "lectures": lecture_stats["count"],
            "posts": post_stats["count"],
            "mentors": Mentor.objects.count(),
            "lecture_hours": round((lecture_stats["total_seconds"] or 0) / 3600),
            "new_lectures": lecture_stats["recent"],
            "post_views": post_stats["views"] or 0,
            "lecture_views": lecture_stats["views"] or 0,
        })
