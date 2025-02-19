import pickle
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework import status

from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

from rest_framework.response import Response
from rest_framework.views import APIView
from socialmedia.services import SocialMediaDBService
from socialmedia.serializers import PostSerializer

from datetime import datetime, date
import logging
# Setting up logging
log_file = './mlapi_logs.log'
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


@permission_classes([IsAuthenticated])
class UserPostsAPIView(APIView):
    def get(self, request, user_id):

        try:
            posts = SocialMediaDBService.get_user_posts(user_id)
            serializer = PostSerializer(posts, many=True)
            return Response(serializer.data, status=200)
        except Exception as e:
            logging.error('Error Request: %s', e)
            predictions = {
                'error' : '2',
                "message": str(e)
            }
            return Response(predictions, status=502)