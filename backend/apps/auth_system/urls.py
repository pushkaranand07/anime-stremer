from django.urls import path
from .views import RegisterView, LoginView, RefreshTokenView, LogoutView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('refresh/', RefreshTokenView.as_view(), name='auth_refresh'),
    path('token/refresh/', RefreshTokenView.as_view(), name='auth_token_refresh'),
    path('refresh-token/', RefreshTokenView.as_view(), name='auth_refresh_token_slash'),
    path('refresh-token', RefreshTokenView.as_view(), name='auth_refresh_token_no_slash'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
]
