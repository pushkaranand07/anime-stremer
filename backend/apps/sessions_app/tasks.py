from celery import shared_task
from django.utils import timezone
from django.contrib.sessions.backends.db import SessionStore
from django.contrib.sessions.models import Session


@shared_task(name="cleanup_expired_sessions")
def cleanup_expired_sessions():
    """
    Celery periodic task — purges expired Django sessions from the database.
    Django's built-in `clearsessions` management command does the same thing,
    but having it as a Celery task allows scheduling via the beat scheduler
    without a cron entry.
    """
    now = timezone.now()
    deleted_count, _ = Session.objects.filter(expire_date__lt=now).delete()
    return f"Purged {deleted_count} expired Django sessions."
