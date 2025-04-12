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
                              n_users=200, records_per_user=50,
                              simulate_missing=True,
                              output_path='unified_preferences.csv',
                              mapping_path='unified_user_mapping.csv'):
    """
    Create an integrated dataset with users from all three domains,
    not restricted by the smallest dataset.
    """
    print("Creating integrated dataset...")
    
    # Get unique users from each dataset
    book_users = books_df['User-ID'].unique()
    music_users = music_df['user_id'].unique()
    movie_users = movies_df['user_id'].unique()
    
    print(f"Available unique users - Books: {len(book_users)}, Music: {len(music_users)}, Movies: {len(movie_users)}")
    
    # Determine the target number of users
    n_users_actual = min(n_users, max(len(book_users), len(music_users), len(movie_users)))
    
    if n_users_actual < n_users:
        print(f"Warning: Reducing target users to {n_users_actual} due to dataset limitations")
    
    # Create synthetic users by randomly assigning IDs from each domain
    synthetic_users = []
    book_users_list = list(book_users)
    music_users_list = list(music_users)
    movie_users_list = list(movie_users)
    
    for i in range(n_users_actual):
        # Randomly select a user ID from each domain
        book_user = random.choice(book_users_list) if book_users_list else None
        music_user = random.choice(music_users_list) if music_users_list else None
        movie_user = random.choice(movie_users_list) if movie_users_list else None
        
        synthetic_users.append({
            'user_id': i + 1,
            'book_user_id': book_user,
            'music_user_id': music_user,
            'movie_user_id': movie_user
        })
    
    # Create a user mapping dataframe
    user_map = pd.DataFrame(synthetic_users)
    
    # Prepare the integrated dataset
    integrated_data = []
    simulated_count = 0
    book_count = 0
    music_count = 0
    movie_count = 0
    
    # Process each synthetic user
    for _, user in user_map.iterrows():
        user_id = user['user_id']
        book_user = user['book_user_id']
        music_user = user['music_user_id']
        movie_user = user['movie_user_id']
        
        # Books
        if book_user is not None:
            user_books = books_df[books_df['User-ID'] == book_user]
            target_books = min(records_per_user // 3, len(user_books))
            
            if target_books > 0:
                if target_books < len(user_books):
                    user_books = user_books.sample(target_books)
                
                for _, row in user_books.iterrows():
                    integrated_data.append({
                        'user_id': user_id,
                        'item_id': row['ISBN'],
                        'item_type': 1  # 1 for books
                    })
                    book_count += 1
        
        # Music
        if music_user is not None:
            user_music = music_df[music_df['user_id'] == music_user]
            target_music = min(records_per_user // 3, len(user_music))
            
            if target_music > 0:
                if target_music < len(user_music):
                    user_music = user_music.sample(target_music)
                
                for _, row in user_music.iterrows():
                    integrated_data.append({
                        'user_id': user_id,
                        'item_id': row['track_id'],
                        'item_type': 3  # 3 for music
                    })
                    music_count += 1
        elif simulate_missing:
            # Simulate music preferences if needed
            for _ in range(records_per_user // 3):
                random_track = music_df.sample(1).iloc[0]['track_id']
                integrated_data.append({
                    'user_id': user_id,
                    'item_id': random_track,
                    'item_type': 3  # 3 for music
                })
                music_count += 1
                simulated_count += 1
        
        # Movies
        if movie_user is not None:
            user_movies = movies_df[movies_df['user_id'] == movie_user]
            target_movies = min(records_per_user // 3, len(user_movies))
            
            if target_movies > 0:
                if target_movies < len(user_movies):
                    user_movies = user_movies.sample(target_movies)
                
                for _, row in user_movies.iterrows():
                    integrated_data.append({
                        'user_id': user_id,
                        'item_id': row['id'],
                        'item_type': 2  # 2 for movies
                    })
                    movie_count += 1
        elif simulate_missing:
            # Simulate movie preferences if needed
            for _ in range(records_per_user // 3):
                random_movie = movies_df.sample(1).iloc[0]['id']
                integrated_data.append({
                    'user_id': user_id,
                    'item_id': random_movie,
                    'item_type': 2  # 2 for movies
                })
                movie_count += 1
                simulated_count += 1
    
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
    print(f"Simulated records: {simulated_count}")
    
    print("Sample data:")
    print(integrated_df.head())
    
    return integrated_df, user_mapping_df

def main(books_path='merged_books.csv', 
         music_path='Music_User_ID_Popularity.csv',
         movies_path='shortened_movie_users.csv',
         n_users=200,
         records_per_user=50):
    """Main function to run the entire process."""
    print("Loading datasets...")
    books_df, music_df, movies_df = load_datasets(books_path, music_path, movies_path)
    
    integrated_df, user_mapping_df = create_integrated_dataset(
        books_df=books_df,
        music_df=music_df,
        movies_df=movies_df,
        n_users=n_users,
        records_per_user=records_per_user,
        simulate_missing=True,
        output_path='unified_preferences.csv',
        mapping_path='unified_user_mapping.csv'
    )
    
    return integrated_df, user_mapping_df

if __name__ == "__main__":
    # Create the integrated dataset
    integrated_df, user_mapping_df = main(
        n_users=200,           # Target 200 users in the integrated dataset
        records_per_user=50    # Target 50 records per user (approximately)
    )