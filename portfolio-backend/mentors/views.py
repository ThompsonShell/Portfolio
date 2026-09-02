from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Mentor
from .serializers import MentorSerializer


class MentorViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MentorSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Mentor.objects.all()
        if self.request.query_params.get("featured") is not None:
            qs = qs.filter(is_featured=True)
        return qs
