from rest_framework import serializers
from .models import UserSession

class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = (
            'id', 'device_name', 'browser', 'os', 'device_type',
            'ip_address', 'country', 'city', 'is_active', 
            'last_active_at', 'created_at'
        )
