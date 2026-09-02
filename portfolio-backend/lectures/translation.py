from modeltranslation.translator import TranslationOptions, register

from .models import Course, Lecture


@register(Lecture)
class LectureTranslationOptions(TranslationOptions):
    fields = ("title", "description")


@register(Course)
class CourseTranslationOptions(TranslationOptions):
    fields = ("title", "description")
