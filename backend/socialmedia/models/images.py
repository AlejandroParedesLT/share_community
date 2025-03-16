from django.db import models
from socialmedia.utils.minio_utils import delete_file
from socialmedia.storage import S3MediaStorage

class Image(models.Model):
    """Model to track images stored in MinIO"""
    image = models.ImageField(
        upload_to="images/",
        storage=S3MediaStorage(),
        blank=True,
        null=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.image.name if self.image else "No image"
    
    def delete(self, *args, **kwargs):
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)