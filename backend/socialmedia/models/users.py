from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

# class User(models.Model):
#     def __init__(self, *args, **kwargs):
#         super(User, self).__init__(*args, **kwargs)
#         self.username = kwargs.get('username')
#         self.email = kwargs.get('email')
#         self.password = kwargs.get('password')
#         self.first_name = kwargs.get('first_name')
#         self.last_name = kwargs.get('last_name')
#         self.is_active = kwargs.get('is_active')
#         self.is_staff = kwargs.get('is_staff')

#     def __str__(self,id):
#         return self.use[id].username

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to="profile_pics/", blank=True, null=True)

    def __str__(self):
        return self.user.username


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_messages")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}"

class Event(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    precordsid = models.IntegerField()#on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)  # When the user interacted with the product

    def __str__(self):
        return f"{self.user.username} - {self.product.title} ({self.timestamp})"
    

class Items(models.Model):
    precordsid = models.AutoField(primary_key=True)  # Auto-incrementing integer primary key
    typeid =models.IntegerField()
    genreid = models.IntegerField()
    title = models.CharField(max_length=255)
    publish_date = models.DateTimeField()
    
    def __str__(self):
        return f"{self.title} ({self.year}) - {self.genre}"

    def __repr__(self):
        return f"Movie(title={self.title}, year={self.year}, genre={self.genre})"
    


class Follower(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"