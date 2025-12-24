"""
Handles all database operations related to users
"""

from datetime import datetime
from utils.database import get_collection
from models.user import User


class UserRepository:    
    def __init__(self):
        self.collection = get_collection('users')
    
    def create_user(self, user):
        try:
            user_data = user.to_dict()
            result = self.collection.insert_one(user_data)
            return user.user_id
        except Exception as e:
            raise Exception(f"Failed to create user: {str(e)}")
    
    def get_user_by_id(self, user_id):
        try:
            user_data = self.collection.find_one({'user_id': user_id})
            if user_data:
                return User.from_dict(user_data)
            return None
        except Exception as e:
            print(f"Error retrieving user {user_id}: {e}")
            return None
    
    def user_exists(self, user_id):
        try:
            count = self.collection.count_documents({'user_id': user_id})
            return count > 0
        except Exception as e:
            print(f"Error checking user existence: {e}")
            return False
    
