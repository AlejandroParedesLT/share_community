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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_user_embedding(request):
    """
    Generate a user embedding based on user's interaction history
    """
    try:
        user = request.user
        
        # Check if user has enough interaction data
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT COUNT(*) FROM book_ratings WHERE user_id = %s",
                [user.id]
            )
            interaction_count = cursor.fetchone()[0]
        
        if interaction_count < 5:  # Minimum interactions needed for a good embedding
            return Response({
                'error': '2',
                'message': 'Not enough user interaction data to generate embedding (minimum 5 required)'
            }, status=400)
        
        # Get the model service instance (already initialized at startup)
        from ...socialmedia.recommenders.services.embedding_service import ModelService
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