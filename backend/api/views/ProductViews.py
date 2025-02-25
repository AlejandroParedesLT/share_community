from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.utils import IntegrityError
from socialmedia.models import Genre, Country  # Ensure these models exist
import logging

# Logging setup
log_file = "./mlapi_logs.log"
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

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