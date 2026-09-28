"""
Session helpers for the anime-streamer auth system.

All authentication is now handled via Django's built-in session framework
(django.contrib.sessions). There are no JWT tokens, no token rotation, and
no refresh-token cookies. A single HttpOnly session cookie ('animesession')
is the sole auth mechanism.

This module provides lightweight utilities consumed by other apps.
"""

from django.contrib.sessions.backends.db import SessionStore


def get_kitsu_token_from_session(request) -> str | None:
    """Return the Kitsu access token stored in the current server-side session, if any."""
    return request.session.get('kitsu_access_token')


def is_kitsu_session(request) -> bool:
    """Return True if the current session is a Kitsu-authenticated session."""
    return 'kitsu_access_token' in request.session
