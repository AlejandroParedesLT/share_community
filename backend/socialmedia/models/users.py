from django.contrib.auth import get_user_model
from django.db import models
# Delete the image from MinIO before deleting the model
from socialmedia.utils.minio_utils import delete_file
from socialmedia.storage import S3MediaStorage
from socialmedia.models.images import hash_upload_path

User = get_user_model()
class Country(models.Model):
    name = models.TextField()
    lat = models.FloatField()
    lon = models.FloatField()
    region = models.TextField()

    def __str__(self):
        return self.name

def item_image_upload_path(instance, filename):
    return hash_upload_path(instance, filename, "profile_pictures")
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True, null=True)
    preferred_name = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to=item_image_upload_path, 
        storage=S3MediaStorage(),
        blank=True, 
        null=True
    )
    def __str__(self):
        return self.user.username
    
    def delete(self, *args, **kwargs):
        # Django will handle file deletion with the storage backend
        if self.profile_picture:
            self.profile_picture.delete(save=False)
        super().delete(*args, **kwargs)

class Follower(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
    


