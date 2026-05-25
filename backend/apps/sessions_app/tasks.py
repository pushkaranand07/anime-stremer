from celery import shared_task
from django.utils import timezone
from .models import UserSession

@shared_task(name="cleanup_expired_sessions")
def cleanup_expired_sessions():
    """
    Cron-style task designed to execute hourly.
    Soft-deletes expired and revoked sessions to keep DB footprint minimal.
    """
    now = timezone.now()
    deleted_count, _ = UserSession.objects.filter(
        expires_at__lt=now, 
        is_active=True
    ).update(is_active=False, revoked_at=now)
    
    return f"Purged {deleted_count} expired sessions."
