import hashlib
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from apps.sessions_app.models import UserSession

class TokenService:
    @staticmethod
    def hash_token(token: str) -> str:
        return hashlib.sha256(token.encode('utf-8')).hexdigest()

    @classmethod
    def create_session(cls, user, ip_address, user_agent, remember_me=False) -> dict:
        refresh = RefreshToken.for_user(user)
        
        # Determine TTL
        days = 30 if remember_me else 7
        refresh.set_exp(lifetime=timedelta(days=days))
        
        raw_refresh_token = str(refresh)
        hashed_refresh = cls.hash_token(raw_refresh_token)
        
        # Simple agent parsing
        device_name = "Web Client"
        browser = "Chrome"
        os = "Windows"
        
        expires_at = timezone.now() + timedelta(days=days)
        
        # Persist to database
        session = UserSession.objects.create(
            user=user,
            refresh_token_hash=hashed_refresh,
            device_name=device_name,
            browser=browser,
            os=os,
            ip_address=ip_address,
            expires_at=expires_at
        )

        return {
            'access_token': str(refresh.access_token),
            'refresh_token': raw_refresh_token,
            'session_id': session.id
        }

    @classmethod
    def rotate_session(cls, raw_refresh_token: str, ip_address: str) -> dict:
        hashed_old = cls.hash_token(raw_refresh_token)
        
        try:
            session = UserSession.objects.get(refresh_token_hash=hashed_old, is_active=True)
        except UserSession.DoesNotExist:
            # Breach Alert: Potential replay attack! Revoke entire family tree.
            cls.revoke_all_sessions_for_token(raw_refresh_token)
            raise ValueError("Token reuse detected. All sessions revoked.")

        if session.expires_at < timezone.now():
            session.is_active = False
            session.save()
            raise ValueError("Session has expired")

        # Invalidate old session
        session.is_active = False
        session.revoked_at = timezone.now()
        session.save()

        # Generate new pair
        user = session.user
        new_refresh = RefreshToken.for_user(user)
        raw_new_refresh_token = str(new_refresh)
        
        # Save new session block
        new_session = UserSession.objects.create(
            user=user,
            refresh_token_hash=cls.hash_token(raw_new_refresh_token),
            device_name=session.device_name,
            browser=session.browser,
            os=session.os,
            ip_address=ip_address,
            expires_at=timezone.now() + timedelta(days=7)
        )

        return {
            'access_token': str(new_refresh.access_token),
            'refresh_token': raw_new_refresh_token
        }

    @classmethod
    def revoke_all_sessions_for_token(cls, raw_token: str):
        try:
            decoded = RefreshToken(raw_token)
            user_id = decoded['user_id']
            UserSession.objects.filter(user_id=user_id, is_active=True).update(
                is_active=False,
                revoked_at=timezone.now()
            )
        except Exception:
            pass
