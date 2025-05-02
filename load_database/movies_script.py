import csv
import requests
import os
import logging
import ast  # For safely evaluating the string representation of Python lists
from datetime import datetime
import re
import json
import chardet


# Configuration
CSV_FILE_PATH = (
    "/Users/nakiyahdhariwala/share_community/load_database/cleaned_movie_records.csv"
)
API_BASE_URL = "http://localhost:8001/api"
LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"
MOVIES_ENDPOINT = f"{API_BASE_URL}/items/"
IMAGE_PATH = "./img_src/"
DEFAULT_IMAGE_PATH = "/Users/nakiyahdhariwala/share_community/movie.png"
IMAGE_MAP_FILE = "/Users/nakiyahdhariwala/share_community/load_database/shortened_movie_image_map.json"  # File with the image mapping


# # Authentication credentials
USERNAME = "admin"  # Replace with your username
PASSWORD = "adminpassword"  # Replace with your password

# Define a mapping of genre names to IDs (adjust with your actual IDs)
with open(
    "/Users/nakiyahdhariwala/share_community/load_database/genres.json", "r"
) as f:
    genre_map = json.load(f)
    genres = genre_map.get("genres", [])


# Logging setup
logging.basicConfig(
    filename="movie_load.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)


def get_auth_token():
    """Get authentication token by logging in"""
    login_data = {"username": USERNAME, "password": PASSWORD}

    try:
        response = requests.post(LOGIN_ENDPOINT, json=login_data)
        if response.status_code == 200:
            token_data = response.json()
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


def clean_and_match_genre(genre_str, genres, title=None):
    """
    Parse a genre string from CSV and match it to an ID from the loaded genre list.
    Returns the matched genre ID as a string, or None if no match is found.
    """
    try:
        genre_str = genre_str.strip()

        # Remove outer quotes if accidentally double-encoded
        if genre_str.startswith('"') and genre_str.endswith('"'):
            genre_str = genre_str[1:-1]

        genre_list = ast.literal_eval(genre_str)

        if not genre_list:
            logging.warning(f"No genre listed for '{title}' — skipping.")
            return None

        # Extract first genre as-is (preserve capitalization and symbols like '[]')
        first_genre = genre_list[0].strip()

        matched_genre = next(
            (str(genre["id"]) for genre in genres if genre["name"] == first_genre),
            None,
        )

        if not matched_genre:
            logging.warning(
                f"Genre '{first_genre}' not found for '{title}' — skipping."
            )
        return matched_genre

    except Exception as e:
        logging.warning(f"Genre parse error for '{title}': {e}")
        return None


def detect_encoding(file_path):
    """Detect the encoding of a file"""
    with open(file_path, "rb") as f:
        return chardet.detect(f.read())["encoding"]


def load_image_map():
    """Load the image mapping from the JSON file"""
    try:
        if os.path.exists(IMAGE_MAP_FILE):
            with open(IMAGE_MAP_FILE, "r") as f:
                return json.load(f)
    except Exception as e:
        logging.error(f"Error loading image map: {e}")
    return {}


def load_movies_from_csv(auth_token, image_map):
    if not auth_token:
        logging.error("Cannot proceed without authentication token")
        return

    headers = {"Authorization": f"Bearer {auth_token}"}

    try:
        # Detect the encoding of the CSV file
        encoding = detect_encoding(CSV_FILE_PATH)

        # Open the file with the detected encoding
        with open(CSV_FILE_PATH, "r", encoding=encoding) as file:
            csv_reader = csv.DictReader(file)

            for row in csv_reader:
                # Extract data from the row
                title = row.get("name", "")
                description = row.get("description", "")

                # Parse the genre list string and get the first genre
                genre_str = row.get("genre", "[]")

                genre_id = clean_and_match_genre(genre_str, genres, title)
                if not genre_id:
                    continue

                release_date = row.get("date", "")
                try:
                    parsed_date = datetime.strptime(release_date, "%d-%m-%Y")
                    release_date = parsed_date.strftime("%Y-%m-%dT00:00:00")
                except ValueError:
                    logging.warning(f"Invalid date format for {title}")
                    release_date = ""

                form_data = {
                    "title": (None, title),
                    "type": (None, "2"),
                    "genre": (None, str(genre_id)),
                    "publish_date": (None, release_date),
                    "description": (None, description),
                }

                # Get the local image path for this title
                image_path = image_map.get(title, DEFAULT_IMAGE_PATH)

                # Add image to form data
                if os.path.isfile(image_path):
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
                    # Use default image if the local file doesn't exist
                    if os.path.isfile(DEFAULT_IMAGE_PATH):
                        with open(DEFAULT_IMAGE_PATH, "rb") as img_file:
                            form_data["image"] = (
                                os.path.basename(DEFAULT_IMAGE_PATH),
                                img_file.read(),
                                "image/jpeg",
                            )
                    else:
                        # If no image and no default, pass empty string
                        form_data["image"] = (None, "")

                # Make POST request using multipart/form-data
                try:
                    response = requests.post(
                        MOVIES_ENDPOINT, files=form_data, headers=headers
                    )
                    if response.status_code == 201:
                        logging.info(f"Successfully added movie: {title}")
                        print(f"Successfully added movie: {title}")
                    else:
                        logging.error(f"Failed to add movie {title}: {response.text}")
                        print(f"Failed to add movie {title}: {response.text}")
                except Exception as e:
                    logging.error(f"Error adding movie {title}: {e}")
    except Exception as e:
        logging.error(f"Error processing CSV file: {e}")


if __name__ == "__main__":
    image_map = load_image_map()
    auth_token = get_auth_token()
    if auth_token:
        load_movies_from_csv(auth_token, image_map)
    else:
        logging.error("Authentication failed. Cannot proceed.")
