import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from lectures.models import Lecture

def seed():
    Lecture.objects.all().delete()
    
    lectures_data = [
        {
            "title": "Ma'lumotlar ombori tarixi",
            "youtube_video_id": "zOjov-2OZ0E", # Placeholder ID, replace with actual if known
            "category": "database",
            "duration_seconds": 750,
            "description": "Ma'lumotlar omborlari qanday paydo bo'lgan, dastlabki tizimlardan zamonaviy relational DB gacha bo'lgan yo'l. Bu lecture keyingi barcha mavzular uchun asos bo'lib xizmat qiladi.",
            "order": 1
        },
        {
            "title": "Ma'lumotlar ombori turlari",
            "youtube_video_id": "W2Z7GTo6Gis",
            "category": "database",
            "duration_seconds": 945,
            "description": "Relational, NoSQL, NewSQL va boshqa turdagi ma'lumotlar omborlarining farqlari va qo'llanilishi.",
            "order": 2
        },
        {
            "title": "Cloud42 amaliyot",
            "youtube_video_id": "b-610-8k6Xg",
            "category": "database",
            "duration_seconds": 1100,
            "description": "Cloud42 platformasida ma'lumotlar ombori bilan ishlash bo'yicha amaliy mashg'ulot.",
            "order": 3
        },
        {
            "title": "Jadvallar, qatorlar va ustunlar",
            "youtube_video_id": "pS6X9v_f8N0",
            "category": "database",
            "duration_seconds": 850,
            "description": "Relational DB ning asosiy elementlari bilan tanishish.",
            "order": 4
        },
        {
            "title": "Advanced networking with Python",
            "youtube_video_id": "3Z8X_U-YI0A",
            "category": "networking",
            "duration_seconds": 1330,
            "description": "Python yordamida tarmoq protokollari bilan ishlash va skriptlar yozish.",
            "order": 1
        }
    ]
    
    for data in lectures_data:
        Lecture.objects.create(**data)
    
    print(f"Successfully seeded {len(lectures_data)} lectures.")

if __name__ == "__main__":
    seed()
