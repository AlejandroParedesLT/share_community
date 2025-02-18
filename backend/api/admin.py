from django.contrib import admin
from socialmedia.models import Profile, Post, Comment, Like, Follower, Notification, Message, Hashtag, PostHashtag

admin.site.register(Profile)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Follower)
admin.site.register(Notification)
admin.site.register(Message)
admin.site.register(Hashtag)
admin.site.register(PostHashtag)
