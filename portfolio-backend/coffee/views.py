from django.core.mail import send_mail
from django.conf import settings
from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny
from .models import CoffeeRequest
from .serializers import CoffeeRequestSerializer


class CoffeeRequestViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Create-only endpoint for coffee meeting requests."""
    queryset = CoffeeRequest.objects.all()
    serializer_class = CoffeeRequestSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        instance = serializer.save()
        
        # Send notification email
        subject = f"☕ New Coffee Request from {instance.name}"
        message = f"""
You have a new coffee meeting request!

Details:
--------
Name: {instance.name}
Email: {instance.email}
Date/Time: {instance.preferred_datetime:%Y-%m-%d %H:%M}
Location: {instance.location}

Topic:
{instance.topic}

---
Sent from ThompsonShell Portfolio
"""
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [getattr(settings, "ADMIN_NOTIFICATION_EMAIL", "asilbek.rajabov.offcial@gmail.com")],
                fail_silently=True,
            )
        except Exception:
            # We don't want to fail the request if email fails (e.g. SMTP not configured)
            pass
