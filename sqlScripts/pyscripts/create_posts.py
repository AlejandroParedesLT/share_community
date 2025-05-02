import requests
import csv
import time
import random
from math import ceil

API_BASE_URL = "http://localhost:8001"
LOGIN_ENDPOINT = f"{API_BASE_URL}/api/login/"
USER_LOOKUP_ENDPOINT = f"{API_BASE_URL}/api/user/"
POST_CREATION_ENDPOINT = f"{API_BASE_URL}/api/posts/"

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "adminpassword"
USER_PASSWORD = "123456"  # All users assumed to have this password

CSV_FILE_PATH = "/home/nd191/share_community/final_preferences_table.csv"

def login(username, password):
    response = requests.post(LOGIN_ENDPOINT, data={"username": username, "password": password})
    if response.status_code == 200:
        return response.json().get("access")
    else:
        print(f"❌ Login failed for {username} — {response.status_code}: {response.text}")
        return None

def get_user_details(user_id, token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{USER_LOOKUP_ENDPOINT}?id={user_id}", headers=headers)
    if response.status_code == 200:
        return response.json().get("data", {})
    else:
        print(f"❌ Failed to fetch user details for ID {user_id} — {response.status_code}: {response.text}")
        return None

def create_post(token, title, content, item_ids):
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "title": title,
        "content": content,
    }
    for item_id in item_ids:
        data.setdefault("items", []).append(int(float(item_id)))


    response = requests.post(POST_CREATION_ENDPOINT, headers=headers, data=data)
    if response.status_code in (200, 201):
        return True
    else:
        return response.text  # return the failure reason for inspection


def generate_post_title(item_count):
    titles = [
        f"My top {item_count} recommendations right now",
        f"{item_count} items that deserve your attention",
        f"Here's my carefully selected list of {item_count} favorites",
        f"{item_count} things you shouldn't miss",
        f"A collection of {item_count} must-experience items",
    ]
    return random.choice(titles)

def generate_post_content(title, item_count):
    return (
        f"{title} Each one offers something unique. "
        f"Together, they create a diverse, enjoyable experience. Let me know what you think!"
    )

def chunk_items(items, size=5):
    for i in range(0, len(items), size):
        yield items[i:i + size]

def process_user_items(csv_file_path):
    # Step 1: Login as admin
    admin_token = login(ADMIN_USERNAME, ADMIN_PASSWORD)
    if not admin_token:
        print("❌ Admin login failed. Aborting.")
        return

    # Step 2: Read user-item mappings from CSV
    user_items = {}
    with open(csv_file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            user_id = row['user_id']
            item_id = row['precordsid']
            user_items.setdefault(user_id, []).append(item_id)

    print(f"📦 Loaded {len(user_items)} users from CSV")

    successful_posts, failed_posts = 0, 0

    for i, (user_id, items) in enumerate(user_items.items(), start=1):
        user_info = get_user_details(user_id, admin_token)
        if not user_info or 'username' not in user_info:
            print(f"[{i}] Skipping user_id={user_id} (no username)")
            continue

        username = user_info['username']
        user_token = login(username, USER_PASSWORD)
        if not user_token:
            print(f"[{i}] Skipping user {username} (login failed)")
            continue

        # Post in batches of 5 items
        for batch_index, item_batch in enumerate(chunk_items(items, size=5), start=1):
            title = generate_post_title(len(item_batch))
            content = generate_post_content(title, len(item_batch))

        success = create_post(user_token, title, content, item_batch)
        if success is True:
            print(f"[{i}] ✅ Post {batch_index} created for {username} ({len(item_batch)} items)")
            successful_posts += 1
        else:
            print(f"[{i}] ❌ Post {batch_index} failed for {username}")
            print(f"    ↳ Reason: {success}")  # success holds the response text when failure
            failed_posts += 1

            time.sleep(0.1)  # avoid flooding the API

        if i % 10 == 0:
            print(f"Progress: {i}/{len(user_items)} users processed")

    print("\n🎉 Post creation complete.")
    print(f"✅ Success: {successful_posts}")
    print(f"❌ Failed: {failed_posts}")

if __name__ == "__main__":
    process_user_items(CSV_FILE_PATH)

# import requests
# import csv
# import time
# import random

# def get_user_details(api_url, user_id):
#     """
#     Get user details from the API using user ID
#     """
#     try:
#         response = requests.get(f"{api_url}/api/user/?id={user_id}")
#         if response.status_code == 200:
#             return response.json()
#         else:
#             print(f"Failed to get user details for ID {user_id}. Status code: {response.status_code}")
#             print(f"Response: {response.text}")
#             return None
#     except Exception as e:
#         print(f"Error getting user details for ID {user_id}: {str(e)}")
#         return None

# def login_user(api_url, username, password):
#     """
#     Log in user and get access token
#     """
#     try:
#         form_data = {
#             'username': username,
#             'password': password
#         }
        
#         response = requests.post(f"{api_url}/api/login/", data=form_data)
        
#         if response.status_code == 200:
#             return response.json()
#         else:
#             print(f"Failed to login user {username}. Status code: {response.status_code}")
#             print(f"Response: {response.text}")
#             return None
#     except Exception as e:
#         print(f"Error logging in user {username}: {str(e)}")
#         return None

# def generate_post_title(item_count):
#     """
#     Generate a random post title that acknowledges multiple items
#     """
#     titles = [
#         f"My top {item_count} recommendations right now",
#         "Check out this amazing collection I've curated",
#         f"{item_count} items that deserve your attention",
#         "My latest obsessions - a curated list",
#         "The ultimate collection I can't stop thinking about",
#         f"Here's my carefully selected list of {item_count} favorites",
#         "A diverse collection worth exploring",
#         "Just discovered these gems - had to share!",
#         "This eclectic mix will brighten your day",
#         "My personal picks - something for everyone here",
#         f"These {item_count} items make the perfect combination",
#         "Curated content that's worth your time",
#         "From my collection to yours - my current favorites",
#         "This varied selection has been my recent go-to",
#         "The perfect starter pack for enthusiasts",
#         f"A collection of {item_count} must-experience items",
#         "The ultimate recommendation bundle",
#         "My hand-picked favorites - a comprehensive list",
#         "Weekend essentials: My curated selection",
#         f"{item_count} things you shouldn't miss",
#         "The perfect combination - my current rotation",
#         "My current obsessions - all in one place",
#         "Community favorites I've assembled for you",
#         "This collection has something for every mood",
#         "Hidden treasures I've gathered for you",
#         "My essential collection for connoisseurs",
#         f"I found these {item_count} gems you need to check out",
#         "This custom-made selection won't disappoint",
#         "An eclectic mix that works surprisingly well together",
#         "My favorite finds - bundled for your convenience"
#     ]
    
#     return random.choice(titles)

# def generate_post_content(title, item_count):
#     """
#     Generate descriptive content that acknowledges multiple items
#     """
#     content_templates = [
#         f"{title} I've been exploring these items lately and had to share this collection with everyone. Each piece brings something unique to the table, creating an experience that's greater than the sum of its parts. Whether you're new to this or a seasoned enthusiast, there's something here that will resonate with you.",
        
#         f"{title} After carefully curating this collection, I'm excited to share these finds with the community. What ties these items together is their exceptional quality and distinctive character. I've arranged them in an order that creates a natural flow, but feel free to explore them however you prefer.",
        
#         f"{title} This collection represents some of my favorite discoveries recently. The variety here offers different perspectives and experiences, yet they complement each other beautifully. I'd love to hear which ones resonate most with you and if you have similar recommendations to add.",
        
#         f"{title} I spent considerable time assembling this carefully selected group of items. Each one stands on its own merits, but together they create a comprehensive experience that covers different styles, moods, and approaches. Perfect for when you want to explore a range of content in one sitting.",
        
#         f"{title} There's something special about finding items that work well together, and this collection hits that sweet spot. From the thought-provoking to the purely entertaining, I've included a balanced mix that showcases the diversity available in this space. Don't miss out on any of these gems!",
        
#         f"{title} Whether you're looking for inspiration, entertainment, or education, this curated selection offers a bit of everything. I've included both well-known classics and hidden gems, creating a balanced collection that demonstrates the breadth and depth of what's available. Dive in and discover your next favorite!",
        
#         f"{title} What makes this collection special is how these distinct items create a cohesive experience when experienced together. I've arranged them to highlight their complementary qualities while showcasing their individual strengths. There's a natural progression here that enhances the overall impact.",
        
#         f"{title} I'm always on the lookout for exceptional content, and these items represent the best of what I've found recently. While diverse in their approaches, they share a commitment to quality and creativity that sets them apart. This collection offers something for every mood and occasion.",
        
#         f"{title} After weeks of exploration, I've assembled this collection that represents the very best in their respective categories. What's fascinating is how they complement each other despite their differences. This carefully balanced selection provides a well-rounded experience that covers all the bases.",
        
#         f"{title} I believe in quality over quantity, but sometimes you can have both. This collection brings together {item_count} outstanding items that collectively offer an unmatched experience. There's a deliberate sequence here that enhances the journey, though each piece stands strong independently.",
        
#         f"{title} There's an art to curation, finding pieces that create harmony when experienced together. This collection represents my attempt to create that perfect balance - distinctive items that somehow feel connected through their excellence. I'd recommend experiencing them in the order presented for maximum impact.",
        
#         f"{title} Some collections are random, but this one was carefully assembled to create a specific experience. Each item contributes something essential to the whole, creating a journey from start to finish. The contrast between these pieces actually enhances what makes each one special.",
        
#         f"{title} What I love about this collection is the diversity it offers. From the immediately accessible to the more acquired tastes, I've included items that cover the full spectrum. Start with whatever appeals most to you, but I encourage exploring all of them for the complete experience.",
        
#         f"{title} Finding one excellent item is exciting, but discovering several that work together is truly special. This collection combines familiar styles with unexpected twists, creating a curated experience that showcases the incredible range available to us. Each addition was carefully considered for what it adds to the whole.",
        
#         f"{title} This collection began with one standout item, and I built around it to create something greater than the sum of its parts. The juxtaposition of different styles and approaches creates an interesting dialogue between the pieces. Notice how certain themes and elements recur throughout the collection in different ways.",
        
#         f"{title} For those who appreciate thoughtful curation, this collection brings together {item_count} items that create a cohesive experience. I've been refining this selection for months, adding and removing pieces until the balance felt right. What you see here represents that perfect equilibrium I was searching for."
#     ]
    
#     return random.choice(content_templates)

# def create_post(api_url, access_token, post_data):
#     """
#     Create a post using the provided access token and post data
#     """
#     try:
#         headers = {
#             'Authorization': f'Bearer {access_token}'
#         }
        
#         response = requests.post(
#             f"{api_url}/api/posts/",
#             headers=headers,
#             data=post_data
#         )
        
#         if response.status_code in [200, 201]:
#             return response.json()
#         else:
#             print(f"Failed to create post. Status code: {response.status_code}")
#             print(f"Response: {response.text}")
#             return None
#     except Exception as e:
#         print(f"Error creating post: {str(e)}")
#         return None

# def process_user_items_csv(csv_file_path, api_base_url):
#     """
#     Process the user-item mappings CSV, login each user, and create posts
#     """
#     # Dictionary to map user_ids to their items
#     user_items = {}
    
#     # Read CSV file and organize data by user
#     try:
#         with open(csv_file_path, 'r') as csvfile:
#             reader = csv.DictReader(csvfile)
            
#             # Check if required columns exist
#             required_columns = ['user_id', 'precordsid']  # Adjust based on your CSV structure
#             for column in required_columns:
#                 if column not in reader.fieldnames:
#                     print(f"Error: CSV file must contain a '{column}' column")
#                     return None
            
#             # Group items by user_id
#             for row in reader:
#                 user_id = row['user_id']
#                 if user_id not in user_items:
#                     user_items[user_id] = []
                
#                 # Store the item_id for each user
#                 user_items[user_id].append(row['precordsid'])
        
#         print(f"Found {len(user_items)} unique users with items in the CSV file")
        
#         # Process each user and their items
#         successful_posts = 0
#         failed_posts = 0
        
#         for i, (user_id, items) in enumerate(user_items.items()):
#             # Get user details
#             user_details_response = get_user_details(api_base_url, user_id)
            
#             if user_details_response and user_details_response.get('error') == '0':
#                 user_data = user_details_response.get('data', {})
#                 username = user_data.get('username')
                
#                 if username:
#                     # For this script, we're assuming password is the same as username
#                     password = "123456"
                    
#                     # Login with username and password
#                     login_response = login_user(api_base_url, username, password)
                    
#                     if login_response and 'access_token' in login_response:
#                         access_token = login_response['access_token']
#                         print(f"[User {i+1}/{len(user_items)}] Successfully logged in as: {username}")
                        
#                         # Create a post for this user with their items
#                         if items:
#                             # Count the number of items
#                             item_count = len(items)
                            
#                             # Generate post title and content based on item count
#                             title = generate_post_title(item_count)
#                             content = generate_post_content(title, item_count)
                            
#                             # Prepare form data for the post
#                             post_data = {
#                                 'title': title,
#                                 'content': content
#                             }
                            
#                             # Add items to the form data
#                             # In the API call, items can be specified multiple times with the same key
#                             for item_id in items:
#                                 post_data['items'] = item_id
                            
#                             # Create the post
#                             post_response = create_post(api_base_url, access_token, post_data)
                            
#                             if post_response:
#                                 successful_posts += 1
#                                 print(f"  - Created post for user {username} with {item_count} items")
#                             else:
#                                 failed_posts += 1
#                                 print(f"  - Failed to create post for user {username}")
#                         else:
#                             print(f"  - No items found for user {username}, skipping post creation")
                        
#                         # Add a small delay to avoid overwhelming the server
#                         time.sleep(0.1)
#                     else:
#                         print(f"[User {i+1}/{len(user_items)}] Failed to get access token for user: {username}")
#                 else:
#                     print(f"[User {i+1}/{len(user_items)}] Username not found in user details for ID: {user_id}")
#             else:
#                 print(f"[User {i+1}/{len(user_items)}] Failed to get valid user details for ID: {user_id}")
            
#             # Print progress every 10 users
#             if (i + 1) % 10 == 0:
#                 print(f"Progress: {i+1}/{len(user_items)} users processed")
        
#         print(f"\nPost creation complete!")
#         print(f"Successfully created: {successful_posts} posts")
#         print(f"Failed to create: {failed_posts} posts")
        
#     except FileNotFoundError:
#         print(f"Error: CSV file not found at {csv_file_path}")
#         return None
#     except Exception as e:
#         print(f"Error processing CSV file: {str(e)}")
#         return None

# if __name__ == "__main__":
#     # CSV file path - replace with your actual file path
#     csv_file_path = "user_item_mappings.csv"
    
#     # API base URL
#     api_base_url = "http://localhost:8001"
    
#     # Process the CSV, login users, and create posts
#     process_user_items_csv(csv_file_path, api_base_url)