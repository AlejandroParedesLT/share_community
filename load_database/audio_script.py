import csv
import requests
from datetime import datetime
import os
import chardet
import json
import re

# Configuration
CSV_FILE_PATH = "/Users/nakiyahdhariwala/share_community/load_database/spotify_dataset_with_description.csv"
API_BASE_URL = "http://localhost:8001/api"
LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"
ITEMS_ENDPOINT = f"{API_BASE_URL}/items/"
# DEFAULT_IMAGE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/audio_images/default_album.jpg"
IMAGE_MAP_FILE = "/Users/nakiyahdhariwala/share_community/load_database/image_map.json"
DEFAULT_IMAGE_PATH = "/Users/nakiyahdhariwala/share_community/load_database/movie.png"


USERNAME = "admin"
PASSWORD = "adminpassword"

# Load genres.json and build genre mapping IS NOT WORKING
GENRE_MAP = {}
try:
    with open(
        "/Users/nakiyahdhariwala/share_community/load_database/genres.json",
        "r",
        encoding="utf-8",
    ) as file:
        genres_data = json.load(file)
        for genre in genres_data["genres"]:
            name = genre["name"].strip().lower()  # strip() and lower() together!
            genre_id = genre["id"]
            GENRE_MAP[name] = genre_id
except FileNotFoundError:
    print("Error: genres.json file not found.")
except json.JSONDecodeError:
    print("Error: genres.json contains invalid JSON.")


def find_genre_id(genre_name):
    """Find genre ID by genre name, default to 1 if not found."""
    if genre_name:
        genre_name_clean = (
            genre_name.strip().lower()
        )  # Clean input: strip spaces + lower
        genre_id = GENRE_MAP.get(genre_name_clean)
        if genre_id is not None:
            return genre_id
    # Fallback
    return 1


def get_auth_token():
    login_data = {"username": USERNAME, "password": PASSWORD}
    try:
        response = requests.post(LOGIN_ENDPOINT, json=login_data)
        if response.status_code == 200:
            token = response.json().get("access", "")
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
    with open(file_path, "rb") as f:
        result = chardet.detect(f.read())
    return result["encoding"]


def load_image_map():
    try:
        if os.path.exists(IMAGE_MAP_FILE):
            with open(IMAGE_MAP_FILE, "r") as f:
                return json.load(f)
        else:
            print(f"Image map file {IMAGE_MAP_FILE} not found!")
            return {}
    except Exception as e:
        print(f"Error loading image map: {str(e)}")
        return {}


def load_music_from_csv(auth_token, image_map):
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

            for row in csv_reader:
                title = row.get("title", "").strip()
                track_id = row.get("track_id", "").strip()
                author = row.get("author", "").strip()
                album_name = row.get("album_name", "").strip()

                genre_text = row.get("genre", "").strip()
                genre_id = find_genre_id(genre_text)

                if genre_id is None:
                    print(
                        f"Warning: Genre '{genre_text}' not found for {title}. Using default genre ID 1."
                    )
                    genre_id = 1  # fallback

                release_date_str = row.get("release_date", "").strip()
                publish_date = ""
                if release_date_str:
                    try:
                        parsed_date = datetime.strptime(release_date_str, "%m/%d/%y")
                        publish_date = parsed_date.strftime("%Y-%m-%dT00:00:00")
                    except ValueError:
                        print(
                            f"Warning: Could not parse release date '{release_date_str}' for title '{title}'. Using empty date."
                        )
                        publish_date = ""

                description = row.get("description", "").strip()

                form_data = {
                    "title": (None, title),
                    "track_id": (None, track_id),  # Not exist in item table
                    "author": (None, author),  # Not exist in item table
                    "album_name": (None, album_name),  # Not exist in item table
                    "type": (None, "3"),
                    "genre": (None, str(genre_id)),
                    "publish_date": (None, publish_date),
                    "description": (None, description),
                }

                image_path = image_map.get(title, DEFAULT_IMAGE_PATH)
                if os.path.isfile(image_path):
                    with open(image_path, "rb") as img_file:
                        image_content = img_file.read()
                        ext = os.path.splitext(image_path)[1].lower()
                        content_type = "image/png" if ext == ".png" else "image/jpeg"
                        form_data["image"] = (
                            os.path.basename(image_path),
                            image_content,
                            content_type,
                        )
                elif os.path.isfile(DEFAULT_IMAGE_PATH):
                    with open(DEFAULT_IMAGE_PATH, "rb") as img_file:
                        form_data["image"] = (
                            os.path.basename(DEFAULT_IMAGE_PATH),
                            img_file.read(),
                            "image/jpeg",
                        )
                else:
                    form_data["image"] = (None, "")

                try:
                    response = requests.post(
                        ITEMS_ENDPOINT, files=form_data, headers=headers
                    )
                    if response.status_code == 201:
                        print(f"Successfully added audio: {title}")
                    else:
                        print(
                            f"Failed to add audio: {title}. Status code: {response.status_code}"
                        )
                        print(f"Response: {response.text}")
                except Exception as e:
                    print(f"Error adding audio {title}: {str(e)}")

    except Exception as e:
        print(f"Error processing CSV file: {str(e)}")


if __name__ == "__main__":
    print("Loading image mapping from file...")
    image_map = load_image_map()

    if not image_map:
        print(
            "WARNING: No image mapping found! Make sure to run the download_images.py script first."
        )
        choice = input("Do you want to continue without images? (y/n): ").lower()
        if choice != "y":
            print("Exiting. Please run the download_images.py script first.")
            exit()

    print("Starting authentication process...")
    auth_token = get_auth_token()

    if auth_token:
        print("Starting to load music from CSV...")
        load_music_from_csv(auth_token, image_map)
        print("Finished loading music.")
    else:
        print("Authentication failed. Cannot proceed with loading music.")


# import csv
# import requests
# from datetime import datetime
# import os
# import chardet
# import json
# import pandas as pd
# import ast

# # Configuration
# CSV_FILE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/Final/spotify_dataset_with_description.csv"
# GENRE_CSV_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/genres.csv"
# API_BASE_URL = "http://localhost:8001/api"
# LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"
# ITEMS_ENDPOINT = f"{API_BASE_URL}/items/"
# DEFAULT_IMAGE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/audio_images/default_album.jpg"
# IMAGE_MAP_FILE = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/image_map.json"

# USERNAME = "admin"
# PASSWORD = "adminpassword"

# df = pd.read.csv(GENRE_CSV_PATH)
# df.head(5)

# # Step 1: Load genres.csv and build genre mapping
# GENRE_MAP = {}
# try:
#     genres_df = pd.read_csv(GENRE_CSV_PATH)
#     for _, row in genres_df.iterrows():
#         genre_name = str(row['name']).strip().lower()
#         genre_id = row['id']
#         if genre_name and genre_name != '[]':
#             GENRE_MAP[genre_name] = genre_id
# except FileNotFoundError:
#     print("Error: genres.csv file not found.")
# except pd.errors.EmptyDataError:
#     print("Error: genres.csv is empty.")
# except Exception as e:
#     print(f"Error loading genres.csv: {str(e)}")

# # Step 2: Genre processing functions
# def find_genre_id(genre_name):
#     if genre_name:
#         genre_name_clean = genre_name.strip().lower()
#         return GENRE_MAP.get(genre_name_clean, 1)  # Default to 1 if not found
#     return 1

# def extract_first_genre(genre_text):
#     try:
#         genres = ast.literal_eval(genre_text)
#         if isinstance(genres, list) and genres:
#             return genres[0]
#         else:
#             return genre_text
#     except (ValueError, SyntaxError):
#         return genre_text

# print(GENRE_MAP)


# # Step 3: Authentication
# def get_auth_token():
#     login_data = {
#         "username": USERNAME,
#         "password": PASSWORD
#     }
#     try:
#         response = requests.post(LOGIN_ENDPOINT, json=login_data)
#         if response.status_code == 200:
#             token = response.json().get('access', '')
#             print("Successfully authenticated")
#             return token
#         else:
#             print(f"Authentication failed. Status code: {response.status_code}")
#             print(f"Response: {response.text}")
#             return None
#     except Exception as e:
#         print(f"Error during authentication: {str(e)}")
#         return None

# # Step 4: Utility
# def detect_encoding(file_path):
#     with open(file_path, 'rb') as f:
#         result = chardet.detect(f.read())
#     return result['encoding']

# def load_image_map():
#     try:
#         if os.path.exists(IMAGE_MAP_FILE):
#             with open(IMAGE_MAP_FILE, 'r') as f:
#                 return json.load(f)
#         else:
#             print(f"Image map file {IMAGE_MAP_FILE} not found!")
#             return {}
#     except Exception as e:
#         print(f"Error loading image map: {str(e)}")
#         return {}

# # Step 5: Load music and upload
# def load_music_from_csv(auth_token, image_map):
#     if not auth_token:
#         print("Cannot proceed without authentication token")
#         return

#     headers = {
#         "Authorization": f"Bearer {auth_token}",
#     }

#     try:
#         encoding = detect_encoding(CSV_FILE_PATH)

#         with open(CSV_FILE_PATH, "r", encoding=encoding) as file:
#             csv_reader = csv.DictReader(file)

#             for row in csv_reader:
#                 title = row.get("title", "").strip()
#                 raw_genre_text = row.get("genre", "").strip()
#                 genre_name = extract_first_genre(raw_genre_text)
#                 genre_id = find_genre_id(genre_name)

#                 if genre_id == 1:
#                     print(f"Warning: Genre '{genre_name}' not found for title '{title}', using default genre ID 1.")

#                 release_date_str = row.get("release_date", "").strip()
#                 publish_date = ""
#                 if release_date_str:
#                     try:
#                         parsed_date = datetime.strptime(release_date_str, "%m/%d/%y")
#                         publish_date = parsed_date.strftime("%Y-%m-%dT00:00:00")
#                     except ValueError:
#                         print(f"Warning: Could not parse release date '{release_date_str}' for title '{title}'. Using empty date.")

#                 description = row.get("description", "").strip()

#                 form_data = {
#                     "title": (None, title),
#                     "type": (None, "3"),
#                     "genre": (None, str(genre_id)),
#                     "publish_date": (None, publish_date),
#                     "description": (None, description),
#                 }

#                 image_path = image_map.get(title, DEFAULT_IMAGE_PATH)
#                 if os.path.isfile(image_path):
#                     with open(image_path, 'rb') as img_file:
#                         image_content = img_file.read()
#                         ext = os.path.splitext(image_path)[1].lower()
#                         content_type = 'image/png' if ext == '.png' else 'image/jpeg'
#                         form_data["image"] = (os.path.basename(image_path), image_content, content_type)
#                 else:
#                     form_data["image"] = (None, "")

#                 try:
#                     response = requests.post(ITEMS_ENDPOINT, files=form_data, headers=headers)
#                     if response.status_code == 201:
#                         print(f"✅ Successfully added: {title}")
#                     else:
#                         print(f"❌ Failed to add: {title}. Status code: {response.status_code}")
#                         print(f"Response: {response.text}")
#                 except Exception as e:
#                     print(f"Error adding {title}: {str(e)}")

#     except Exception as e:
#         print(f"Error processing CSV file: {str(e)}")

# # Main script
# if __name__ == "__main__":
#     print("Loading image mapping from file...")
#     image_map = load_image_map()

#     if not image_map:
#         print("WARNING: No image mapping found! Make sure to run the download_images.py script first.")
#         choice = input("Do you want to continue without images? (y/n): ").lower()
#         if choice != 'y':
#             print("Exiting. Please run the download_images.py script first.")
#             exit()

#     print("Starting authentication process...")
#     auth_token = get_auth_token()

#     if auth_token:
#         print("Starting to load music from CSV...")
#         load_music_from_csv(auth_token, image_map)
#         print("Finished loading music.")
#     else:
#         print("Authentication failed. Cannot proceed with loading music.")


# import csv
# import requests
# from datetime import datetime
# import os
# import chardet
# import json
# import pandas as pd

# # Configuration
# CSV_FILE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/Final/spotify_dataset_with_description.csv"
# GENRE_CSV_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/genres.csv"
# API_BASE_URL = "http://localhost:8001/api"
# LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"
# ITEMS_ENDPOINT = f"{API_BASE_URL}/items/"
# DEFAULT_IMAGE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/audio_images/default_album.jpg"
# IMAGE_MAP_FILE = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/image_map.json"

# USERNAME = "admin"
# PASSWORD = "adminpassword"

# # # Load genres.json and build genre mapping
# # GENRE_MAP = {}
# # try:
# #     with open('genres.json', 'r', encoding='utf-8') as file:
# #         genres_data = json.load(file)
# #         for genre in genres_data["genres"]:
# #             name = genre["name"]
# #             if isinstance(name, str) and name.strip() != "":
# #                 name_clean = name.strip().lower()  # Clean name by stripping spaces and making lowercase
# #                 genre_id = genre["id"]
# #                 GENRE_MAP[name_clean] = genre_id
# # except FileNotFoundError:
# #     print("Error: genres.json file not found.")
# # except json.JSONDecodeError:
# #     print("Error: genres.json contains invalid JSON.")

# # def find_genre_id(genre_name):
# #     """Find genre ID by genre name, default to 1 if not found."""
# #     if genre_name:
# #         genre_name_clean = genre_name.strip().lower()  # Clean input: strip spaces + lower
# #         genre_id = GENRE_MAP.get(genre_name_clean)
# #         if genre_id is not None:
# #             return genre_id
# #     # Fallback
# #     return 1  # Default genre id

# def get_auth_token():
#     login_data = {
#         "username": USERNAME,
#         "password": PASSWORD
#     }
#     try:
#         response = requests.post(LOGIN_ENDPOINT, json=login_data)
#         if response.status_code == 200:
#             token = response.json().get('access', '')
#             print("Successfully authenticated")
#             return token
#         else:
#             print(f"Authentication failed. Status code: {response.status_code}")
#             print(f"Response: {response.text}")
#             return None
#     except Exception as e:
#         print(f"Error during authentication: {str(e)}")
#         return None

# def detect_encoding(file_path):
#     with open(file_path, 'rb') as f:
#         result = chardet.detect(f.read())
#     return result['encoding']

# def load_image_map():
#     try:
#         if os.path.exists(IMAGE_MAP_FILE):
#             with open(IMAGE_MAP_FILE, 'r') as f:
#                 return json.load(f)
#         else:
#             print(f"Image map file {IMAGE_MAP_FILE} not found!")
#             return {}
#     except Exception as e:
#         print(f"Error loading image map: {str(e)}")
#         return {}

# def load_music_from_csv(auth_token, image_map):
#     if not auth_token:
#         print("Cannot proceed without authentication token")
#         return

#     headers = {
#         "Authorization": f"Bearer {auth_token}",
#     }

#     try:
#         encoding = detect_encoding(CSV_FILE_PATH)

#         with open(CSV_FILE_PATH, "r", encoding=encoding) as file:
#             csv_reader = csv.DictReader(file)

#             for row in csv_reader:
#                 title = row.get("title", "").strip()
#                 track_id = row.get("track_id", "").strip()
#                 author = row.get("author", "").strip()
#                 album_name = row.get("album_name", "").strip()

#                 genre_text = row.get("genre", "").strip()
#                 genre_id = find_genre_id(genre_text)

#                 if genre_id is None:
#                     print(f"Warning: Genre '{genre_text}' not found for {title}. Using default genre ID 1.")
#                     genre_id = 1  # fallback

#                 release_date_str = row.get("release_date", "").strip()
#                 publish_date = ""
#                 if release_date_str:
#                     try:
#                         parsed_date = datetime.strptime(release_date_str, "%m/%d/%y")
#                         publish_date = parsed_date.strftime("%Y-%m-%dT00:00:00")
#                     except ValueError:
#                         print(f"Warning: Could not parse release date '{release_date_str}' for title '{title}'. Using empty date.")
#                         publish_date = ""

#                 description = row.get("description", "").strip()

#                 form_data = {
#                     "title": (None, title),
#                     "track_id": (None, track_id), # Not exist in item table
#                     "author": (None, author), # Not exist in item table
#                     "album_name": (None, album_name), # Not exist in item table
#                     "type": (None, "3"),
#                     "genre": (None, str(genre_id)),
#                     "publish_date": (None, publish_date),
#                     "description": (None, description),
#                 }

#                 image_path = image_map.get(title, DEFAULT_IMAGE_PATH)
#                 if os.path.isfile(image_path):
#                     with open(image_path, 'rb') as img_file:
#                         image_content = img_file.read()
#                         ext = os.path.splitext(image_path)[1].lower()
#                         content_type = 'image/png' if ext == '.png' else 'image/jpeg'
#                         form_data["image"] = (os.path.basename(image_path), image_content, content_type)
#                 elif os.path.isfile(DEFAULT_IMAGE_PATH):
#                     with open(DEFAULT_IMAGE_PATH, 'rb') as img_file:
#                         form_data["image"] = (os.path.basename(DEFAULT_IMAGE_PATH), img_file.read(), 'image/jpeg')
#                 else:
#                     form_data["image"] = (None, "")

#                 try:
#                     response = requests.post(ITEMS_ENDPOINT, files=form_data, headers=headers)
#                     if response.status_code == 201:
#                         print(f"Successfully added audio: {title}")
#                     else:
#                         print(f"Failed to add audio: {title}. Status code: {response.status_code}")
#                         print(f"Response: {response.text}")
#                 except Exception as e:
#                     print(f"Error adding audio {title}: {str(e)}")

#     except Exception as e:
#         print(f"Error processing CSV file: {str(e)}")

# if __name__ == "__main__":
#     print("Loading image mapping from file...")
#     image_map = load_image_map()

#     if not image_map:
#         print("WARNING: No image mapping found! Make sure to run the download_images.py script first.")
#         choice = input("Do you want to continue without images? (y/n): ").lower()
#         if choice != 'y':
#             print("Exiting. Please run the download_images.py script first.")
#             exit()

#     print("Starting authentication process...")
#     auth_token = get_auth_token()

#     if auth_token:
#         print("Starting to load music from CSV...")
#         load_music_from_csv(auth_token, image_map)
#         print("Finished loading music.")
#     else:
#         print("Authentication failed. Cannot proceed with loading music.")
