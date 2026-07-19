from django.http import JsonResponse


def custom_404(request, exception=None):
    return JsonResponse(
        {"detail": "Not found.", "status": 404, "path": request.path},
        status=404,
    )


def custom_500(request):
    return JsonResponse(
        {"detail": "Internal server error.", "status": 500},
        status=500,
    )
