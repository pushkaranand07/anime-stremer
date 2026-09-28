"""
sessions_app/views.py

With Django session-cookie auth, "active sessions" simply means the
django_session table rows. We expose a lightweight read endpoint so
the frontend can show "You are logged in" without any token logic.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


class SessionStatusView(APIView):
    """
    GET /api/v1/sessions/status/
    Returns basic session info for the currently authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session = request.session
        return Response({
            'success': True,
            'session_key': session.session_key,
            'session_age': session.get_expiry_age(),
            'user': {
                'id': str(request.user.id),
                'username': request.user.username,
                'email': request.user.email,
                'role': request.user.role,
            },
        }, status=status.HTTP_200_OK)

    def delete(self, request):
        """
        DELETE /api/v1/sessions/status/
        Terminates the current session (same as logout).
        """
        from django.contrib.auth import logout
        logout(request)
        return Response({'success': True, 'message': 'Session terminated'}, status=status.HTTP_200_OK)
