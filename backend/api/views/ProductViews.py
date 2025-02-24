from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.utils import IntegrityError
from socialmedia.models import Audio, Book
import logging

# Logging setup
log_file = './mlapi_logs.log'
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@permission_classes([IsAuthenticated])
class BookView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            product_id = request.query_params.get('id')
            if not product_id:
                return Response({'error': '1', 'message': 'Book ID is required'}, status=400)

            book = get_object_or_404(Book, id=product_id)

            book_data = {
                'id': book.id,
                'precordsid': book.precordsid,
                'title': book.title,
                'author': book.author,
                'genre': book.genre,
                'releasedate': book.releasedate,
                'publisher': book.publisher,
                'description': book.description,
            }
            return Response({'error': '0', 'message': 'Success', 'data': book_data}, status=200)

        except Exception as e:
            logging.error('Error Request: %s', e)
            return Response({'error': '2', 'message': str(e)}, status=500)

    def post(self, request):
        try:
            data = request.data
            precordsid = data.get('precordsid')
            title = data.get('title')
            author = data.get('author')
            genre = data.get('genre')
            releasedate = data.get('releasedate', None)
            publisher = data.get('publisher', '')
            description = data.get('description', '')

            if not title or not author or not genre:
                return Response({'error': '1', 'message': 'Title, Author, and Genre are required'}, status=400)

            book = Book.objects.create(
                title=title, author=author, genre=genre, releasedate=releasedate,
                publisher=publisher, description=description
            )

            return Response({'error': '0', 'message': f'Book {book.title} created'}, status=201)

        except IntegrityError:
            return Response({'error': '2', 'message': 'Book already exists'}, status=400)

        except Exception as e:
            logging.error('Error creating book: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)

    def put(self, request):
        try:
            data = request.data
            book_id = data.get('id')

            if not book_id:
                return Response({'error': '1', 'message': 'Book ID is required'}, status=400)

            book = get_object_or_404(Book, id=book_id)

            book.precordsid = data.get('precordsid', book.precordsid)
            book.title = data.get('title', book.title)
            book.author = data.get('author', book.author)
            book.genre = data.get('genre', book.genre)
            book.releasedate = data.get('releasedate', book.releasedate)
            book.publisher = data.get('publisher', book.publisher)
            book.description = data.get('description', book.description)

            book.save()

            return Response({'error': '0', 'message': f'Book {book.title} updated'}, status=200)

        except Exception as e:
            logging.error('Error updating book: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)

    def delete(self, request):
        try:
            book_id = request.query_params.get('id')

            if not book_id:
                return Response({'error': '1', 'message': 'Book ID is required'}, status=400)

            book = get_object_or_404(Book, id=book_id)
            book.delete()

            return Response({'error': '0', 'message': f'Book {book.title} deleted'}, status=200)

        except Exception as e:
            logging.error('Error deleting book: %s', e)
            return Response({'error': '3', 'message': str(e)}, status=500)
