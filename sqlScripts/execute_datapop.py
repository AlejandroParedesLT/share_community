import subprocess
import os
import sys
import time
import json
import logging
import requests
import pandas as pd
import numpy as np


def execute_datapop(script_name):
    # Set up logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Get the current working directory
    current_dir = os.getcwd()
    
    # Define the path to the data_pop.py script
    script_path = os.path.join(current_dir, script_name)
    
    # Check if the script exists
    if not os.path.exists(script_path):
        logging.error(f"Script {script_path} does not exist.")
        sys.exit(1)
    
    # Execute the script using subprocess
    try:
        result = subprocess.run(['python ', script_path], check=True, capture_output=True, text=True)
        logging.info("Script executed successfully.")
        logging.info(result.stdout)
    except subprocess.CalledProcessError as e:
        logging.error(f"Script execution failed: {e.stderr}")
        sys.exit(1)

if __name__ == "__main__":
    
    # Execute the specified script
    # execute_datapop('sqlScripts/pyscripts/countries_script.py')    
    
    # Execution
    # execute_datapop('./pyscripts/itemtypes_script.py')
    # execute_datapop('./pyscripts/genres_script.py')

    execute_datapop('./pyscripts/audio_script.py')
    execute_datapop('./pyscripts/books_script.py')
    execute_datapop('./pyscripts/movies_script.py')
    execute_datapop('./pyscripts/uploadEmbeddings.py')
    