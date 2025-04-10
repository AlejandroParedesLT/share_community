#Alejandro Paredes La Torre
#Import necessary libraries
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.decorators import permission_classes
from rest_framework import viewsets

from django.db import IntegrityError
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.utils import IntegrityError

import logging
# Setting up logging
log_file = './requests_logs.log'
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


from socialmedia.models import Profile, Country, Follower
from socialmedia.serializers import FollowerSerializer
from socialmedia.utils.minio_utils import upload_file, delete_file
from socialmedia.serializers import CountrySerializer
from socialmedia.permissions import IsOwnerOrReadOnly

User = get_user_model()

class CountryViewSet(viewsets.ModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class FollowerViewSet(viewsets.ModelViewSet):
    queryset = Follower.objects.all()
    serializer_class = FollowerSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    def perform_create(self, serializer):
        """Set the user field to the authenticated user before saving."""
        serializer.save(user=self.request.user)


class UserView(APIView):
    def get_permissions(self):
        """Define permissions based on the request method"""
        if self.request.method == 'POST':
            return [AllowAny()]  # Anyone can register
        return [IsAuthenticated()]  # Other actions require authentication

    def get(self, request, user_id=None):
        """Allow users to view any user profile by ID"""
        try:
            if user_id:
                user = User.objects.get(id=user_id)
            else:
                user = request.user  # Default to the authenticated user
            
            profile, _ = Profile.objects.get_or_create(user=user)
            
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'bio': profile.bio,  # random description
                'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
                'country': profile.country.name if profile.country else None
            }
            return Response({'error': '0', 'message': 'Success', 'data': user_data}, status=200)

        except User.DoesNotExist:
            return Response({'error': '1', 'message': 'User not found'}, status=404)
        except Exception as e:
            logging.error('Error fetching profile: %s', e)
            return Response({'error': '2', "message": str(e)}, status=500)

    def post(self, request):
        """Register a new user"""
        try:
            data = request.data
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            bio = data.get('bio', '')

            if not username or not email or not password:
                return Response({'error': '1', 'message': 'Missing required fields'}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)
            profile = Profile.objects.create(user=user, bio=bio)
            
            if 'profile_picture' in request.FILES:
                image_file = request.FILES['profile_picture']
                file_url = upload_file(image_file, "profile_pics/")
                profile.profile_picture.name = file_url
                profile.save()

            return Response({'error': '0', 'message': f'User {user.username} created successfully'}, status=201)

        except IntegrityError:
            return Response({'error': '2', 'message': 'Username or email already exists'}, status=400)
        except Exception as e:
            logging.error('Error creating user: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)

    def put(self, request):
        """Allow a user to update only their own profile"""
        try:
            user = request.user
            data = request.data

            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            bio = data.get('bio')

            if username:
                user.username = username
            if email:
                user.email = email
            if password:
                user.set_password(password)

            user.save()
            profile, _ = Profile.objects.get_or_create(user=user)

            if bio is not None:
                profile.bio = bio

            # if 'profile_picture' in request.FILES:
            #     if profile.profile_picture:
            #         profile.profile_picture.delete(save=False)
            #     profile.profile_picture = request.FILES['profile_picture']

            # profile.save()
            if 'profile_picture' in request.FILES:
                image_file = request.FILES['profile_picture']
                profile.profile_picture = image_file
                profile.save()

            return Response({'error': '0', 'message': f'User {user.username} updated successfully'}, status=200)

        except Exception as e:
            logging.error('Error updating user: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)

    def delete(self, request):
        """Allow users to delete only their own account"""
        try:
            user = request.user
            username = user.username
            user.delete()

            return Response({'error': '0', 'message': f'User {username} deleted successfully'}, status=200)

        except Exception as e:
            logging.error('Error deleting user: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)
    

# class UserView(APIView):
#     def get_permissions(self):
#         """Different permissions for GET and POST"""
#         if self.request.method == 'POST':
#             return [AllowAny()]  # Anyone can register
#         return [IsAuthenticated()]  # Only authenticated users can get user info

#     def get(self, request):
#         try:
#             user = request.user
#             user_data = {
#                 'id': user.id,
#                 'username': user.username,
#                 'email': user.email,
#             }
#             return Response({'error': '0', 'message': 'Success', 'data': user_data}, status=200)
#         except Exception as e:
#             logging.error('Error Request: %s', e)
#             return Response({'error': '2', "message": str(e)}, status=502)
        
#     def post(self, request):
#         try:
#             data = request.data
#             username = data.get('username')
#             email = data.get('email')
#             password = data.get('password')

#             if not username or not email or not password:
#                 return Response({'error': '1', 'message': 'Missing required fields'}, status=400)

#             user = User.objects.create_user(username=username, email=email, password=password, is_staff=False, is_superuser=False)

#             return Response({'error': '0', 'message': f'User {user.username} created successfully'}, status=201)

#         except IntegrityError:
#             return Response({'error': '2', 'message': 'Username or email already exists'}, status=400)

#         except Exception as e:
#             logging.error('Error creating user: %s', e)
#             return Response({'error': '3', 'message': str(e)}, status=500)

#     def put(self, request):
#         try:
#             user = request.user  # Ensure the user can only update their own account
#             data = request.data

#             username = data.get('username')
#             email = data.get('email')
#             password = data.get('password')

#             if username:
#                 user.username = username
#             if email:
#                 user.email = email
#             if password:
#                 user.set_password(password)

#             user.save()

#             return Response({'error': '0', 'message': f'User {user.username} updated successfully'}, status=200)

#         except Exception as e:
#             logging.error('Error updating user: %s', e)
#             return Response({'error': '3', 'message': str(e)}, status=500)

#     def delete(self, request):
#         try:
#             user = request.user  # Only allow users to delete their own account
#             username = user.username
#             user.delete()
#             return Response({'error': '0', 'message': f'User {username} deleted successfully'}, status=200)

#         except Exception as e:
#             logging.error('Error deleting user: %s', e)
#             return Response({'error': '3', 'message': str(e)}, status=500)