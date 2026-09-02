from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import MentorViewSet

router = SimpleRouter()
router.register("mentors", MentorViewSet, basename="mentor")

urlpatterns = [
    path("", include(router.urls)),
]
