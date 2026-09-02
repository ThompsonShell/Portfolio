from modeltranslation.translator import TranslationOptions, register

from .models import Work, WorkChallenge, WorkFeature, WorkStat


@register(Work)
class WorkTranslationOptions(TranslationOptions):
    fields = ("title", "subtitle", "description", "overview", "role", "duration", "team_size", "architecture")


@register(WorkStat)
class WorkStatTranslationOptions(TranslationOptions):
    fields = ("label",)


@register(WorkFeature)
class WorkFeatureTranslationOptions(TranslationOptions):
    fields = ("title", "description")


@register(WorkChallenge)
class WorkChallengeTranslationOptions(TranslationOptions):
    fields = ("problem_title", "problem_description", "solution")
