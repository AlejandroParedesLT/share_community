from django.db import connection
from models.items import *
from models.users import *


class SocialMediaDBService:
    """Handles calls to stored procedures for social media data."""

    @staticmethod
    def get_user_posts(user_id):
        with connection.cursor() as cursor:
            cursor.callproc("get_user_posts", [user_id])
            results = cursor.fetchall()

        # Return list of dictionaries
        return [{"id": row[0], "title": row[1], "content": row[2], "created_at": row[3]} for row in results]
    