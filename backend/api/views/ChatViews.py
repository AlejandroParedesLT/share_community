from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import action


from socialmedia.permissions import IsOwnerOrReadOnly
from socialmedia.models import Chat, Message
from socialmedia.serializers import ChatSerializer, MessageSerializer

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):
        """Retrieve all messages for a specific chat."""
        chat = get_object_or_404(Chat, id=pk)

        # Ensure the user is a participant in the chat
        if request.user not in chat.participants.all():
            return Response({"detail": "Not authorized to view this chat."}, status=403)

        messages = chat.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """Filter messages by chat_id if provided."""
        chat_id = self.request.query_params.get("chat_id")
        if chat_id:
            return Message.objects.filter(chat_id=chat_id)
        return Message.objects.all()