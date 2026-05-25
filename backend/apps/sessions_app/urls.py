from django.urls import path
from .views import UserSessionListView, UserSessionDetailView

urlpatterns = [
    path('', UserSessionListView.as_view(), name='sessions_list'),
    path('<uuid:session_id>/', UserSessionDetailView.as_view(), name='session_revoke'),
]
