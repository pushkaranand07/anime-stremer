from django.urls import path
from .views import CSRFView, RegisterView, LoginView, LogoutView, MeView

urlpatterns = [
    # CSRF token endpoint — frontend calls this first before any mutating request
    path('csrf/', CSRFView.as_view(), name='auth_csrf'),

    # Core auth
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),

    # Session probe — frontend calls this on startup to restore auth state
    path('me/', MeView.as_view(), name='auth_me'),
]
