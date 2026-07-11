from django.contrib import admin, messages

from lectures.models import Lecture

from .models import VideoUpload


@admin.register(VideoUpload)
class VideoUploadAdmin(admin.ModelAdmin):
    list_display = ("original_filename", "owner", "status", "progress_percent", "category", "created_at")
    list_filter = ("status", "category", "created_at")
    search_fields = ("original_filename", "title")
    readonly_fields = (
        "upload_id", "owner", "original_filename", "content_type", "total_size",
        "bytes_received", "progress_percent", "storage_path", "created_at", "updated_at",
    )
    actions = ["create_lecture_from_upload"]

    @admin.display(description="Progress")
    def progress_percent(self, obj: VideoUpload) -> str:
        return f"{obj.progress_percent}%"

    @admin.action(description="Create a Lecture from the uploaded file")
    def create_lecture_from_upload(self, request, queryset):
        created = 0
        for upload in queryset:
            if upload.status not in (VideoUpload.Status.PENDING_PROCESSING, VideoUpload.Status.COMPLETED):
                self.message_user(
                    request,
                    f"'{upload.original_filename}' is not finished yet — skipped.",
                    level=messages.WARNING,
                )
                continue
            if upload.lecture_id:
                continue
            lecture = Lecture.objects.create(
                title=upload.title or upload.original_filename,
                category=upload.category,
                lecture_video=upload.storage_path,  # relative to MEDIA_ROOT
            )
            upload.lecture = lecture
            upload.status = VideoUpload.Status.COMPLETED
            upload.save(update_fields=["lecture", "status", "updated_at"])
            created += 1
        if created:
            self.message_user(request, f"Created {created} lecture(s).", level=messages.SUCCESS)
