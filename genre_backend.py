import requests
import json
import datetime

# Configuration
API_BASE_URL = "http://localhost:8001/api"  # Base API URL
LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"  # Login endpoint
GENRE_ENDPOINT = f"{API_BASE_URL}/genres/"  # Genres endpoint

# Authentication credentials
USERNAME = "admin"  # Replace with your username
PASSWORD = "adminpassword"  # Replace with your password

# Path to your genres JSON file
GENRES_JSON_PATH = "/Users/rishikarandev/DB Final Project/share_community/genres.json"  # Replace with your JSON file path


def get_auth_token():
    """Get authentication token by logging in"""
    login_data = {"username": USERNAME, "password": PASSWORD}

    try:
        # For Login, use JSON
        response = requests.post(LOGIN_ENDPOINT, json=login_data)

        if response.status_code == 200:
            # Extract token from response
            token_data = response.json()
            # Using 'access' as the key name for the token
            token = token_data.get("access", "")
            print(f"Successfully authenticated")
            return token
        else:
            print(f"Authentication failed. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None

    except Exception as e:
        print(f"Error during authentication: {str(e)}")
        return None


# def load_genres_from_json(json_file_path):
#     """Load genres from a JSON file"""
#     try:
#         with open(json_file_path, "r", encoding="utf-8") as file:
#             genres = json.load(file)
#             print(f"Successfully loaded {len(genres)} genres from {json_file_path}")
#             return genres
#     except Exception as e:
#         print(f"Error loading genres from JSON: {str(e)}")
#         return []


def load_genres_from_json(json_file_path):
    """Load genres from a JSON file"""
    try:
        with open(json_file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            genres = data.get("genres", [])
            print(f"Successfully loaded {len(genres)} genres from {json_file_path}")
            return genres
    except Exception as e:
        print(f"Error loading genres from JSON: {str(e)}")
        return []


def populate_genres_table(auth_token, genres_list):
    """Populate the genres table with genres from the JSON file"""
    if not auth_token:
        print("Cannot proceed without authentication token")
        return

    # Set up authentication header
    headers = {
        "Authorization": f"Bearer {auth_token}",
    }

    success_count = 0
    fail_count = 0

    for genre_item in genres_list:
        genre_id = genre_item.get("id")
        genre_name = genre_item.get("name")

        if not genre_id or not genre_name:
            print(f"Skipping invalid genre item: {genre_item}")
            continue

        # Create form data with createdAt
        form_data = {
            "id": (None, str(genre_id)),
            "name": (None, genre_name),
            "createdAt": (None, datetime.datetime.now().strftime("%Y-%m-%d")),
        }

        try:
            # Make POST request to create genre
            response = requests.post(GENRE_ENDPOINT, files=form_data, headers=headers)

            # Check if request was successful
            if response.status_code == 201:
                print(f"Successfully added genre: {genre_name}")
                success_count += 1
            else:
                print(
                    f"Failed to add genre: {genre_name}. Status code: {response.status_code}"
                )
                print(f"Response: {response.text}")
                fail_count += 1

        except Exception as e:
            print(f"Error adding genre {genre_name}: {str(e)}")
            fail_count += 1

    print(f"Genre import complete. Success: {success_count}, Failed: {fail_count}")


def main():
    # Start authentication process
    print("Starting authentication process...")
    auth_token = get_auth_token()

    if auth_token:
        # Load genres from JSON file
        genres = load_genres_from_json(GENRES_JSON_PATH)

        if genres:
            # Populate genres table
            print("Populating genres table...")
            populate_genres_table(auth_token, genres)
        else:
            print("No genres loaded. Cannot proceed.")
    else:
        print("Authentication failed. Cannot proceed.")


if __name__ == "__main__":
    main()
