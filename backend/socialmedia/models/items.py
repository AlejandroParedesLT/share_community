from django.db import models
from django.utils import timezone
#from socialmedia.models import Image

class ItemType(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    createdAt = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return self.name

class Genre(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    createdAt = models.DateField()

    def __str__(self):
        return self.name


class Item(models.Model):
    precordsid = models.AutoField(primary_key=True)
    type = models.ForeignKey(ItemType, on_delete=models.SET_NULL, null=True, blank=True, related_name="items")
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, blank=True, related_name="items")
    title = models.CharField(max_length=255)
    publish_date = models.DateTimeField(default=timezone.now)
    image = models.ImageField(upload_to="item_images/", blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def __repr__(self):
        return f"Item(title={self.title}, type={self.type}, genre={self.genre})"
    


class Audio(models.Model):
    precordsid = models.ForeignKey(Item, on_delete=models.CASCADE)
    name = models.TextField(blank=True, null=True)
    releasedate = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    category = models.IntegerField(max_length=100)
    genre = models.IntegerField(max_length=100)

    def __str__(self):
        return self.name

class Book(models.Model):
    precordsid = models.ForeignKey(Item, on_delete=models.CASCADE)
    title = models.TextField(blank=True, null=True)
    author = models.TextField(blank=True, null=True)
    publisher = models.TextField(blank=True, null=True)
    releasedate = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    genre = models.IntegerField(max_length=100)

    def __str__(self):
        return self.title

class Movie(models.Model):
    precordsid = models.ForeignKey(Item, on_delete=models.CASCADE)
    title = models.TextField(blank=True, null=True)
    release_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    genre = models.IntegerField(max_length=100, blank=True, null=True)
    category = models.IntegerField(max_length=100)

    def __str__(self):
        return self.title
