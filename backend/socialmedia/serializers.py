from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    ItemType, 
    Genre, 
    Item,
    Follower,
    Comment,
    Like,
    Notification,
    Event,
    Country,
    Post,
    Chat,
    Message
)


User = get_user_model()


class ItemTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemType
        fields = '__all__'

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'

class FollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follower
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'content', 'created_at', 'is_read']
        read_only_fields = ['id', 'created_at']

class ChatSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True
    )
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'participants', 'created_at', 'last_message']
        read_only_fields = ['id', 'created_at']

    def get_last_message(self, obj):
        last_message = obj.get_last_message()
        return MessageSerializer(last_message).data if last_message else None

    def create(self, validated_data):
        participants = validated_data.pop('participants')
        chat = Chat.objects.create(**validated_data)
        chat.participants.set(participants)
        return chat