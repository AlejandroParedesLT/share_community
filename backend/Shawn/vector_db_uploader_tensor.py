"""
===============================================================================
Environment : Python 3.9.22 (for TFRS compatibility)
Project: Optimized User Embedding Generation with TFRS on Apple Silicon
Description:
    This script builds a full pipeline to train a TensorFlow Recommenders (TFRS) retrieval model
    on a user-item interaction dataset using Apple Silicon GPU (via Metal acceleration),
    and stores the resulting user embedding vectors into a PostgreSQL database using pgvector.

Functionality Overview:
    1. Load user-item interaction data from CSV
    2. Preprocess the data and encode IDs
    3. Train a TFRS two-tower retrieval model
    4. Extract user embeddings from the trained model
    5. Upload embeddings to a PostgreSQL table with pgvector extension
    6. Create an IVFFlat index on the embedding column for fast similarity search

Key Features:
    - Optimized for Apple M1/M2/M3 using tensorflow-metal
    - Uses TensorFlow’s data pipeline and GPU acceleration for speed
    - Real-time progress logging during model training
    - Integrates PostgreSQL vector storage and search via pgvector

Result:
    A database table (`user_preference_embedding_all`) storing high-dimensional
    vector representations of each user’s preference profile, ready for similarity-based retrieval.
===============================================================================
"""

import time
import logging
import numpy as np
import pandas as pd
import tensorflow as tf
import tensorflow_recommenders as tfrs
import psycopg2
from pgvector.psycopg2 import register_vector

# === Logging Configuration ===
logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

# === Configuration ===
CONFIG = {
    "CSV_FILE_PATH": "/Users/ilseoplee/share_community-2/backend/Shawn/unified_preferences.csv",
    "EMBEDDING_DIM": 64,
    "BATCH_SIZE": 256,
    "EPOCHS": 3,
    "DB_CONFIG": {
        "host": "localhost",
        "port": 5433,
        "dbname": "mydatabase",
        "user": "myuser",
        "password": "mypassword"
    },
    "TARGET_TABLE": "user_preference_embedding_all"
}

# === Initialize GPU ===
def init_gpu():
    logger.info("TensorFlow version: %s", tf.__version__)
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        logger.info("GPU devices: %s", gpus)
        tf.config.threading.set_intra_op_parallelism_threads(1)
        try:
            with tf.device('/GPU:0'):
                a = tf.random.normal([1000, 1000])
                b = tf.random.normal([1000, 1000])
                c = tf.matmul(a, b)
                logger.info("GPU test successful: %s", c.shape)
        except Exception as e:
            logger.warning("GPU test failed: %s", e)
    else:
        logger.warning("No GPU found. Running on CPU.")

# === Load and Preprocess Data ===
def load_and_preprocess_data():
    start = time.time()
    df = pd.read_csv(CONFIG["CSV_FILE_PATH"])
    df = df.sample(frac=1).reset_index(drop=True)
    df["user_id"] = df["user_id"].astype(str)
    df["item_id"] = df["item_type"].astype(str) + "_" + df["item_id"].astype(str)
    logger.info("Loaded and shuffled %d rows (%.2fs)", len(df), time.time() - start)
    return df

# === TensorFlow Dataset Builder ===
def get_tf_dataset(df):
    return tf.data.Dataset.from_tensor_slices({
        "user_id": df["user_id"].values,
        "item_id": df["item_id"].values
    }).shuffle(10000, reshuffle_each_iteration=True) \
      .batch(CONFIG["BATCH_SIZE"]) \
      .prefetch(tf.data.AUTOTUNE)

# === Progress Callback ===
class ProgressCallback(tf.keras.callbacks.Callback):
    def __init__(self, total_epochs):
        super().__init__()
        self.total_epochs = total_epochs
        self.last_log_time = time.time()

    def on_epoch_begin(self, epoch, logs=None):
        logger.info("[Epoch %d/%d] Starting...", epoch+1, self.total_epochs)
        self.epoch_start_time = time.time()
        self.batch_count = 0

    def on_train_batch_end(self, batch, logs=None):
        self.batch_count += 1
        if time.time() - self.last_log_time > 3:
            logger.info("  • Batch %d, loss: %.4f", self.batch_count, logs['loss'])
            self.last_log_time = time.time()

    def on_epoch_end(self, epoch, logs=None):
        duration = time.time() - self.epoch_start_time
        logger.info("[Epoch %d/%d] Done in %.2fs - loss: %.4f", epoch+1, self.total_epochs, duration, logs["loss"])

# === Define TFRS Retrieval Model ===
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

        self.task = tfrs.tasks.Retrieval()

    def compute_loss(self, features, training=False):
        user_embeddings = self.user_model(features["user_id"])
        item_embeddings = self.item_model(features["item_id"])
        return self.task(user_embeddings, item_embeddings)

# === Train Model ===
def train_model(dataset, user_vocab, item_vocab):
    logger.info("Training model on GPU (if available)...")
    progress_callback = ProgressCallback(CONFIG["EPOCHS"])
    model = SimpleRetrievalModel(user_vocab, item_vocab, CONFIG["EMBEDDING_DIM"])
    model.compile(optimizer=tf.keras.optimizers.Adagrad(learning_rate=0.1))
    model.fit(dataset, epochs=CONFIG["EPOCHS"], verbose=0, callbacks=[progress_callback])
    logger.info("Model training complete.")
    return model

# === Generate Embeddings ===
def generate_user_embeddings(model, user_vocab):
    start = time.time()
    embeddings = model.user_model(tf.convert_to_tensor(user_vocab)).numpy()
    logger.info("Generated %d embeddings (%.2fs)", len(embeddings), time.time() - start)
    return embeddings

# === PostgreSQL Upload ===
def upload_to_postgresql(user_vocab, user_embeddings):
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(**CONFIG["DB_CONFIG"])
        register_vector(conn)
        cur = conn.cursor()
        logger.info("Connected to PostgreSQL.")

        cur.execute(f"""
            CREATE EXTENSION IF NOT EXISTS vector;
            DROP TABLE IF EXISTS {CONFIG['TARGET_TABLE']};
            CREATE TABLE {CONFIG['TARGET_TABLE']} (
                user_id TEXT PRIMARY KEY,
                embedding vector({CONFIG['EMBEDDING_DIM']})
            );
        """)
        conn.commit()
        logger.info("Table `%s` created.", CONFIG["TARGET_TABLE"])

        data = [(user_vocab[i], user_embeddings[i].tolist()) for i in range(len(user_vocab))]
        cur.executemany(
            f"INSERT INTO {CONFIG['TARGET_TABLE']} (user_id, embedding) VALUES (%s, %s);", data
        )
        conn.commit()
        logger.info("Uploaded %d user vectors.", len(user_vocab))

        cur.execute(f"""
            CREATE INDEX ON {CONFIG['TARGET_TABLE']} USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
        """)
        conn.commit()
        logger.info("Vector index created.")

    except Exception as e:
        logger.error("Database operation failed: %s", e)
        if conn:
            conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# === Pipeline Execution ===
def run_pipeline():
    init_gpu()
    df = load_and_preprocess_data()
    user_vocab = sorted(df["user_id"].unique())
    item_vocab = sorted(df["item_id"].unique())
    logger.info("Unique users: %d, Unique items: %d", len(user_vocab), len(item_vocab))

    dataset = get_tf_dataset(df)
    model = train_model(dataset, user_vocab, item_vocab)
    user_embeddings = generate_user_embeddings(model, user_vocab)
    upload_to_postgresql(user_vocab, user_embeddings)

    # === Summary Logging ===
    logger.info(" Pipeline completed successfully.")
    logger.info(" Final Summary:")
    logger.info(" Total users       : %d", len(user_vocab))
    logger.info(" Embedding dimension: %d", CONFIG["EMBEDDING_DIM"])
    logger.info(" Target DB table    : %s", CONFIG["TARGET_TABLE"])
    logger.info(" Vector index       : ivfflat + L2 distance")

# === Entry Point ===
if __name__ == "__main__":
    run_pipeline()


# """
# ===============================================================================
# Project: Optimized User Embedding Generation with TFRS on Apple Silicon
# Description:
#     Train a retrieval model with TensorFlow Recommenders (TFRS),
#     generate user embeddings, and save them to PostgreSQL with pgvector.
    
# Platform: Apple Silicon (M1/M2/M3) using tensorflow-metal
# Python  : 3.9 (for TFRS compatibility)
# TensorFlow: tensorflow-macos + tensorflow-metal
# GPU     : Metal GPU backend (/GPU:0)
# ===============================================================================
# """

# import os
# import time
# import numpy as np
# import pandas as pd
# import tensorflow as tf
# import tensorflow_recommenders as tfrs
# import psycopg2
# from pgvector.psycopg2 import register_vector

# # === Thread Safety Fix for Metal ===
# tf.config.threading.set_intra_op_parallelism_threads(1)

# # === Paths and Configs ===
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

# # === Load & Preprocess Data ===
# print("[1] Loading and shuffling data...")
# start = time.time()
# df = pd.read_csv(CSV_FILE_PATH)
# df = df.sample(frac=1).reset_index(drop=True)  # Global shuffle for randomness
# df["user_id"] = df["user_id"].astype(str)
# df["item_id"] = df["item_type"].astype(str) + "_" + df["item_id"].astype(str)
# print(f"[✓] Loaded and shuffled {len(df)} rows. ({time.time() - start:.2f}s)")

# user_vocab = df["user_id"].unique()
# item_vocab = df["item_id"].unique()

# # === Logging Callback ===
# class TimeLogger(tf.keras.callbacks.Callback):
#     def on_epoch_begin(self, epoch, logs=None):
#         self.start_time = time.time()
#         print(f"\n[Epoch {epoch+1}] Start...")

#     def on_epoch_end(self, epoch, logs=None):
#         print(f"[Epoch {epoch+1}] Done in {time.time() - self.start_time:.2f}s")

# # === Define Optimized Dataset Builder ===
# def get_tf_dataset(df):
#     return tf.data.Dataset.from_tensor_slices({
#         "user_id": df["user_id"].values,
#         "item_id": df["item_id"].values
#     }).shuffle(1000, reshuffle_each_iteration=True) \
#       .batch(256) \
#       .prefetch(tf.data.AUTOTUNE)

# # === Define TFRS Retrieval Model ===
# class SimpleRetrievalModel(tfrs.Model):
#     def __init__(self, user_vocab, item_vocab, embedding_dim):
#         super().__init__()
#         self.user_lookup = tf.keras.layers.StringLookup(vocabulary=user_vocab, mask_token=None)
#         self.item_lookup = tf.keras.layers.StringLookup(vocabulary=item_vocab, mask_token=None)

#         self.user_model = tf.keras.Sequential([
#             self.user_lookup,
#             tf.keras.layers.Embedding(len(user_vocab) + 1, embedding_dim)
#         ])

#         self.item_model = tf.keras.Sequential([
#             self.item_lookup,
#             tf.keras.layers.Embedding(len(item_vocab) + 1, embedding_dim)
#         ])

#         self.task = tfrs.tasks.Retrieval()

#     def compute_loss(self, features, training=False):
#         return self.task(
#             self.user_model(features["user_id"]),
#             self.item_model(features["item_id"]),
#         )

# # === Full Pipeline Execution ===
# def run_pipeline_and_upload(df):
#     total_start = time.time()

#     print("[2] Connecting to PostgreSQL...")
#     conn = psycopg2.connect(**DB_CONFIG)
#     register_vector(conn)
#     cur = conn.cursor()
#     print("[✓] Connected.")

#     print("[3] Preparing TensorFlow dataset...")
#     tf_dataset = get_tf_dataset(df)
#     print("[✓] Dataset ready.")

#     print("[4] Training model...")
#     try:
#         with tf.device('/GPU:0'):
#             model = SimpleRetrievalModel(user_vocab, item_vocab, EMBEDDING_DIM)
#             model.compile(optimizer=tf.keras.optimizers.Adagrad(learning_rate=0.1))
#             model.fit(tf_dataset, epochs=3, verbose=1, callbacks=[TimeLogger()])
#     except Exception as e:
#         print(f"[!] GPU failed, fallback to CPU: {e}")
#         with tf.device('/CPU:0'):
#             model = SimpleRetrievalModel(user_vocab, item_vocab, EMBEDDING_DIM)
#             model.compile(optimizer=tf.keras.optimizers.Adagrad(learning_rate=0.1))
#             model.fit(tf_dataset, epochs=3, verbose=1, callbacks=[TimeLogger()])

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

#     print("[7] Uploading embeddings to PostgreSQL...")
#     start = time.time()
#     try:
#         data = [(user_vocab[i], user_embeddings[i].tolist()) for i in range(len(user_vocab))]
#         cur.executemany(
#             f"INSERT INTO {TARGET_TABLE} (user_id, embedding) VALUES (%s, %s);", data
#         )
#         conn.commit()
#         print(f"[✓] Uploaded {len(user_vocab)} vectors. ({time.time() - start:.2f}s)")
#     except Exception as e:
#         print(f"[!] Upload error: {e}")
#         conn.rollback()

#     cur.close()
#     conn.close()
#     print(f"[✓] Pipeline completed in {time.time() - total_start:.2f}s")

# # === Entry Point ===
# if __name__ == "__main__":
#     run_pipeline_and_upload(df)


# """
# ===============================================================================
# Project: User Embedding Generation for Recommendation
# Purpose: Train a TensorFlow Recommenders (TFRS) retrieval model on user-item 
#          interaction data and store user embeddings to PostgreSQL using pgvector.

# Environment:
#     - Platform       : Apple Silicon (MacBook M1/M2/M3)
#     - Python Version : 3.9 (Note: Python 3.12+ is not yet fully compatible with TFRS)
#     - TensorFlow     : tensorflow-macos + tensorflow-metal (Apple Metal GPU backend)
#     - GPU Usage      : Enabled via /GPU:0 (automatically used when available)
#     - Conda Env Name : tf-metal (recommended for isolation and reproducibility)

# Dependencies (install with pip):
#     pip install tensorflow-macos tensorflow-metal
#     pip install tensorflow-recommenders
#     pip install pandas numpy
#     pip install psycopg2-binary pgvector

# PostgreSQL Configuration:
#     - The pgvector extension must be enabled (CREATE EXTENSION vector;)
#     - Embeddings are stored in a table with a 'vector' column (dimension = EMBEDDING_DIM)

# Input Data:
#     - CSV file path : /Users/ilseoplee/share_community-2/backend/Shawn/unified_preferences.csv
#     - Required columns: user_id, item_id, item_type
#     - The item_id is augmented with item_type to ensure uniqueness

# Pipeline Steps:
#     [1] Load and preprocess data (combine item_type and item_id)
#     [2] Build a simple TFRS retrieval model (without FactorizedTopK for faster training)
#     [3] Train the model using TensorFlow (GPU-accelerated if available)
#     [4] Extract user embedding vectors from the trained user model
#     [5] Store the embeddings in PostgreSQL using psycopg2 and pgvector

# Notes:
#     - FactorizedTopK metric is intentionally excluded for faster local training.
#     - This code is designed for local development and testing.
#     - For large-scale deployment or real-time inference, consider ANN methods (e.g., pgvector index).
# ===============================================================================
# """

# import os
# import time
# import numpy as np
# import pandas as pd
# import tensorflow as tf
# import tensorflow_recommenders as tfrs
# import psycopg2
# from pgvector.psycopg2 import register_vector

# # === Check GPU Availability (Metal)
# print("Physical devices:", tf.config.list_physical_devices())
# tf.debugging.set_log_device_placement(True)  # Show device used in each op

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

# # === Logging Callback ===
# class TimeLogger(tf.keras.callbacks.Callback):
#     def on_epoch_begin(self, epoch, logs=None):
#         self.start_time = time.time()
#         print(f"\n[Epoch {epoch+1}] Start...")

#     def on_epoch_end(self, epoch, logs=None):
#         print(f"[Epoch {epoch+1}] Done in {time.time() - self.start_time:.2f}s")

# # === TFRS Retrieval Model (No FactorizedTopK) ===
# class SimpleRetrievalModel(tfrs.Model):
#     def __init__(self, user_vocab, item_vocab, embedding_dim):
#         super().__init__()
#         self.user_lookup = tf.keras.layers.StringLookup(vocabulary=user_vocab, mask_token=None)
#         self.item_lookup = tf.keras.layers.StringLookup(vocabulary=item_vocab, mask_token=None)

#         self.user_model = tf.keras.Sequential([
#             self.user_lookup,
#             tf.keras.layers.Embedding(len(user_vocab) + 1, embedding_dim)
#         ])

#         self.item_model = tf.keras.Sequential([
#             self.item_lookup,
#             tf.keras.layers.Embedding(len(item_vocab) + 1, embedding_dim)
#         ])

#         # Fast training: no FactorizedTopK metric
#         self.task = tfrs.tasks.Retrieval()

#     def compute_loss(self, features, training=False):
#         return self.task(
#             self.user_model(features["user_id"]),
#             self.item_model(features["item_id"]),
#         )

# # === Pipeline ===
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
#     }).shuffle(1000).batch(256)
#     print("[✓] Dataset ready.")

#     print("[4] Training model...")
#     with tf.device('/GPU:0'):  # Use Metal GPU if available
#         model = SimpleRetrievalModel(user_vocab, item_vocab, EMBEDDING_DIM)
#         model.compile(optimizer=tf.keras.optimizers.Adagrad(learning_rate=0.1))
#         model.fit(tf_dataset, epochs=3, verbose=1, callbacks=[TimeLogger()])
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

#     print("[7] Uploading embeddings to PostgreSQL...")
#     start = time.time()
#     try:
#         data = [(user_vocab[i], user_embeddings[i].tolist()) for i in range(len(user_vocab))]
#         cur.executemany(
#             f"INSERT INTO {TARGET_TABLE} (user_id, embedding) VALUES (%s, %s);", data
#         )
#         conn.commit()
#         print(f"[✓] Uploaded {len(user_vocab)} vectors. ({time.time() - start:.2f}s)")
#     except Exception as e:
#         print(f"[!] Upload error: {e}")
#         conn.rollback()

#     cur.close()
#     conn.close()
#     print(f"[✓] Pipeline completed in {time.time() - total_start:.2f}s")

# # === Entry Point ===
# if __name__ == "__main__":
#     run_pipeline_and_upload(df)