import logging
from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings
from django.middleware.csrf import get_token

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle

from .serializers import RegisterSerializer
from apps.user.models import CustomUser

logger = logging.getLogger(__name__)


class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'


def _user_payload(user):
    """Serialize the minimal user object returned to the frontend."""
    return {
        'id': str(user.id),
        'email': user.email,
        'username': user.username,
        'role': getattr(user, 'role', 'USER'),
    }


class CSRFView(APIView):
    """
    GET /api/v1/auth/csrf/
    Returns a CSRF cookie and token for frontend state-modifying requests.
    """
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({'csrfToken': get_token(request)})


class RegisterView(APIView):
    """
    POST /api/v1/auth/register/
    Body: { username, email, password, password_confirm? }
    Creates a new user and logs them in via Django session.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data.copy()
        if 'password_confirm' not in data and 'password' in data:
            data['password_confirm'] = data['password']
        if not data.get('username') and data.get('email'):
            data['username'] = data['email'].split('@')[0]

        serializer = RegisterSerializer(data=data)
        if not serializer.is_valid():
            # Return first human-readable validation error
            errors = serializer.errors
            first_err = None
            for key, val in errors.items():
                msg = val[0] if isinstance(val, list) and len(val) > 0 else str(val)
                first_err = f"{key.capitalize()}: {msg}"
                break
            return Response(
                {'error': first_err or 'Validation error', 'details': errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()
        user.is_active = True
        user.save(update_fields=['is_active'])

        login(request, user)
        logger.info('[RegisterView] New user registered and logged in: %s', user.email)

        return Response({
            'success': True,
            'user': _user_payload(user),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    POST /api/v1/auth/login/
    Body: { username|email, password, remember_me? }
    Authenticates and issues a Django session cookie.
    """
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        identifier = (request.data.get('username') or request.data.get('email', '')).strip()
        password = request.data.get('password', '')

        if not identifier or not password:
            return Response(
                {'error': 'Email/username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Try authenticating directly (email as username)
        user = authenticate(request, username=identifier, password=password)

        # 2. If identifier is a username instead of email, look up by username
        if user is None:
            try:
                db_user = CustomUser.objects.filter(username__iexact=identifier).first() \
                    or CustomUser.objects.filter(email__iexact=identifier).first()
                if db_user:
                    user = authenticate(request, username=db_user.email, password=password)
            except Exception as e:
                logger.warning('[LoginView] User lookup error: %s', e)

        if user is not None:
            if not user.is_active:
                return Response(
                    {'error': 'Account is deactivated. Please contact support.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

            remember_me = bool(request.data.get('remember_me', False))
            if remember_me:
                request.session.set_expiry(30 * 24 * 60 * 60)  # 30 days
            else:
                request.session.set_expiry(0)  # session cookie (until browser closes)

            login(request, user)
            logger.info('[LoginView] User logged in: %s (remember_me=%s)', user.email, remember_me)

            return Response({
                'success': True,
                'user': _user_payload(user),
            }, status=status.HTTP_200_OK)

        # 3. Clean user-friendly 401 error message
        return Response(
            {'error': 'Invalid email/username or password. If you don\'t have an account, please sign up.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    Flushes the Django session and deletes the session cookie.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        logout(request)
        logger.info('[LogoutView] Session terminated')
        return Response({'success': True, 'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class MeView(APIView):
    """
    GET /api/v1/auth/me/
    Returns current session authentication state.
    Returns 200 OK with authenticated: false for guests so the frontend console is clean.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user and request.user.is_authenticated:
            return Response({
                'authenticated': True,
                'success': True,
                'user': _user_payload(request.user),
            }, status=status.HTTP_200_OK)

        return Response({
            'authenticated': False,
            'success': False,
            'user': None,
        }, status=status.HTTP_200_OK)
