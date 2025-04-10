import csv
import requests
import os
from urllib.parse import urlparse
import json

# Configuration
CSV_FILE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/Final/spotify_dataset_final.csv"
IMAGES_DIR = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/audio_images/"
DEFAULT_IMAGE_PATH = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/audio_images/default_album.jpg"
IMAGE_MAP_FILE = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/image_map.json"


def download_image(url, save_path):
    """Download image from URL and save to path"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            parsed_url = urlparse(url)
            filename = os.path.basename(parsed_url.path)

            if not filename or '.' not in filename:
                filename = f"music_cover_{hash(url)}.jpg"

            file_path = os.path.join(save_path, filename)

            with open(file_path, 'wb') as f:
                f.write(response.content)

            print(f"Successfully downloaded image to {file_path}")
            return file_path
        else:
            print(f"Failed to download image from {url}. Status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error downloading image from {url}: {str(e)}")
        return None


def try_different_encodings(file_path):
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                for _ in range(5):
                    f.readline()
            print(f"Found working encoding: {encoding}")
            return encoding
        except UnicodeDecodeError:
            continue
    print("All standard encodings failed, using latin-1 as fallback")
    return 'latin-1'


def download_all_images_from_csv():
    os.makedirs(IMAGES_DIR, exist_ok=True)
    image_map = {}

    try:
        encoding = try_different_encodings(CSV_FILE_PATH)
        print(f"Using encoding: {encoding}")

        with open(CSV_FILE_PATH, "r", encoding=encoding, errors='replace') as file:
            csv_reader = csv.DictReader(file)

            for row in csv_reader:
                # Get unique key using track_id
                track_id = row.get("track_id", "").strip()
                if not track_id:
                    print("Skipping row without track_id")
                    continue

                image_url = row.get("cover_img_url", "").strip() or row.get("image", "").strip()

                if image_url.startswith("http://") or image_url.startswith("https://"):
                    print(f"Downloading image for track_id {track_id} from: {image_url}")
                    local_path = download_image(image_url, IMAGES_DIR)
                    image_map[track_id] = local_path if local_path else DEFAULT_IMAGE_PATH
                else:
                    image_map[track_id] = DEFAULT_IMAGE_PATH

        with open(IMAGE_MAP_FILE, 'w') as f:
            json.dump(image_map, f, indent=2)

        print(f"Image mapping saved to {IMAGE_MAP_FILE}")
        return image_map

    except Exception as e:
        print(f"Error processing CSV file for image download: {str(e)}")
        import traceback
        traceback.print_exc()
        return {}


if __name__ == "__main__":
    print("Starting to download all images...")
    image_map = download_all_images_from_csv()
    print(f"Downloaded {len(image_map)} images.")
    print(f"Image mapping has been saved to {IMAGE_MAP_FILE} for later use.")