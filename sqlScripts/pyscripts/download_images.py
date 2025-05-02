import csv
import requests
import os
from urllib.parse import urlparse
import json

# Configuration
CSV_FILE_PATH = "/home/nd191/share_community/load_database/final_books_for_db (1).csv"  # Update this to your CSV file path
IMAGES_DIR = "./artifacts/book_images"  # Directory to store downloaded images
DEFAULT_IMAGE_PATH = "/home/nd191/share_community/sqlScripts/popeye.jpg"  # Path to a default image if none is provided
IMAGE_MAP_FILE = "./image_map.json"  # File to store the mapping


def download_image(url, save_path):
    """Download image from URL and save to path"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            # Get filename from URL
            parsed_url = urlparse(url)
            filename = os.path.basename(parsed_url.path)
            
            # If filename is empty or doesn't have an extension, use a default
            if not filename or '.' not in filename:
                filename = f"book_cover_{hash(url)}.jpg"
                
            # Create full file path
            file_path = os.path.join(save_path, filename)
            
            # Save the image
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
    """Try different encodings to read the CSV file"""
    # List of encodings to try
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
    
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                # Try reading a few lines to see if encoding works
                for _ in range(5):
                    f.readline()
            # If we get here, encoding worked
            print(f"Found working encoding: {encoding}")
            return encoding
        except UnicodeDecodeError:
            continue
    
    # If all encodings fail, try binary mode with latin-1 (which rarely fails)
    print("All standard encodings failed, using latin-1 as fallback")
    return 'latin-1'


def download_all_images_from_csv():
    """Download all images from the CSV file to a local folder"""
    # Create images directory if it doesn't exist
    os.makedirs(IMAGES_DIR, exist_ok=True)
    
    # Dictionary to store title -> local image path mapping
    image_map = {}
    
    try:
        # Try different encodings to find one that works
        encoding = try_different_encodings(CSV_FILE_PATH)
        print(f"Using encoding: {encoding}")
        
        # Open the file with the detected encoding
        with open(CSV_FILE_PATH, "r", encoding=encoding, errors='replace') as file:
            # Use errors='replace' to replace undecodable bytes with a replacement character
            csv_reader = csv.DictReader(file)
            
            for row in csv_reader:
                title = row.get("title", "")
                if not title:
                    continue  # Skip rows without titles
                    
                # Look for image URL in either 'coverImg' or 'image' column
                image_url = row.get("coverImg", "") or row.get("image", "")
                
                if image_url and (image_url.startswith('http://') or image_url.startswith('https://')):
                    print(f"Downloading image for '{title}' from: {image_url}")
                    local_path = download_image(image_url, IMAGES_DIR)
                    if local_path:
                        image_map[title] = local_path
                    else:
                        image_map[title] = DEFAULT_IMAGE_PATH
                else:
                    # Use default image if no URL is provided
                    image_map[title] = DEFAULT_IMAGE_PATH
        
        # Save the image map to a JSON file for later use
        with open(IMAGE_MAP_FILE, 'w') as f:
            json.dump(image_map, f, indent=2)
            
        print(f"Image mapping saved to {IMAGE_MAP_FILE}")
        return image_map
        
    except Exception as e:
        print(f"Error processing CSV file for image download: {str(e)}")
        import traceback
        traceback.print_exc()  # Print full traceback for debugging
        return {}


if __name__ == "__main__":
    print("Starting to download all images...")
    image_map = download_all_images_from_csv()
    print(f"Downloaded {len(image_map)} images.")
    print(f"Image mapping has been saved to {IMAGE_MAP_FILE} for later use.")
