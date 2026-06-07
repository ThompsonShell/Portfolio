from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.utils import timezone
from blog.models import Post
from projects.models import Project
from lectures.models import Lecture
from about.models import Bio, Experience

class Command(BaseCommand):
    help = 'Seeds the database with sample data for the portfolio'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')

        # 1. Bio
        bio = Bio.load()
        bio.bio_text = """
### Hello, I'm ThompsonShell
I am a **Senior Software Engineer** with over 8 years of experience building scalable backend systems and high-performance web applications. My expertise lies in Python/Django and Scalable Backend Architectures.

I specialize in:
- **Backend Architecture**: Designing robust APIs and distributed systems.
- **System Design**: Optimizing performance and security at scale.
- **Database Optimization**: Managing high-load PostgreSQL and Redis environments.

When I'm not coding, I enjoy sharing knowledge through my lectures and exploring new technologies.
"""
        bio.github_url = "https://github.com/acer"
        bio.linkedin_url = "https://linkedin.com/in/acer"
        bio.telegram_url = "https://t.me/acer"
        bio.email = "john@example.com"
        bio.photo = "bio/placeholder.png"
        bio.save()
        self.stdout.write(self.style.SUCCESS('Seeded Bio'))

        # 2. Experiences
        Experience.objects.all().delete()
        Experience.objects.create(
            title="Senior Backend Engineer",
            company="Tech Giants Corp",
            start_date="2020-01-01",
            description="Leading the core platform team, optimizing microservices, and implementing event-driven architectures with Django and Celery.",
            order=1
        )
        Experience.objects.create(
            title="Full Stack Developer",
            company="Innovative Startups",
            start_date="2017-06-01",
            end_date="2019-12-31",
            description="Developed and maintained complex web applications using Django, PostgreSQL, and modern frontend tools.",
            order=2
        )
        self.stdout.write(self.style.SUCCESS('Seeded Experiences'))

        # 3. Projects
        Project.objects.all().delete()
        Project.objects.create(
            title="High-Load E-commerce API",
            description="A robust backend for an e-commerce platform handling thousands of concurrent users.",
            tech_tags="Django, DRF, Redis, Celery",
            github_url="https://github.com/acer/ecommerce-api",
            is_featured=True,
            order=1,
            cover_image="project_covers/placeholder.png"
        )
        Project.objects.create(
            title="Scalable API Gateway",
            description="A high-performance API gateway built with Go, featuring rate limiting and service discovery.",
            tech_tags="Go, Redis, Docker",
            github_url="https://github.com/acer/gateway",
            is_featured=True,
            order=2,
            cover_image="project_covers/placeholder.png"
        )
        self.stdout.write(self.style.SUCCESS('Seeded Projects'))

        # 4. Blog Posts
        Post.objects.all().delete()
        Post.objects.create(
            title="The Future of Backend Architecture",
            slug="future-of-backend",
            content="""
In this post, we explore how serverless and edge computing are reshaping the way we think about the backend.

### Serverless is the key
Modern applications require horizontal scaling and minimal management overhead. Serverless functions allow us to focus on business logic while the infrastructure scales automatically.

1. **Scalability**: Handle millions of requests effortlessly.
2. **Cost-efficiency**: Pay only for what you use.
3. **Speed**: Deploy in seconds.

Stay tuned for more insights into the world of distributed systems.
""",
            excerpt="Exploring how serverless and edge computing are reshaping the backend landscape.",
            reading_time=8,
            published_at=timezone.now(),
            cover_image="blog_covers/placeholder.png"
        )
        Post.objects.create(
            title="Mastering Framer Motion in Next.js",
            slug="mastering-framer-motion",
            content="""
Animations can make or break a user experience. In this tutorial, we will learn how to integrate Framer Motion into a Next.js application for premium UI transitions.

```tsx
import { motion } from "framer-motion";

export const FadeIn = ({ children }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    {children}
  </motion.div>
);
```

Simple, yet powerful.
""",
            excerpt="A deep dive into creating fluid, premium animations using Framer Motion.",
            reading_time=6,
            published_at=timezone.now(),
            cover_image="blog_covers/placeholder.png"
        )
        self.stdout.write(self.style.SUCCESS('Seeded Blog Posts'))

        # 5. Lectures
        Lecture.objects.all().delete()
        Lecture.objects.create(
            title="Introduction to Database Distributing",
            youtube_video_id="dQw4w9WgXcQ",
            category="database",
            duration_seconds=1200,
            order=1
        )
        Lecture.objects.create(
            title="Advanced Networking with Python",
            youtube_video_id="jNQXAC9IVRw",
            category="networking",
            duration_seconds=1800,
            order=2
        )
        self.stdout.write(self.style.SUCCESS('Seeded Lectures'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded all data!'))
