from django.db import models
from socialmedia.utils.minio_utils import delete_file
from socialmedia.storage import S3MediaStorage
import os
import uuid
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

import uuid
import os
from django.core.files.storage import default_storage

def hash_upload_path(instance, filename, directory="uploads"):
    """Generate a hashed filename while keeping the correct file extension.
    
    Args:
        instance: The model instance (not used here but required by Django).
        filename: The original filename.
        directory: The directory where the file should be stored (default: 'uploads').

    Returns:
        A unique file path with a hashed filename.
    """
    ext = os.path.splitext(filename)[1]  # Extract file extension
    hashed_name = uuid.uuid4().hex  # Generate a unique hash
    new_filename = f"{directory}/{hashed_name}{ext}"
    return new_filename
    # while True:
    #     hashed_name = uuid.uuid4().hex  # Generate a unique hash
    #     new_filename = f"{directory}/{hashed_name}{ext}"

    #     # Check if file already exists in storage
    #     if not default_storage.exists(new_filename):
    #         return new_filename


