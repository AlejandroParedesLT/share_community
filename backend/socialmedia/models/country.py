from django.contrib.auth import get_user_model
from django.db import models

class Country(models.Model):
    precordsid = models.IntegerField()
    id = models.IntegerField()
    name = models.TextField()
    lat = models.FloatField()
    lon = models.FloatField()
    region = models.TextField()

    def __str__(self):
        return self.name