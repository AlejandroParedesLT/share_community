import csv
import requests
from datetime import datetime
import ast  # For safely evaluating the string representation of Python lists
import os  # For file path handling
import chardet
import json
import re

# Configuration
CSV_FILE_PATH = "/Users/rishikarandev/Downloads/books_2k.csv"  # Update this to your CSV file path
API_BASE_URL = "http://localhost:8001/api"  # Base API URL
LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"  # Login endpoint
ITEMS_ENDPOINT = f"{API_BASE_URL}/items/"  # Items endpoint
DEFAULT_IMAGE_PATH = "/Users/rishikarandev/Downloads/sample_book.jpg"  # Path to a default image if none is provided
IMAGE_MAP_FILE = "/Users/rishikarandev/Downloads/image_map.json"  # File with the image mapping

# Authentication credentials
USERNAME = "admin"  # Replace with your username
PASSWORD = "adminpassword"  # Replace with your password

# Define a mapping of genre names to IDs (adjust with your actual IDs)
GENRE_MAP = {
    # Add more as needed
}


def get_auth_token():
    """Get authentication token by logging in"""
    login_data = {
        "username": USERNAME,
        "password": PASSWORD
    }
    
    try:
        # For login, use JSON
        response = requests.post(LOGIN_ENDPOINT, json=login_data)
        
        if response.status_code == 200:
            # Extract token from response
            token_data = response.json()
            # Using 'access' as the key name for the token
            token = token_data.get('access', '')
            print(f"Successfully authenticated")
            return token
        else:
            print(f"Authentication failed. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error during authentication: {str(e)}")
        return None


def detect_encoding(file_path):
    """Detect the encoding of a file"""
    with open(file_path, 'rb') as f:
        result = chardet.detect(f.read())
    return result['encoding']


def load_image_map():
    """Load the image mapping from the JSON file"""
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


def load_books_from_csv(auth_token, image_map):
    if not auth_token:
        print("Cannot proceed without authentication token")
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
                author = row.get("author", "")

                # Parse the genre list string and get the first genre
                genre_str = row.get("genres", "[]")
                try:
                    # Using ast.literal_eval to safely evaluate the string as a Python literal
                    genre_list = ast.literal_eval(genre_str)
                    first_genre = genre_list[0] if genre_list else ""
                    # Get genre ID from the mapping
                    genre_id = GENRE_MAP.get(first_genre.lower(), "1")
                except (SyntaxError, ValueError):
                    # Fallback if parsing fails
                    print(f"Warning: Could not parse genre for {title}. Using 1 as genre.")
                    genre_id = "1"

                # Parse release date
                releasedate = row.get("publishDate", None)
                if releasedate:
                    try:
                        # Parse date in format MM/DD/YY
                        parsed_date = datetime.strptime(releasedate, "%m/%d/%y")
                        # Convert to ISO 8601 format
                        releasedate = parsed_date.strftime("%Y-%m-%dT00:00:00")
                    except ValueError:
                        try:
                            # Parse date in format MM/DD/YYYY
                            parsed_date = datetime.strptime(releasedate, "%m/%d/%Y")
                            # Convert to ISO 8601 format
                            releasedate = parsed_date.strftime("%Y-%m-%dT00:00:00")
                        except ValueError:
                            # Try to handle natural language dates like "September 1st 1997"
                            try:
                                # Remove ordinal indicators (st, nd, rd, th)
                                cleaned_date = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', releasedate)
                                # Try to parse with format "Month Day Year"
                                date_obj = datetime.strptime(cleaned_date, '%B %d %Y')
                                releasedate = date_obj.strftime("%Y-%m-%dT00:00:00")
                            except ValueError:
                                print(f"Warning: Could not parse date '{releasedate}'. Using empty date.")
                                releasedate = ""

                # Extract other fields
                description = row.get("description", "")
                publisher = row.get("publisher", "")
                
                # Create multipart form data for non-file fields
                form_data = {
                    "title": (None, title),
                    "type": (None, "1"),  # Using string as in the curl example
                    "genre": (None, str(genre_id)),  # Use genre ID instead of name
                    "publish_date": (None, releasedate if releasedate else ""),
                    "description": (None, description),
                }
                
                # Get the local image path for this title
                image_path = image_map.get(title, DEFAULT_IMAGE_PATH)
                
                # Add image to form data
                if os.path.isfile(image_path):
                    with open(image_path, 'rb') as img_file:
                        image_content = img_file.read()
                        # Determine content type based on file extension
                        file_ext = os.path.splitext(image_path)[1].lower()
                        if file_ext == '.jpg' or file_ext == '.jpeg':
                            content_type = 'image/jpeg'
                        elif file_ext == '.png':
                            content_type = 'image/png'
                        else:
                            content_type = 'image/jpeg'  # Default to JPEG
                            
                        form_data["image"] = (os.path.basename(image_path), image_content, content_type)
                else:
                    # Use default image if the local file doesn't exist
                    if os.path.isfile(DEFAULT_IMAGE_PATH):
                        with open(DEFAULT_IMAGE_PATH, 'rb') as img_file:
                            form_data["image"] = (os.path.basename(DEFAULT_IMAGE_PATH), img_file.read(), 'image/jpeg')
                    else:
                        # If no image and no default, pass empty string
                        form_data["image"] = (None, "")

                # Make POST request using multipart/form-data
                try:
                    response = requests.post(ITEMS_ENDPOINT, files=form_data, headers=headers)

                    # Check if request was successful
                    if response.status_code == 201:
                        print(f"Successfully added book: {title}")
                    else:
                        print(
                            f"Failed to add book: {title}. Status code: {response.status_code}"
                        )
                        print(f"Response: {response.text}")

                except Exception as e:
                    print(f"Error adding book {title}: {str(e)}")
    
    except Exception as e:
        print(f"Error processing CSV file: {str(e)}")


if __name__ == "__main__":
    print("Loading image mapping from file...")
    image_map = load_image_map()
    
    if not image_map:
        print("WARNING: No image mapping found! Make sure to run the download_images.py script first.")
        print("Do you want to continue without images? (y/n)")
        choice = input().lower()
        if choice != 'y':
            print("Exiting. Please run the download_images.py script first.")
            exit()
    
    print("Starting authentication process...")
    auth_token = get_auth_token()
    
    if auth_token:
        print("Starting to load books from CSV...")
        load_books_from_csv(auth_token, image_map)
        print("Finished loading books.")
    else:
        print("Authentication failed. Cannot proceed with loading books.")