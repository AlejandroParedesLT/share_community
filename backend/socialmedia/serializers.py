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
    Message,
    Profile
)
from django.conf import settings
from socialmedia.storage import get_custom_s3_client
# Initialize MinIO client
s3 = get_custom_s3_client()

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username"]  # Only exposing the username

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)  # Directly expose username
    userid = serializers.CharField(source="user.id", read_only=True)
    presigned_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ["userid","username", "bio", "country", "presigned_image_url"]
    
    def get_presigned_image_url(self, obj):
        """Generate and return a pre-signed URL for the profile picture."""
        if not obj.profile_picture:
            return None
        
        try:
            presigned_url = s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.AWS_STORAGE_BUCKET_NAME, "Key": obj.profile_picture.name},
                ExpiresIn=3600,  # URL expires in 1 hour
            )
            return presigned_url
        except Exception:
            return None  # Return None if any error occurs


class ItemTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemType
        fields = '__all__'

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'


class ItemSerializer(serializers.ModelSerializer):
    presigned_image_url = serializers.SerializerMethodField()  # Add field for pre-signed URL

    class Meta:
        model = Item
        fields = "__all__"

    def get_presigned_image_url(self, obj):
        """Generate and return a pre-signed URL for the item's image."""
        if not obj.image:
            return None

        try:
            presigned_url = s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.AWS_STORAGE_BUCKET_NAME, "Key": obj.image.name},
                ExpiresIn=3600,  # URL expires in 1 hour
            )
            return presigned_url
        except Exception as e:
            return None  # In case of an error, return None

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
    items = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(), many=True, write_only=True
    )
    items_detail = ItemSerializer(many=True, read_only=True)  # Used only for GET responses
    user = ProfileSerializer(source="user.profile", read_only=True)
    presigned_image_url = serializers.SerializerMethodField()  # Add field for pre-signed URL


    class Meta:
        model = Post
        fields = '__all__'
        extra_kwargs = {"user": {"required": False}}  # Make 'user' optional in input

    def create(self, validated_data):
        """Ensure user is set from request context."""
        request = self.context.get("request")
        if request and request.user:
            validated_data["user"] = request.user
        return super().create(validated_data)

    def to_representation(self, instance):
        """Customize GET response to show full item details."""
        data = super().to_representation(instance)
        request = self.context.get("request")

        if request and request.method == "GET":
            data["items"] = ItemSerializer(instance.items.all(), many=True, context=self.context).data
        else:
            data["items"] = list(instance.items.values_list("precordsid", flat=True))
        return data

    def get_presigned_image_url(self, obj):
        """Generate and return a pre-signed URL for the item's image."""
        if not obj.image:
            return None

        try:
            presigned_url = s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.AWS_STORAGE_BUCKET_NAME, "Key": obj.image.name},
                ExpiresIn=3600,  # URL expires in 1 hour
            )
            return presigned_url
        except Exception as e:
            return None  # In case of an error, return None

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