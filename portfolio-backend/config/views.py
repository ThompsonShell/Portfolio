from django.conf import settings
from django.http import HttpResponseRedirect, JsonResponse


def custom_404(request, exception=None):
    # API callers (fetch/axios) send Accept: application/json and need a JSON
    # body to parse; a browser navigating directly is sent to the frontend's
    # own styled not-found page instead of a bare Django error.
    if request.path.startswith("/api/") and "text/html" not in request.headers.get("Accept", ""):
        return JsonResponse(
            {"detail": "Not found.", "status": 404, "path": request.path},
            status=404,
        )
    return HttpResponseRedirect(settings.FRONTEND_URL + request.path)


def custom_500(request):
    return JsonResponse(
        {"detail": "Internal server error.", "status": 500},
        status=500,
    )
