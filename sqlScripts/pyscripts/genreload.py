import json
import os
import requests
import time
import datetime

# === Configuration ===
API_BASE_URL = "http://localhost:8001/api"  # Or replace with Ngrok URL
LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"
GENRE_ENDPOINT = f"{API_BASE_URL}/genres/"
USERNAME = "admin"
PASSWORD = "adminpassword"
JSON_FILE_PATH = "/home/nd191/share_community/sqlScripts/json/genres.json"


# === Step 1: Authenticate and get token ===
def get_auth_token():
    login_data = {"username": USERNAME, "password": PASSWORD}
    try:
        response = requests.post(LOGIN_ENDPOINT, json=login_data)
        if response.status_code == 200:
            token = response.json().get("access", "")
            print("✅ Successfully authenticated")
            return token
        else:
            print(f"❌ Authentication failed. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error during authentication: {str(e)}")
        return None


# === Step 2: Read genres from JSON file ===
def read_genres_from_json(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get("genres", [])
    except Exception as e:
        print(f"❌ Error reading JSON file {file_path}: {str(e)}")
        return []


# === Step 3: Upload each genre ===
def load_static_genres_from_file(auth_token, json_path):
    genres = read_genres_from_json(json_path)

    if not genres:
        print("⚠️ No genres found to upload.")
        return

    headers = {
        "Authorization": f"Bearer {auth_token}",
    }

    for genre in genres:
        form_data = {
            "id": (None, str(genre["id"])),
            "name": (None, genre["name"]),
            "createdAt": (None, datetime.datetime.now().strftime("%Y-%m-%d")),
        }

        try:
            response = requests.post(GENRE_ENDPOINT, files=form_data, headers=headers)
            if response.status_code == 201:
                print(f"✅ Inserted genre: {genre['name']}")
            else:
                print(f"❌ Failed to insert {genre['name']} - {response.status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Error inserting {genre['name']}: {str(e)}")

        time.sleep(0.2)


# === Main Entry Point ===
def main():
    print("🔐 Authenticating...")
    auth_token = get_auth_token()

    if not auth_token:
        print("❌ Cannot proceed without authentication.")
        return

    print(f"📂 Reading genres from {JSON_FILE_PATH}")
    load_static_genres_from_file(auth_token, JSON_FILE_PATH)


if __name__ == "__main__":
    main()
