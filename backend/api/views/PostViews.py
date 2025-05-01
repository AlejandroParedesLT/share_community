#Alejandro Paredes La Torre
#Import necessary libraries
import os
from rest_framework.decorators import api_view, authentication_classes, permission_classes # type: ignore
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.decorators import permission_classes
from rest_framework.pagination import PageNumberPagination

from django.db import IntegrityError
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.utils import IntegrityError
from rest_framework import viewsets
import urllib.parse

import logging
# Setting up logging
log_file = './userposts_logs.log'
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

from socialmedia.models import (Event, 
                                Post,
                                Follower,
                                Comment,
                                Like,
                                Notification
                                )

from socialmedia.permissions import IsOwnerOrReadOnly  # Import the custom permission

from socialmedia.serializers import (FollowerSerializer,
                                      CommentSerializer,
                                      LikeSerializer,
                                      NotificationSerializer,
                                      EventSerializer,
                                      PostSerializer)
from socialmedia.storage import get_s3_client, get_custom_s3_client
from django.conf import settings
User = get_user_model()


class CustomItemPagination(PageNumberPagination):
    page_size = 10  # Number of items per page
    page_size_query_param = 'page_size'  # Allow dynamic page sizes
    max_page_size = 50  # Limit max items per page

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    def perform_create(self, serializer):
        """Set the user field to the authenticated user before saving."""
        serializer.save(user=self.request.user)

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    def perform_create(self, serializer):
        """Set the user field to the authenticated user before saving."""
        serializer.save(user=self.request.user)

class CustomItemPagination(PageNumberPagination):
    page_size = 10  # Number of items per page
    page_size_query_param = 'page_size'  # Allow dynamic page sizes
    max_page_size = 50  # Limit max items per page

# class PostViewSet(viewsets.ModelViewSet):
#     queryset = Post.objects.all()
#     serializer_class = PostSerializer
#     permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
#     pagination_class = CustomItemPagination

#     def perform_create(self, serializer):
#         """Set the user field to the authenticated user before saving."""
#         serializer.save(user=self.request.user)
#     # def get_queryset(self):
#     #     limit = self.request.query_params.get('limit', 10)  # Default to 10 if not provided
#     #     return Post.objects.all().order_by('-created_at')[:int(limit)]

from django.db import connection
import logging
from recommenders.services.embedding_service import ModelService
from django.db import models
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    pagination_class = CustomItemPagination

    # def get_queryset(self):
    #     """
    #     This method is responsible for filtering posts based on the user ID.
    #     If a 'user_id' query parameter is provided, it filters the posts for that specific user.
    #     """
    #     user_id = self.request.query_params.get('id')  # Retrieve 'user_id' from the query params
        
    #     if user_id:
    #         return Post.objects.filter(user__id=user_id)  # Filter posts by user ID
        
        
    #     return Post.objects.all() 

    def get_queryset(self):
        """
        Returns posts filtered according to these rules:
        - If total posts < 20, return all posts
        - Otherwise, retrieve posts from users ordered by embedding similarity,
        then by date descending, limited to 20 posts total
        """
        user_id = self.request.query_params.get('id')
        
        # If user_id is provided, return only that user's posts
        if user_id:
            return Post.objects.filter(user__id=user_id)
        
        # Check if we have less than 20 posts total
        total_posts = Post.objects.count()
        if total_posts < 20:
            return Post.objects.all().order_by('-created_at')
        
        # Get current user's embedding to use for similarity search
        current_user_id = self.request.user.id
        
        try:
            # Get model service to use embeddings
            model_service = ModelService.get_instance()
            
            # Get the current user's embedding for similarity comparison
            try:
                current_user_embedding = model_service.get_user_embedding(current_user_id)
            except ValueError:
                # If user has no embedding, fall back to regular ordering
                return Post.objects.all().order_by('-created_at')[:20]
            
            # Get similar users based on embedding vector similarity
            with connection.cursor() as cursor:
                # Convert the NumPy array to a PostgreSQL vector string
                vector_str = "[" + ",".join(str(x) for x in current_user_embedding.tolist()) + "]"
                
                # Query to find similar users based on embedding cosine similarity
                # Limit to more than 20 users to ensure we have enough posts
                cursor.execute("""
                    SELECT user_id, 
                        embedding <=> %s::vector AS distance
                    FROM user_embeddings
                    WHERE user_id != %s
                    ORDER BY distance ASC
                    LIMIT 50
                """, [vector_str, current_user_id])
                
                similar_users = [row[0] for row in cursor.fetchall()]
            
            if not similar_users:
                # Fall back to regular ordering if no similar users found
                return Post.objects.all().order_by('-created_at')
            
            # First get posts from similar users, ordered by user similarity then by date
            similar_user_posts = Post.objects.filter(
                user_id__in=similar_users
            ).order_by(
                # This uses the Case/When to order by the similarity rank
                *[models.Case(
                    *[models.When(user_id=user_id, then=models.Value(i)) 
                    for i, user_id in enumerate(similar_users)],
                    default=models.Value(len(similar_users))
                ),
                '-created_at']
            )[:20]
            
            return similar_user_posts
            
        except Exception as e:
            logging.error(f"Error in similarity-based post retrieval: {e}")
            # Fall back to default ordering in case of errors
            return Post.objects.all().order_by('-created_at')[:20]

    def perform_create(self, serializer):
        """Set the user field to the authenticated user before saving."""
        post = serializer.save(user=self.request.user)
        self.update_user_embedding(self.request.user)
        return post
    
    def perform_update(self, serializer):
        """Update the post and refresh user embedding."""
        post = serializer.save()
        # Only update embedding for significant content changes
        if 'content' in serializer.validated_data or 'title' in serializer.validated_data:
            self.update_user_embedding(post.user)
        return post
    
    def perform_destroy(self, instance):
        """Delete the post and refresh user embedding."""
        user = instance.user
        instance.delete()
        self.update_user_embedding(user)
    
    def update_user_embedding(self, user):
        """
        Updates or creates the user's embedding vector based on their latest activity
        """
        try:
            # Get the model service instance
            model_service = ModelService.get_instance()
            
            # Generate a new embedding for the user
            user_embedding = model_service.get_user_embedding(user.id)
            
            # Store or update the embedding in the database
            with connection.cursor() as cursor:
                # Convert the NumPy array to a PostgreSQL vector
                vector_str = "[" + ",".join(str(x) for x in user_embedding.tolist()) + "]"
                
                # Check if user already has an embedding
                cursor.execute(
                    "SELECT user_id FROM user_embeddings WHERE user_id = %s",
                    [user.id]
                )
                result = cursor.fetchone()
                
                if result:
                    # Update existing embedding
                    cursor.execute(
                        "UPDATE user_embeddings SET embedding = %s::vector, updated_at = NOW() WHERE user_id = %s",
                        [vector_str, user.id]
                    )
                else:
                    # Insert new embedding
                    cursor.execute(
                        "INSERT INTO user_embeddings (user_id, embedding, created_at, updated_at) VALUES (%s, %s::vector, NOW(), NOW())",
                        [user.id, vector_str]
                    )
            
            logging.info(f"Updated embedding for user {user.id}")
            return True
            
        except Exception as e:
            logging.error(f"Error updating user embedding: {e}")
            return False

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def get_presigned_url(request):
#     """Generate a pre-signed URL to access an image with correct object path."""
#     object_name = request.query_params.get("object_name")  # Expecting full object path

#     if not object_name:
#         return Response({"error": "Missing object_name parameter"}, status=400)

#     # Ensure object_name contains only the relative path
#     parsed_url = urllib.parse.urlparse(object_name)
#     object_key = parsed_url.path.lstrip("/")  # Extract path, remove leading slash

#     try:
#         # Generate the pre-signed URL
#         presigned_url = s3.generate_presigned_url(
#             "get_object",
#             Params={"Bucket": settings.AWS_STORAGE_BUCKET_NAME, "Key": object_key},
#             ExpiresIn=3600,  # URL valid for 1 hour
#         )

#         target_url=os.environb.get(b"TARGET_IP").decode("utf-8")
#         fixed_url = presigned_url.replace("http://minio:9000", f"http://{target_url}:9000")

#         return Response({"url": fixed_url})
#     except Exception as e:
#         return Response({"error": str(e)}, status=500)

############################
###### REFERENCE FOR PAGINATION

# class ItemViewSet(viewsets.ModelViewSet):
#     serializer_class = ItemSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         limit = self.request.query_params.get('limit', 10)  # Default to 10 if not provided
#         return Item.objects.all().order_by('-created_at')[:int(limit)]

##########################
#### Reference for pagination native

# from rest_framework.pagination import PageNumberPagination

# class ItemViewSet(viewsets.ModelViewSet):
#     queryset = Item.objects.all().order_by('-created_at')
#     serializer_class = ItemSerializer
#     permission_classes = [IsAuthenticated]
#     pagination_class = PageNumberPagination  # Enables pagination














# class PostView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request):
#         try:
#             post_id = request.query_params.get('id')
#             if not post_id:
#                 return Response({'error': '1', 'message': 'Post ID is required'}, status=400)

#             post = get_object_or_404(Post, id=post_id)

#             post_data = {
#                 'id': post.id,
#                 'title': post.title,
#                 'content': post.content,
#                 'created_at': post.created_at.strftime('%Y-%m-%d %H:%M:%S'),
#             }
#             return Response({'error': '0', 'message': 'Success', 'data': post_data}, status=200)

#         except Exception as e:
#             logging.error('Error Request: %s', e)
#             return Response({'error': '2', 'message': str(e)}, status=500)
        
#     def post(self, request):
#         try:
#             data = request.data
#             user = request.user  # Authenticated user
#             title = data.get('title')
#             content = data.get('content')
#             events_data = data.get('events', {})
#             imageid= data.get('imageid')
#             if not title or not content:
#                 return Response({'error': '1', 'message': 'Missing required fields'}, status=400)

#             post = Post.objects.create(user=user, title=title, content=content, imageid=imageid)

#             # Attach Events to Post
#             for event_id, event_data in events_data.items():
#                 precords_id = event_data.get('precords_id')
#                 timestamp = event_data.get('timestamp')

#                 if not precords_id: #or not timestamp:
#                     continue  # Skip invalid events

#                 event = Event.objects.create(user=user, precordsid=precords_id, timestamp=timestamp)
#                 post.events.add(event)

#             return Response({'error': '0', 'message': f'Post {post.title} created successfully'}, status=201)

#         except Exception as e:
#             return Response({'error': '3', 'message': str(e)}, status=500)
        
#     def put(self, request):
#         try:
#             data = request.data
#             post_id = data.get('id')

#             if not post_id:
#                 return Response({'error': '1', 'message': 'Post ID is required'}, status=400)
            
#             post = get_object_or_404(Post, id=post_id)

#             title = data.get('title')
#             content = data.get('content')

#             if title:
#                 post.title = title
#             if content:
#                 post.content = content

#             post.save()

#             return Response({'error': '0', 'message': 'Post updated'}, status=200)
        
#         except Exception as e:
#             logging.error('Error updating post: %s', e)
#             return Response({'error': '3', 'message': str(e)}, status=500)
        
#     def delete(self, request):
#         try:
#             post_id = request.query_params.get('id')

#             if not post_id:
#                 return Response({'error': '1', 'message': 'Post ID is required'}, status=400)
            
#             post = get_object_or_404(Post, id=post_id)
#             post.delete()

#             return Response({'error': '0', 'message': 'Post deleted'}, status=200)
        
#         except Exception as e:
#             logging.error('Error deleting post: %s', e)
#             return Response({'error': '3', 'message': str(e)}, status=500)




# class EventView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request):
#         try:
#             event_id = request.query_params.get('id')
#             if not event_id:
#                 return Response({'error': '1', 'message': 'Transaction ID is required'}, status=400)

#             event = get_object_or_404(Event, id=event_id)

#             event_data = {
#                 'id': event.id,
#                 'user': event.user.username,
#                 'precordsid': event.precordsid,
#                 # Create the timestamp serverside not 
#                 'timestamp': event.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
#             }

#             return Response({'error': '0', 'message': 'Success', 'data': event_data}, status=200)

#         except Exception as e:
#             logging.error('Error Request: %s', e)
#             return Response({'error': '2', 'message': str(e)}, status=500)

#     def post(self, request):
#         try:
#             data = request.data
#             user_id = data.get('user_id')
#             precords_id = data.get('precords_id')

#             if not user_id or not precords_id:
#                 return Response({'error': '1', 'message': 'User ID and Product ID are required'}, status=400)
            
#             user = get_object_or_404(User, id=user_id)
#             item = get_object_or_404(Item, precordsid=precords_id)
#             event = Event.objects.create(user=user, precordsid=item)
            
#             return Response({'error': '0', 'message': f'Transaction created for {user.username} - {item.title} on {event.timestamp}'}, status=201)
#         except Exception as e:
#             logging.error('Error creating transaction: %s', e)
#             return Response({'error': '3', 'message': str(e)}, status=500)

#     def put(self, request):
#         try:
#             data = request.data
#             transaction_id = data.get('id')

#             if not transaction_id:
#                 return Response({'error': '1', 'message': 'Transaction ID is required'}, status=400)

#             event = get_object_or_404(Event, id=transaction_id)

#             user_id = data.get('user_id')
#             product_id = data.get('product_id')

#             if user_id:
#                 event.user = get_object_or_404(User, id=user_id)
#             if product_id:
#                 item = get_object_or_404(Item, precordsid=product_id)
#                 event.precordsid = item

#             event.save()

#             return Response({'error': '0', 'message': 'Transaction updated'}, status=200)

#         except Exception as e:
#             logging.error('Error updating transaction: %s', e)
#             return Response({'error': '3', 'message': str(e)}, status=500)

#     def delete(self, request):
#         try:
#             event_id = request.query_params.get('id')

#             if not event_id:
#                 return Response({'error': '1', 'message': 'Transaction ID is required'}, status=400)

#             transaction = get_object_or_404(Event, id=event_id)
#             transaction.delete()

#             return Response({'error': '0', 'message': 'Transaction deleted'}, status=200)

#         except Exception as e:
#             logging.error('Error deleting transaction: %s', e)
#             return Response({'error': '3', 'message': str(e)}, status=500)