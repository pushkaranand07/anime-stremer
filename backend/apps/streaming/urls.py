from django.urls import path
from .views import InfoView, WatchView, ProxyView

urlpatterns = [
    path('info/', InfoView.as_view(), name='streaming_info'),
    path('info', InfoView.as_view()),
    
    path('watch/<path:episode_id>/', WatchView.as_view(), name='streaming_watch'),
    path('watch/<path:episode_id>', WatchView.as_view()),
    
    path('proxy/', ProxyView.as_view(), name='streaming_proxy'),
    path('proxy', ProxyView.as_view()),
]
