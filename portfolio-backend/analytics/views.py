from datetime import timedelta

from django.db.models import Sum
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
        lectures = Lecture.objects.all()
        posts = Post.objects.filter(published_at__isnull=False)

        total_seconds = lectures.aggregate(total=Sum("duration_seconds"))["total"] or 0
        recent_cutoff = timezone.now() - timedelta(days=30)

        return Response({
            "works": Work.objects.count(),
            "courses": Course.objects.count(),
            "lectures": lectures.count(),
            "posts": posts.count(),
            "mentors": Mentor.objects.count(),
            "lecture_hours": round(total_seconds / 3600),
            "new_lectures": lectures.filter(created_at__gte=recent_cutoff).count(),
            "post_views": posts.aggregate(total=Sum("views_count"))["total"] or 0,
            "lecture_views": lectures.aggregate(total=Sum("views_count"))["total"] or 0,
        })
