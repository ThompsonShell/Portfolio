from rest_framework import serializers

from common.serializers import absolute_url

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
    # Experiences and skills are standalone tables, not FK'd to the Bio
    # singleton, so the view passes them in via context after fetching each
    # list once. Querying them from inside a method field would hide two
    # extra queries behind what looks like a plain field.
    experiences = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Bio
        fields = [
            "photo_url", "resume_url", "bio_text", "github_url", "linkedin_url",
            "telegram_url", "youtube_url", "email", "experiences", "skills",
        ]

    def get_photo_url(self, obj: Bio) -> str:
        return absolute_url(self, obj.photo)

    def get_resume_url(self, obj: Bio) -> str:
        return absolute_url(self, obj.resume)

    def get_experiences(self, obj: Bio) -> list[dict[str, object]]:
        experiences = self.context.get("experiences")
        if experiences is None:
            experiences = Experience.objects.all()
        return ExperienceSerializer(experiences, many=True).data

    def get_skills(self, obj: Bio) -> list[dict[str, object]]:
        skills = self.context.get("skills")
        if skills is None:
            skills = Skill.objects.all()
        return SkillSerializer(skills, many=True).data
