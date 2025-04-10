import csv
import requests
from datetime import datetime
import ast  # For safely evaluating the string representation of Python lists
import os  # For file path handling
import chardet
import json
import re

# Configuration
CSV_FILE_PATH = "/Users/nrutachoudhari/Downloads/countries.csv"  # Update this to your CSV file path
API_BASE_URL = "http://localhost:8001/api"  # Base API URL
LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"  # Login endpoint
ITEMS_ENDPOINT = f"{API_BASE_URL}/items/"  # Items endpoint

# Authentication credentials
USERNAME = "admin"  # Replace with your username
PASSWORD = "adminpassword"  # Replace with your password

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

def load_countries_from_csv(auth_token):
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
                name = row.get("Country", "")
                region = row.get("Region", "")
                lat = row.get("Latitude", "")
                lon = row.get("Longitude", "")

                # Create multipart form data for non-file fields
                form_data = {
                    "title": (None, name),
                    "region": (None, region),  # Use genre ID instead of name
                    "lat": (None, lat),
                    "lon": (None, lon),
                }

                # Make POST request using multipart/form-data
                try:
                    response = requests.post(ITEMS_ENDPOINT, files=form_data, headers=headers)

                    # Check if request was successful
                    if response.status_code == 201:
                        print(f"Successfully added country: {name}")
                    else:
                        print(
                            f"Failed to add country: {name}. Status code: {response.status_code}"
                        )
                        print(f"Response: {response.text}")

                except Exception as e:
                    print(f"Error adding country {name}: {str(e)}")
    
    except Exception as e:
        print(f"Error processing CSV file: {str(e)}")


if __name__ == "__main__":

    print("Starting authentication process...")
    auth_token = get_auth_token()
    
    if auth_token:
        print("Starting to load countries from CSV...")
        load_countries_from_csv(auth_token)
        print("Finished countries books.")
    else:
        print("Authentication failed. Cannot proceed with loading countries.")
