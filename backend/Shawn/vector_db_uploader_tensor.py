"""
===============================================================================
Project: User Embedding Generation for Recommendation
Purpose: Train a TensorFlow Recommenders (TFRS) retrieval model on user-item 
         interaction data and store user embeddings to PostgreSQL using pgvector.

Environment:
    - Platform       : Apple Silicon (MacBook M1/M2/M3)
    - Python Version : 3.9 (Note: Python 3.12+ is not yet fully compatible with TFRS)
    - TensorFlow     : tensorflow-macos + tensorflow-metal (Apple Metal GPU backend)
    - GPU Usage      : Enabled via /GPU:0 (automatically used when available)
    - Conda Env Name : tf-metal (recommended for isolation and reproducibility)

Dependencies (install with pip):
    pip install tensorflow-macos tensorflow-metal
    pip install tensorflow-recommenders
    pip install pandas numpy
    pip install psycopg2-binary pgvector

PostgreSQL Configuration:
    - The pgvector extension must be enabled (CREATE EXTENSION vector;)
    - Embeddings are stored in a table with a 'vector' column (dimension = EMBEDDING_DIM)

Input Data:
    - CSV file path : /Users/ilseoplee/share_community-2/backend/Shawn/unified_preferences.csv
    - Required columns: user_id, item_id, item_type
    - The item_id is augmented with item_type to ensure uniqueness

Pipeline Steps:
    [1] Load and preprocess data (combine item_type and item_id)
    [2] Build a simple TFRS retrieval model (without FactorizedTopK for faster training)
    [3] Train the model using TensorFlow (GPU-accelerated if available)
    [4] Extract user embedding vectors from the trained user model
    [5] Store the embeddings in PostgreSQL using psycopg2 and pgvector

Notes:
    - FactorizedTopK metric is intentionally excluded for faster local training.
    - This code is designed for local development and testing.
    - For large-scale deployment or real-time inference, consider ANN methods (e.g., FAISS or pgvector index).
===============================================================================
"""

import os
import time
import numpy as np
import pandas as pd
import tensorflow as tf
import tensorflow_recommenders as tfrs
import psycopg2
from pgvector.psycopg2 import register_vector

# === Check GPU Availability (Metal)
print("Physical devices:", tf.config.list_physical_devices())
tf.debugging.set_log_device_placement(True)  # Show device used in each op

# === Configuration ===
CSV_FILE_PATH = "/Users/ilseoplee/share_community-2/backend/Shawn/unified_preferences.csv"
EMBEDDING_DIM = 64
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "dbname": "mydatabase",
    "user": "myuser",
    "password": "mypassword"
}
TARGET_TABLE = "user_preference_embedding_all"

# === Load and preprocess data ===
print("[1] Loading data...")
start = time.time()
df = pd.read_csv(CSV_FILE_PATH)
df["user_id"] = df["user_id"].astype(str)
df["item_id"] = df["item_type"].astype(str) + "_" + df["item_id"].astype(str)
print(f"[✓] Loaded {len(df)} rows. ({time.time() - start:.2f}s)")

user_vocab = df["user_id"].unique()
item_vocab = df["item_id"].unique()

# === Logging Callback ===
class TimeLogger(tf.keras.callbacks.Callback):
    def on_epoch_begin(self, epoch, logs=None):
        self.start_time = time.time()
        print(f"\n[Epoch {epoch+1}] Start...")

    def on_epoch_end(self, epoch, logs=None):
        print(f"[Epoch {epoch+1}] Done in {time.time() - self.start_time:.2f}s")

# === TFRS Retrieval Model (No FactorizedTopK) ===
class SimpleRetrievalModel(tfrs.Model):
    def __init__(self, user_vocab, item_vocab, embedding_dim):
        super().__init__()
        self.user_lookup = tf.keras.layers.StringLookup(vocabulary=user_vocab, mask_token=None)
        self.item_lookup = tf.keras.layers.StringLookup(vocabulary=item_vocab, mask_token=None)

        self.user_model = tf.keras.Sequential([
            self.user_lookup,
            tf.keras.layers.Embedding(len(user_vocab) + 1, embedding_dim)
        ])

        self.item_model = tf.keras.Sequential([
            self.item_lookup,
            tf.keras.layers.Embedding(len(item_vocab) + 1, embedding_dim)
        ])

        # Fast training: no FactorizedTopK metric
        self.task = tfrs.tasks.Retrieval()

    def compute_loss(self, features, training=False):
        return self.task(
            self.user_model(features["user_id"]),
            self.item_model(features["item_id"]),
        )

# === Pipeline ===
def run_pipeline_and_upload(df):
    total_start = time.time()

    print("[2] Connecting to PostgreSQL...")
    conn = psycopg2.connect(**DB_CONFIG)
    register_vector(conn)
    cur = conn.cursor()
    print("[✓] Connected.")

    print("[3] Preparing TensorFlow dataset...")
    tf_dataset = tf.data.Dataset.from_tensor_slices({
        "user_id": df["user_id"].values,
        "item_id": df["item_id"].values
    }).shuffle(10000).batch(256)
    print("[✓] Dataset ready.")

    print("[4] Training model...")
    with tf.device('/GPU:0'):  # Use Metal GPU if available
        model = SimpleRetrievalModel(user_vocab, item_vocab, EMBEDDING_DIM)
        model.compile(optimizer=tf.keras.optimizers.Adagrad(learning_rate=0.1))
        model.fit(tf_dataset, epochs=3, verbose=1, callbacks=[TimeLogger()])
    print("[✓] Model training complete.")

    print("[5] Generating user embeddings...")
    start = time.time()
    user_embeddings = model.user_model(tf.convert_to_tensor(user_vocab)).numpy()
    print(f"[✓] Generated {len(user_embeddings)} embeddings. ({time.time() - start:.2f}s)")

    print(f"[6] Creating table `{TARGET_TABLE}`...")
    try:
        cur.execute(f"""
            CREATE EXTENSION IF NOT EXISTS vector;
            DROP TABLE IF EXISTS {TARGET_TABLE};
            CREATE TABLE {TARGET_TABLE} (
                user_id TEXT PRIMARY KEY,
                embedding vector({EMBEDDING_DIM})
            );
        """)
        conn.commit()
        print(f"[✓] Table `{TARGET_TABLE}` created.")
    except Exception as e:
        print(f"[!] Error creating table: {e}")
        conn.rollback()

    print("[7] Uploading embeddings to PostgreSQL...")
    start = time.time()
    try:
        data = [(user_vocab[i], user_embeddings[i].tolist()) for i in range(len(user_vocab))]
        cur.executemany(
            f"INSERT INTO {TARGET_TABLE} (user_id, embedding) VALUES (%s, %s);", data
        )
        conn.commit()
        print(f"[✓] Uploaded {len(user_vocab)} vectors. ({time.time() - start:.2f}s)")
    except Exception as e:
        print(f"[!] Upload error: {e}")
        conn.rollback()

    cur.close()
    conn.close()
    print(f"[✓] Pipeline completed in {time.time() - total_start:.2f}s")

# === Entry Point ===
if __name__ == "__main__":
    run_pipeline_and_upload(df)

# [✓] Uploaded 934 vectors. (0.57s)
# [✓] Pipeline completed in 181.53s



# # Using tensor marcos, instead of tensor normal version for Macbook

# import os
# import time
# import numpy as np
# import pandas as pd
# import tensorflow as tf
# import tensorflow_recommenders as tfrs
# import psycopg2
# from pgvector.psycopg2 import register_vector

# # === Configuration ===
# CSV_FILE_PATH = "/Users/ilseoplee/share_community-2/backend/Shawn/unified_preferences.csv"
# EMBEDDING_DIM = 64
# DB_CONFIG = {
#     "host": "localhost",
#     "port": 5433,
#     "dbname": "mydatabase",
#     "user": "myuser",
#     "password": "mypassword"
# }
# TARGET_TABLE = "user_preference_embedding_all"

# # === Load and preprocess data ===
# print("[1] Loading data...")
# start = time.time()
# df = pd.read_csv(CSV_FILE_PATH)
# df["user_id"] = df["user_id"].astype(str)
# df["item_id"] = df["item_type"].astype(str) + "_" + df["item_id"].astype(str)
# print(f"[✓] Loaded {len(df)} rows. ({time.time() - start:.2f}s)")

# user_vocab = df["user_id"].unique()
# item_vocab = df["item_id"].unique()

# # === TimeLogger Callback ===
# class TimeLogger(tf.keras.callbacks.Callback):
#     def on_epoch_begin(self, epoch, logs=None):
#         self.start_time = time.time()
#         print(f"\n[Epoch {epoch+1}] Start...")

#     def on_epoch_end(self, epoch, logs=None):
#         print(f"[Epoch {epoch+1}] Done in {time.time() - self.start_time:.2f}s")

# # === Model Definition (No FactorizedTopK) ===
# class SimpleRetrievalModel(tfrs.Model):
#     def __init__(self, user_vocab, item_vocab, embedding_dim):
#         super().__init__()
#         self.embedding_dim = embedding_dim

#         self.user_lookup = tf.keras.layers.StringLookup(vocabulary=user_vocab, mask_token=None)
#         self.item_lookup = tf.keras.layers.StringLookup(vocabulary=item_vocab, mask_token=None)

#         self.user_model = tf.keras.Sequential([
#             self.user_lookup,
#             tf.keras.layers.Embedding(input_dim=len(user_vocab) + 1, output_dim=self.embedding_dim)
#         ])

#         self.item_model = tf.keras.Sequential([
#             self.item_lookup,
#             tf.keras.layers.Embedding(input_dim=len(item_vocab) + 1, output_dim=self.embedding_dim)
#         ])

#         # ✅ Removed FactorizedTopK for faster training
#         self.task = tfrs.tasks.Retrieval()

#     def compute_loss(self, features, training=False):
#         return self.task(
#             self.user_model(features["user_id"]),
#             self.item_model(features["item_id"]),
#         )

# # === Run Full Pipeline ===
# def run_pipeline_and_upload(df):
#     total_start = time.time()

#     print("[2] Connecting to PostgreSQL...")
#     conn = psycopg2.connect(**DB_CONFIG)
#     register_vector(conn)
#     cur = conn.cursor()
#     print("[✓] Connected.")

#     print("[3] Preparing TensorFlow dataset...")
#     tf_dataset = tf.data.Dataset.from_tensor_slices({
#         "user_id": df["user_id"].values,
#         "item_id": df["item_id"].values
#     }).shuffle(10000).batch(256)
#     print("[✓] Dataset ready.")

#     print("[4] Training model...")
#     model = SimpleRetrievalModel(user_vocab, item_vocab, EMBEDDING_DIM)
#     model.compile(optimizer=tf.keras.optimizers.Adagrad(learning_rate=0.1))
#     model.fit(tf_dataset, epochs=3, verbose=1, callbacks=[TimeLogger()])
#     print("[✓] Model training complete.")

#     print("[5] Generating user embeddings...")
#     start = time.time()
#     user_embeddings = model.user_model(tf.convert_to_tensor(user_vocab)).numpy()
#     print(f"[✓] Generated {len(user_embeddings)} embeddings. ({time.time() - start:.2f}s)")

#     print(f"[6] Creating table `{TARGET_TABLE}`...")
#     try:
#         cur.execute(f"""
#             CREATE EXTENSION IF NOT EXISTS vector;
#             DROP TABLE IF EXISTS {TARGET_TABLE};
#             CREATE TABLE {TARGET_TABLE} (
#                 user_id TEXT PRIMARY KEY,
#                 embedding vector({EMBEDDING_DIM})
#             );
#         """)
#         conn.commit()
#         print(f"[✓] Table `{TARGET_TABLE}` created.")
#     except Exception as e:
#         print(f"[!] Error creating table: {e}")
#         conn.rollback()

#     print("[7] Uploading to PostgreSQL...")
#     start = time.time()
#     try:
#         data = [(user_vocab[i], user_embeddings[i].tolist()) for i in range(len(user_vocab))]
#         cur.executemany(
#             f"INSERT INTO {TARGET_TABLE} (user_id, embedding) VALUES (%s, %s);", data
#         )
#         conn.commit()
#         print(f"[✓] Uploaded {len(user_vocab)} rows. ({time.time() - start:.2f}s)")
#     except Exception as e:
#         print(f"[!] Upload error: {e}")
#         conn.rollback()

#     cur.close()
#     conn.close()
#     print(f"[✓] Total pipeline completed in {time.time() - total_start:.2f}s")

# # === Run ===
# if __name__ == "__main__":
#     run_pipeline_and_upload(df)

