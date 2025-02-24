from django.contrib.auth import get_user_model
from django.db import models

class Books(models.Model):
    precordsid = models.IntegerField()
    title = models.TextField(blank=True, null=True)
    author = models.TextField(blank=True, null=True)
    publisher = models.TextField(blank=True, null=True)
    releasedate = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    genre = models.CharField(max_length=100)
    # user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE) 
    # audio = models.FileField(upload_to="audio_files/", blank=True, null=True)

    def __str__(self):
        return self.name