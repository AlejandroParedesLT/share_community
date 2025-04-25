import requests
import csv
import ast  # For safely evaluating string representations of list
import datetime  # For timestamped filenames
import chardet   # For detecting file encoding

# Configuration
API_BASE_URL = "http://localhost:8001/api"  # Base API URL
LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"  # Login endpoint
GENRE_ENDPOINT = f"{API_BASE_URL}/genres/"  # Genres endpoint
base_dir = "./sqlScripts/artifacts"  # Base directory for CSV files
# Authentication credentials
USERNAME = "admin"  # Replace with your username
PASSWORD = "adminpassword"  # Replace with your password

# CSV file paths
MOVIE_CSV_PATH = f"{base_dir}/movie_records.csv"  # Replace with your movie CSV file path
BOOK_CSV_PATH = f"{base_dir}/books_original.csv"        # Replace with your book CSV file path
MUSIC_CSV_PATH = f"{base_dir}/spotify_dataset_with_description.csv"  # Replace with your music CSV file path

# Column names for each CSV file
MOVIE_GENRE_COLUMN = "genre"
BOOK_GENRE_COLUMN = "genres"
MUSIC_GENRE_COLUMN = "genre"

class GenreIDMapper:
    def __init__(self):
        """
        Initialize an immutable, append-only genre ID mapper.
        """
        self._genre_to_id = {}
        self._id_to_genre = {}
        self._next_id = 1

    def add_genres(self, genres):
        """
        Add new genres to the mapper.
        
        Args:
            genres (set or list): New genres to add
        
        Returns:
            dict: Mapping of newly added genres to their IDs
        """
        # Track newly added genres
        new_genre_ids = {}
        
        for genre in genres:
            # Only add if genre doesn't already exist
            if genre not in self._genre_to_id:
                self._genre_to_id[genre] = self._next_id
                self._id_to_genre[self._next_id] = genre
                new_genre_ids[genre] = self._next_id
                self._next_id += 1
        
        return new_genre_ids

    def get_genre_id(self, genre):
        """
        Get the ID for a specific genre.
        
        Args:
            genre (str): Genre to look up
        
        Returns:
            int or None: ID of the genre, or None if not found
        """
        return self._genre_to_id.get(genre)

    def get_genre_by_id(self, genre_id):
        """
        Get the genre for a specific ID.
        
        Args:
            genre_id (int): ID to look up
        
        Returns:
            str or None: Genre corresponding to the ID, or None if not found
        """
        return self._id_to_genre.get(genre_id)

    def get_all_genres(self):
        """
        Get all current genres.
        
        Returns:
            dict: Mapping of all genres to their IDs
        """
        return dict(self._genre_to_id)

def get_auth_token():
    """Get authentication token by logging in"""
    login_data = {
        "username": USERNAME,
        "password": PASSWORD
    }

    try:
        # For Login, use JSON
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

def detect_file_encoding(file_path):
    """
    Detect the encoding of a file
    
    Args:
        file_path (str): Path to the file
    
    Returns:
        str: Detected encoding
    """
    with open(file_path, 'rb') as f:
        # Read a sample to determine encoding
        sample = f.read(10000)  # Read first 10000 bytes as sample
        result = chardet.detect(sample)
        encoding = result['encoding']
        confidence = result['confidence']
        print(f"Detected encoding: {encoding} with confidence: {confidence}")
        return encoding

def break_down_genres(genres_input, media_type="movie"):
    """
    Break down compound genres and create individual genre entries
    
    Args:
        genres_input (str or list): A string of comma-separated genres or a list of genres
        media_type (str): Type of media ('movie', 'book', or 'music') - for logging only
    
    Returns:
        set: Unique genres, preserving multi-word genres without splitting them
    """
    # Handle empty list case
    if genres_input == [] or genres_input == "[]" or not genres_input:
        return {"No Genre Detected"}
    
    # Handle both string and list inputs
    if isinstance(genres_input, str):
        # Handle empty string
        if not genres_input.strip():
            return {"No Genre Detected"}
        
        # For music, it's just a single genre
        if media_type.lower() == "music":
            genres = [genres_input.strip()]
        else:
            # For movies and books, handle as list or comma-separated values
            # Try to parse as a literal list if it looks like one
            if genres_input.startswith('[') and genres_input.endswith(']'):
                try:
                    genres = ast.literal_eval(genres_input)
                except (SyntaxError, ValueError):
                    # If parsing fails, treat as comma-separated
                    genres = [genre.strip() for genre in genres_input.split(',')]
            else:
                # Otherwise treat as comma-separated values
                genres = [genre.strip() for genre in genres_input.split(',')]
    else:
        # Handle empty list
        if not genres_input:
            return {"No Genre Detected"}
        genres = genres_input

    # Set to store unique genres
    unique_genres = set()

    for genre in genres:
        # Skip empty strings
        if not genre or genre.strip() == "":
            continue
            
        # Convert to proper case instead of lowercase
        genre = genre.strip().title()

        # Add the genre 
        unique_genres.add(genre)
    
    # If we ended up with an empty set (e.g., all empty strings), add the default
    if not unique_genres:
        unique_genres.add("No Genre Detected")

    return unique_genres

def extract_genres_from_csv(csv_file_path, genre_mapper, media_type, genre_column):
    """
    Extract genres from a CSV file
    
    Args:
        csv_file_path (str): Path to the CSV file
        genre_mapper (GenreIDMapper): Genre mapper instance
        media_type (str): Type of media ('movie', 'book', or 'music') - for logging only
        genre_column (str): Name of the column containing genre information
    
    Returns:
        set: Unique genres extracted from the CSV
    """
    unique_genres = set()
    
    try:
        # Detect file encoding
        encoding = detect_file_encoding(csv_file_path)
        
        # Try different encodings if the confidence is low
        encodings_to_try = [encoding, 'latin-1', 'cp1252', 'ISO-8859-1']
        
        # Try each encoding until successful
        for enc in encodings_to_try:
            try:
                with open(csv_file_path, 'r', encoding=enc) as csv_file:
                    print(f"Trying to read {csv_file_path} with encoding: {enc}")
                    csv_reader = csv.DictReader(csv_file)
                    
                    # Process rows
                    row_count = 0
                    for i, row in enumerate(csv_reader):
                        row_count += 1
                        
                        # Extract genres from the row
                        genres_str = row.get(genre_column, '')
                        
                        try:
                            # Break down genres based on media type
                            item_genres = break_down_genres(genres_str, media_type)
                            
                            # Add to unique genres set
                            unique_genres.update(item_genres)
                            
                        except (SyntaxError, ValueError) as e:
                            print(f"Error parsing genres for row {i+1} in {media_type} data")
                            print(f"Genres string: {genres_str}")
                            print(f"Error: {e}")
                    
                    print(f"Successfully read {row_count} rows from {csv_file_path} with encoding {enc}")
                    break  # Break the encoding loop if successful
                    
            except UnicodeDecodeError as e:
                print(f"Failed to read {csv_file_path} with encoding {enc}: {e}")
                if enc == encodings_to_try[-1]:
                    print(f"All encoding attempts failed for {csv_file_path}")
                continue
    
    except Exception as e:
        print(f"Error reading CSV file {csv_file_path}: {str(e)}")
    
    # Add these genres to the mapper
    genre_mapper.add_genres(unique_genres)
    
    print(f"Unique {media_type} genres from CSV: {len(unique_genres)}")
    return unique_genres

def save_genres_to_csv(genre_mapper, output_file="genre_mappings.csv"):
    """
    Save all genres and their IDs to a CSV file
    
    Args:
        genre_mapper (GenreIDMapper): The genre mapper containing the mappings
        output_file (str): Path to the output CSV file
    """
    try:
        with open(output_file, 'w', newline='', encoding='utf-8') as csv_file:
            csv_writer = csv.writer(csv_file)
            
            # Write header
            csv_writer.writerow(['genre_id', 'genre_name'])
            
            # Get all genres and sort by ID
            all_genres = genre_mapper.get_all_genres()
            sorted_genres = sorted(all_genres.items(), key=lambda x: x[1])
            
            # Write each genre and its ID
            for genre, genre_id in sorted_genres:
                csv_writer.writerow([genre_id, genre])
            
            print(f"Successfully saved {len(all_genres)} genres to {output_file}")
    
    except Exception as e:
        print(f"Error saving genres to CSV: {str(e)}")

def populate_genres_table(auth_token, genre_mapper):
    """Populate the genres table with unique genres"""
    if not auth_token:
        print("Cannot proceed without authentication token")
        return
    
    # Set up authentication header
    headers = {
        "Authorization": f"Bearer {auth_token}",
    }

    # Get all genres from the mapper
    all_genres = genre_mapper.get_all_genres()

    for genre, genre_id in all_genres.items():
        # Create form data
        form_data = {
            "id": (None, str(genre_id)), 
            "name": (None, genre),
            "createdAt": (None, datetime.datetime.now().strftime("%Y-%m-%d")),
        }

        try:
            # Make POST request to create genre
            response = requests.post(GENRE_ENDPOINT, files=form_data, headers=headers)

            # Check if request was successful
            if response.status_code == 201:
                print(f"Successfully added genre: {genre}")
            else:
                print(f"Failed to add genre: {genre}. Status code: {response.status_code}")
                print(f"Response: {response.text}")
            
        except Exception as e:
            print(f"Error adding genre {genre}: {str(e)}")

def main():
    # Initialize the genre mapper
    genre_mapper = GenreIDMapper()

    # Start authentication process
    print("Starting authentication process...")
    auth_token = get_auth_token()

    if auth_token:
        # Process movies
        if MOVIE_CSV_PATH:
            print(f"Extracting unique genres from movie CSV...")
            movie_genres = extract_genres_from_csv(MOVIE_CSV_PATH, genre_mapper, "movie", MOVIE_GENRE_COLUMN)
            print(f"Found {len(movie_genres)} unique movie genres")
        
        # Process books
        if BOOK_CSV_PATH:
            print(f"Extracting unique genres from book CSV...")
            book_genres = extract_genres_from_csv(BOOK_CSV_PATH, genre_mapper, "book", BOOK_GENRE_COLUMN)
            print(f"Found {len(book_genres)} unique book genres")
        
        # Process music
        if MUSIC_CSV_PATH:
            print(f"Extracting unique genres from music CSV...")
            music_genres = extract_genres_from_csv(MUSIC_CSV_PATH, genre_mapper, "music", MUSIC_GENRE_COLUMN)
            print(f"Found {len(music_genres)} unique music genres")

        print("\nAll Unique Genres Found:")
        all_genres = genre_mapper.get_all_genres()
        
        # Print all genres sorted by ID
        for genre, genre_id in sorted([(g, genre_mapper.get_genre_id(g)) for g in all_genres], key=lambda x: x[1]):
            print(f"{genre}: {genre_id}")
        
        print(f"\nTotal unique genres across all media types: {len(all_genres)}")
        
        # Save genres to CSV for reference
        # Use timestamped filename to track changes over time
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        save_genres_to_csv(genre_mapper, f"genre_mappings_{timestamp}.csv")
        
        # Also save to a standard filename that gets overwritten each time
        save_genres_to_csv(genre_mapper, "genre_mappings_latest.csv")

        # Populate genres table
        print("Populating genres table...")
        populate_genres_table(auth_token, genre_mapper)

    else:
        print("Authentication failed. Cannot proceed.")


if __name__ == "__main__":
    main()