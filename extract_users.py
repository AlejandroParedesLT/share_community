import os
import pandas as pd
import re
import glob


def find_movielens_directory():
    """
    Try to find the MovieLens data directory in the current path or parent paths.
    """
    # Check current directory
    if os.path.exists("ml-100k"):
        return "ml-100k"

    # Check if we're in a subdirectory of where the data is
    current_dir = os.getcwd()
    parent_dir = os.path.dirname(current_dir)

    possible_paths = [
        os.path.join(current_dir, "ml-100k"),
        os.path.join(parent_dir, "ml-100k"),
        os.path.join(current_dir, "large_files_new", "ml-100k"),
        os.path.join(parent_dir, "large_files_new", "ml-100k"),
    ]

    for path in possible_paths:
        if os.path.exists(path):
            return path

    return None


def explore_directory(directory):
    """
    Explore a directory to find MovieLens data files.
    """
    print(f"Exploring directory: {directory}")
    print("Files found:")

    for root, dirs, files in os.walk(directory):
        for file in files:
            print(f"  - {os.path.join(root, file)}")

        # Only go one level deep
        break

    # Check for specific MovieLens files
    data_file = os.path.join(directory, "u.data")
    item_file = os.path.join(directory, "u.item")
    user_file = os.path.join(directory, "u.user")

    return {
        "data_exists": os.path.exists(data_file),
        "item_exists": os.path.exists(item_file),
        "user_exists": os.path.exists(user_file),
    }


def convert_movielens_to_csv(ml_dir=None, output_dir="ml-100k-csv"):
    """
    Convert MovieLens 100K dataset from tab-separated format to CSV.

    Parameters:
    ml_dir (str): Directory containing the MovieLens 100K dataset
    output_dir (str): Directory to save the CSV files
    """
    # Find the MovieLens directory if not specified
    if ml_dir is None:
        ml_dir = find_movielens_directory()
        if ml_dir is None:
            print("Error: Could not find the MovieLens data directory.")
            print(f"Current working directory: {os.getcwd()}")
            print("Please specify the correct path to the ml-100k directory.")
            return None

    print(f"Using MovieLens directory: {ml_dir}")

    # Check if the necessary files exist
    file_info = explore_directory(ml_dir)
    if not all(file_info.values()):
        print("Error: Some required MovieLens files are missing:")
        for file_type, exists in file_info.items():
            print(f"  - {file_type}: {'Found' if exists else 'Missing'}")
        return None

    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}")

    # Process ratings (u.data)
    try:
        print("Processing ratings data...")
        ratings_file = os.path.join(ml_dir, "u.data")
        print(f"Reading from: {ratings_file}")
        ratings_cols = ["user_id", "movie_id", "rating", "timestamp"]
        ratings = pd.read_csv(ratings_file, sep="\t", names=ratings_cols)
        ratings.to_csv(os.path.join(output_dir, "ratings.csv"), index=False)
        print(f"Saved ratings data: {len(ratings)} ratings")

        # Process movies (u.item)
        print("Processing movie data...")
        movies_file = os.path.join(ml_dir, "u.item")
        print(f"Reading from: {movies_file}")
        movies_cols = [
            "movie_id",
            "title",
            "release_date",
            "video_release_date",
            "imdb_url",
        ] + [
            "unknown",
            "Action",
            "Adventure",
            "Animation",
            "Children",
            "Comedy",
            "Crime",
            "Documentary",
            "Drama",
            "Fantasy",
            "Film-Noir",
            "Horror",
            "Musical",
            "Mystery",
            "Romance",
            "Sci-Fi",
            "Thriller",
            "War",
            "Western",
        ]
        movies = pd.read_csv(
            movies_file, sep="|", names=movies_cols, encoding="latin-1"
        )
        movies.to_csv(os.path.join(output_dir, "movies.csv"), index=False)
        print(f"Saved movie data: {len(movies)} movies")

        # Process users (u.user)
        print("Processing user data...")
        users_file = os.path.join(ml_dir, "u.user")
        print(f"Reading from: {users_file}")
        users_cols = ["user_id", "age", "gender", "occupation", "zip_code"]
        users = pd.read_csv(users_file, sep="|", names=users_cols)
        users.to_csv(os.path.join(output_dir, "users.csv"), index=False)
        print(f"Saved user data: {len(users)} users")

        # Create a merged dataset with user ratings and movie details
        print("Creating a merged dataset...")
        merged_data = pd.merge(ratings, movies[["movie_id", "title"]], on="movie_id")
        merged_data = pd.merge(merged_data, users, on="user_id")
        merged_data.to_csv(os.path.join(output_dir, "merged_ratings.csv"), index=False)
        print(f"Saved merged dataset with {len(merged_data)} entries")

        # Create a genre matrix as a separate file
        print("Creating genre matrix...")
        genre_cols = movies_cols[5:]  # All genre columns
        genre_matrix = movies[["movie_id", "title"] + genre_cols]
        genre_matrix.to_csv(os.path.join(output_dir, "movie_genres.csv"), index=False)
        print(f"Saved genre matrix for {len(genre_matrix)} movies")

        print("\nData cleaning complete! CSV files saved to:", output_dir)
        return {
            "ratings": os.path.join(output_dir, "ratings.csv"),
            "movies": os.path.join(output_dir, "movies.csv"),
            "users": os.path.join(output_dir, "users.csv"),
            "merged": os.path.join(output_dir, "merged_ratings.csv"),
            "genres": os.path.join(output_dir, "movie_genres.csv"),
        }
    except Exception as e:
        print(f"Error during conversion: {str(e)}")
        return None


def print_dataset_summary(files):
    """
    Print a summary of the datasets.
    """
    print("\nDataset summary:")

    # Ratings summary
    ratings = pd.read_csv(files["ratings"])
    print(
        f"Ratings: {len(ratings)} entries from {ratings['user_id'].nunique()} users on {ratings['movie_id'].nunique()} movies"
    )
    print(
        f"Rating distribution: {ratings['rating'].value_counts().sort_index().to_dict()}"
    )

    # Movies summary
    movies = pd.read_csv(files["movies"])
    print(f"Movies: {len(movies)} entries")

    # Users summary
    users = pd.read_csv(files["users"])
    print(f"Users: {len(users)} entries")
    gender_dist = users["gender"].value_counts()
    print(f"Gender distribution: {gender_dist.to_dict()}")

    # Age distribution
    age_bins = [0, 18, 25, 35, 45, 55, 100]
    age_labels = ["<18", "18-24", "25-34", "35-44", "45-54", "55+"]
    users["age_group"] = pd.cut(users["age"], bins=age_bins, labels=age_labels)
    age_dist = users["age_group"].value_counts().sort_index()
    print(f"Age distribution: {age_dist.to_dict()}")

    # Top occupations
    occ_dist = users["occupation"].value_counts().head(5)
    print(f"Top 5 occupations: {occ_dist.to_dict()}")

    # Genre popularity
    genres = pd.read_csv(files["genres"])
    genre_cols = [col for col in genres.columns if col not in ["movie_id", "title"]]
    genre_popularity = {genre: genres[genre].sum() for genre in genre_cols}
    sorted_genres = sorted(genre_popularity.items(), key=lambda x: x[1], reverse=True)
    print("Top 5 genres:")
    for genre, count in sorted_genres[:5]:
        print(f"  - {genre}: {count} movies")


if __name__ == "__main__":
    print(f"Current working directory: {os.getcwd()}")

    # Try to find the ml-100k directory
    ml_dir = find_movielens_directory()

    if ml_dir is None:
        print("Could not automatically find the ml-100k directory.")
        user_input = input("Please enter the full path to the ml-100k directory: ")
        if user_input and os.path.exists(user_input):
            ml_dir = user_input
        else:
            print("Invalid directory. Exiting.")
            exit(1)

    # Set the output directory
    output_dir = "ml-100k-csv"

    # Convert the data to CSV
    files = convert_movielens_to_csv(ml_dir, output_dir)

    # Print a summary of the datasets if successful
    if files:
        print_dataset_summary(files)
