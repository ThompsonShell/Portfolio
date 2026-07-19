from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import ProjectViewSet

router = SimpleRouter()
router.register("projects", ProjectViewSet, basename="project")

urlpatterns = [
    path("", include(router.urls)),
]
