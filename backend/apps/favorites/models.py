import uuid
from django.db import models
from django.conf import settings

class Favorite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    anime_id = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    image_url = models.URLField(max_length=1000, blank=True, null=True)
    mal_id = models.CharField(max_length=50, blank=True, null=True)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'favorites'
        unique_together = ('user', 'anime_id')
        indexes = [
            models.Index(fields=['user', 'added_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.title}"
