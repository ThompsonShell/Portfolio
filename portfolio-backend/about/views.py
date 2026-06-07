from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from .models import Bio
from .serializers import BioSerializer


class AboutView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        bio = Bio.load()
        serializer = BioSerializer(bio, context={"request": request})
        return Response(serializer.data)
