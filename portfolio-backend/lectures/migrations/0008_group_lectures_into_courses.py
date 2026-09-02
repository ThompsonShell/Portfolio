from django.db import migrations
from django.utils.text import slugify


CATEGORY_TITLES = {
    "database": ("Database", "#0E7490"),
    "networking": ("Networking", "#1D4ED8"),
    "backend": ("Backend", "#15803D"),
    "frontend": ("Frontend", "#7C3AED"),
    "devops": ("DevOps", "#C2410C"),
    "algorithms": ("Algorithms", "#BE123C"),
    "general": ("Umumiy darslar", "#7C3AED"),
}


def group_into_courses(apps, schema_editor):
    """Give every existing lecture a course, grouped by its category.

    Courses are new, so nothing in the database points at one yet. Rather than
    leaving every lesson course-less (and the player showing "1/1"), seed one
    course per category that is actually in use. Titles can be renamed in the
    admin afterwards.
    """
    Lecture = apps.get_model("lectures", "Lecture")
    Course = apps.get_model("lectures", "Course")

    categories = (
        Lecture.objects.filter(course__isnull=True)
        .values_list("category", flat=True)
        .distinct()
    )

    for order, category in enumerate(sorted(c for c in categories if c)):
        title, color = CATEGORY_TITLES.get(category, (category.title(), "#7C3AED"))

        base = slugify(title) or f"course-{category}"
        slug, i = base, 2
        while Course.objects.filter(slug=slug).exists():
            slug = f"{base}-{i}"
            i += 1

        course = Course.objects.create(
            title=title,
            title_uz=title,
            slug=slug,
            category=category,
            accent_color=color,
            order=order,
        )
        Lecture.objects.filter(category=category, course__isnull=True).update(course=course)


def ungroup(apps, schema_editor):
    apps.get_model("lectures", "Lecture").objects.update(course=None)
    apps.get_model("lectures", "Course").objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("lectures", "0007_course_lecture_views_count_lecture_course"),
    ]

    operations = [migrations.RunPython(group_into_courses, ungroup)]
