#Alejandro Paredes La Torre
#Import necessary libraries
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import permission_classes

from django.db import IntegrityError
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.utils import IntegrityError

from socialmedia.models import Event

from datetime import datetime, date
import logging
# Setting up logging
log_file = './mlapi_logs.log'
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Create your views here.
@api_view(['GET'])
def index_page(request):
    return_data = {
        "error" : "0",
        "message" : "Successfull Ok",
    } 
    logging.info("GET") 
    print("PRINT")
    return Response(return_data)

#@api_view(["POST"])
#@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
class Test_Request(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            request_data = request.data
            name = request_data['name']
            hello = {
                'error' : '0',
                'message': f'Hello World {name}'
            }
            return Response(hello, status=200)
        except Exception as e:
            logging.error('Error Request: %s', e)
            predictions = {
                'error' : '2',
                "message": str(e)
            }
            return Response(predictions, status=502)

    def post(self, request):
        try:
            request_data = request.data
            name = request_data['name']
            hello = {
                'error' : '0',
                'message': f'Hello World transform {name}'
            }
            return Response(hello, status=200)
        except Exception as e:
            logging.error('Error Request: %s', e)
            predictions = {
                'error' : '2',
                "message": str(e)
            }
            return Response(predictions, status=502)
    

User = get_user_model()

class UserView(APIView):
    def get_permissions(self):
        """Different permissions for GET and POST"""
        if self.request.method == 'POST':
            return [AllowAny()]  # Anyone can register
        return [IsAuthenticated()]  # Only authenticated users can get user info

    def get(self, request):
        try:
            user_id = request.query_params.get('id')  # Fetching user ID from query params
            if not user_id:
                return Response({'error': '1', 'message': 'User ID is required'}, status=400)

            user = User.objects.get(id=user_id)  # Fetching user from database
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }

            return Response({'error': '0', 'message': 'Success', 'data': user_data}, status=200)
        except User.DoesNotExist:
            return Response({'error': '1', 'message': 'User not found'}, status=404)
        except Exception as e:
            logging.error('Error Request: %s', e)
            return Response({'error': '2', "message": str(e)}, status=502)
    def post(self, request):
        try:
            data = request.data
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            if not username or not email or not password:
                return Response({'error': '1', 'message': 'Missing required fields'}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)

            return Response({'error': '0', 'message': f'User {user.username} created successfully'}, status=201)

        except IntegrityError:
            return Response({'error': '2', 'message': 'Username or email already exists'}, status=400)

        except Exception as e:
            logging.error('Error creating user: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)

@permission_classes([IsAuthenticated])
class EventView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            event_id = request.query_params.get('id')
            if not event_id:
                return Response({'error': '1', 'message': 'Transaction ID is required'}, status=400)

            event = get_object_or_404(Event, id=event_id)

            event_data = {
                'id': event.id,
                'user': event.user.username,
                'product': event.product.title,
                'timestamp': event.timestamp,
            }

            return Response({'error': '0', 'message': 'Success', 'data': event_data}, status=200)

        except Exception as e:
            logging.error('Error Request: %s', e)
            return Response({'error': '2', 'message': str(e)}, status=500)

    def post(self, request):
        try:
            data = request.data
            user_id = data.get('user_id')
            product_id = data.get('product_id')

            if not user_id or not product_id:
                return Response({'error': '1', 'message': 'User ID and Product ID are required'}, status=400)
            
            user = get_object_or_404(User, id=user_id)
            product = get_object_or_404(Product, id=product_id)
            
            event = Event.objects.create(user=user, product=product)
            
            return Response({'error': '0', 'message': f'Transaction created for {user.username} - {product.title} on {event.timestamp}'}, status=201)
        except Exception as e:
            logging.error('Error creating transaction: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)

    def put(self, request):
        try:
            data = request.data
            transaction_id = data.get('id')

            if not transaction_id:
                return Response({'error': '1', 'message': 'Transaction ID is required'}, status=400)

            event = get_object_or_404(Event, id=transaction_id)

            user_id = data.get('user_id')
            product_id = data.get('product_id')

            if user_id:
                event.user = get_object_or_404(User, id=user_id)
            if product_id:
                event.product = get_object_or_404(Product, id=product_id)

            event.save()

            return Response({'error': '0', 'message': 'Transaction updated'}, status=200)

        except Exception as e:
            logging.error('Error updating transaction: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)

    def delete(self, request):
        try:
            event_id = request.query_params.get('id')

            if not event_id:
                return Response({'error': '1', 'message': 'Transaction ID is required'}, status=400)

            transaction = get_object_or_404(Event, id=event_id)
            transaction.delete()

            return Response({'error': '0', 'message': 'Transaction deleted'}, status=200)

        except Exception as e:
            logging.error('Error deleting transaction: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)


# @api_view(["POST"])
# @authentication_classes([SessionAuthentication, TokenAuthentication])
# def stories(request):
#     try:
#         request_data = request.data
#         name = request_data['name']
#         hello = {
#             'error' : '0',
#             'message': f'Hello World {name}'
#         }
#         return Response(hello, status=200)
#     except Exception as e:
#         logging.error('Error Request: %s', e)
#         predictions = {
#             'error' : '2',
#             "message": str(e)
#         }
#         return Response(predictions, status=502)

# @api_view(["POST"])
# def stories(request):
#     try:
#         request_data = request.data
#         name = request_data['name']
#         hello = {
#             'error' : '0',
#             'message': f'Hello World {name}'
#         }
#         return Response(hello, status=200)
#     except Exception as e:
#         logging.error('Error Request: %s', e)
#         predictions = {
#             'error' : '2',
#             "message": str(e)
#         }
#         return Response(predictions, status=502)
    
# @api_view(["GET"])
# def books(request):
#     try:
#         request_data = request.data
#         name = request_data['name']
#         hello = {
#             'error' : '0',
#             'message': f'Hello World {name}'
#         }
#         return Response(hello, status=200)
#     except Exception as e:
#         logging.error('Error Request: %s', e)
#         predictions = {
#             'error' : '2',
#             "message": str(e)
#         }
#         return Response(predictions, status=502)
    
# @api_view(["POST"])
# def books(request):
#     try:
#         request_data = request.data
#         name = request_data['name']
#         hello = {
#             'error' : '0',
#             'message': f'Hello World {name}'
#         }
#         return Response(hello, status=200)
#     except Exception as e:
#         logging.error('Error Request: %s', e)
#         predictions = {
#             'error' : '2',
#             "message": str(e)
#         }
#         return Response(predictions, status=502)
    
# @api_view(["PUT"])
# def books(request):
#     try:
#         request_data = request.data
#         name = request_data['name']
#         hello = {
#             'error' : '0',
#             'message': f'Hello World {name}'
#         }
#         return Response(hello, status=200)
#     except Exception as e:
#         logging.error('Error Request: %s', e)
#         predictions = {
#             'error' : '2',
#             "message": str(e)
#         }
#         return Response(predictions, status=502)

# @permission_classes([IsAuthenticated])
# class ProductView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             product_id = request.query_params.get('id')
#             if not product_id:
#                 return Response({'error': '1', 'message': 'Product ID is required'}, status=400)

#             product = get_object_or_404(Product, id=product_id)

#             product_data = {
#                 'id': product.id,
#                 'title': product.title,
#                 'category': product.category,
#                 'release_date': product.release_date,
#                 'description': product.description,
#             }
#             return Response({'error': '0', 'message': 'Success', 'data': product_data}, status=200)

#         except Exception as e:
#             logging.error('Error Request: %s', e)
#             return Response({'error': '2', 'message': str(e)}, status=500)

#     def post(self, request):
#         try:
#             data = request.data
#             title = data.get('title')
#             category = data.get('category')
#             release_date = data.get('release_date')
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

#             product.title = data.get('title', product.title)
#             product.category = data.get('category', product.category)
#             product.release_date = data.get('release_date', product.release_date)
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
