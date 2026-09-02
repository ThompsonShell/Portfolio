from modeltranslation.translator import TranslationOptions, register

from .models import Bio, Experience, Skill


@register(Bio)
class BioTranslationOptions(TranslationOptions):
    fields = ("bio_text",)


@register(Experience)
class ExperienceTranslationOptions(TranslationOptions):
    fields = ("title", "company", "description")


@register(Skill)
class SkillTranslationOptions(TranslationOptions):
    fields = ("name",)
