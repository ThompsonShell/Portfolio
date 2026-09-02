from django.db import IntegrityError, transaction
from django.db.models import F
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import ViewRecord


class ViewCountMixin:
    """Adds `POST /<detail>/view/` to a ViewSet, counting each visitor once.

    Set `view_content_type` on the ViewSet. The counter lives on the model as
    `views_count`, denormalised so listing pages don't have to aggregate.
    """

    view_content_type: str = ""

    @action(detail=True, methods=["post"], permission_classes=[AllowAny], url_path="view")
    def register_view(self, request, *args, **kwargs):
        obj = self.get_object()
        visitor = ViewRecord.visitor_hash_for(request)

        try:
            with transaction.atomic():
                ViewRecord.objects.create(
                    content_type=self.view_content_type,
                    object_id=obj.pk,
                    visitor_hash=visitor,
                )
        except IntegrityError:
            # This visitor already counted — return the current total unchanged.
            return Response({"views_count": obj.views_count, "counted": False})

        # F() so two concurrent views can't both write the same total back and
        # lose one; refresh_from_db then reads what the database actually
        # settled on, which is the number the response has to report.
        type(obj).objects.filter(pk=obj.pk).update(views_count=F("views_count") + 1)
        obj.refresh_from_db(fields=["views_count"])
        return Response({"views_count": obj.views_count, "counted": True})
