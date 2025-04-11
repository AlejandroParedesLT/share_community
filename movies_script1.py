import csv
import requests
import os
import json
import logging
from datetime import datetime
import chardet
import ast

# Configure logging
logging.basicConfig(
    filename="script_debug.log",
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
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
USERNAME = "admin"
PASSWORD = "adminpassword"


def get_auth_token():
    """Get authentication token by logging in"""
    login_data = {"username": USERNAME, "password": PASSWORD}

    try:
        logging.info("Attempting login...")
        response = requests.post(LOGIN_ENDPOINT, json=login_data)

        if response.status_code == 200:
            token = response.json().get("access", "")
            if not token:
                logging.error("Received empty access token.")
                return None
            print(f"Auth Token: {token}")
            logging.info("Successfully authenticated")
            return token
        else:
            logging.error(
                f"Authentication failed: {response.status_code} - {response.text}"
            )
            return None
    except Exception as e:
        logging.error(f"Error during authentication: {str(e)}")
        return None


def detect_encoding(file_path):
    """Detect the encoding of a file"""
    try:
        with open(file_path, "rb") as f:
            result = chardet.detect(f.read())
        logging.info(f"Detected encoding for {file_path}: {result['encoding']}")
        return result["encoding"]
    except Exception as e:
        logging.error(f"Error detecting file encoding: {str(e)}")
        return "utf-8"


def load_image_map():
    """Load the image mapping from the JSON file"""
    try:
        if os.path.exists(IMAGE_MAP_FILE):
            with open(IMAGE_MAP_FILE, "r") as f:
                logging.info(f"Loading image map from {IMAGE_MAP_FILE}")
                return json.load(f)
        else:
            logging.warning(f"Image map file {IMAGE_MAP_FILE} not found!")
            return {}
    except Exception as e:
        logging.error(f"Error loading image map: {str(e)}")
        return {}


def load_genre_map():
    """Load genre mapping from the provided JSON file"""
    try:
        if os.path.exists(GENRE_MAP_FILE):
            with open(GENRE_MAP_FILE, "r") as f:
                genre_data = json.load(f)
                genre_map = {
                    genre["name"].strip().lower(): str(genre["id"])
                    for genre in genre_data["genres"]
                    if genre["name"].strip() != "[]"
                }
                logging.info(f"Loaded {len(genre_map)} genres from {GENRE_MAP_FILE}")
                return genre_map
        else:
            logging.error(f"Genre map file {GENRE_MAP_FILE} not found!")
            return {}
    except Exception as e:
        logging.error(f"Error loading genre map: {str(e)}")
        return {}


def clean_genre(genre_str, genre_map):
    """Fix genre formatting from CSV"""
    try:
        genre_list = ast.literal_eval(genre_str)
        for g in genre_list:
            genre_id = genre_map.get(g.strip().lower())
            if genre_id:
                return [int(genre_id)]  # return integer ID
        return []
    except (SyntaxError, ValueError):
        return []


def load_movies_from_csv(auth_token, image_map, genre_map):
    """Load movies from CSV and send them to the API with image upload"""
    if not auth_token:
        logging.error("Cannot proceed without authentication token")
        return

    headers = {
        "Authorization": f"Bearer {auth_token}",
    }

    try:
        encoding = detect_encoding(CSV_FILE_PATH)

        with open(CSV_FILE_PATH, "r", encoding=encoding) as file:
            csv_reader = csv.DictReader(file)

            for row in csv_reader:
                title = row.get("name", "").strip()
                description = row.get("description", "").strip()
                raw_genres = row.get("genre", "").strip()
                release_date = row.get("date", "").strip()
                movie_id = row.get("id", "").strip()

                logging.info(f"Processing movie: {title} (ID: {movie_id})")

                genre_list = clean_genre(raw_genres, genre_map)
                genre_id = genre_list[0] if genre_list else None

                try:
                    parsed_date = datetime.strptime(release_date, "%m-%d-%Y")
                    release_date = parsed_date.strftime("%Y-%m-%dT00:00:00")
                except ValueError:
                    logging.warning(f"Invalid date format for {title}: {release_date}")
                    release_date = ""

                image_filename = image_map.get(movie_id)
                image_path = (
                    os.path.join(DEFAULT_IMAGE_PATH, image_filename)
                    if image_filename
                    else None
                )

                data = {
                    "title": title,
                    "type": 2,
                    "description": description,
                    "publish_date": release_date,
                    "genre": genre_id,
                }

                files = {}
                if image_path and os.path.exists(image_path):
                    try:
                        files["image"] = open(image_path, "rb")
                    except Exception as e:
                        logging.warning(
                            f"Could not open image file for {title}: {str(e)}"
                        )

                try:
                    response = requests.post(
                        MOVIES_ENDPOINT,
                        data=data,
                        files=files if files else None,
                        headers=headers,
                    )
                    if response.status_code == 201:
                        logging.info(f"Successfully added movie: {title}")
                    else:
                        logging.error(
                            f"Failed to add movie {title}. Status: {response.status_code}, Response: {response.text}"
                        )
                except Exception as e:
                    logging.error(f"Error sending movie {title} to API: {str(e)}")
                finally:
                    if "image" in files:
                        files["image"].close()

    except Exception as e:
        logging.error(f"Error processing CSV file: {str(e)}")


if __name__ == "__main__":
    logging.info("Script started")

    image_map = load_image_map()
    if not image_map:
        logging.warning(
            "No image mapping found! Make sure to run download_images.py first."
        )
        choice = (
            input("Do you want to continue without images? (y/n): ").strip().lower()
        )
        if choice != "y":
            logging.info("Exiting script. Run download_images.py first.")
            exit()

    genre_map = load_genre_map()
    if not genre_map:
        logging.error(
            "No genre mapping found! Cannot continue without valid genre map."
        )
        exit()

    auth_token = get_auth_token()
    if not auth_token:
        logging.error("Authentication failed. Cannot proceed with loading movies.")
        exit()

    load_movies_from_csv(auth_token, image_map, genre_map)
    logging.info("Finished loading movies.")


# import csv
# import requests
# import os
# import json
# import logging
# from datetime import datetime
# import chardet
# import ast  # Import for safe string-to-list conversion

# # Configure logging
# logging.basicConfig(
#     filename="script_debug.log",
#     level=logging.DEBUG,
#     format="%(asctime)s - %(levelname)s - %(message)s",
# )

# # Configuration
# CSV_FILE_PATH = "./large_files/movie_records.csv"
# API_BASE_URL = "http://localhost:8001/api"
# LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"
# MOVIES_ENDPOINT = f"{API_BASE_URL}/items/"
# DEFAULT_IMAGE_PATH = "./archive_new/posters/"
# IMAGE_MAP_FILE = "./large_files/movie_image_map.json"
# GENRE_MAP_FILE = "./large_files/genres.json"

# # Authentication credentials
# USERNAME = "admin"
# PASSWORD = "adminpassword"


# def get_auth_token():
#     """Get authentication token by logging in"""
#     login_data = {"username": USERNAME, "password": PASSWORD}

#     try:
#         logging.info("Attempting login...")
#         response = requests.post(LOGIN_ENDPOINT, json=login_data)

#         logging.debug(f"Login response status: {response.status_code}")
#         logging.debug(f"Login response text: {response.text}")

#         if response.status_code == 200:
#             token = response.json().get("access", "")
#             if not token:
#                 logging.error("Received empty access token.")
#                 return None
#             print(f"Auth Token: {token}")  # Debugging print
#             logging.info("Successfully authenticated")
#             return token
#         else:
#             logging.error(
#                 f"Authentication failed: {response.status_code} - {response.text}"
#             )
#             return None
#     except Exception as e:
#         logging.error(f"Error during authentication: {str(e)}")
#         return None


# def detect_encoding(file_path):
#     """Detect the encoding of a file"""
#     try:
#         with open(file_path, "rb") as f:
#             result = chardet.detect(f.read())
#         logging.info(f"Detected encoding for {file_path}: {result['encoding']}")
#         return result["encoding"]
#     except Exception as e:
#         logging.error(f"Error detecting file encoding: {str(e)}")
#         return "utf-8"


# def load_image_map():
#     """Load the image mapping from the JSON file"""
#     try:
#         if os.path.exists(IMAGE_MAP_FILE):
#             with open(IMAGE_MAP_FILE, "r") as f:
#                 logging.info(f"Loading image map from {IMAGE_MAP_FILE}")
#                 return json.load(f)
#         else:
#             logging.warning(f"Image map file {IMAGE_MAP_FILE} not found!")
#             return {}
#     except Exception as e:
#         logging.error(f"Error loading image map: {str(e)}")
#         return {}


# def load_genre_map():
#     """Load genre mapping from the provided JSON file"""
#     try:
#         if os.path.exists(GENRE_MAP_FILE):
#             with open(GENRE_MAP_FILE, "r") as f:
#                 genre_data = json.load(f)
#                 genre_map = {
#                     genre["name"].strip().lower(): str(genre["id"])
#                     for genre in genre_data["genres"]
#                 }
#                 logging.info(f"Loaded {len(genre_map)} genres from {GENRE_MAP_FILE}")
#                 return genre_map
#         else:
#             logging.error(f"Genre map file {GENRE_MAP_FILE} not found!")
#             return {}
#     except Exception as e:
#         logging.error(f"Error loading genre map: {str(e)}")
#         return {}


# def clean_genre(genre_str, genre_map):
#     """Fix genre formatting from CSV"""
#     try:
#         genre_list = ast.literal_eval(genre_str)  # Convert string to list safely
#         return [
#             genre_map.get(g.strip().lower(), "unknown")
#             for g in genre_list
#             if isinstance(g, str)
#         ]
#     except (SyntaxError, ValueError):
#         return ["unknown"]


# def load_movies_from_csv(auth_token, image_map, genre_map):
#     """Load movies from CSV and send them to the API"""
#     if not auth_token:
#         logging.error("Cannot proceed without authentication token")
#         return

#     headers = {
#         "Authorization": f"Bearer {auth_token}",
#         "Content-Type": "application/json",
#     }

#     try:
#         encoding = detect_encoding(CSV_FILE_PATH)

#         with open(CSV_FILE_PATH, "r", encoding=encoding) as file:
#             csv_reader = csv.DictReader(file)

#             for row in csv_reader:
#                 title = row.get("name", "").strip()
#                 description = row.get("description", "").strip()
#                 raw_genres = row.get("genre", "").strip()
#                 release_date = row.get("date", "").strip()
#                 movie_id = row.get("id", "").strip()

#                 logging.info(f"Processing movie: {title} (ID: {movie_id})")

#                 # Clean genre list using the dynamically loaded genre map
#                 genre_list = clean_genre(raw_genres, genre_map)

#                 # Parse release date
#                 try:
#                     parsed_date = datetime.strptime(release_date, "%m-%d-%Y")
#                     release_date = parsed_date.strftime("%Y-%m-%dT00:00:00")
#                 except ValueError:
#                     logging.warning(f"Invalid date format for {title}: {release_date}")
#                     release_date = ""

#                 # Get image path based on movie ID
#                 image_filename = image_map.get(movie_id, None)
#                 image_path = (
#                     os.path.join(DEFAULT_IMAGE_PATH, image_filename)
#                     if image_filename
#                     else None
#                 )

#                 # Prepare request payload
#                 data = {
#                     "title": title,
#                     "type": "2",
#                     "genre": genre_list,  # List of genre IDs
#                     "publish_date": release_date if release_date else "",
#                     "description": description,
#                 }

#                 # Debugging: Log exact payload before sending
#                 logging.debug(f"Payload for {title}: {json.dumps(data, indent=4)}")

#                 # Send request
#                 try:
#                     response = requests.post(
#                         MOVIES_ENDPOINT, json=data, headers=headers
#                     )
#                     if response.status_code == 201:
#                         logging.info(f"Successfully added movie: {title}")
#                     else:
#                         logging.error(
#                             f"Failed to add movie {title}. Status: {response.status_code}, Response: {response.text}"
#                         )
#                 except Exception as e:
#                     logging.error(f"Error sending movie {title} to API: {str(e)}")

#     except Exception as e:
#         logging.error(f"Error processing CSV file: {str(e)}")


# if __name__ == "__main__":
#     logging.info("Script started")

#     # Load image map
#     logging.info("Loading image mapping from file...")
#     image_map = load_image_map()

#     if not image_map:
#         logging.warning(
#             "No image mapping found! Make sure to run download_images.py first."
#         )
#         choice = (
#             input("Do you want to continue without images? (y/n): ").strip().lower()
#         )
#         if choice != "y":
#             logging.info("Exiting script. Run download_images.py first.")
#             exit()

#     # Load genre map from JSON file
#     logging.info("Loading genre map from JSON file...")
#     genre_map = load_genre_map()

#     if not genre_map:
#         logging.error(
#             "No genre mapping found! Cannot continue without valid genre map."
#         )
#         exit()

#     # Authenticate
#     logging.info("Starting authentication process...")
#     auth_token = get_auth_token()
#     if not auth_token:
#         logging.error("Authentication failed. Cannot proceed with loading movies.")
#         exit()

#     logging.info("Starting to load movies from CSV...")
#     load_movies_from_csv(auth_token, image_map, genre_map)
#     logging.info("Finished loading movies.")

# import csv
# import requests
# import os
# import json
# import logging
# from datetime import datetime
# import chardet

# # Configure logging
# logging.basicConfig(
#     filename="script_debug.log",
#     level=logging.DEBUG,
#     format="%(asctime)s - %(levelname)s - %(message)s",
# )

# # Configuration
# CSV_FILE_PATH = "./large_files/movie_records.csv"
# API_BASE_URL = "http://localhost:8001/api"
# LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"
# MOVIES_ENDPOINT = f"{API_BASE_URL}/items/"
# DEFAULT_IMAGE_PATH = "./../archive_new/posters/"
# IMAGE_MAP_FILE = "./movie_image_map.json"

# # Authentication credentials
# USERNAME = "admin"
# PASSWORD = "adminpassword"

# # Define a mapping of genre names to IDs
# GENRE_MAP = {
#     # Add more genres as needed
# }

# # Define x and y for row range. Change these as needed.
# X_ROW = 200  # Starting row (inclusive), set to 0 to process from beginning
# Y_ROW = 500  # Ending row (exclusive), set to None to process all rows


# def get_auth_token():
#     """Get authentication token by logging in"""
#     login_data = {"username": USERNAME, "password": PASSWORD}

#     try:
#         logging.info("Attempting login...")
#         response = requests.post(LOGIN_ENDPOINT, json=login_data)

#         logging.debug(f"Login response status: {response.status_code}")
#         logging.debug(f"Login response text: {response.text}")

#         if response.status_code == 200:
#             token = response.json().get("access", "")
#             logging.info("Successfully authenticated")
#             return token
#         else:
#             logging.error(f"Authentication failed: {response.status_code}")
#             return None
#     except Exception as e:
#         logging.error(f"Error during authentication: {str(e)}")
#         return None


# def detect_encoding(file_path):
#     """Detect the encoding of a file"""
#     try:
#         with open(file_path, "rb") as f:
#             result = chardet.detect(f.read())
#         logging.info(f"Detected encoding for {file_path}: {result['encoding']}")
#         return result["encoding"]
#     except Exception as e:
#         logging.error(f"Error detecting file encoding: {str(e)}")
#         return "utf-8"


# def load_image_map():
#     """Load the image mapping from the JSON file"""
#     try:
#         if os.path.exists(IMAGE_MAP_FILE):
#             with open(IMAGE_MAP_FILE, "r") as f:
#                 logging.info(f"Loading image map from {IMAGE_MAP_FILE}")
#                 return json.load(f)
#         else:
#             logging.warning(f"Image map file {IMAGE_MAP_FILE} not found!")
#             return {}
#     except Exception as e:
#         logging.error(f"Error loading image map: {str(e)}")
#         return {}


# def load_movies_from_csv(auth_token, image_map):
#     """Load movies from CSV and send them to the API"""
#     if not auth_token:
#         logging.error("Cannot proceed without authentication token")
#         return

#     headers = {"Authorization": f"Bearer {auth_token}"}

#     try:
#         encoding = detect_encoding(CSV_FILE_PATH)

#         with open(CSV_FILE_PATH, "r", encoding=encoding) as file:
#             csv_reader = csv.DictReader(file)
#             rows = list(csv_reader)  # Convert the reader to a list for easy indexing

#             # If X_ROW and Y_ROW are set to specific values, process only that range
#             rows_to_process = rows[X_ROW:Y_ROW] if Y_ROW else rows[X_ROW:]

#             for row in rows_to_process:
#                 title = row.get("name", "").strip()
#                 description = row.get("description", "").strip()
#                 genres = row.get("genre", "").strip()
#                 theme = row.get("theme", "").strip()
#                 release_date = row.get("date", "").strip()
#                 movie_id = row.get("id", "").strip()  # Get movie ID from the CSV

#                 logging.info(f"Processing movie: {title} (ID: {movie_id})")

#                 # Parse genre list
#                 try:
#                     genre_list = [g.strip().lower() for g in genres.split(",")]
#                     genre_id = GENRE_MAP.get(genre_list[0], "1") if genre_list else "1"
#                 except Exception as e:
#                     logging.warning(f"Error parsing genres for {title}: {str(e)}")
#                     genre_id = "1"

#                 # Parse release date
#                 try:
#                     parsed_date = datetime.strptime(release_date, "%m-%d-%Y")
#                     release_date = parsed_date.strftime("%Y-%m-%dT00:00:00")
#                 except ValueError:
#                     logging.warning(f"Invalid date format for {title}: {release_date}")
#                     release_date = ""

#                 # Get image path based on movie ID
#                 image_filename = image_map.get(movie_id, None)
#                 if image_filename:
#                     image_path = os.path.join(
#                         DEFAULT_IMAGE_PATH, image_filename
#                     )  # Concatenate the path
#                 else:
#                     logging.warning(
#                         f"No image found for movie ID {movie_id}, using default image."
#                     )
#                     image_path = DEFAULT_IMAGE_PATH

#                 # Prepare form data
#                 form_data = {
#                     "title": (None, title),
#                     "type": (None, "2"),
#                     "genre": (None, str(genre_id)),
#                     "publish_date": (None, release_date if release_date else ""),
#                     "description": (None, description),
#                     # "theme": (None, theme),
#                 }

#                 # Attach image file
#                 try:
#                     if os.path.isfile(image_path):
#                         with open(image_path, "rb") as img_file:
#                             file_ext = os.path.splitext(image_path)[1].lower()
#                             content_type = (
#                                 "image/jpeg"
#                                 if file_ext in [".jpg", ".jpeg"]
#                                 else "image/png"
#                             )
#                             form_data["image"] = (
#                                 os.path.basename(image_path),
#                                 img_file.read(),
#                                 content_type,
#                             )
#                     else:
#                         logging.warning(
#                             f"Image file {image_path} not found for {title}."
#                         )
#                 except Exception as e:
#                     logging.error(
#                         f"Error loading image {image_path} for {title}: {str(e)}"
#                     )

#                 # Send request
#                 try:
#                     response = requests.post(
#                         MOVIES_ENDPOINT, files=form_data, headers=headers
#                     )
#                     if response.status_code == 201:
#                         logging.info(f"Successfully added movie: {title}")
#                     else:
#                         logging.error(
#                             f"Failed to add movie {title}. Status: {response.status_code}, Response: {response.text}"
#                         )
#                 except Exception as e:
#                     logging.error(f"Error sending movie {title} to API: {str(e)}")

#     except Exception as e:
#         logging.error(f"Error processing CSV file: {str(e)}")


# if __name__ == "__main__":
#     logging.info("Script started")

#     # Load image map
#     logging.info("Loading image mapping from file...")
#     image_map = load_image_map()

#     if not image_map:
#         logging.warning(
#             "No image mapping found! Make sure to run the download_images.py script first."
#         )
#         choice = (
#             input("Do you want to continue without images? (y/n): ").strip().lower()
#         )
#         if choice != "y":
#             logging.info("Exiting script. Run download_images.py first.")
#             exit()

#     # Authenticate
#     logging.info("Starting authentication process...")
#     auth_token = get_auth_token()

#     if auth_token:
#         logging.info("Starting to load movies from CSV...")
#         load_movies_from_csv(auth_token, image_map)
#         logging.info("Finished loading movies.")
#     else:
#         logging.error("Authentication failed. Cannot proceed with loading movies.")
