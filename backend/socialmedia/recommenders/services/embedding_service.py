import tensorflow as tf
import numpy as np
import logging
import os
from django.conf import settings

class ModelService:
    _instance = None
    _model = None
    _is_initialized = False
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def __init__(self):
        # This doesn't actually load the model yet
        # The model will be loaded by the AppConfig.ready() method
        pass
    
    def initialize(self):
        """Initialize the model - should be called only   at application startup"""
        if self._is_initialized:
            return
            
        try:
            model_path = os.path.join(settings.BASE_DIR, 'recommender', 'models', 'book_model')
            self._model = tf.keras.models.load_model(model_path)
            self._is_initialized = True
            logging.info("Successfully loaded recommendation model")
        except Exception as e:
            logging.error(f"Error loading model: {e}")
            self._model = None
    
    def get_user_embedding(self, user_id):
        """Get user embedding from the model"""
        if not self._is_initialized or self._model is None:
            raise ValueError("Model not initialized or failed to load")
            
        # Convert user_id to string as the model expects string IDs
        user_id_str = str(user_id)
        
        # Extract user embedding from the model
        user_embedding = self._model.user_model(tf.constant([user_id_str])).numpy()[0]
        
        return user_embedding