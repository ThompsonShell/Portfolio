from django.urls import path

from .views import (
    TusCreateView,
    TusUploadDetailView,
    TusdWebhookView,
    VideoUploadDetailView,
    VideoUploadListView,
)

# Included under "api/" in config/urls.py, so the public paths are /api/upload/...
urlpatterns = [
    # Option B — hand-written tus 1.0.0 server (what @uppy/tus talks to)
    path("upload/tus/", TusCreateView.as_view(), name="tus-create"),
    path("upload/tus/<uuid:upload_id>/", TusUploadDetailView.as_view(), name="tus-detail"),

    # Option A — tusd webhook
    path("upload/tusd-hook/", TusdWebhookView.as_view(), name="tusd-hook"),

    # Read-only status/progress API
    path("upload/videos/", VideoUploadListView.as_view(), name="upload-list"),
    path("upload/videos/<uuid:upload_id>/", VideoUploadDetailView.as_view(), name="upload-detail"),
]
