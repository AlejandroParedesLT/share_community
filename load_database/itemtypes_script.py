import requests

# Configuration
API_BASE_URL = "http://localhost:8001/api"  # Base API URL
LOGIN_ENDPOINT = f"{API_BASE_URL}/login/"  # Login endpoint
ITEMTYPE_ENDPOINT = f"{API_BASE_URL}/itemtypes/"  # Itemtypes endpoint

# Authentication credentials
USERNAME = "admin"  # Replace with your username
PASSWORD = "adminpassword"  # Replace with your password

def get_auth_token():
    """Get authentication token by logging in"""
    login_data = {
        "username": USERNAME,
        "password": PASSWORD
    }
    
    try:
        # For login, use JSON
        response = requests.post(LOGIN_ENDPOINT, json=login_data)
        
        if response.status_code == 200:
            # Extract token from response
            token_data = response.json()
            # Using 'access' as the key name for the token
            token = token_data.get('access', '')
            print(f"Successfully authenticated")
            return token
        else:
            print(f"Authentication failed. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error during authentication: {str(e)}")
        return None

def create_item_types(auth_token):
    if not auth_token:
        print("Cannot proceed without authentication token")
        return
        
    # Set up authentication header
    headers = {
        "Authorization": f"Bearer {auth_token}",
    }
 
    # Predefined item types
    item_types = [
        {"type": 1, "name": "books"},
        {"type": 2, "name": "movies"},
        {"type": 3, "name": "music"}
    ]

    for item_type in item_types:
        # Create form data
        form_data = {
            "type": (None, str(item_type['type'])),
            "name": (None, item_type['name'])
        }
        
        # Make POST request
        try:
            response = requests.post(ITEMTYPE_ENDPOINT, files=form_data, headers=headers)

            # Check if request was successful
            if response.status_code == 201:
                print(f"Successfully added item type: {item_type['name']}")
            else:
                print(
                    f"Failed to add item type: {item_type['name']}. Status code: {response.status_code}"
                )
                print(f"Response: {response.text}")

        except Exception as e:
            print(f"Error adding item type {item_type['name']}: {str(e)}")

if __name__ == "__main__":
    print("Starting authentication process...")
    auth_token = get_auth_token()
    
    if auth_token:
        print("Starting to create item types...")
        create_item_types(auth_token)
        print("Finished creating item types.")
    else:
        print("Authentication failed. Cannot proceed with creating item types.")