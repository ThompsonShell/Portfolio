from rest_framework import serializers

from .models import VideoUpload


class VideoUploadSerializer(serializers.ModelSerializer):
    """Read-only view of an upload's progress/status for the admin dashboard."""

    progress_percent = serializers.IntegerField(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = VideoUpload
        fields = [
            "upload_id",
            "original_filename",
            "content_type",
            "title",
            "category",
            "total_size",
            "bytes_received",
            "progress_percent",
            "status",
            "storage_path",
            "file_url",
            "lecture",
            "error_message",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_file_url(self, obj: VideoUpload) -> str | None:
        if not obj.storage_path:
            return None
        request = self.context.get("request")
        url = f"/media/{obj.storage_path}"
        return request.build_absolute_uri(url) if request else url
