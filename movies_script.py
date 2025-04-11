import csv
import requests
from datetime import datetime
import ast  # For safely evaluating the string representation of Python lists
import os  # For file path handling
import chardet
import json
import re
import logging

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Configuration
CSV_FILE_PATH = "./large_files/movie_records.csv"
API_BASE_URL = "http://localhost:8001/api"
LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"
MOVIES_ENDPOINT = f"{API_BASE_URL}/items/"
DEFAULT_IMAGE_PATH = "./archive_new/posters/"
IMAGE_MAP_FILE = "./large_files/movie_image_map.json"
GENRE_MAP_FILE = "./large_files/genres.json"

# Authentication credentials
USERNAME = "admin"  # Replace with your username
PASSWORD = "adminpassword"  # Replace with your password


def get_auth_token():
    """Get authentication token by logging in"""
    login_data = {"username": USERNAME, "password": PASSWORD}

    try:
        # For login, use JSON
        response = requests.post(LOGIN_ENDPOINT, json=login_data)

        if response.status_code == 200:
            # Extract token from response
            token_data = response.json()
            # Using 'access' as the key name for the token
            token = token_data.get("access", "")
            logging.info("Successfully authenticated")
            return token
        else:
            logging.error(f"Authentication failed. Status code: {response.status_code}")
            logging.error(f"Response: {response.text}")
            return None

    except Exception as e:
        logging.error(f"Error during authentication: {str(e)}")
        return None


def detect_encoding(file_path):
    """Detect the encoding of a file"""
    with open(file_path, "rb") as f:
        result = chardet.detect(f.read())
    return result["encoding"]


def load_genre_map():
    """Load the genre mapping from the JSON file"""
    try:
        if os.path.exists(GENRE_MAP_FILE):
            with open(GENRE_MAP_FILE, "r") as f:
                return json.load(f)
        else:
            logging.warning(f"Genre map file {GENRE_MAP_FILE} not found!")
            return {}
    except Exception as e:
        logging.error(f"Error loading genre map: {str(e)}")
        return {}


def load_image_map():
    """Load the image mapping from the JSON file"""
    try:
        if os.path.exists(IMAGE_MAP_FILE):
            with open(IMAGE_MAP_FILE, "r") as f:
                return json.load(f)
        else:
            logging.warning(f"Image map file {IMAGE_MAP_FILE} not found!")
            return {}
    except Exception as e:
        logging.error(f"Error loading image map: {str(e)}")
        return {}


def format_release_date(date_str):
    """Format release date to ISO 8601 format"""
    if not date_str:
        return ""

    date_formats = [
        "%Y-%m-%d",  # YYYY-MM-DD
        "%m/%d/%y",  # MM/DD/YY
        "%m/%d/%Y",  # MM/DD/YYYY
        "%B %d %Y",  # Month Day Year
        "%B %d, %Y",  # Month Day, Year
        "%d %B %Y",  # Day Month Year
        "%Y",  # Just the year
    ]

    # Remove ordinal indicators (st, nd, rd, th)
    cleaned_date = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", date_str)

    for date_format in date_formats:
        try:
            date_obj = datetime.strptime(cleaned_date, date_format)
            return date_obj.strftime("%Y-%m-%dT00:00:00")
        except ValueError:
            continue

    logging.warning(f"Could not parse date '{date_str}'. Using empty date.")
    return ""


def load_movies_from_csv(auth_token, genre_map, image_map):
    if not auth_token:
        logging.error("Cannot proceed without authentication token")
        return

    # Set up authentication header
    headers = {
        "Authorization": f"Bearer {auth_token}",
    }

    try:
        # Detect the encoding of the CSV file
        encoding = detect_encoding(CSV_FILE_PATH)

        # Open the file with the detected encoding
        with open(CSV_FILE_PATH, "r", encoding=encoding) as file:
            csv_reader = csv.DictReader(file)

            for row in csv_reader:
                # Extract data from the row
                title = row.get("title", "")
                movie_id = row.get("id", "")

                logging.info(f"Processing movie: {title} (ID: {movie_id})")

                # Parse the genre list and get the first genre
                genre_str = row.get("genres", "[]")
                try:
                    # Using ast.literal_eval to safely evaluate the string as a Python literal
                    genre_list = ast.literal_eval(genre_str) if genre_str else []
                    first_genre = genre_list[0] if genre_list else ""
                    # Get genre ID from the mapping
                    genre_id = genre_map.get(first_genre, "1")
                except (SyntaxError, ValueError) as e:
                    logging.warning(
                        f"Could not parse genre for {title}: {e}. Using default genre ID 1."
                    )
                    genre_id = "1"

                # Parse release date
                release_date = format_release_date(row.get("release_date", ""))

                # Extract other fields
                description = row.get("overview", "")
                director = row.get("director", "")
                runtime = row.get("runtime", "")

                # Create multipart form data for non-file fields
                form_data = {
                    "title": (None, title),
                    "type": (None, "2"),  # Assuming 2 is for movies, 1 was for books
                    "genre": (None, str(genre_id)),
                    "publish_date": (None, release_date),
                    "description": (None, description),
                    "director": (None, director) if director else None,
                    "runtime": (None, runtime) if runtime else None,
                }

                # Remove None values from form_data
                form_data = {k: v for k, v in form_data.items() if v is not None}

                # Get the image path for this movie
                image_filename = image_map.get(movie_id, "")
                image_path = (
                    os.path.join(DEFAULT_IMAGE_PATH, image_filename)
                    if image_filename
                    else ""
                )

                # Add image to form data
                if image_path and os.path.isfile(image_path):
                    with open(image_path, "rb") as img_file:
                        image_content = img_file.read()
                        # Determine content type based on file extension
                        file_ext = os.path.splitext(image_path)[1].lower()
                        if file_ext == ".jpg" or file_ext == ".jpeg":
                            content_type = "image/jpeg"
                        elif file_ext == ".png":
                            content_type = "image/png"
                        else:
                            content_type = "image/jpeg"  # Default to JPEG

                        form_data["image"] = (
                            os.path.basename(image_path),
                            image_content,
                            content_type,
                        )
                else:
                    # If no specific image found, look for a default using movie ID
                    default_image = os.path.join(DEFAULT_IMAGE_PATH, f"{movie_id}.jpg")
                    if os.path.isfile(default_image):
                        with open(default_image, "rb") as img_file:
                            form_data["image"] = (
                                os.path.basename(default_image),
                                img_file.read(),
                                "image/jpeg",
                            )
                    else:
                        logging.warning(f"No image found for movie: {title}")
                        form_data["image"] = (None, "")

                # Make POST request using multipart/form-data
                try:
                    response = requests.post(
                        MOVIES_ENDPOINT, files=form_data, headers=headers
                    )

                    # Check if request was successful
                    if response.status_code == 201:
                        logging.info(f"Successfully added movie: {title}")
                    else:
                        logging.error(
                            f"Failed to add movie: {title}. Status: {response.status_code}, Response: {response.text}"
                        )

                except Exception as e:
                    logging.error(f"Error adding movie {title}: {str(e)}")

    except Exception as e:
        logging.error(f"Error processing CSV file: {str(e)}")


if __name__ == "__main__":
    logging.info("Starting movie loading script...")

    logging.info("Loading genre mapping from file...")
    genre_map = load_genre_map()

    if not genre_map:
        logging.warning(
            "No genre mapping found or empty genre map! Using default genres."
        )

    logging.info("Loading image mapping from file...")
    image_map = load_image_map()

    if not image_map:
        logging.warning(
            "No image mapping found! Images will be looked up by movie ID in the default path."
        )

    logging.info("Starting authentication process...")
    auth_token = get_auth_token()

    if auth_token:
        logging.info("Starting to load movies from CSV...")
        load_movies_from_csv(auth_token, genre_map, image_map)
        logging.info("Finished loading movies.")
    else:
        logging.error("Authentication failed. Cannot proceed with loading movies.")
