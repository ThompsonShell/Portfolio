from django.conf import settings
from django.utils import translation


class QueryParamLocaleMiddleware:
    """Let an API client choose the response language with `?lang=uz` / `?lang=en`.

    The Next.js frontend is a separate origin with its own routing, so it cannot
    rely on Django's Accept-Language negotiation alone. This runs after
    LocaleMiddleware and simply overrides whatever it decided when the query
    param names a language we actually ship.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.supported = {code for code, _ in settings.LANGUAGES}

    def __call__(self, request):
        lang = request.GET.get("lang")
        if lang in self.supported:
            translation.activate(lang)
            request.LANGUAGE_CODE = lang
        response = self.get_response(request)
        if lang in self.supported:
            response["Content-Language"] = lang
        return response
