from django.db import migrations


# (model, field) pairs whose existing content was authored in Uzbek. Copy it into
# the new *_uz column so the default language is not blank after this deploy.
FIELDS = [
    ("Post", ("title", "content", "excerpt")),
]


def backfill_uz(apps, schema_editor):
    for model_name, fields in FIELDS:
        Model = apps.get_model("blog", model_name)
        for obj in Model.objects.all():
            changed = []
            for field in fields:
                if not getattr(obj, f"{field}_uz", None):
                    setattr(obj, f"{field}_uz", getattr(obj, field))
                    changed.append(f"{field}_uz")
            if changed:
                obj.save(update_fields=changed)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [("blog", "0003_post_content_en_post_content_uz_post_excerpt_en_and_more")]

    operations = [migrations.RunPython(backfill_uz, noop)]
