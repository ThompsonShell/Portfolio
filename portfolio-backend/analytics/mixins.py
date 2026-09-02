from django.db import IntegrityError, transaction
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

        # F() would avoid the read, but we need the new value in the response.
        obj.views_count = obj.views_count + 1
        obj.save(update_fields=["views_count"])
        return Response({"views_count": obj.views_count, "counted": True})
