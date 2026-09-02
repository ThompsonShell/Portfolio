from datetime import timedelta

import environ
from pathlib import Path

env = environ.Env(
    DEBUG=(bool, False),
)

BASE_DIR = Path(__file__).resolve().parent.parent

environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("SECRET_KEY")
DEBUG = env.bool("DEBUG", default=False)
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

INSTALLED_APPS = [
    # modeltranslation must come before django.contrib.admin so its admin
    # patches (the per-language field tabs) actually apply.
    "modeltranslation",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "cloudinary",
    "cloudinary_storage",
    # Local apps
    "works",
    "mentors",
    "analytics",
    "projects",
    "blog",
    "lectures",
    "videos",
    "about",
    "coffee",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "config.middleware.QueryParamLocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env("DB_NAME", default="portfolio_db"),
        'USER': env("DB_USER", default="portfolio_user"),
        'PASSWORD': env("DB_PASSWORD", default="changeme"),
        'HOST': env("DB_HOST", default="localhost"),
        'PORT': env("DB_PORT", default="5432"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ── i18n ─────────────────────────────────────────────────────────────────────
# The site ships in Uzbek and English. Uzbek is the default: content is authored
# in it first, and modeltranslation falls back to it when a translation is blank.
LANGUAGE_CODE = "uz"
TIME_ZONE = "Asia/Tashkent"
USE_I18N = True
USE_L10N = True
USE_TZ = True

LANGUAGES = [
    ("uz", "O'zbekcha"),
    ("en", "English"),
]

LOCALE_PATHS = [BASE_DIR / "locale"]

MODELTRANSLATION_DEFAULT_LANGUAGE = "uz"
MODELTRANSLATION_LANGUAGES = ("uz", "en")
MODELTRANSLATION_FALLBACK_LANGUAGES = ("uz", "en")

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Cloudinary settings
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": env("CLOUDINARY_CLOUD_NAME", default=""),
    "API_KEY": env("CLOUDINARY_API_KEY", default=""),
    "API_SECRET": env("CLOUDINARY_API_SECRET", default=""),
}

# Media files
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Only use Cloudinary if CLOUD_NAME is provided, otherwise fall back to local storage
if CLOUDINARY_STORAGE.get("CLOUD_NAME"):
    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
else:
    DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS
from corsheaders.defaults import default_headers  # noqa: E402

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:3000"],
)

# The browser needs to read these tus response headers cross-origin, and Uppy
# needs to send the tus request headers. Without both lists the upload silently
# stalls at 0% behind CORS.
CORS_EXPOSE_HEADERS = [
    "Location",
    "Upload-Offset",
    "Upload-Length",
    "Tus-Resumable",
    "Tus-Version",
    "Tus-Extension",
    "Tus-Max-Size",
    "Upload-Metadata",
]
CORS_ALLOW_HEADERS = list(default_headers) + [
    "tus-resumable",
    "upload-length",
    "upload-metadata",
    "upload-offset",
    "upload-concat",
    "upload-defer-length",
    "x-http-method-override",
]

# # Email
# EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
# EMAIL_HOST = env("EMAIL_HOST", default="smtp.gmail.com")
# EMAIL_PORT = env.int("EMAIL_PORT", default=587)
# EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
# EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
# EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
# DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="ThompsonShell Portfolio <noreply@gmail.com>")
# ADMIN_NOTIFICATION_EMAIL = env("ADMIN_NOTIFICATION_EMAIL", default="asilbek.rajabov.offcial@gmail.com")

# DRF
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_RENDERER_CLASSES": (
        ["rest_framework.renderers.JSONRenderer", "rest_framework.renderers.BrowsableAPIRenderer"]
        if DEBUG
        else ["rest_framework.renderers.JSONRenderer"]
    ),
}

# JWT — the access token must outlive a full upload, otherwise a chunk request
# can 401 mid-transfer (Uppy/tus does not refresh tokens on its own).
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=env.int("JWT_ACCESS_HOURS", default=12)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

# ── Chunked video upload ─────────────────────────────────────────────────────
VIDEO_UPLOAD_MAX_SIZE = 6 * 1024 ** 3  # 6 GB hard cap
VIDEO_UPLOAD_ALLOWED_EXTENSIONS = [".mp4", ".mov", ".mkv"]
VIDEO_UPLOAD_READ_SIZE = 512 * 1024  # how much we read/write per loop while streaming a chunk

# Shared secret for the tusd webhook (Option A). Leave empty to disable the check
# and rely on network isolation + the forwarded JWT instead.
TUSD_WEBHOOK_SECRET = env("TUSD_WEBHOOK_SECRET", default="")

# We stream chunks straight to disk with request.read(), so Django never buffers a
# whole chunk in memory. These limits only guard *other* (form/JSON) endpoints;
# keep them modest but comfortably above one 10 MB chunk just in case.
DATA_UPLOAD_MAX_MEMORY_SIZE = 20 * 1024 * 1024   # 20 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 20 * 1024 * 1024   # 20 MB
