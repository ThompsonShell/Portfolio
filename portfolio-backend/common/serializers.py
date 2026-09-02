"""Serializer helpers shared across the API apps."""


def absolute_url(serializer, file_field) -> str:
    """Full URL for a FileField/ImageField, or "" when the field is empty.

    Every app's serializer needs the same three lines to turn a stored file
    into something the frontend can load, so they all call this instead of
    repeating it.
    """
    if not file_field:
        return ""
    request = serializer.context.get("request")
    if request is not None:
        return request.build_absolute_uri(file_field.url)
    return file_field.url
