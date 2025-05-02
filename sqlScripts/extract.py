import pandas as pd
import psycopg2

# === DB Configuration ===
DB_CONFIG = {
    'host': 'localhost',
    'dbname': 'mydatabase',
    'user': 'myuser',
    'password': 'mypassword',
    'port': 5431
}

# === Output file path ===
CSV_OUTPUT_PATH = './socialmedia_item_export.csv'

def export_table_to_csv():
    try:
        # Connect to the database
        conn = psycopg2.connect(**DB_CONFIG)

        # Define SQL query
        query = "SELECT * FROM public.socialmedia_item"

        # Load into pandas DataFrame
        df = pd.read_sql_query(query, conn)

        # Export to CSV (with index)
        df.to_csv(CSV_OUTPUT_PATH, index=True)
        
        print(f"✅ Exported {len(df)} rows to {CSV_OUTPUT_PATH}")
    
    except Exception as e:
        print(f"❌ Error exporting table: {str(e)}")
    
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    export_table_to_csv()
