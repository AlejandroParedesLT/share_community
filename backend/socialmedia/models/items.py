from django.db import models
from django.utils import timezone
#from socialmedia.models import Image
from socialmedia.storage import S3MediaStorage
from django.conf import settings
from socialmedia.models.images import hash_upload_path

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

# Define a function wrapper to avoid serialization issues
def item_image_upload_path(instance, filename):
    return hash_upload_path(instance, filename, "item_images")
class Item(models.Model):
    precordsid = models.AutoField(primary_key=True)
    type = models.ForeignKey(ItemType, on_delete=models.SET_NULL, null=True, blank=True, related_name="items")
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, blank=True, related_name="items")
    title = models.CharField(max_length=255)
    publish_date = models.DateTimeField(default=timezone.now)
    #image = models.ImageField(upload_to="item_images/", storage=S3MediaStorage(), blank=True, null=True)
    image = models.ImageField(upload_to=item_image_upload_path, storage=S3MediaStorage(), blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title

    def __repr__(self):
        return f"Item(title={self.title}, type={self.type}, genre={self.genre})"
    # @property
    # def image_url(self):
    #     """Return the full URL for the image, or None if no image is set"""
    #     if self.image:
    #         return f"{settings.AWS_S3_DOMAIN}/{self.image.name}"
    #     return None
    @property
    def image_url(self):
        """Return the full URL for the image, without protocol duplication."""
        if self.image:
            # Get base URL from settings, remove any existing protocol
            base_url = settings.AWS_S3_DOMAIN_RETRIEVAL
                    # Debug prints
            print(f"DEBUG: AWS_S3_ENDPOINT_URL = {settings.AWS_S3_ENDPOINT_URL}")
            print(f"DEBUG: AWS_S3_CUSTOM_DOMAIN = {settings.AWS_S3_CUSTOM_DOMAIN}")
            print(f"DEBUG: AWS_S3_DOMAIN_RETRIEVAL = {settings.AWS_S3_DOMAIN_RETRIEVAL}")
            
            # Remove protocol if it exists
            if '://' in base_url:
                protocol, remainder = base_url.split('://', 1)
                base_url = remainder
            
            # Ensure clean URL construction without double slashes
            image_path = self.image.name.lstrip('/')
            base_url = base_url.rstrip('/')
            
            # Add back a single protocol
            return f"http://{base_url}/{image_path}"
        return None

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
