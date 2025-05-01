import os
import pprint
import tempfile

from typing import Dict, Text
import os
from django.conf import settings
import tensorflow as tf
import tensorflow_recommenders as tfrs
import numpy as np
import pickle
def load_inference_model():
    # Load vocabularies
    #vocab_path = os.path.join(settings.BASE_DIR, "backend", "recommenders", "models", "user_vocab.pkl")
    with open('recommenders/models/user_vocab.pkl', 'rb') as f:
        user_vocab = pickle.load(f)
    item_path = os.path.join(settings.BASE_DIR, "backend", "recommenders", "models", "item_vocab.pkl")
    with open('recommenders/models/item_vocab.pkl', 'rb') as f:
        item_vocab = pickle.load(f)

        #https://github.com/AlejandroParedesLT/share_community/blob/main/backend/recommenders/models/user_vocab.pkl
        
    # Load weights
    user_weights_path = os.path.join(settings.BASE_DIR, "backend", "recommenders", "models", "user_weights.npy")
    user_weights = np.load('recommenders/models/user_weights.npy', allow_pickle=True)
    item_weights_path = os.path.join(settings.BASE_DIR, "backend", "recommenders", "models", "item_weights.npy")
    item_weights = np.load('recommenders/models/item_weights.npy', allow_pickle=True)
    
    # Create embedding lookup models
    embedding_dimension = 32
    
    user_model = tf.keras.Sequential([
        tf.keras.layers.StringLookup(vocabulary=user_vocab, mask_token=None),
        tf.keras.layers.Embedding(len(user_vocab) + 1, embedding_dimension)
    ])
    
    item_model = tf.keras.Sequential([
        tf.keras.layers.StringLookup(vocabulary=item_vocab, mask_token=None),
        tf.keras.layers.Embedding(len(item_vocab) + 1, embedding_dimension)
    ])
    
    # Build models
    user_model(np.array([user_vocab[0]]))
    item_model(np.array([item_vocab[0]]))
    
    # Set weights
    user_model.set_weights(user_weights)
    item_model.set_weights(item_weights)
    
    # Create a simple inference model function
    def get_embeddings(user_ids, item_ids):
        user_embs = user_model(user_ids)
        item_embs = item_model(item_ids)
        return user_embs, item_embs
    
    return get_embeddings, user_model, item_model

# # Example usage
# get_embeddings, user_model, item_model = load_inference_model()

# # Test it
# test_user_id = np.array(["1"])
# test_item_id = np.array(["0140121617"])
# user_emb, item_emb = get_embeddings(test_user_id, test_item_id)
# print("User embedding:", user_emb)
# print("Item embedding:", item_emb)