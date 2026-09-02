from django.db import migrations
from django.utils.text import slugify


CATEGORY_TO_WORK_TYPE = {
    "backend": "api",
    "frontend": "web_app",
    "fullstack": "web_app",
    "infrastructure": "other",
    "devops": "other",
}


def copy_projects(apps, schema_editor):
    """Carry every existing Project over to the new Work model.

    The projects app stays registered for now so old clients keep working, but
    Work is the model the site reads from — nothing should have to be re-entered
    in the admin after this deploy.
    """
    Project = apps.get_model("projects", "Project")
    Work = apps.get_model("works", "Work")
    WorkStat = apps.get_model("works", "WorkStat")

    for project in Project.objects.all():
        base = slugify(project.title) or f"work-{project.pk}"
        slug, i = base, 2
        while Work.objects.filter(slug=slug).exists():
            slug = f"{base}-{i}"
            i += 1

        work = Work.objects.create(
            title=project.title,
            title_uz=project.title,
            slug=slug,
            description=project.description,
            description_uz=project.description,
            overview=project.description,
            overview_uz=project.description,
            work_type=CATEGORY_TO_WORK_TYPE.get(project.category, "other"),
            status="production",
            cover_image=project.cover_image,
            tech_tags=project.tech_tags,
            github_url=project.github_url,
            live_url=project.live_url,
            sponsor_url=project.sponsor_url,
            is_featured=project.is_featured,
            order=project.order,
        )

        for order, (value, label) in enumerate(
            (
                (project.stat1_value, project.stat1_label),
                (project.stat2_value, project.stat2_label),
                (project.stat3_value, project.stat3_label),
            )
        ):
            if value and label:
                WorkStat.objects.create(
                    work=work, value=value, label=label, label_uz=label, order=order
                )


def drop_copied_works(apps, schema_editor):
    apps.get_model("works", "Work").objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("works", "0001_initial"),
        ("projects", "0007_project_sponsor_url"),
    ]

    operations = [
        migrations.RunPython(copy_projects, drop_copied_works),
    ]
