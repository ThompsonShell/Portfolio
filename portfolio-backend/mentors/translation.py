from modeltranslation.translator import TranslationOptions, register

from .models import Mentor


@register(Mentor)
class MentorTranslationOptions(TranslationOptions):
    fields = ("role", "company", "description")
