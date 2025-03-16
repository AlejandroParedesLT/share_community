from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Chat(models.Model):
    participants = models.ManyToManyField(User, related_name="chats")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat {self.id} with {', '.join([user.username for user in self.participants.all()])}"

    def get_last_message(self):
        return self.messages.order_by("-created_at").first()

    def get_unread_messages(self, user):
        return self.messages.filter(is_read=False).exclude(sender=user)

    def get_unread_messages_count(self, user):
        return self.get_unread_messages(user).count()


class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"[Chat {self.chat.id}] {self.sender.username}: {self.content[:50]}"

    class Meta:
        ordering = ["created_at"]


class MessageNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="message_notifications")
    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"New message from {self.message.sender.username}"