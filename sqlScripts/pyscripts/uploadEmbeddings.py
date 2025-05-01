import csv
import psycopg2
from datetime import datetime
import requests
import csv
import psycopg2
import random
import string
import requests
from datetime import datetime


# Update these values with your database config
DB_CONFIG = {
    'host': 'localhost',
    'dbname': 'mydatabase',
    'user': 'myuser',
    'password': 'mypassword',
    'port': 5431
}

CSV_PATH = './artifacts/user_embeddings.csv'  # Replace with the path to your CSV file
PROFILE_API_URL = 'http://localhost:8001/api/user/'

def random_name(length=8):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

def create_user_via_profile():
    name = random_name()
    email = f"{name}@example.com"
    payload = {
            "username": name,
            "email": email,
            "password": "123456"  # adjust based on your serializer rules 
    }

    response = requests.post(PROFILE_API_URL, json=payload)
    if response.status_code == 201:
        user_id = response.json().get("message")
        # print(f"✅ Created user {name} with ID {user_id}")
        return user_id
    else:
        print(f"❌ Failed to create user: {response.status_code} {response.text}")
        return None

def insert_user_embeddings():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    with open(CSV_PATH, 'r') as file:
        reader = csv.reader(file)
        next(reader)  # skip header

        for row in reader:
            vector = [float(x) for x in row[:32]]
            user_id = int(row[32])

            # Check if user exists
            cursor.execute("SELECT 1 FROM auth_user WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                # Create new user and update user_id
                new_user_id = create_user_via_profile()
                if new_user_id is None:
                    continue  # skip this embedding
                # cursor.execute("SELECT max(id) FROM auth_user", (user_id,))
                # cursor.fetchone()
                # user_id = new_user_id

            cursor.execute("""
                INSERT INTO user_embeddings (user_id, embedding, created_at, updated_at)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_id) DO UPDATE
                SET embedding = EXCLUDED.embedding,
                    updated_at = EXCLUDED.updated_at;
            """, (user_id, vector, datetime.now(), datetime.now()))
            print(f"✅ Inserted/Updated embedding for user_id {user_id}")
    
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == '__main__':
    insert_user_embeddings()