from django.http import JsonResponse
from django.shortcuts import render


def custom_404(request, exception=None):
    # This only fires when no URL pattern matched at all (e.g. bare "/api/",
    # a typo'd path) — real DRF 404s for valid routes (unknown object id) are
    # rendered by DRF itself as JSON and never reach this view.
    #
    # We render the page ourselves instead of redirecting to the frontend:
    # nginx routes any /api* path straight back to Django regardless of host,
    # so a redirect to the same path (even on the asilbek.me origin) would
    # just bounce back and forth between nginx and Django forever.
    return render(request, "404.html", status=404)


def custom_500(request):
    return JsonResponse(
        {"detail": "Internal server error.", "status": 500},
        status=500,
    )
