from django.conf import settings
from django.http import HttpResponseRedirect, JsonResponse


def custom_404(request, exception=None):
    # /api/ is Django's own namespace — the frontend has no page for it, so a
    # 404 there always stays JSON, browser or not. Everything else (e.g. an
    # /admin typo) sends the browser to the frontend's styled not-found page.
    if request.path.startswith("/api/"):
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
