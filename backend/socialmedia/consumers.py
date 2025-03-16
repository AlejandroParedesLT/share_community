# import json
# from urllib.parse import parse_qs
# from channels.generic.websocket import AsyncWebsocketConsumer
# from django.contrib.auth import get_user_model
# from socialmedia.models import Chat, Message
# from rest_framework.authtoken.models import Token
# from django.contrib.auth.models import AnonymousUser
# from channels.db import database_sync_to_async

# from rest_framework_simplejwt.tokens import AccessToken
# from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

# User = get_user_model()

# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         # Extract token from query parameters
#         query_string = parse_qs(self.scope["query_string"].decode())
#         token = query_string.get("token", [None])[0]

#         # Authenticate user from token
#         self.user = await self.get_user_from_token(token)

#         if self.user is None or self.user.is_anonymous:
#             await self.close()  # Reject connection if unauthorized
#             return

#         self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
#         self.chat_group_name = f"chat_{self.chat_id}"

#         # Join chat group
#         await self.channel_layer.group_add(self.chat_group_name, self.channel_name)
#         await self.accept()

#     async def disconnect(self, close_code):
#         # Leave chat group
#         await self.channel_layer.group_discard(self.chat_group_name, self.channel_name)

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         content = data.get("content")

#         chat = await self.get_chat(self.chat_id)

#         if chat:
#             # Save the message
#             message = await self.create_message(chat, self.user, content)

#             # Broadcast message to group
#             await self.channel_layer.group_send(
#                 self.chat_group_name,
#                 {
#                     "type": "chat_message",
#                     "message": message.content,
#                     "sender": self.user.username,
#                     "created_at": str(message.created_at),
#                 },
#             )

#     async def chat_message(self, event):
#         await self.send(text_data=json.dumps(event))

#     @database_sync_to_async
#     def get_user_from_token(self, token):        
#         try:
#             # Validate token and get user
#             token_data = AccessToken(token)
#             user_id = token_data['user_id']
#             return User.objects.get(id=user_id)
#         except (InvalidToken, TokenError, User.DoesNotExist):
#             return AnonymousUser()

#     @database_sync_to_async
#     def get_chat(self, chat_id):
#         """Retrieve chat object"""
#         return Chat.objects.filter(id=chat_id).first()

#     @database_sync_to_async
#     def create_message(self, chat, sender, content):
#         """Create a new message"""
#         return Message.objects.create(chat=chat, sender=sender, content=content)


# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from socialmedia.models import Chat, Message
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async

from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract token from headers
        headers = dict(self.scope.get('headers', []))
        authorization = headers.get(b'authorization', b'').decode()
        
        # Get token from Authorization header
        token = None
        if authorization.startswith('Bearer '):
            token = authorization.split(' ')[1]
        
        # Initial authentication handshake - allow connection but require authentication message
        self.is_authenticated = False
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.chat_group_name = f"chat_{self.chat_id}"
        
        # Accept the connection but wait for authentication
        await self.accept()
        
        # Authenticate if token was found in header
        if token:
            self.user = await self.get_user_from_token(token)
            if self.user and not self.user.is_anonymous:
                self.is_authenticated = True
                # Join chat group
                await self.channel_layer.group_add(self.chat_group_name, self.channel_name)
                # Inform client authentication was successful
                await self.send(text_data=json.dumps({
                    "type": "authentication",
                    "status": "success"
                }))
            else:
                await self.send(text_data=json.dumps({
                    "type": "authentication",
                    "status": "failed",
                    "message": "Invalid token"
                }))
                # Don't close yet, allow client to try again with proper auth

    async def disconnect(self, close_code):
        # Leave chat group if authenticated
        if hasattr(self, 'is_authenticated') and self.is_authenticated:
            await self.channel_layer.group_discard(self.chat_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        # Handle authentication message
        if data.get("type") == "authentication":
            token = data.get("token")
            if token:
                self.user = await self.get_user_from_token(token)
                if self.user and not self.user.is_anonymous:
                    self.is_authenticated = True
                    # Join chat group
                    await self.channel_layer.group_add(self.chat_group_name, self.channel_name)
                    await self.send(text_data=json.dumps({
                        "type": "authentication",
                        "status": "success"
                    }))
                    return
            
            # Authentication failed
            await self.send(text_data=json.dumps({
                "type": "authentication",
                "status": "failed",
                "message": "Invalid token"
            }))
            return
        
        # Regular message - only process if authenticated
        if not hasattr(self, 'is_authenticated') or not self.is_authenticated:
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "Not authenticated"
            }))
            return
            
        content = data.get("content")
        if not content:
            return

        chat = await self.get_chat(self.chat_id)
        if chat:
            # Save the message
            message = await self.create_message(chat, self.user, content)

            # Broadcast message to group
            await self.channel_layer.group_send(
                self.chat_group_name,
                {
                    "type": "chat_message",
                    "message": message.content,
                    "sender": self.user.username,
                    "created_at": str(message.created_at),
                },
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_user_from_token(self, token):        
        try:
            # Validate token and get user
            token_data = AccessToken(token)
            user_id = token_data['user_id']
            return User.objects.get(id=user_id)
        except (InvalidToken, TokenError, User.DoesNotExist):
            return AnonymousUser()

    @database_sync_to_async
    def get_chat(self, chat_id):
        """Retrieve chat object"""
        return Chat.objects.filter(id=chat_id).first()

    @database_sync_to_async
    def create_message(self, chat, sender, content):
        """Create a new message"""
        return Message.objects.create(chat=chat, sender=sender, content=content)