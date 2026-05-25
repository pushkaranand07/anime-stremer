from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.conf import settings
from django.utils import timezone
from .services import TokenService
from .serializers import RegisterSerializer
from apps.user.models import CustomUser
from apps.sessions_app.models import UserSession

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            ip_address = request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Authenticate immediately
            tokens = TokenService.create_session(user, ip_address, user_agent, remember_me=False)
            
            response = Response({
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'role': user.role
                },
                'access_token': tokens['access_token']
            }, status=status.HTTP_201_CREATED)

            response.set_cookie(
                key='refresh_token',
                value=tokens['refresh_token'],
                httponly=True,
                secure=True,
                samesite='Strict',
                max_age=7 * 24 * 3600
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        remember_me = request.data.get('remember_me', False)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate sessions
        ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        tokens = TokenService.create_session(user, ip_address, user_agent, remember_me)

        response = Response({
            'success': True,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'username': user.username,
                'role': user.role
            },
            'access_token': tokens['access_token']
        }, status=status.HTTP_200_OK)

        cookie_age = 30 * 24 * 3600 if remember_me else 7 * 24 * 3600
        response.set_cookie(
            key='refresh_token',
            value=tokens['refresh_token'],
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=cookie_age
        )
        return response

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        raw_refresh_token = request.COOKIES.get('refresh_token')
        if not raw_refresh_token:
            return Response({'error': 'No refresh token provided'}, status=status.HTTP_401_UNAUTHORIZED)

        ip_address = request.META.get('REMOTE_ADDR')
        try:
            tokens = TokenService.rotate_session(raw_refresh_token, ip_address)
        except ValueError as err:
            response = Response({'error': str(err)}, status=status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie('refresh_token')
            return response

        # Fetch user associated with session
        hashed_token = TokenService.hash_token(tokens['refresh_token'])
        session = UserSession.objects.get(refresh_token_hash=hashed_token)
        user = session.user

        response = Response({
            'success': True,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'username': user.username,
                'role': user.role
            },
            'access_token': tokens['access_token']
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key='refresh_token',
            value=tokens['refresh_token'],
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=7 * 24 * 3600
        )
        return response

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_refresh_token = request.COOKIES.get('refresh_token')
        if raw_refresh_token:
            hashed_token = TokenService.hash_token(raw_refresh_token)
            UserSession.objects.filter(refresh_token_hash=hashed_token).update(
                is_active=False,
                revoked_at=timezone.now()
            )

        response = Response({'success': True, 'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        return response
