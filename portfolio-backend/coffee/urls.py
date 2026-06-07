from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CoffeeRequestViewSet

router = DefaultRouter()
router.register("coffee-requests", CoffeeRequestViewSet, basename="coffee-request")

urlpatterns = [
    path("", include(router.urls)),
]
