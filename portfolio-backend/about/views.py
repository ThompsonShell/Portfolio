from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Bio, Experience, Skill
from .serializers import BioSerializer


class AboutView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        serializer = BioSerializer(
            Bio.load(),
            context={
                "request": request,
                "experiences": Experience.objects.all(),
                "skills": Skill.objects.all(),
            },
        )
        return Response(serializer.data)
