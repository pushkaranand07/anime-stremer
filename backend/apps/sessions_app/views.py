from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import UserSession
from .serializers import UserSessionSerializer
from apps.auth_system.services import TokenService

class UserSessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = UserSession.objects.filter(user=request.user, is_active=True).order_by('-last_active_at')
        serializer = UserSessionSerializer(sessions, many=True)
        return Response({
            'success': True,
            'sessions': serializer.data
        }, status=status.HTTP_200_OK)

    def delete(self, request):
        # Revoke all sessions except the current one
        current_token = request.COOKIES.get('refresh_token')
        current_hash = TokenService.hash_token(current_token) if current_token else None

        queryset = UserSession.objects.filter(user=request.user, is_active=True)
        if current_hash:
            queryset = queryset.exclude(refresh_token_hash=current_hash)

        updated_count = queryset.update(is_active=False, revoked_at=timezone.now())

        return Response({
            'success': True,
            'message': f'Successfully revoked {updated_count} other sessions'
        }, status=status.HTTP_200_OK)

class UserSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, session_id):
        try:
            session = UserSession.objects.get(id=session_id, user=request.user, is_active=True)
        except UserSession.DoesNotExist:
            return Response({'error': 'Active session not found'}, status=status.HTTP_404_NOT_FOUND)

        session.is_active = False
        session.revoked_at = timezone.now()
        session.save()

        return Response({
            'success': True,
            'message': 'Session revoked successfully'
        }, status=status.HTTP_200_OK)
