import requests
from urllib.parse import quote

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
        username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Missing parameters'}, status=status.HTTP_400_BAD_REQUEST)

        payload = {
            'grant_type': 'password',
            'username': username,
            'password': quote(password, safe=''),
        }

        try:
            tokens_response = requests.post(
                f'{settings.KITSU_OAUTH_URL}/token',
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=15,
            )
            response_data = tokens_response.json()
        except requests.RequestException:
            return Response({'error': 'Failed to connect to Kitsu OAuth endpoint'}, status=status.HTTP_502_BAD_GATEWAY)

        if tokens_response.status_code != status.HTTP_200_OK:
            error_code = response_data.get('error')
            error_map = {
                'invalid_request': 'Missing parameters',
                'invalid_client': 'Invalid credentials',
                'invalid_grant': 'Wrong username or password',
                'unsupported_grant_type': 'Server config error',
            }
            return Response(
                {'error': error_map.get(error_code, response_data.get('error_description', 'Authentication failed'))},
                status=tokens_response.status_code,
            )

        request.session['kitsu_refresh_token'] = response_data.get('refresh_token')
        request.session.modified = True

        response = Response({
            'success': True,
            'access_token': response_data.get('access_token'),
            'refresh_token': response_data.get('refresh_token'),
            'expires_in': response_data.get('expires_in'),
            'token_type': response_data.get('token_type'),
            'user': {'username': username},
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key='refresh_token',
            value=response_data.get('refresh_token'),
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=7 * 24 * 3600,
        )
        return response

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        kitsu_refresh_token = request.session.get('kitsu_refresh_token')

        if kitsu_refresh_token:
            payload = {
                'grant_type': 'refresh_token',
                'refresh_token': kitsu_refresh_token,
            }
            try:
                refresh_response = requests.post(
                    f'{settings.KITSU_OAUTH_URL}/token',
                    json=payload,
                    headers={'Content-Type': 'application/json'},
                    timeout=15,
                )
                response_data = refresh_response.json()
            except requests.RequestException:
                return Response({'error': 'Failed to refresh token with Kitsu'}, status=status.HTTP_502_BAD_GATEWAY)

            if refresh_response.status_code != status.HTTP_200_OK:
                error_code = response_data.get('error')
                error_map = {
                    'invalid_request': 'Missing parameters',
                    'invalid_client': 'Invalid credentials',
                    'invalid_grant': 'Wrong username or password',
                    'unsupported_grant_type': 'Server config error',
                }
                response = Response(
                    {'error': error_map.get(error_code, response_data.get('error_description', 'Token refresh failed'))},
                    status=refresh_response.status_code,
                )
                response.delete_cookie('refresh_token')
                request.session.pop('kitsu_refresh_token', None)
                return response

            request.session['kitsu_refresh_token'] = response_data.get('refresh_token')
            request.session.modified = True

            response = Response({
                'success': True,
                'access_token': response_data.get('access_token'),
                'refresh_token': response_data.get('refresh_token'),
                'expires_in': response_data.get('expires_in'),
                'token_type': response_data.get('token_type'),
            }, status=status.HTTP_200_OK)
            response.set_cookie(
                key='refresh_token',
                value=response_data.get('refresh_token'),
                httponly=True,
                secure=True,
                samesite='Strict',
                max_age=7 * 24 * 3600,
            )
            return response

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
