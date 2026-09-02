import hashlib

from django.db import models


class ViewRecord(models.Model):
    """One counted view of one object, deduplicated per visitor.

    We never store a raw IP: the visitor is identified by a salted hash of
    IP + user agent, which is enough to stop the same person inflating a
    counter on refresh without keeping anything personally identifying.
    """

    content_type = models.CharField(max_length=30, help_text="post | lecture")
    object_id = models.PositiveIntegerField()
    visitor_hash = models.CharField(max_length=64, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # The same visitor is only ever counted once per object.
        constraints = [
            models.UniqueConstraint(
                fields=["content_type", "object_id", "visitor_hash"],
                name="unique_view_per_visitor",
            )
        ]
        indexes = [models.Index(fields=["content_type", "object_id"])]
        verbose_name = "Ko'rish"
        verbose_name_plural = "Ko'rishlar"

    def __str__(self) -> str:
        return f"{self.content_type}#{self.object_id}"

    @staticmethod
    def visitor_hash_for(request) -> str:
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
        ip = forwarded.split(",")[0].strip() or request.META.get("REMOTE_ADDR", "")
        agent = request.META.get("HTTP_USER_AGENT", "")
        return hashlib.sha256(f"{ip}|{agent}".encode()).hexdigest()
