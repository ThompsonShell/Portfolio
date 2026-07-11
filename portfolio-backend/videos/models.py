import os
import uuid

from django.conf import settings
from django.db import models


def video_media_root() -> str:
    """MEDIA_ROOT/videos — parent of both the tmp and original folders."""
    return os.path.join(settings.MEDIA_ROOT, "videos")


class VideoUpload(models.Model):
    """
    Tracks the lifecycle of one chunked (tus-protocol) video upload.

    This is the "Video" record referenced in the upload spec: it is created with
    status='uploading' when the upload starts, updated on every chunk, and flipped
    to 'pending_processing' when the whole file has arrived. Stage 2 (FFmpeg → HLS)
    will later pick up rows in the 'pending_processing' state and produce a Lecture.
    """

    class Status(models.TextChoices):
        UPLOADING = "uploading", "Uploading"
        PENDING_PROCESSING = "pending_processing", "Pending processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    # Public identifier used in the tus URL: /api/upload/tus/<upload_id>/
    upload_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="video_uploads",
    )

    original_filename = models.CharField(max_length=500)
    content_type = models.CharField(max_length=100, blank=True, default="")

    # Optional metadata sent by the client (Uppy meta) so the file is not anonymous.
    title = models.CharField(max_length=300, blank=True, default="")
    category = models.CharField(max_length=30, default="general")

    total_size = models.BigIntegerField(help_text="Full file size in bytes (tus Upload-Length)")
    bytes_received = models.BigIntegerField(default=0)

    status = models.CharField(max_length=32, choices=Status.choices, default=Status.UPLOADING)

    # Path of the finished file, relative to MEDIA_ROOT (e.g. videos/original/<id>.mp4).
    storage_path = models.CharField(max_length=1000, blank=True, default="")

    # Filled in stage 2 once the raw file has been processed into a Lecture.
    lecture = models.ForeignKey(
        "lectures.Lecture",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="source_uploads",
    )

    error_message = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.original_filename} ({self.status})"

    # ── Filesystem paths ────────────────────────────────────────────────────

    @property
    def part_path(self) -> str:
        """Where the incomplete upload is streamed to while chunks arrive."""
        return os.path.join(video_media_root(), "tmp", f"{self.upload_id}.part")

    @property
    def extension(self) -> str:
        return os.path.splitext(self.original_filename)[1].lower()

    @property
    def final_path(self) -> str:
        return os.path.join(video_media_root(), "original", f"{self.upload_id}{self.extension}")

    @property
    def progress_percent(self) -> int:
        if not self.total_size:
            return 0
        return int(self.bytes_received * 100 / self.total_size)
