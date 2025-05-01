import csv
import json

def convert_csv_to_json(csv_file_path, json_file_path):
    """
    Convert the genre mappings CSV file to a JSON file
    
    Args:
        csv_file_path (str): Path to the input CSV file
        json_file_path (str): Path to the output JSON file
    """
    genres = []
    
    try:
        # Read CSV file
        with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            
            # Process each row
            for row in csv_reader:
                genre_id = int(row['genre_id'])
                genre_name = row['genre_name']
                
                # Add to genres list
                genres.append({
                    "id": genre_id,
                    "name": genre_name
                })
        
        # Write JSON file
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump({"genres": genres}, json_file, indent=2)
            
        print(f"Successfully converted CSV to JSON. Output saved to {json_file_path}")
        
    except Exception as e:
        print(f"Error converting CSV to JSON: {str(e)}")

# File paths
csv_file_path = "./artifacts/genre_mappings_latest.csv"
json_file_path = "genres.json"

# Convert CSV to JSON
convert_csv_to_json(csv_file_path, json_file_path)