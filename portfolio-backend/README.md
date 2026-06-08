# Portfolio Backend

Django REST API for the ThompsonShell portfolio website.

## Tech Stack

- **Framework:** Django 4.2 + Django REST Framework
- **Database:** PostgreSQL (configured via `DB_*` environment variables)
- **File Storage:** Local filesystem (optional Cloudinary support)
- **Deployment:** Docker Compose (app + PostgreSQL + Nginx)

## Quick Start (Local)

### Prerequisites

- Python 3.11+
- PostgreSQL (or Docker for the database)

### Setup

```bash
# 1. Clone and enter the backend directory
cd portfolio-backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/macOS
# venv\Scripts\activate    # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your settings (at minimum SECRET_KEY and DB_* settings)

# 5. Create the database
# Make sure PostgreSQL is running and the database/user from DB_* settings exist.
# Or use Docker: docker compose up db -d

# 6. Run migrations
python manage.py migrate

# 7. Seed sample data (optional)
python manage.py seed_data

# 8. Start the dev server
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`.

## Docker Compose (Production-like)

```bash
docker compose up --build
```

- API: `http://localhost:8000/api/`
- Django Admin: `http://localhost:8000/admin/`
- Nginx reverse proxy on port `80`

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `SECRET_KEY` | **Yes** | — | Django secret key |
| `DEBUG` | No | `False` | Django debug mode |
| `ALLOWED_HOSTS` | No | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `DB_NAME` | **Yes** | `portfolio_db` | PostgreSQL database name |
| `DB_USER` | **Yes** | `portfolio_user` | PostgreSQL user |
| `DB_PASSWORD` | **Yes** | `changeme` | PostgreSQL password |
| `DB_HOST` | **Yes** | `localhost` | PostgreSQL host |
| `DB_PORT` | **Yes** | `5432` | PostgreSQL port |
| `POSTGRES_PASSWORD` | No | `changeme` | Used by docker-compose for the DB container |
| `CLOUDINARY_CLOUD_NAME` | No | `""` | Cloudinary cloud name (leave empty for local storage) |
| `CLOUDINARY_API_KEY` | No | `""` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | `""` | Cloudinary API secret |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:3000` | Comma-separated allowed CORS origins |
| `EMAIL_HOST` | No | `smtp.gmail.com` | SMTP host |
| `EMAIL_PORT` | No | `587` | SMTP port |
| `EMAIL_USE_TLS` | No | `True` | SMTP TLS flag |
| `EMAIL_HOST_USER` | No | `""` | SMTP username |
| `EMAIL_HOST_PASSWORD` | No | `""` | SMTP password |
| `DEFAULT_FROM_EMAIL` | No | — | From address for sent emails |
| `ADMIN_NOTIFICATION_EMAIL` | No | — | Where coffee-request notifications go |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects/` | List projects (`?tag=`, `?featured=true`) |
| `GET` | `/api/blog/` | List published blog posts |
| `GET` | `/api/blog/{slug}/` | Blog post detail |
| `GET` | `/api/lectures/` | List lectures (`?category=`, `?search=`) |
| `GET` | `/api/lectures/{id}/` | Lecture detail (with prev/next) |
| `GET` | `/api/about/` | Bio, experiences, and skills |
| `POST` | `/api/coffee-requests/` | Submit a coffee meeting request |

## Management Commands

```bash
python manage.py seed_data    # Seed the database with sample data
python manage.py createsuperuser  # Create an admin account
```
