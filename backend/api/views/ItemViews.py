from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets


from django.shortcuts import get_object_or_404
from django.db.utils import IntegrityError

import logging

# Logging setup
log_file = "./items_logs.log"
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

from socialmedia.models import Audio, Book, Movie, Genre, ItemType, Genre, Item
from socialmedia.serializers import ItemTypeSerializer, GenreSerializer, ItemSerializer
from socialmedia.permissions import IsOwnerOrReadOnly


class ItemTypeViewSet(viewsets.ModelViewSet):
    queryset = ItemType.objects.all()
    serializer_class = ItemTypeSerializer
    permission_classes = [IsAuthenticated]

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [IsAuthenticated]

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]

# Implement this:

# from django.contrib.postgres.search import TrigramSimilarity

# class ItemViewSet(viewsets.ModelViewSet):
#     serializer_class = ItemSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         queryset = Item.objects.all()
#         # 1️⃣ Retrieve the first 10 items
#         if 'latest' in self.request.query_params:
#             return queryset.order_by('-created_at')[:10]

#         # 2️⃣ Perform similarity-based search
#         search_query = self.request.query_params.get('search', None)
#         if search_query:
#             return queryset.annotate(
#                 similarity=TrigramSimilarity('title', search_query)
#             ).filter(similarity__gt=0.3).order_by('-similarity')
#         # Default: return everything
#         return queryset


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
                publisher=publisher, description=description, precordsid=precordsid
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


class MovieView(APIView):
    """
    API View to handle CRUD operations for Movie objects.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            movie_id = request.query_params.get("id")
            if not movie_id:
                return Response(
                    {"error": "1", "message": "Movie ID is required"}, status=400
                )

            movie = get_object_or_404(Movie, id=movie_id)

            movie_data = {
                "id": movie.id,
                "precordsid": movie.precordsid,
                "title": movie.title,
                "release_date": movie.release_date,
                "description": movie.description,
                "genre": movie.genre,
                "category": movie.category,
            }
            return Response(
                {"error": "0", "message": "Success", "data": movie_data}, status=200
            )

        except Exception as e:
            logging.error("Error fetching Movie record: %s", e)
            return Response({"error": "2", "message": str(e)}, status=500)

    def post(self, request):
        """
        Create a new Movie record.
        """
        try:
            data = request.data
            precordsid = data.get("precordsid")
            title = data.get("title")
            release_date = data.get("release_date", None)
            description = data.get("description", "")
            genre = data.get("genre", "")
            category = data.get("category", "")

            if not precordsid or not category:
                return Response(
                    {"error": "1", "message": "precordsid and category are required"},
                    status=400,
                )

            movie = Movie.objects.create(
                precordsid=precordsid,
                title=title,
                release_date=release_date,
                description=description,
                genre=genre,
                category=category,
            )

            return Response(
                {"error": "0", "message": f"Movie {movie.title} created"}, status=201
            )

        except IntegrityError:
            return Response(
                {"error": "2", "message": "Movie record already exists"}, status=400
            )

        except Exception as e:
            logging.error("Error creating Movie record: %s", e)
            return Response({"error": "3", "message": str(e)}, status=500)

    def put(self, request):
        """
        Update an existing Movie record.
        """
        try:
            data = request.data
            movie_id = data.get("id")

            if not movie_id:
                return Response(
                    {"error": "1", "message": "Movie ID is required"}, status=400
                )

            movie = get_object_or_404(Movie, id=movie_id)

            movie.precordsid = data.get("precordsid", movie.precordsid)
            movie.title = data.get("title", movie.title)
            movie.release_date = data.get("release_date", movie.release_date)
            movie.description = data.get("description", movie.description)
            movie.genre = data.get("genre", movie.genre)
            movie.category = data.get("category", movie.category)

            movie.save()

            return Response(
                {"error": "0", "message": f"Movie {movie.title} updated"}, status=200
            )

        except Exception as e:
            logging.error("Error updating Movie record: %s", e)
            return Response({"error": "3", "message": str(e)}, status=500)

    def delete(self, request):
        """
        Delete a Movie record.
        """
        try:
            movie_id = request.query_params.get("id")

            if not movie_id:
                return Response(
                    {"error": "1", "message": "Movie ID is required"}, status=400
                )

            movie = get_object_or_404(Movie, id=movie_id)
            movie.delete()

            return Response(
                {"error": "0", "message": f"Movie {movie.title} deleted"}, status=200
            )

        except Exception as e:
            logging.error("Error deleting Movie record: %s", e)
            return Response({"error": "3", "message": str(e)}, status=500)
