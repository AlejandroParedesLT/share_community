from django.contrib.auth import get_user_model
from django.db import models

class Genre(models.Model):
    precordsid = models.IntegerField()
    id = models.IntegerField()
    name = models.CharField(max_length=100)
    createdAt = models.DateField()

    def __str__(self):
        return self.name