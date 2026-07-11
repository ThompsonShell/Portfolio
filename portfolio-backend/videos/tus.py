"""
Helpers for the hand-written tus 1.0.0 server (Option B) and the tusd
webhook (Option A). Kept separate from the views so both entry points share
exactly the same validation and metadata parsing.
"""
import base64
import os

from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

TUS_VERSION = "1.0.0"


def parse_upload_metadata(header_value: str) -> dict:
    """
    Parse a tus `Upload-Metadata` header into a plain dict.

    Format: comma-separated `key <base64value>` pairs, e.g.
        "filename dmlkZW8ubXA0,filetype dmlkZW8vbXA0,title TXkgY2xhc3M="
    A key with no value (valueless metadata) maps to "".
    """
    meta: dict[str, str] = {}
    if not header_value:
        return meta
    for pair in header_value.split(","):
        pair = pair.strip()
        if not pair:
            continue
        parts = pair.split(" ", 1)
        key = parts[0]
        if len(parts) == 2:
            try:
                meta[key] = base64.b64decode(parts[1]).decode("utf-8", errors="replace")
            except Exception:
                meta[key] = ""
        else:
            meta[key] = ""
    return meta


def authenticate_request(request):
    """
    Validate the `Authorization: Bearer <jwt>` header on a plain Django request.

    Reused by the tus views (which are plain Django Views, so they don't get
    DRF's auth for free) and by the tusd webhook (which validates the JWT that
    tusd forwarded from the original browser request).

    Returns the User on success, or None if the token is missing/invalid.
    """
    try:
        result = JWTAuthentication().authenticate(request)
    except (InvalidToken, TokenError):
        return None
    if result is None:
        return None
    user, _token = result
    return user


def user_can_upload(user) -> bool:
    """Only authenticated staff (admins) may upload lecture videos."""
    return bool(user and user.is_authenticated and user.is_active and user.is_staff)


def validate_filename(filename: str) -> str | None:
    """Return an error string if the extension is not allowed, else None."""
    ext = os.path.splitext(filename or "")[1].lower()
    allowed = [e.lower() for e in settings.VIDEO_UPLOAD_ALLOWED_EXTENSIONS]
    if ext not in allowed:
        return f"File type '{ext or 'unknown'}' is not allowed. Allowed: {', '.join(allowed)}"
    return None


def validate_size(total_size: int) -> str | None:
    """Return an error string if the declared size is out of range, else None."""
    if total_size is None or total_size <= 0:
        return "Missing or invalid upload size."
    if total_size > settings.VIDEO_UPLOAD_MAX_SIZE:
        limit_gb = settings.VIDEO_UPLOAD_MAX_SIZE / (1024 ** 3)
        return f"File is too large. Maximum allowed size is {limit_gb:.0f} GB."
    return None
