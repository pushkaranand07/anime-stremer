import os
from django.core.wsgi import get_wsgi_application

# Default to development settings, can be overridden by env variable
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

application = get_wsgi_application()
