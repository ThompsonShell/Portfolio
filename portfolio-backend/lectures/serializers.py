from rest_framework import serializers

from .models import Course, Lecture


class LectureSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.SerializerMethodField()
    prev_id = serializers.SerializerMethodField()
    next_id = serializers.SerializerMethodField()
    course_title = serializers.CharField(source="course.title", read_only=True, default="")
    course_slug = serializers.CharField(source="course.slug", read_only=True, default="")
    position = serializers.SerializerMethodField()
    course_lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        fields = [
            "id", "title", "description", "youtube_video_id", "lecture_video", "category",
            "duration_seconds", "thumbnail_url", "order", "created_at", "views_count",
            "course", "course_title", "course_slug", "position", "course_lesson_count",
            "prev_id", "next_id",
        ]
        read_only_fields = ["views_count"]

    def get_thumbnail_url(self, obj: Lecture) -> str | None:
        if not obj.youtube_video_id:
            return None
        return f"https://img.youtube.com/vi/{obj.youtube_video_id}/hqdefault.jpg"

    def _siblings(self, obj: Lecture):
        """Lessons this one sits among: its course when it has one, else its category."""
        if obj.course_id:
            return Lecture.objects.filter(course_id=obj.course_id).order_by("order", "id")
        return Lecture.objects.filter(course__isnull=True, category=obj.category).order_by("order", "id")

    def get_position(self, obj: Lecture) -> int:
        ids = list(self._siblings(obj).values_list("id", flat=True))
        return ids.index(obj.id) + 1 if obj.id in ids else 1

    def get_course_lesson_count(self, obj: Lecture) -> int:
        return self._siblings(obj).count()

    def get_prev_id(self, obj: Lecture) -> int | None:
        ids = list(self._siblings(obj).values_list("id", flat=True))
        if obj.id not in ids:
            return None
        i = ids.index(obj.id)
        return ids[i - 1] if i > 0 else None

    def get_next_id(self, obj: Lecture) -> int | None:
        ids = list(self._siblings(obj).values_list("id", flat=True))
        if obj.id not in ids:
            return None
        i = ids.index(obj.id)
        return ids[i + 1] if i < len(ids) - 1 else None

    def validate(self, attrs):
        youtube_video_id = attrs.get("youtube_video_id", getattr(self.instance, "youtube_video_id", None))
        lecture_video = attrs.get("lecture_video", getattr(self.instance, "lecture_video", None))
        if not youtube_video_id and not lecture_video:
            raise serializers.ValidationError(
                "Either youtube_video_id or lecture_video must be provided."
            )
        return attrs


class CourseSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()
    lesson_count = serializers.IntegerField(read_only=True)
    total_seconds = serializers.IntegerField(read_only=True)
    total_views = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id", "slug", "title", "description", "category", "accent_color",
            "cover_image_url", "is_featured", "order",
            "lesson_count", "total_seconds", "total_views", "created_at",
        ]

    def get_cover_image_url(self, obj: Course) -> str:
        if not obj.cover_image:
            return ""
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.cover_image.url)
        return obj.cover_image.url

    def get_total_views(self, obj: Course) -> int:
        return sum(l.views_count for l in obj.lectures.all())


class CourseDetailSerializer(CourseSerializer):
    lectures = LectureSerializer(many=True, read_only=True)

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ["lectures"]
