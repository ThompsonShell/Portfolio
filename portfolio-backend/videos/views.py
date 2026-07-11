"""
Chunked video upload endpoints.

Option B (implemented here in full): a hand-written **tus 1.0.0** server so the
exact same `@uppy/tus` frontend works without a separate Go binary.

Note on the wire format: the spec sketched `POST /init`, `PATCH` with
`Content-Range`, and `HEAD`. `@uppy/tus` does not speak that ad-hoc scheme — it
speaks the tus protocol, where the equivalent operations are:

    POST   /api/upload/tus/            -> create   (the "init" step)
    HEAD   /api/upload/tus/<id>/       -> offset   (the "resume" step)
    PATCH  /api/upload/tus/<id>/       -> append a chunk at Upload-Offset

So the same three operations are here, just spelled with the tus headers
(`Upload-Length`, `Upload-Offset`, `Upload-Metadata`) that Uppy sends. The upshot
is that this backend and `tusd` (Option A) are drop-in interchangeable behind the
identical frontend.

The tus endpoints are plain Django Views, not DRF APIViews: the PATCH body is a
raw `application/offset+octet-stream`, which we stream straight to disk with
`request.read()`. DRF's parsers/content-negotiation are built for structured
payloads and would get in the way, so we authenticate the JWT manually via the
same SimpleJWT machinery the rest of the API uses.
"""
import json
import logging
import os

from django.conf import settings
from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import VideoUpload
from .serializers import VideoUploadSerializer
from .tus import (
    TUS_VERSION,
    authenticate_request,
    parse_upload_metadata,
    user_can_upload,
    validate_filename,
    validate_size,
)

logger = logging.getLogger(__name__)

OCTET_STREAM = "application/offset+octet-stream"


# ── Shared helpers ──────────────────────────────────────────────────────────


def _tus_response(status=204, body=b""):
    resp = HttpResponse(body, status=status)
    resp["Tus-Resumable"] = TUS_VERSION
    return resp


def _current_offset(upload: VideoUpload) -> int:
    """
    Authoritative bytes-on-disk for a resume. We trust the file size rather than
    the DB counter, so a crash mid-chunk still resumes from exactly the right
    byte (tus clients re-read the file from the offset we report).
    """
    if upload.status != VideoUpload.Status.UPLOADING:
        return upload.total_size
    try:
        return os.path.getsize(upload.part_path)
    except OSError:
        return 0


def _append_stream(request, upload: VideoUpload, offset: int) -> int:
    """Stream the request body onto the part file at `offset`. Returns bytes written."""
    written = 0
    max_allowed = upload.total_size - offset  # never let a client overrun the declared size
    read_size = settings.VIDEO_UPLOAD_READ_SIZE
    with open(upload.part_path, "r+b") as f:
        f.seek(offset)
        while True:
            chunk = request.read(read_size)
            if not chunk:
                break
            if written + len(chunk) > max_allowed:
                chunk = chunk[: max_allowed - written]
                if chunk:
                    f.write(chunk)
                    written += len(chunk)
                break
            f.write(chunk)
            written += len(chunk)
        f.flush()
        os.fsync(f.fileno())
    return written


def _finalize(upload: VideoUpload) -> None:
    """Move the completed part file to videos/original/ and mark it for processing."""
    os.makedirs(os.path.dirname(upload.final_path), exist_ok=True)
    os.replace(upload.part_path, upload.final_path)
    upload.storage_path = os.path.relpath(upload.final_path, settings.MEDIA_ROOT)
    upload.bytes_received = upload.total_size
    upload.status = VideoUpload.Status.PENDING_PROCESSING
    upload.save(update_fields=["storage_path", "bytes_received", "status", "updated_at"])
    logger.info("Upload %s finished -> %s", upload.upload_id, upload.storage_path)


# ── Option B: tus 1.0.0 server ──────────────────────────────────────────────


@method_decorator(csrf_exempt, name="dispatch")
class TusCreateView(View):
    """POST /api/upload/tus/ — create a new upload (the tus 'creation' extension)."""

    def options(self, request, *args, **kwargs):
        resp = _tus_response(204)
        resp["Tus-Version"] = TUS_VERSION
        resp["Tus-Extension"] = "creation"
        resp["Tus-Max-Size"] = str(settings.VIDEO_UPLOAD_MAX_SIZE)
        return resp

    def post(self, request, *args, **kwargs):
        user = authenticate_request(request)
        if not user_can_upload(user):
            return JsonResponse({"detail": "Authentication required (admin only)."}, status=401)

        try:
            total_size = int(request.headers.get("Upload-Length", ""))
        except (TypeError, ValueError):
            return JsonResponse({"detail": "Upload-Length header is required."}, status=400)

        size_error = validate_size(total_size)
        if size_error:
            return JsonResponse({"detail": size_error}, status=413)

        meta = parse_upload_metadata(request.headers.get("Upload-Metadata", ""))
        filename = meta.get("filename") or meta.get("name") or "upload"
        name_error = validate_filename(filename)
        if name_error:
            return JsonResponse({"detail": name_error}, status=415)

        upload = VideoUpload.objects.create(
            owner=user,
            original_filename=filename[:500],
            content_type=(meta.get("filetype") or meta.get("type") or "")[:100],
            title=(meta.get("title") or meta.get("name") or "")[:300],
            category=(meta.get("category") or "general")[:30],
            total_size=total_size,
        )

        # Pre-create the (empty) part file so PATCH can seek/append into it.
        os.makedirs(os.path.dirname(upload.part_path), exist_ok=True)
        open(upload.part_path, "wb").close()

        offset = 0
        # tus "creation-with-upload": the client may include the first chunk in
        # the POST body. Handle it if present so we stay spec-complete.
        if request.META.get("CONTENT_TYPE", "").startswith(OCTET_STREAM):
            offset = _append_stream(request, upload, 0)
            upload.bytes_received = offset
            upload.save(update_fields=["bytes_received", "updated_at"])
            if offset >= upload.total_size:
                _finalize(upload)

        resp = _tus_response(201)
        # Path-absolute Location; tus-js-client resolves it against the endpoint.
        resp["Location"] = f"/api/upload/tus/{upload.upload_id}/"
        resp["Upload-Offset"] = str(offset)
        return resp


@method_decorator(csrf_exempt, name="dispatch")
class TusUploadDetailView(View):
    """HEAD/PATCH /api/upload/tus/<upload_id>/ — resume info and chunk append."""

    def _get_owned_upload(self, request, upload_id):
        """Returns (upload, error_response). Enforces auth + per-user ownership."""
        user = authenticate_request(request)
        if not user_can_upload(user):
            return None, JsonResponse({"detail": "Authentication required (admin only)."}, status=401)
        try:
            upload = VideoUpload.objects.get(upload_id=upload_id)
        except VideoUpload.DoesNotExist:
            return None, _tus_response(404)
        if upload.owner_id != user.id:
            return None, _tus_response(403)
        return upload, None

    def options(self, request, *args, **kwargs):
        resp = _tus_response(204)
        resp["Tus-Version"] = TUS_VERSION
        resp["Tus-Extension"] = "creation"
        resp["Tus-Max-Size"] = str(settings.VIDEO_UPLOAD_MAX_SIZE)
        return resp

    def head(self, request, upload_id, *args, **kwargs):
        upload, error = self._get_owned_upload(request, upload_id)
        if error:
            return error
        resp = _tus_response(200)
        resp["Upload-Offset"] = str(_current_offset(upload))
        resp["Upload-Length"] = str(upload.total_size)
        resp["Cache-Control"] = "no-store"
        return resp

    def patch(self, request, upload_id, *args, **kwargs):
        upload, error = self._get_owned_upload(request, upload_id)
        if error:
            return error

        if request.content_type != OCTET_STREAM:
            return _tus_response(415)

        try:
            client_offset = int(request.headers.get("Upload-Offset", ""))
        except (TypeError, ValueError):
            return _tus_response(400)

        current = _current_offset(upload)
        if client_offset != current:
            # Offset mismatch (or already finished) -> 409; the client will HEAD
            # to re-sync and resume from the offset we report here.
            resp = _tus_response(409)
            resp["Upload-Offset"] = str(current)
            return resp

        if upload.status != VideoUpload.Status.UPLOADING:
            resp = _tus_response(409)
            resp["Upload-Offset"] = str(upload.total_size)
            return resp

        written = _append_stream(request, upload, current)
        new_offset = current + written
        upload.bytes_received = new_offset
        upload.save(update_fields=["bytes_received", "updated_at"])

        if new_offset >= upload.total_size:
            _finalize(upload)

        resp = _tus_response(204)
        resp["Upload-Offset"] = str(new_offset)
        return resp

    def get(self, request, *args, **kwargs):
        return HttpResponseNotAllowed(["HEAD", "PATCH", "OPTIONS"])


# ── Read-only status API (DRF) ──────────────────────────────────────────────


class VideoUploadListView(generics.ListAPIView):
    """GET /api/upload/videos/ — the signed-in admin's own uploads."""

    serializer_class = VideoUploadSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return VideoUpload.objects.filter(owner=self.request.user)


class VideoUploadDetailView(generics.RetrieveAPIView):
    """GET /api/upload/videos/<upload_id>/ — poll a single upload's status."""

    serializer_class = VideoUploadSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = "upload_id"

    def get_queryset(self):
        return VideoUpload.objects.filter(owner=self.request.user)


# ── Option A: tusd webhook ───────────────────────────────────────────────────


class TusdWebhookView(APIView):
    """
    POST /api/upload/tusd-hook/ — receives tusd's HTTP hooks.

    Security model:
      * Reachable only from tusd on the same host (lock it down in nginx/firewall).
      * Optional shared secret in the `X-Tusd-Hook-Secret` header (TUSD_WEBHOOK_SECRET).
      * The original browser's JWT is forwarded by tusd (run tusd with
        `-hooks-http-forward-headers Authorization`) and validated here, so only a
        real admin token can create a video — same rule as Option B.

    Relevant hooks:
      * pre-create : validate auth + filename + size; a non-2xx reply makes tusd
                     reject the upload before a single byte is stored.
      * post-finish: the file is fully on disk; create the VideoUpload row as
                     'pending_processing'.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        secret = settings.TUSD_WEBHOOK_SECRET
        if secret and request.headers.get("X-Tusd-Hook-Secret") != secret:
            return Response({"detail": "Bad hook secret."}, status=403)

        payload = request.data if isinstance(request.data, dict) else {}
        hook_name = payload.get("Type") or request.headers.get("Hook-Name") or ""
        event = payload.get("Event", payload)
        upload_info = event.get("Upload", {}) or {}
        http_request = event.get("HTTPRequest", {}) or {}

        user = self._user_from_forwarded_headers(http_request)
        if not user_can_upload(user):
            return Response({"detail": "Authentication required (admin only)."}, status=401)

        meta = upload_info.get("MetaData", {}) or {}
        filename = meta.get("filename") or meta.get("name") or "upload"
        size = upload_info.get("Size") or 0

        if hook_name == "pre-create":
            name_error = validate_filename(filename)
            if name_error:
                return Response({"detail": name_error}, status=415)
            size_error = validate_size(int(size or 0))
            if size_error:
                return Response({"detail": size_error}, status=413)
            return Response({"status": "ok"})

        if hook_name in ("post-finish", "post-receive"):
            if hook_name == "post-finish":
                self._record_finished(user, upload_info, meta, filename, size)
            return Response({"status": "ok"})

        # Any other hook (pre-finish, post-terminate, ...) — nothing to do.
        return Response({"status": "ignored", "hook": hook_name})

    def _user_from_forwarded_headers(self, http_request: dict):
        headers = http_request.get("Header", {}) or {}
        raw = headers.get("Authorization") or headers.get("authorization")
        if isinstance(raw, list):
            raw = raw[0] if raw else None
        if not raw:
            return None
        auth = JWTAuthentication()
        try:
            token = auth.get_validated_token(raw.split()[-1])
            return auth.get_user(token)
        except Exception:
            return None

    def _record_finished(self, user, upload_info, meta, filename, size):
        tusd_id = upload_info.get("ID", "")
        storage = upload_info.get("Storage", {}) or {}
        stored_path = storage.get("Path", "")
        rel_path = ""
        if stored_path and str(stored_path).startswith(str(settings.MEDIA_ROOT)):
            rel_path = os.path.relpath(stored_path, settings.MEDIA_ROOT)

        VideoUpload.objects.update_or_create(
            storage_path=rel_path or f"tusd/{tusd_id}",
            defaults={
                "owner": user,
                "original_filename": filename[:500],
                "content_type": (meta.get("filetype") or "")[:100],
                "title": (meta.get("title") or meta.get("name") or "")[:300],
                "category": (meta.get("category") or "general")[:30],
                "total_size": int(size or 0),
                "bytes_received": int(size or 0),
                "status": VideoUpload.Status.PENDING_PROCESSING,
            },
        )
