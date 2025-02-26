from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.utils import IntegrityError
from socialmedia.models import Movie, Genre, Country  # Ensure these models exist

import logging

# Logging setup
log_file = "./mlapi_logs.log"
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

class MovieView(APIView):
    """
    API View to handle CRUD operations for Movie objects.
    """

    permission_classes = [IsAuthenticated]  # ✅ Correct placement

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

class Genre(APIView):
    """
    API View to handle CRUD operations for Genre objects
    """

    permission_classes = [IsAuthenticated]

    def get(self, request): 
        try:
            genre_id = request.query_params.get("id")
            if not genre_id:
                return Response(
                    {"error": "1", "message": "Genre ID is required"}, status=400
                )
            
            genre = get_object_or_404(Genre, id=genre_id)

            genre_data = {
                "id": genre.id,
                "name": genre.name,
                "createdAt": genre.createdAt,
            }
            return Response(
                {"error": "0", "message": "Success", "data": genre_data}, status=200
            )
        
        except Exception as e:
            logging.error("Error fetching Genre record: %s", e)
            return Response({"error": "2", "message": str(e)}, status=500)
        
    def post(self, request):
        """
        Creating a new Genre record
        """
        try:
            data = request.data
            name = data.get("name")
            createdAt = data.get("createdAt", None)

            if not name:
                return Response(
                    {"error": "1", "message": "Genre name is required"},
                    status=400,
                )
            
            genre = Genre.objects.create(
                name=name,
                createdAt=createdAt,
            )

            return Response(
                {"error": "0", "message": f"Genre {genre.name} created"}, status=201
            )
        
        except IntegrityError:
            return Response(
                {"error": "2", "message": "Genre record already exists"}, status=400
            )
        
        except Exception as e:
            logging.error("Error creating Genre record: %s", e)
            return Response({"error": "3", "message": str(e)}, status=500)
        
    def put(self, request):
        """
        Update an existing Genre record.
        """
        try:
            data = request.data
            genre_id = data.get("id")

            if not genre_id:
                return Response(
                    {"error": "1", "message": "Genre ID is required"}, status=400
                )
            
            genre = get_object_or_404(Genre, id=genre_id)

            genre.name = data.get("name", genre.name)
            genre.createdAt = data.get("createdAt", genre.createdAt)

            genre.save()

            return Response(
                {"error": "0", "message": f"Genre {genre.name} updated"}, status=200
            )
        
        except Exception as e:
            logging.error("Error updating Genre record: %s", e)
            return Response({"error": "3", "message": str(e)}, status=500)
        
    def delete(self, request):
        """
        Delete a Genre record
        """
        try:
            genre_id = request.query_params.get("id")

            if not genre_id:
                return Response(
                    {"error": "1", "message": "Genre ID is required"}, status=400
                )
            
            genre = get_object_or_404(Genre, id=genre_id)
            genre.delete()

            return Response(
                {"error": "0", "message": f"Genre {genre.name} deleted"}, status=200
            )

        except Exception as e:
            logging.error("Error deleting Genre record: %s", e)
            return Response({"error": "3", "message": str(e)}, status=500)


class Country(APIView):
    """
    API View to handle CRUD operations for Country objects
    """

    permission_classes = [IsAuthenticated]

    def get(self, request): 
        try:
            country_id = request.query_params.get("id")
            if not country_id:
                return Response(
                    {"error": "1", "message": "Country ID is required"}, status=400
                )
            
            country = get_object_or_404(Country, id=country_id)

            country_data = {
                "id": country.id,
                "name": country.name,
                "lat": country.lat,
                "lon": country.lon,
                "region": country.region
            }
            return Response(
                {"error": "0", "message": "Success", "data": country_data}, status=200
            )
        
        except Exception as e:
            logging.error("Error fetching Country record: %s", e)
            return Response({"error": "2", "message": str(e)}, status=500)
        
    def post(self, request):
        """
        Creating a new Country record
        """
        try:
            data = request.data
            name = data.get("name")
            lat = data.get("lat")
            lon = data.get("lon")
            region = data.get("region")

            if not name:
                return Response(
                    {"error": "1", "message": "Country name is required"},
                    status=400,
                )
            
            country = Country.objects.create(
                name=name,
                lat=lat,
                lon=lon,
                region=region
            )

            return Response(
                {"error": "0", "message": f"Country {country.name} created"}, status=201
            )
        
        except IntegrityError:
            return Response(
                {"error": "2", "message": "Country record already exists"}, status=400
            )
        
        except Exception as e:
            logging.error("Error creating Country record: %s", e)
            return Response({"error": "3", "message": str(e)}, status=500)
        
    def put(self, request):
        """
        Update an existing Country record.
        """
        try:
            data = request.data
            country_id = data.get("id")

            if not country_id:
                return Response(
                    {"error": "1", "message": "Country ID is required"}, status=400
                )
            
            country = get_object_or_404(Country, id=country_id)

            country.name = data.get("name", country.name)
            country.lat = data.get("lat", country.lat)
            country.lon = data.get("lon", country.lon)
            country.region = data.get("region", country.region)

            country.save()

            return Response(
                {"error": "0", "message": f"Country {country.name} updated"}, status=200
            )
        
        except Exception as e:
            logging.error("Error updating Country record: %s", e)
            return Response({"error": "3", "message": str(e)}, status=500)
        
    def delete(self, request):
        """
        Delete a Country record
        """
        try:
            country_id = request.query_params.get("id")

            if not country_id:
                return Response(
                    {"error": "1", "message": "Country ID is required"}, status=400
                )
            
            country = get_object_or_404(Country, id=country_id)
            country.delete()

            return Response(
                {"error": "0", "message": f"Country {country.name} deleted"}, status=200
            )

        except Exception as e:
            logging.error("Error deleting Country record: %s", e)
            return Response({"error": "3", "message": str(e)}, status=500)