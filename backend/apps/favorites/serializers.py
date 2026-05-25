from rest_framework import serializers
from .models import Favorite

class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ('id', 'anime_id', 'title', 'image_url', 'mal_id', 'added_at')
        read_only_fields = ('id', 'added_at')
