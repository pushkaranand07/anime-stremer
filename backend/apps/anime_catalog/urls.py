from django.urls import path, re_path
from .views import (
    JikanProxyView,
    KitsuGenericProxyView,
    MangaListView,
    MangaDetailView,
    MangaChaptersView,
    TrendingMangaView,
    StreamersView,
    StreamingLinksView,
    AnimeStreamingView,
    AnimeEpisodesView,
)

urlpatterns = [
    path('manga/', MangaListView.as_view(), name='kitsu_manga_list'),
    path('manga/<str:manga_id>/', MangaDetailView.as_view(), name='kitsu_manga_detail'),
    path('manga/<str:manga_id>/chapters/', MangaChaptersView.as_view(), name='kitsu_manga_chapters'),
    path('manga/trending/', TrendingMangaView.as_view(), name='kitsu_manga_trending'),
    path('streamers/', StreamersView.as_view(), name='kitsu_streamers'),
    path('streaming-links/', StreamingLinksView.as_view(), name='kitsu_streaming_links'),
    path('anime/<str:anime_id>/streaming/', AnimeStreamingView.as_view(), name='kitsu_anime_streaming'),
    path('anime/<str:anime_id>/episodes/', AnimeEpisodesView.as_view(), name='kitsu_anime_episodes'),
    path('kitsu/<path:kitsu_path>/', KitsuGenericProxyView.as_view(), name='kitsu_generic'),
    re_path(r'^catalog/(?P<jikan_path>.*)$', JikanProxyView.as_view(), name='jikan_proxy'),
]
