from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import WorkViewSet

router = SimpleRouter()
router.register("works", WorkViewSet, basename="work")

urlpatterns = [
    path("", include(router.urls)),
]
