import csv
import requests
from datetime import datetime
import os
import chardet
import json
import re

# Configuration
CSV_FILE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/Final/spotify_dataset_with_description.csv"
API_BASE_URL = "http://localhost:8001/api"
LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"
ITEMS_ENDPOINT = f"{API_BASE_URL}/items/"
DEFAULT_IMAGE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/audio_images/default_album.jpg"
IMAGE_MAP_FILE = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/image_map.json"

USERNAME = "admin"
PASSWORD = "adminpassword"

# # Load genres.json and build genre mapping
# GENRE_MAP = {}
# try:
#     with open('genres.json', 'r', encoding='utf-8') as file:
#         genres_data = json.load(file)
#         for genre in genres_data["genres"]:
#             name = genre["name"].lower()
#             genre_id = genre["id"]
#             GENRE_MAP[name] = genre_id
# except FileNotFoundError:
#     print("Error: genres.json file not found.")
# except json.JSONDecodeError:
#     print("Error: genres.json contains invalid JSON.")

# # Find genre ID from genre name
# def find_genre_id(genre_name):
#     return GENRE_MAP.get(genre_name.lower(), None)

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

def load_image_map():
    try:
        if os.path.exists(IMAGE_MAP_FILE):
            with open(IMAGE_MAP_FILE, 'r') as f:
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
                    print(f"Warning: Genre '{genre_text}' not found for {title}. Using default genre ID 1.")
                    genre_id = 1  # fallback

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

                form_data = {
                    "title": (None, title),
                    "track_id": (None, track_id), # Not exist in item table
                    "author": (None, author), # Not exist in item table
                    "album_name": (None, album_name), # Not exist in item table
                    "type": (None, "3"),
                    "genre": (None, str(genre_id)),
                    "publish_date": (None, publish_date),
                    "description": (None, description),
                }

                image_path = image_map.get(title, DEFAULT_IMAGE_PATH)
                if os.path.isfile(image_path):
                    with open(image_path, 'rb') as img_file:
                        image_content = img_file.read()
                        ext = os.path.splitext(image_path)[1].lower()
                        content_type = 'image/png' if ext == '.png' else 'image/jpeg'
                        form_data["image"] = (os.path.basename(image_path), image_content, content_type)
                elif os.path.isfile(DEFAULT_IMAGE_PATH):
                    with open(DEFAULT_IMAGE_PATH, 'rb') as img_file:
                        form_data["image"] = (os.path.basename(DEFAULT_IMAGE_PATH), img_file.read(), 'image/jpeg')
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

    except Exception as e:
        print(f"Error processing CSV file: {str(e)}")

if __name__ == "__main__":
    print("Loading image mapping from file...")
    image_map = load_image_map()

    if not image_map:
        print("WARNING: No image mapping found! Make sure to run the download_images.py script first.")
        choice = input("Do you want to continue without images? (y/n): ").lower()
        if choice != 'y':
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
# import ast
# import os
# import chardet
# import json
# import re

# # Configuration
# CSV_FILE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/Final/spotify_dataset_with_description.csv"
# API_BASE_URL = "http://localhost:8001/api"
# LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"
# ITEMS_ENDPOINT = f"{API_BASE_URL}/items/"
# DEFAULT_IMAGE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/audio_images/default_album.jpg"
# IMAGE_MAP_FILE = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/image_map.json"

# USERNAME = "admin"
# PASSWORD = "adminpassword"

# GENRE_MAP = {}
# try:
#     with open('genres.json', 'r', encoding='utf-8') as file:
#         GENRE_MAP.update(json.load(file))
# except FileNotFoundError:
#     print("Error: genres.json file not found.")
# except json.JSONDecodeError:
#     print("Error: genres.json contains invalid JSON.")

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

#                 genre_str = row.get("genres", "[]")
#                 try:
#                     genre_list = ast.literal_eval(genre_str)
#                     first_genre = genre_list[0] if genre_list else ""
#                     genre_id = GENRE_MAP.get(first_genre.lower(), "1")
#                 except (SyntaxError, ValueError):
#                     print(f"Warning: Could not parse genre for {title}. Using 1 as genre.")
#                     genre_id = "1"


#                 release_date_str = row.get("release_date", "").strip()
#                 release_date = ""
#                 if release_date_str:
#                     try:
#                         # Your date format looks like MM/DD/YY
#                         parsed_date = datetime.strptime(release_date_str, "%m/%d/%y")
#                         release_date = parsed_date.strftime("%Y-%m-%dT00:00:00")
#                     except ValueError:
#                         print(f"Warning: Could not parse release date '{release_date_str}' for title '{title}'. Using empty date.")
#                         release_date = ""


#                 description = row.get("description", "").strip()

#                 form_data = {
#                     "title": (None, title),
#                     "track_id": (None, track_id),
#                     "author": (None, author),
#                     "album_name": (None, album_name),
#                     "type": (None, "3"),
#                     "genre": (None, str(genre_id)),
#                     "publish_date": (None, release_date),
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




# import json

# # Load genres.json
# with open('genres.json', 'r', encoding='utf-8') as f:
#     genres_data = json.load(f)

# # Build a mapping: name -> id
# GENRE_MAP = {}
# for genre in genres_data["genres"]:
#     name = genre["name"].lower()  # Lowercase to handle case differences
#     genre_id = genre["id"]
#     GENRE_MAP[name] = genre_id

# # Function to find genre ID
# def find_genre_id(genre_name):
#     return GENRE_MAP.get(genre_name.lower(), None)

# # Example usage
# print(find_genre_id("acoustic"))  # Output: 513
# print(find_genre_id("pop"))       # Output: 536
# print(find_genre_id("rock"))      # Output: 459



# # # How can we integrate genre ?

# # import csv
# # import requests
# # from datetime import datetime
# # import ast
# # import os
# # import chardet
# # import json
# # import re
# # import json
# # import re

# # # Configuration
# # CSV_FILE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/Final/spotify_dataset_with_description.csv.csv"
# # API_BASE_URL = "http://localhost:8001/api"
# # LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"
# # ITEMS_ENDPOINT = f"{API_BASE_URL}/items/"
# # DEFAULT_IMAGE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/audio_images/default_album.jpg"
# # IMAGE_MAP_FILE = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/image_map.json"

# # USERNAME = "admin"
# # PASSWORD = "adminpassword"

# # GENRE_MAP = {}
# # try:
# #     with open('genres.json', 'r', encoding='utf-8') as file:
# #         GENRE_MAP.update(json.load(file))
# # except FileNotFoundError:
# #     print("Error: genres.json file not found.")
# # except json.JSONDecodeError:
# #     print("Error: genres.json contains invalid JSON.")

# # def get_auth_token():
# #     login_data = {
# #         "username": USERNAME,
# #         "password": PASSWORD
# #     }

# #     try:
# #         response = requests.post(LOGIN_ENDPOINT, json=login_data)
# #         if response.status_code == 200:
# #             token = response.json().get('access', '')
# #             print("Successfully authenticated")
# #             return token
# #         else:
# #             print(f"Authentication failed. Status code: {response.status_code}")
# #             print(f"Response: {response.text}")
# #             return None
# #     except Exception as e:
# #         print(f"Error during authentication: {str(e)}")
# #         return None


# # def detect_encoding(file_path):
# #     with open(file_path, 'rb') as f:
# #         result = chardet.detect(f.read())
# #     return result['encoding']


# # def load_image_map():
# #     try:
# #         if os.path.exists(IMAGE_MAP_FILE):
# #             with open(IMAGE_MAP_FILE, 'r') as f:
# #                 return json.load(f)
# #         else:
# #             print(f"Image map file {IMAGE_MAP_FILE} not found!")
# #             return {}
# #     except Exception as e:
# #         print(f"Error loading image map: {str(e)}")
# #         return {}


# # def load_music_from_csv(auth_token, image_map):
# #     if not auth_token:
# #         print("Cannot proceed without authentication token")
# #         return

# #     headers = {
# #         "Authorization": f"Bearer {auth_token}",
# #     }

# #     try:
# #         encoding = detect_encoding(CSV_FILE_PATH)

# #         with open(CSV_FILE_PATH, "r", encoding=encoding) as file:
# #             csv_reader = csv.DictReader(file)

# #             for row in csv_reader:
# #                 title = row.get("title", "").strip()
# #                 author = row.get("author", "").strip()

# #                 genre_str = row.get("genres", "[]")
# #                 try:
# #                     genre_list = ast.literal_eval(genre_str)
# #                     first_genre = genre_list[0] if genre_list else ""
# #                     genre_id = GENRE_MAP.get(first_genre.lower(), "1")
# #                 except (SyntaxError, ValueError):
# #                     print(f"Warning: Could not parse genre for {title}. Using 1 as genre.")
# #                     genre_id = "1"

# #                 # Parse release_date with flexible format handling
# #                 release_date_str = row.get("release_date", "").strip()
# #                 release_date = ""
# #                 if release_date_str:
# #                     try:
# #                         # Your date format looks like MM/DD/YY
# #                         parsed_date = datetime.strptime(release_date_str, "%m/%d/%y")
# #                         release_date = parsed_date.strftime("%Y-%m-%dT00:00:00")
# #                     except ValueError:
# #                         print(f"Warning: Could not parse release date '{release_date_str}' for title '{title}'. Using empty date.")
# #                         release_date = ""

# #                 description = row.get("description", "").strip()

# #                 form_data = {
# #                     "title": (None, title),
# #                     "type": (None, "3"),
# #                     "genre": (None, str(genre_id)),
# #                     "year": (None, release_date),
# #                     "description": (None, description),
# #                 }

# #                 image_path = image_map.get(title, DEFAULT_IMAGE_PATH)
# #                 if os.path.isfile(image_path):
# #                     with open(image_path, 'rb') as img_file:
# #                         image_content = img_file.read()
# #                         ext = os.path.splitext(image_path)[1].lower()
# #                         content_type = 'image/png' if ext == '.png' else 'image/jpeg'
# #                         form_data["image"] = (os.path.basename(image_path), image_content, content_type)
# #                 elif os.path.isfile(DEFAULT_IMAGE_PATH):
# #                     with open(DEFAULT_IMAGE_PATH, 'rb') as img_file:
# #                         form_data["image"] = (os.path.basename(DEFAULT_IMAGE_PATH), img_file.read(), 'image/jpeg')
# #                 else:
# #                     form_data["image"] = (None, "")

# #                 try:
# #                     response = requests.post(ITEMS_ENDPOINT, files=form_data, headers=headers)
# #                     if response.status_code == 201:
# #                         print(f"Successfully added audio: {title}")
# #                     else:
# #                         print(f"Failed to add audio: {title}. Status code: {response.status_code}")
# #                         print(f"Response: {response.text}")
# #                 except Exception as e:
# #                     print(f"Error adding audio {title}: {str(e)}")

# #     except Exception as e:
# #         print(f"Error processing CSV file: {str(e)}")


# # if __name__ == "__main__":
# #     print("Loading image mapping from file...")
# #     image_map = load_image_map()

# #     if not image_map:
# #         print("WARNING: No image mapping found! Make sure to run the download_images.py script first.")
# #         choice = input("Do you want to continue without images? (y/n): ").lower()
# #         if choice != 'y':
# #             print("Exiting. Please run the download_images.py script first.")
# #             exit()

# #     print("Starting authentication process...")
# #     auth_token = get_auth_token()

# #     if auth_token:
# #         print("Starting to load music from CSV...")
# #         load_music_from_csv(auth_token, image_map)
# #         print("Finished loading music.")
# #     else:
# #         print("Authentication failed. Cannot proceed with loading music.")




