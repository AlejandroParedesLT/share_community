from django.contrib import admin
from .models import (
    Profile, 
    Post, 
    Comment, 
    Like, 
    Follower, 
    Notification, 
    Message,
    Country,
    Chat,
    MessageNotification,
    Event,
    Item
)

admin.site.register(Profile)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Follower)
admin.site.register(Notification)
admin.site.register(Message)
admin.site.register(Country)
admin.site.register(Chat)
admin.site.register(MessageNotification)
admin.site.register(Event)
admin.site.register(Item)
