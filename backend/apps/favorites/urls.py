from django.urls import path
from .views import FavoriteListView, FavoriteDetailView

urlpatterns = [
    path('', FavoriteListView.as_view(), name='favorites_list'),
    path('<str:anime_id>/', FavoriteDetailView.as_view(), name='favorite_remove'),
]
