import pandas as pd
import numpy as np
import random
import uuid

def load_datasets(books_path='merged_books.csv', 
                  music_path='Music_User_ID_Popularity.csv',
                  movies_path='shortened_movie_users.csv'):
    """Load the three datasets."""
    books_df = pd.read_csv(books_path)
    music_df = pd.read_csv(music_path)
    movies_df = pd.read_csv(movies_path)
    
    print(f"Books dataset: {len(books_df)} rows, {books_df['User-ID'].nunique()} unique users")
    print(f"Music dataset: {len(music_df)} rows, {music_df['user_id'].nunique()} unique users")
    print(f"Movies dataset: {len(movies_df)} rows, {movies_df['user_id'].nunique()} unique users")
    
    return books_df, music_df, movies_df

def create_integrated_dataset(books_df, music_df, movies_df, 
                              output_path='unified_preferences.csv',
                              mapping_path='unified_user_mapping.csv'):
    """
    Create an integrated dataset using the minimum number of users across datasets.
    Each user will have real data from all three domains.
    """
    print("Creating integrated dataset with minimum user count across domains...")
    
    # Get unique users from each dataset
    book_users = books_df['User-ID'].unique()
    music_users = music_df['user_id'].unique()
    movie_users = movies_df['user_id'].unique()
    
    print(f"Available unique users - Books: {len(book_users)}, Music: {len(music_users)}, Movies: {len(movie_users)}")
    
    # Use the minimum number of users across all datasets
    min_users_count = min(len(book_users), len(music_users), len(movie_users))
    print(f"Using {min_users_count} users as baseline (minimum across datasets)")
    
    # Randomly select users from each dataset
    selected_book_users = np.random.choice(book_users, min_users_count, replace=False)
    selected_music_users = np.random.choice(music_users, min_users_count, replace=False)
    selected_movie_users = np.random.choice(movie_users, min_users_count, replace=False)
    
    # Create user mapping
    synthetic_users = []
    
    # For each index, create a mapping between the three domains
    for i in range(min_users_count):
        synthetic_users.append({
            'user_id': i + 1,  # New unified ID
            'book_user_id': selected_book_users[i],
            'music_user_id': selected_music_users[i],
            'movie_user_id': selected_movie_users[i]
        })
    
    # Create a user mapping dataframe
    user_map = pd.DataFrame(synthetic_users)
    
    # Prepare the integrated dataset
    integrated_data = []
    book_count = 0
    music_count = 0
    movie_count = 0
    
    # Process each user
    for _, user in user_map.iterrows():
        user_id = user['user_id']  # Unified user ID
        book_user = user['book_user_id']
        music_user = user['music_user_id']
        movie_user = user['movie_user_id']
        
        # Books
        user_books = books_df[books_df['User-ID'] == book_user]
        for _, row in user_books.iterrows():
            integrated_data.append({
                'user_id': user_id,
                'item_id': row['ISBN'],
                'item_type': 1,  # 1 for books
            })
            book_count += 1
        
        # Music
        user_music = music_df[music_df['user_id'] == music_user]
        for _, row in user_music.iterrows():
            integrated_data.append({
                'user_id': user_id,
                'item_id': row['track_id'],
                'item_type': 3,  # 3 for music
            })
            music_count += 1
        
        # Movies
        user_movies = movies_df[movies_df['user_id'] == movie_user]
        for _, row in user_movies.iterrows():
            integrated_data.append({
                'user_id': user_id,
                'item_id': row['id'],
                'item_type': 2,  # 2 for movies
            })
            movie_count += 1
    
    # Create and save the integrated dataset
    integrated_df = pd.DataFrame(integrated_data)
    integrated_df.to_csv(output_path, index=False)
    
    # Save the user mapping
    user_mapping_df = user_map
    user_mapping_df.to_csv(mapping_path, index=False)
    
    print("Saving results...")
    print("Final Statistics:")
    print(f"Total records: {len(integrated_df)}")
    print(f"Unique users: {integrated_df['user_id'].nunique()}")
    print(f"Book records: {book_count}")
    print(f"Movie records: {movie_count}")
    print(f"Music records: {music_count}")
    print(f"Average records per user: {len(integrated_df) / integrated_df['user_id'].nunique():.2f}")
    
    print("Sample data:")
    print(integrated_df.head())
    
    return integrated_df, user_mapping_df

def main(books_path='merged_books.csv', 
         music_path='Music_User_ID_Popularity.csv',
         movies_path='shortened_movie_users.csv'):
    """Main function to run the entire process using minimum users across datasets."""
    print("Loading datasets...")
    books_df, music_df, movies_df = load_datasets(books_path, music_path, movies_path)
    
    integrated_df, user_mapping_df = create_integrated_dataset(
        books_df=books_df,
        music_df=music_df,
        movies_df=movies_df,
        output_path='unified_preferences.csv',
        mapping_path='unified_user_mapping.csv'
    )
    
    return integrated_df, user_mapping_df

if __name__ == "__main__":
    # Create the integrated dataset with minimum users across datasets
    integrated_df, user_mapping_df = main()