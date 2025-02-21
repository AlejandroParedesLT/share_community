from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.utils import IntegrityError
from socialmedia.models import Audio
import logging

# Logging setup
log_file = './mlapi_logs.log'
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class AudioView(APIView):
    """
    API View to handle CRUD operations for Audio objects.
    """
    permission_classes = [IsAuthenticated]  # ✅ Correct placement

    def get(self, request):
        try:
            product_id = request.query_params.get('id')
            if not product_id:
                return Response({'error': '1', 'message': 'Product ID is required'}, status=400)

            audio = get_object_or_404(Audio, id=product_id)

            product_data = {
                'id': audio.id,
                'precordsid': audio.precordsid,
                'name': audio.name,
                'releasedate': audio.releasedate,
                'description': audio.description,
                'category': audio.category,
            }
            return Response({'error': '0', 'message': 'Success', 'data': product_data}, status=200)

        except Exception as e:
            logging.error('Error fetching Audio record: %s', e)
            return Response({'error': '2', 'message': str(e)}, status=500)

    def post(self, request):
        """
        Create a new Audio record.
        """
        try:
            data = request.data
            precordsid = data.get('precordsid')
            name = data.get('name', '')
            releasedate = data.get('releasedate', None)
            description = data.get('description', '')
            category = data.get('category', '')

            if not precordsid or not category:
                return Response({'error': '1', 'message': 'precordsid and category are required'}, status=400)

            audio = Audio.objects.create(
                precordsid=precordsid,
                name=name,
                releasedate=releasedate,
                description=description,
                category=category
            )

            return Response({'error': '0', 'message': f'Audio {audio.name} created'}, status=201)

        except IntegrityError:
            return Response({'error': '2', 'message': 'Audio record already exists'}, status=400)

        except Exception as e:
            logging.error('Error creating Audio record: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)

    def put(self, request):
        """
        Update an existing Audio record.
        """
        try:
            data = request.data
            audio_id = data.get('id')

            if not audio_id:
                return Response({'error': '1', 'message': 'Audio ID is required'}, status=400)

            audio = get_object_or_404(Audio, id=audio_id)

            audio.precordsid = data.get('precordsid', audio.precordsid)
            audio.name = data.get('name', audio.name)
            audio.releasedate = data.get('releasedate', audio.releasedate)
            audio.description = data.get('description', audio.description)
            audio.category = data.get('category', audio.category)

            audio.save()

            return Response({'error': '0', 'message': f'Audio {audio.name} updated'}, status=200)

        except Exception as e:
            logging.error('Error updating Audio record: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)

    def delete(self, request):
        """
        Delete an Audio record.
        """
        try:
            audio_id = request.query_params.get('id')

            if not audio_id:
                return Response({'error': '1', 'message': 'Audio ID is required'}, status=400)

            audio = get_object_or_404(Audio, id=audio_id)
            audio.delete()

            return Response({'error': '0', 'message': f'Audio {audio.name} deleted'}, status=200)

        except Exception as e:
            logging.error('Error deleting Audio record: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)


# #Alejandro Paredes La Torre
# #Import necessary libraries
# from rest_framework.decorators import api_view, authentication_classes, permission_classes
# from rest_framework.authentication import SessionAuthentication, TokenAuthentication
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework.decorators import permission_classes

# from django.db import IntegrityError
# from django.contrib.auth import get_user_model
# from django.shortcuts import get_object_or_404
# from django.contrib.auth.models import User
# from django.db.utils import IntegrityError

# from socialmedia.models import Product, Event, Audio

# from datetime import datetime, date
# import logging
# # Setting up logging
# log_file = './mlapi_logs.log'
# logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# @permission_classes([IsAuthenticated])
# class AudioView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             product_id = request.query_params.get('id')
#             if not product_id:
#                 return Response({'error': '1', 'message': 'Product ID is required'}, status=400)

#             product = get_object_or_404(Audio, id=product_id)

#             product_data = {
#                 'id': product.id,
#                 'precordsid': product.precordsid,
#                 'name': product.name,
#                 'releasedate': product.releasedate,
#                 'description': product.description,
#                 'category': product.category,
#             }
#             return Response({'error': '0', 'message': 'Success', 'data': product_data}, status=200)

#     # precordsid = models.IntegerField()
#     # name = models.TextField(blank=True, null=True)
#     # releasedate = models.DateField(null=True, blank=True)
#     # description = models.TextField(blank=True, null=True)
#     # category = models.CharField(max_length=100)

#         except Exception as e:
#             logging.error('Error Request: %s', e)
#             return Response({'error': '2', 'message': str(e)}, status=500)

#     def post(self, request):
#         try:
#             data = request.data
#             title = data.get('precordsid')
#             category = data.get('category')
#             release_date = data.get('releasedate')
#             description = data.get('description', '')

#             if not title or not category:
#                 return Response({'error': '1', 'message': 'Title and Category are required'}, status=400)

#             product = Product.objects.create(
#                 title=title, category=category, release_date=release_date, description=description
#             )

#             return Response({'error': '0', 'message': f'Product {product.title} created'}, status=201)

#         except IntegrityError:
#             return Response({'error': '2', 'message': 'Product already exists'}, status=400)

#         except Exception as e:
#             logging.error('Error creating product: %s', e)
#             return Response({'error': '3', 'message': str(e)}, status=500)

#     def put(self, request):
#         try:
#             data = request.data
#             product_id = data.get('id')

#             if not product_id:
#                 return Response({'error': '1', 'message': 'Product ID is required'}, status=400)

#             product = get_object_or_404(Product, id=product_id)

#             product.title = data.get('precordsid', product.title)
#             product.category = data.get('category', product.category)
#             product.release_date = data.get('releasedate', product.release_date)
#             product.description = data.get('description', product.description)

#             product.save()

#             return Response({'error': '0', 'message': f'Product {product.title} updated'}, status=200)

#         except Exception as e:
#             logging.error('Error updating product: %s', e)
#             return Response({'error': '3', 'message': str(e)}, status=500)

#     def delete(self, request):
#         try:
#             product_id = request.query_params.get('id')

#             if not product_id:
#                 return Response({'error': '1', 'message': 'Product ID is required'}, status=400)

#             product = get_object_or_404(Product, id=product_id)
#             product.delete()

#             return Response({'error': '0', 'message': f'Product {product.title} deleted'}, status=200)

#         except Exception as e:
#             logging.error('Error deleting product: %s', e)
#             return Response({'error': '3', 'message': str(e)}, status=500)