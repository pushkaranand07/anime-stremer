import logging
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.core.cache import cache
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

JIKAN_BASE_URL = getattr(settings, 'JIKAN_API_URL', 'https://api.jikan.moe/v4')
JIKAN_TIMEOUT = getattr(settings, 'JIKAN_TIMEOUT', 15)
JIKAN_CACHE_TTL = getattr(settings, 'JIKAN_CACHE_TTL', 30)
KITSU_BASE_URL = getattr(settings, 'KITSU_BASE_URL', 'https://kitsu.io/api/edge')
KITSU_HEADERS = getattr(settings, 'KITSU_HEADERS', {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
})


def proxy_kitsu(endpoint, params=None):
    url = f'{KITSU_BASE_URL.rstrip("/")}/{endpoint.lstrip("/")}'
    response = requests.get(url, headers=KITSU_HEADERS, params=params or {}, timeout=15)
    return response


class JikanProxyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, jikan_path=''):
        if not jikan_path:
            return Response(
                {'detail': 'Jikan path is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_url = f'{JIKAN_BASE_URL.rstrip("/")}/{jikan_path.lstrip("/")}'
        params = request.query_params.dict()
        cache_key = f'jikan:{jikan_path}:{urlencode(sorted(params.items()))}'
        cached_payload = cache.get(cache_key)
        if cached_payload is not None:
            return Response(cached_payload)

        try:
            response = requests.get(target_url, params=params, timeout=JIKAN_TIMEOUT)
            response.raise_for_status()
            payload = response.json()
            cache.set(cache_key, payload, JIKAN_CACHE_TTL)
            return Response(payload, status=response.status_code)
        except requests.exceptions.RequestException as exc:
            logger.exception('[JikanProxy] Failed to fetch data from Jikan')
            response = getattr(exc, 'response', None)
            status_code = response.status_code if response is not None else status.HTTP_502_BAD_GATEWAY
            error_payload = {
                'detail': 'Failed to fetch Jikan API data.',
                'error': response.text if response is not None else str(exc),
            }
            return Response(error_payload, status=status_code)


class KitsuGenericProxyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, kitsu_path=''):
        if not kitsu_path:
            return Response({'detail': 'Kitsu path is required.'}, status=status.HTTP_400_BAD_REQUEST)

        response = proxy_kitsu(kitsu_path, request.query_params.dict())
        try:
            response.raise_for_status()
            return Response(response.json(), status=response.status_code)
        except requests.exceptions.RequestException as exc:
            logger.exception('[KitsuProxy] Failed to fetch data from Kitsu')
            err_payload = {
                'detail': 'Failed to fetch Kitsu API data.',
                'error': getattr(exc, 'response', None).text if getattr(exc, 'response', None) is not None else str(exc),
            }
            status_code = getattr(exc, 'response', None).status_code if getattr(exc, 'response', None) is not None else status.HTTP_502_BAD_GATEWAY
            return Response(err_payload, status=status_code)


class MangaListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        response = proxy_kitsu('manga', request.query_params.dict())
        return Response(response.json(), status=response.status_code)


class MangaDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, manga_id):
        response = proxy_kitsu(f'manga/{manga_id}', request.query_params.dict())
        return Response(response.json(), status=response.status_code)


class MangaChaptersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, manga_id):
        params = request.query_params.dict()
        params['filter[mangaId]'] = manga_id
        response = proxy_kitsu('chapters', params)
        return Response(response.json(), status=response.status_code)


class TrendingMangaView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        response = proxy_kitsu('trending/manga', request.query_params.dict())
        return Response(response.json(), status=response.status_code)


class StreamersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        response = proxy_kitsu('streamers', request.query_params.dict())
        return Response(response.json(), status=response.status_code)


class StreamingLinksView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        response = proxy_kitsu('streaming-links', request.query_params.dict())
        return Response(response.json(), status=response.status_code)


class AnimeStreamingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, anime_id):
        params = request.query_params.dict()
        params.setdefault('include', 'streamingLinks.streamer')
        response = proxy_kitsu(f'anime/{anime_id}', params)
        return Response(response.json(), status=response.status_code)


class AnimeEpisodesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, anime_id):
        params = request.query_params.dict()
        params['filter[mediaId]'] = anime_id
        response = proxy_kitsu('episodes', params)
        return Response(response.json(), status=response.status_code)
