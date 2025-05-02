import pandas as pd

movies = pd.read_csv("/home/nd191/share_community/load_database/shortened_movie_records.csv")
# print(movies.head())
# print(len(movies))

print('\n')

books = pd.read_csv("/home/nd191/share_community/load_database/final_books_for_db (1).csv")
# print(books)
# print(len(books))

audio = pd.read_csv("sqlScripts/pyscripts/spotify_dataset_condensed.csv")

audio['release_date_parsed'] = pd.to_datetime(audio['release_date'], errors='coerce', infer_datetime_format=True)

print(audio)
print(len(audio))

unique_ids = audio['track_id'].nunique()
print(unique_ids)