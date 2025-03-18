from django.db import models
from django.contrib.auth import get_user_model
from .items import Item
from socialmedia.models.images import hash_upload_path
from django.conf import settings
from socialmedia.storage import S3MediaStorage



User = get_user_model()

class Event(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="events")  
    timestamp = models.DateTimeField(auto_now_add=True)  # When the user interacted with the item

    def __str__(self):
        return f"{self.user.username} - {self.item.title} ({self.timestamp})"

# Define a function wrapper to avoid serialization issues
def post_image_upload_path(instance, filename):
    return hash_upload_path(instance, filename, "post_images")
class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to=post_image_upload_path, storage=S3MediaStorage(), blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    #events = models.ManyToManyField(Event, related_name="posts")
    items = models.ManyToManyField(Item, related_name="posts")

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.created_at})"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField(blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} on {self.post.id}"


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} liked {self.post.id}"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('follow', 'Follow'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_notifications")
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username} {self.notification_type}d {self.user.username}"