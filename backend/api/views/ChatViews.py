from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from socialmedia.permissions import IsOwnerOrReadOnly
from socialmedia.models import Chat, Message
from socialmedia.serializers import ChatSerializer, MessageSerializer

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]