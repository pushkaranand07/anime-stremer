from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.auth_system.urls')),
    path('api/v1/user/', include('apps.user.urls')),
    path('api/v1/sessions/', include('apps.sessions_app.urls')),
    path('api/v1/favorites/', include('apps.favorites.urls')),
]
