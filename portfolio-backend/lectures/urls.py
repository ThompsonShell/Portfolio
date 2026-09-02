from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import CourseViewSet, LectureViewSet

router = SimpleRouter()
router.register("lectures", LectureViewSet, basename="lecture")
router.register("courses", CourseViewSet, basename="course")

urlpatterns = [
    path("", include(router.urls)),
]
