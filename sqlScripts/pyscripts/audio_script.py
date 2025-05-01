import csv
import requests
from datetime import datetime
import os
import chardet
import json
import re
import tempfile
import urllib.parse
import ast  # For safely evaluating the string representation of Python lists

# Configuration
# CSV_FILE_PATH = "./sqlScripts/artifacts/spotify_dataset_with_description.csv"
CSV_FILE_PATH = "./artifacts/spotify_dataset_with_description.csv"
API_BASE_URL = "http://localhost:8001/api"
LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"
ITEMS_ENDPOINT = f"{API_BASE_URL}/items/"
DEFAULT_IMAGE_PATH = "./popeye.jpg"

USERNAME = "admin"
PASSWORD = "adminpassword"

# Load genres.json and build genre mapping
# GENRE_MAP = {}
# try:
#     with open('genres.json', 'r', encoding='utf-8') as file:
#         genres_data = json.load(file)
#         for genre in genres_data["genres"]:
#             name = genre["name"].strip().lower()  # strip() and lower() together!
#             genre_id = genre["id"]
#             GENRE_MAP[name] = genre_id
# except FileNotFoundError:
#     print("Error: genres.json file not found.")
# except json.JSONDecodeError:
#     print("Error: genres.json contains invalid JSON.")

# def find_genre_id(genre_name):
#     """Find genre ID by genre name, default to 1 if not found."""
#     if genre_name:
#         genre_name_clean = genre_name.strip().lower()  # Clean input: strip spaces + lower
#         genre_id = GENRE_MAP.get(genre_name_clean)
#         if genre_id is not None:
#             return genre_id
#     # Fallback
#     return 1

# Define a mapping of genre names to IDs (adjust with your actual IDs)
with open('./json/genres.json', 'r') as f:
    genre_map = json.load(f)
    genres = genre_map.get("genres", [])

def get_auth_token():
    login_data = {
        "username": USERNAME,
        "password": PASSWORD
    }
    try:
        response = requests.post(LOGIN_ENDPOINT, json=login_data)
        if response.status_code == 200:
            token = response.json().get('access', '')
            print("Successfully authenticated")
            return token
        else:
            print(f"Authentication failed. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error during authentication: {str(e)}")
        return None

def detect_encoding(file_path):
    with open(file_path, 'rb') as f:
        result = chardet.detect(f.read())
    return result['encoding']

def download_image(url):
    """Download image from URL and return the local path"""
    try:
        if not url or url.strip() == "":
            print("Empty URL provided, using default image")
            return DEFAULT_IMAGE_PATH
        
        # Create a temp file with the right extension
        img_ext = os.path.splitext(urllib.parse.urlparse(url).path)[1]
        if not img_ext:
            img_ext = ".jpg"  # Default extension if not detected
            
        # Create a temporary file that will be automatically cleaned up
        temp_file = tempfile.NamedTemporaryFile(suffix=img_ext, delete=False)
        temp_path = temp_file.name
        temp_file.close()
        
        # Download the image
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        
        with open(temp_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        print(f"Image downloaded successfully to {temp_path}")
        return temp_path
    except Exception as e:
        print(f"Error downloading image from {url}: {str(e)}")
        return DEFAULT_IMAGE_PATH

def load_music_from_csv(auth_token):
    if not auth_token:
        print("Cannot proceed without authentication token")
        return

    headers = {
        "Authorization": f"Bearer {auth_token}",
    }

    try:
        encoding = detect_encoding(CSV_FILE_PATH)

        with open(CSV_FILE_PATH, "r", encoding=encoding) as file:
            csv_reader = csv.DictReader(file)
            i = 0
            for row in csv_reader:
                i += 1
                if i > 150:  # Limit to first 10 rows for testing
                    break
                title = row.get("title", "").strip()
                track_id = row.get("track_id", "").strip()
                author = row.get("author", "").strip()
                album_name = row.get("album_name", "").strip()

                genre_str = row.get("genre", "").strip()
                # Parse the genre list string and get the first genre
                # genre_str = row.get("genres", "[]")
                try:
                    # Using ast.literal_eval to safely evaluate the string as a Python literal
                    #print(genre_list)
                    #genre_list = ast.literal_eval(genre_str)
                    #print(genre_list)
                    first_genre = genre_str
                    # Get genre ID from the mapping
                    genre_id = next((str(genre["id"]) for genre in genres if str.lower(genre["name"]) == str.lower(first_genre)), "1")
                except (SyntaxError, ValueError):
                    # Fallback if parsing fails
                    print(f"Warning: Could not parse genre for {title}. Using 1 as genre.")
                    genre_id = "1"
                # genre_id = find_genre_id(genre_text)

                # if genre_id is None:
                #     print(f"Warning: Genre '{genre_text}' not found for {title}. Using default genre ID 1.")
                #     genre_id = 1  # fallback

                release_date_str = row.get("release_date", "").strip()
                publish_date = ""
                if release_date_str:
                    try:
                        parsed_date = datetime.strptime(release_date_str, "%m/%d/%y")
                        publish_date = parsed_date.strftime("%Y-%m-%dT00:00:00")
                    except ValueError:
                        print(f"Warning: Could not parse release date '{release_date_str}' for title '{title}'. Using empty date.")
                        publish_date = ""

                description = row.get("description", "").strip()
                cover_img_url = row.get("cover_img_url", "").strip()

                form_data = {
                    "title": (None, title),
                    "original_id": (None, track_id), # Not exist in item table
                    "author": (None, author), # Not exist in item table
                    "album_name": (None, album_name), # Not exist in item table
                    "type": (None, "3"),
                    "genre": (None, str(genre_id)),
                    "publish_date": (None, publish_date),
                    "description": (None, description),
                }

                # Download the image from URL
                image_path = DEFAULT_IMAGE_PATH
                if cover_img_url:
                    print(f"Downloading image for {title} from {cover_img_url}")
                    image_path = download_image(cover_img_url)

                # Add image to the form data
                if os.path.isfile(image_path):
                    with open(image_path, 'rb') as img_file:
                        image_content = img_file.read()
                        ext = os.path.splitext(image_path)[1].lower()
                        content_type = 'image/png' if ext == '.png' else 'image/jpeg'
                        form_data["image"] = (os.path.basename(image_path), image_content, content_type)
                else:
                    form_data["image"] = (None, "")

                try:
                    response = requests.post(ITEMS_ENDPOINT, files=form_data, headers=headers)
                    if response.status_code == 201:
                        print(f"Successfully added audio: {title}")
                    else:
                        print(f"Failed to add audio: {title}. Status code: {response.status_code}")
                        print(f"Response: {response.text}")
                except Exception as e:
                    print(f"Error adding audio {title}: {str(e)}")
                finally:
                    # Delete the temporary image if it was downloaded
                    if image_path != DEFAULT_IMAGE_PATH and os.path.exists(image_path):
                        try:
                            os.remove(image_path)
                            print(f"Deleted temporary image: {image_path}")
                        except Exception as e:
                            print(f"Failed to delete temporary image {image_path}: {str(e)}")
                
    except Exception as e:
        print(f"Error processing CSV file: {str(e)}")

if __name__ == "__main__":
    print("Starting authentication process...")
    auth_token = get_auth_token()

    if auth_token:
        print("Starting to load music from CSV...")
        load_music_from_csv(auth_token)
        print("Finished loading music.")
    else:
        print("Authentication failed. Cannot proceed with loading music.")