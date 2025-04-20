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
from django.db import connection, IntegrityError 

import logging
# Setting up logging
log_file = './userposts_logs.log'
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Second method
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import logging
from recommenders.services.embedding_service import ModelService
from socialmedia.permissions import IsOwnerOrReadOnly  # Import the custom permission


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsOwnerOrReadOnly])
def generate_user_embedding(request):
    """
    Generate a user embedding based on user's interaction history
    """
    try:
        user = request.user
        
        # Check if user has enough interaction data
        with connection.cursor() as cursor:
            cursor.execute(
                    """
                    select 
                    COUNT(*) 
                    from socialmedia_post_items si 
                    inner join socialmedia_post sp on si.post_id = sp.id 
                    inner join socialmedia_profile sp2 on sp.user_id = sp2.user_id 
                    where sp2.user_id = %s""",
                #"SELECT COUNT(*) FROM socialmedia_itemuser WHERE user_id = %s",
                [user.id]
            )
            interaction_count = cursor.fetchone()[0]
        
        if interaction_count < 5:  # Minimum interactions needed for a good embedding
            return Response({
                'error': '2',
                'message': 'Not enough user interaction data to generate embedding (minimum 5 required)'
            }, status=400)
        
        # Get the model service instance (already initialized at startup)
        from ...recommenders.services.embedding_service import ModelService
        model_service = ModelService.get_instance()
        
        # Generate the embedding (model is already loaded, so this is fast)
        user_embedding = model_service.get_user_embedding(user.id)
        
        # Store the embedding
        with connection.cursor() as cursor:
            # Convert the NumPy array to a PostgreSQL vector
            vector_str = "{" + ",".join(str(x) for x in user_embedding.tolist()) + "}"
            
            # Check if user already has an embedding
            cursor.execute(
                "SELECT id FROM user_embeddings WHERE user_id = %s",
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
        
        return Response({
            'error': '0',
            'message': 'User embedding generated and stored successfully',
            'embedding': user_embedding[:5].tolist() + ['...']  # Only show first few values
        }, status=200)
        
    except Exception as e:
        logging.error('Error generating user embedding: %s', e)
        return Response({
            'error': '3',
            'message': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsOwnerOrReadOnly])
def recommend_similar_users(request):
    """
    Recommend similar users based on embedding vector similarity
    
    This endpoint performs a vector similarity search to find users
    whose embedding vectors are closest to the current user's embedding.
    """
    try:
        user = request.user
        limit = int(request.query_params.get('limit', 10))  # Default to 10 recommendations
        
        # Check if user has enough interactions before generating embeddings
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT COUNT(*) FROM socialmedia_itemuser WHERE user_id = %s",
                [user.id]
            )
            interaction_count = cursor.fetchone()[0]
        
        if interaction_count < 5:  # Minimum interactions needed for a good embedding
            return Response({
                'error': '2',
                'message': 'Not enough user interaction data to generate recommendations (minimum 5 required)',
                'similar_users': []  # Return empty list instead of failing
            }, status=200)  # Use 200 instead of 400 to handle gracefully
            
        # Check if user has an embedding
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT embedding FROM user_embeddings WHERE user_id = %s",
                [user.id]
            )
            embedding_row = cursor.fetchone()
            
        if not embedding_row:
            # No embedding found, generate one on-the-fly
            model_service = ModelService.get_instance()
            
            try:
                user_embedding = model_service.get_user_embedding(user.id)
                
                # Store the embedding for future use
                with connection.cursor() as cursor:
                    vector_str = "{" + ",".join(str(x) for x in user_embedding.tolist()) + "}"
                    
                    cursor.execute(
                        "INSERT INTO user_embeddings (user_id, embedding, created_at, updated_at) VALUES (%s, %s::vector, NOW(), NOW())",
                        [user.id, vector_str]
                    )
                    
                    user_embedding_str = vector_str
            except Exception as e:
                logging.error(f"Error generating user embedding: {e}")
                return Response({
                    'error': '3',
                    'message': 'Failed to generate user embedding',
                    'similar_users': []
                }, status=200)  # Return 200 with empty list instead of failing
        else:
            # Use the existing embedding
            user_embedding_str = embedding_row[0]
        
        # Find similar users based on vector similarity
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    u.id,
                    u.username,
                    u.first_name,
                    u.last_name,
                    p.profile_picture_url,
                    p.bio,
                    1 - (e.embedding <=> %s::vector) as similarity_score
                FROM user_embeddings e
                JOIN auth_user u ON e.user_id = u.id
                LEFT JOIN socialmedia_profile p ON u.id = p.user_id
                WHERE e.user_id != %s  -- Exclude current user
                ORDER BY e.embedding <=> %s::vector  -- Order by similarity (cosine distance)
                LIMIT %s
                """,
                [user_embedding_str, user.id, user_embedding_str, limit]
            )
            
            # Fetch all results
            columns = [col[0] for col in cursor.description]
            similar_users = [
                dict(zip(columns, row)) 
                for row in cursor.fetchall()
            ]
        
        return Response({
            'error': '0',
            'message': 'Similar users found successfully',
            'similar_users': similar_users
        }, status=200)
        
    except Exception as e:
        logging.error(f'Error finding similar users: {e}')
        return Response({
            'error': '3',
            'message': str(e),
            'similar_users': []
        }, status=500)

# recommender/views.py

