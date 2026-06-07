from rest_framework import serializers
from .models import Bio, Experience, Skill


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ["id", "title", "company", "start_date", "end_date", "description", "order"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "order"]


class BioSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()
    experiences = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Bio
        fields = [
            "photo_url", "resume_url", "bio_text", "github_url", "linkedin_url",
            "telegram_url", "youtube_url", "email", "experiences", "skills",
        ]

    def get_photo_url(self, obj: Bio) -> str:
        if not obj.photo:
            return ""
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.photo.url)
        return obj.photo.url

    def get_resume_url(self, obj: Bio) -> str:
        if not obj.resume:
            return ""
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.resume.url)
        return obj.resume.url

    def get_experiences(self, obj: Bio) -> list[dict[str, object]]:
        # Experiences are standalone — not FK'd to Bio (singleton pattern)
        experiences = Experience.objects.all()
        return ExperienceSerializer(experiences, many=True).data

    def get_skills(self, obj: Bio) -> list[dict[str, object]]:
        skills = Skill.objects.all()
        return SkillSerializer(skills, many=True).data
