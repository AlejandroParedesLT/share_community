from django.contrib.auth import get_user_model
from django.db import models


class Movie(models.Model):
    precordsid = models.IntegerField()
    title = models.TextField(blank=True, null=True)
    release_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    category = models.CharField(max_length=100)
    # user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    # movie_file = models.FileField(upload_to="movie_files/", blank=True, null=True)

    def __str__(self):
        return self.title
