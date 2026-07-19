from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import LectureViewSet

router = SimpleRouter()
router.register("lectures", LectureViewSet, basename="lecture")

urlpatterns = [
    path("", include(router.urls)),
]
