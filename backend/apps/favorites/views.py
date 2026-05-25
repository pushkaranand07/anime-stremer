from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Favorite
from .serializers import FavoriteSerializer
from django.db import IntegrityError

class FavoriteListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favorites = Favorite.objects.filter(user=request.user).order_by('-added_at')
        
        # Paginate results
        page = self.paginate_queryset(favorites)
        if page is not None:
            serializer = FavoriteSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = FavoriteSerializer(favorites, many=True)
        return Response({
            'success': True,
            'favorites': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = FavoriteSerializer(data=request.data)
        if serializer.is_valid():
            try:
                favorite = serializer.save(user=request.user)
                return Response({
                    'success': True,
                    'favorite': FavoriteSerializer(favorite).data
                }, status=status.HTTP_201_CREATED)
            except IntegrityError:
                return Response({
                    'success': False,
                    'message': 'Anime already in favorites'
                }, status=status.HTTP_409_CONFLICT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Simple DRF-like properties to support pagination easily in a plain APIView
    @property
    def paginator(self):
        if not hasattr(self, '_paginator'):
            from apps.core.pagination import StandardResultsSetPagination
            self._paginator = StandardResultsSetPagination()
        return self._paginator

    def paginate_queryset(self, queryset):
        return self.paginator.paginate_queryset(queryset, self.request, view=self)

    def get_paginated_response(self, data):
        return self.paginator.get_paginated_response(data)

class FavoriteDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, anime_id):
        try:
            favorite = Favorite.objects.get(user=request.user, anime_id=anime_id)
        except Favorite.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Favorite not found'
            }, status=status.HTTP_404_NOT_FOUND)

        favorite.delete()
        return Response({
            'success': True,
            'message': 'Favorite removed successfully'
        }, status=status.HTTP_200_OK)
