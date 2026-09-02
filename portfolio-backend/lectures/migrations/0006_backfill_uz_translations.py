from django.db import migrations


# (model, field) pairs whose existing content was authored in Uzbek. Copy it into
# the new *_uz column so the default language is not blank after this deploy.
FIELDS = [
    ("Lecture", ("title", "description")),
]


def backfill_uz(apps, schema_editor):
    for model_name, fields in FIELDS:
        Model = apps.get_model("lectures", model_name)
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
    dependencies = [("lectures", "0005_lecture_description_en_lecture_description_uz_and_more")]

    operations = [migrations.RunPython(backfill_uz, noop)]
