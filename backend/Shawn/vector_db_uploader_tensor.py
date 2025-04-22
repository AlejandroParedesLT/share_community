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