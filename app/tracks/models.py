from django.db import models
from django.contrib.auth.models import User


class Track(models.Model):
    title = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    posted_by = models.ForeignKey(User, null=True,
                                  on_delete=models.CASCADE)


class Like(models.Model):
    user = models.ForeignKey(User, models.CASCADE, null=True)
    track = models.ForeignKey(Track, on_delete=models.CASCADE, 
                              null=True, related_name='likes')
