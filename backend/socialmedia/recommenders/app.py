# recommender/apps.py

from django.apps import AppConfig
import logging

class RecommenderConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'recommender'
    
    def ready(self):
        """
        This method is called once when Django starts.
        Perfect place to initialize our model.
        """
        # Import here to avoid circular imports
        from recommender.services.model_service import ModelService
        
        logging.info("Initializing TensorFlow Recommender model...")
        try:
            # Get the singleton instance and initialize it
            model_service = ModelService.get_instance()
            model_service.initialize()
            logging.info("TensorFlow model initialization complete!")
        except Exception as e:
            logging.error(f"Failed to initialize TensorFlow model: {e}")