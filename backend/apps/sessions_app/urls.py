from django.urls import path
from .views import SessionStatusView

urlpatterns = [
    path('status/', SessionStatusView.as_view(), name='session_status'),
]
