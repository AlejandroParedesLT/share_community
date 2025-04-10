## For personal use ## 

import pandas as pd
from datetime import datetime

CSV_INPUT = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/Final/spotify_dataset_final.csv"
CSV_OUTPUT = "/Users/ilseoplee/Desktop/Study/2025 MIDS_Spring/Database system/Groupwork/TeamPizza/DB_music/Final Database/Final/spotify_dataset_with_description.csv"

def describe_song_rule_based(row):
    title = row["title"]
    author = row["author"]
    genre = row.get("genre", "music")
    release_date = row["release_date"]
    tempo = row["tempo"]
    valence = row["valence"]
    danceability = row["danceability"]
    duration_ms = row["duration_ms"]

    def valence_desc(v):
        if v >= 0.7:
            return "an uplifting and cheerful"
        elif v >= 0.4:
            return "a neutral and balanced"
        else:
            return "a melancholic and emotional"

    def tempo_desc(t):
        if t >= 120:
            return "fast-paced"
        elif t >= 90:
            return "moderate-tempo"
        else:
            return "slow and relaxed"

    def dance_desc(d):
        if d >= 0.7:
            return "very danceable"
        elif d >= 0.4:
            return "somewhat danceable"
        else:
            return "not very danceable"

    def format_duration(duration_ms):
        total_seconds = int(duration_ms / 1000)
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        return f"{minutes} minute{'s' if minutes != 1 else ''} and {seconds} second{'s' if seconds != 1 else ''}"

    try:
        date_obj = datetime.strptime(str(release_date).strip(), "%m/%d/%y")
        date_fmt = date_obj.strftime("%B %Y")
    except Exception:
        date_fmt = release_date

    return (
        f"'{title}' by {author} is a {genre} song released in {date_fmt}. "
        f"It runs for {format_duration(duration_ms)} with {valence_desc(valence)} mood, "
        f"a {tempo_desc(tempo)} rhythm, and is {dance_desc(danceability)}."
    )

def generate_descriptions():
    df = pd.read_csv(CSV_INPUT)

    df = df.dropna(subset=["title", "author", "release_date", "tempo", "valence", "danceability", "duration_ms"])

    df["description"] = df.apply(describe_song_rule_based, axis=1)

    df.to_csv(CSV_OUTPUT, index=False)
    print(f"✅ Description column added and saved to: {CSV_OUTPUT}")

if __name__ == "__main__":
    generate_descriptions()
