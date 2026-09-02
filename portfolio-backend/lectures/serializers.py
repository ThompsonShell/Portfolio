from rest_framework import serializers

from common.serializers import absolute_url

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

    def _sibling_ids(self, obj: Lecture) -> list[int]:
        """Ordered ids of the lessons this one sits among — its course when it
        has one, else its category.

        Four fields (position, count, prev, next) all describe the same ordered
        list, so it is fetched once and cached per serializer instance. Without
        the cache each lesson cost four identical queries, which on a course
        detail page multiplied by every lesson in the course.
        """
        key = ("course", obj.course_id) if obj.course_id else ("category", obj.category)
        cache = self.context.setdefault("_sibling_ids", {})
        if key not in cache:
            if obj.course_id:
                qs = Lecture.objects.filter(course_id=obj.course_id)
            else:
                qs = Lecture.objects.filter(course__isnull=True, category=obj.category)
            cache[key] = list(qs.order_by("order", "id").values_list("id", flat=True))
        return cache[key]

    def _index(self, obj: Lecture) -> int:
        """Position of this lesson in its sibling list, or -1 when absent."""
        ids = self._sibling_ids(obj)
        return ids.index(obj.id) if obj.id in ids else -1

    def get_position(self, obj: Lecture) -> int:
        index = self._index(obj)
        return index + 1 if index >= 0 else 1

    def get_course_lesson_count(self, obj: Lecture) -> int:
        return len(self._sibling_ids(obj))

    def get_prev_id(self, obj: Lecture) -> int | None:
        index = self._index(obj)
        if index <= 0:
            return None
        return self._sibling_ids(obj)[index - 1]

    def get_next_id(self, obj: Lecture) -> int | None:
        index = self._index(obj)
        ids = self._sibling_ids(obj)
        if index < 0 or index >= len(ids) - 1:
            return None
        return ids[index + 1]

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
    lesson_count = serializers.SerializerMethodField()
    total_seconds = serializers.SerializerMethodField()
    total_views = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id", "slug", "title", "description", "category", "accent_color",
            "cover_image_url", "is_featured", "order",
            "lesson_count", "total_seconds", "total_views", "created_at",
        ]

    def get_cover_image_url(self, obj: Course) -> str:
        return absolute_url(self, obj.cover_image)

    # The view prefetches `lectures`, so these three read the already-loaded
    # rows. Going through the model's `lesson_count` / `total_seconds`
    # properties would call .count()/.all() on the manager and re-query per
    # course instead.
    def get_lesson_count(self, obj: Course) -> int:
        return len(obj.lectures.all())

    def get_total_seconds(self, obj: Course) -> int:
        return sum(lecture.duration_seconds for lecture in obj.lectures.all())

    def get_total_views(self, obj: Course) -> int:
        return sum(lecture.views_count for lecture in obj.lectures.all())


class CourseDetailSerializer(CourseSerializer):
    lectures = LectureSerializer(many=True, read_only=True)

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ["lectures"]
