from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CoffeeRequestViewSet

router = SimpleRouter()
router.register("coffee-requests", CoffeeRequestViewSet, basename="coffee-request")

urlpatterns = [
    path("", include(router.urls)),
]
