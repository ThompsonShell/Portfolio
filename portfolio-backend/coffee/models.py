from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator


class CoffeeRequest(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    preferred_datetime = models.DateTimeField()
    location = models.CharField(max_length=300)
    topic = models.TextField(
        validators=[MinLengthValidator(20), MaxLengthValidator(600)],
        help_text="What would you like to discuss? (20–600 characters)",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Coffee with {self.name} on {self.preferred_datetime:%Y-%m-%d}"
