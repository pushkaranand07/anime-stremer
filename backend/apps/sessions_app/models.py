"""
sessions_app/models.py

The custom UserSession model has been removed. Authentication is now entirely
handled by Django's built-in session framework (django.contrib.sessions).

Sessions are stored in the `django_session` table managed by
django.contrib.sessions.backends.db, which is included in INSTALLED_APPS via
'django.contrib.sessions'.

No custom models are required here.
"""
# This file intentionally left model-free.
