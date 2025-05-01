import tensorflow as tf
import numpy as np
import logging
import os
from django.conf import settings
from django.db import connection

class ModelService:
    _instance = None
    _is_initialized = False

    def __init__(self):
        self.user_model = None
        self.item_model = None
        self.get_embeddings_fn = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def initialize(self):
        if self._is_initialized:
            return

        try:
            from recommenders.services.item_model import load_inference_model  # Update path
            self.get_embeddings_fn, self.user_model, self.item_model = load_inference_model()
            self._is_initialized = True
            logging.info("Successfully loaded embedding models.")
        except Exception as e:
            logging.error(f"Error loading embedding models: {e}")
            self.user_model = None
            self.item_model = None

    def get_user_embedding(self, user_id, strategy='mean'):
        if not self._is_initialized or self.item_model is None:
            raise ValueError("Model not initialized or failed to load")

        # Get item IDs the user interacted with
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT si.item_id
                FROM socialmedia_post_items si
                INNER JOIN socialmedia_post sp ON si.post_id = sp.id
                INNER JOIN socialmedia_profile sp2 ON sp.user_id = sp2.user_id
                WHERE sp2.user_id = %s
            """, [user_id])
            rows = cursor.fetchall()

        if not rows:
            raise ValueError("User has no item interactions")

        item_ids = [str(row[0]) for row in rows]
        item_tensor = tf.constant(item_ids)
        item_embeddings = self.item_model(item_tensor)

        # Strategy logic stays unchanged
        if strategy == 'mean':
            user_embedding = tf.reduce_mean(item_embeddings, axis=0)
        elif strategy == 'weighted':
            weights = tf.range(1, len(item_embeddings) + 1, dtype=tf.float32)
            weights = weights / tf.reduce_sum(weights)
            user_embedding = tf.reduce_sum(item_embeddings * tf.expand_dims(weights, axis=1), axis=0)
        elif strategy == 'rnn':
            gru = tf.keras.layers.GRU(self.user_model.layers[-1].output_dim)
            user_embedding = gru(tf.expand_dims(item_embeddings, axis=0))[0]
        elif strategy == 'attention':
            query = tf.reduce_mean(item_embeddings, axis=0, keepdims=True)
            key = value = item_embeddings
            scores = tf.matmul(query, key, transpose_b=True) / tf.math.sqrt(tf.cast(tf.shape(query)[-1], tf.float32))
            weights = tf.nn.softmax(scores, axis=-1)
            user_embedding = tf.matmul(weights, value)
            user_embedding = tf.squeeze(user_embedding, axis=0)
        else:
            raise ValueError(f"Unknown pooling strategy '{strategy}'")

        return user_embedding.numpy()
