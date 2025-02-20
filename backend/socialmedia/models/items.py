from django.db import models

class Movie(models.Model):
    id = models.AutoField(primary_key=True)  # Auto-incrementing integer primary key
    title = models.CharField(max_length=255)
    year = models.IntegerField()
    genre = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.title} ({self.year}) - {self.genre}"

    def __repr__(self):
        return f"Movie(title={self.title}, year={self.year}, genre={self.genre})"
