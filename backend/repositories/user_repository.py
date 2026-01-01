"""
Handles all database operations related to users.
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
    
    def update_user(self, user_id, update_data):
        try:
            result = self.collection.update_one(
                {'user_id': user_id},
                {'$set': update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating user {user_id}: {e}")
            return False
    
    def update_last_seen(self, user_id):
        return self.update_user(user_id, {
            'last_seen': datetime.now()
        })
    
    def increment_interactions(self, user_id):
        try:
            result = self.collection.update_one(
                {'user_id': user_id},
                {'$inc': {'total_interactions': 1}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error incrementing interactions for {user_id}: {e}")
            return False
    
    def increment_sessions(self, user_id):
        try:
            result = self.collection.update_one(
                {'user_id': user_id},
                {'$inc': {'total_sessions': 1}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error incrementing sessions for {user_id}: {e}")
            return False
    
    def get_all_users(self, limit=100, skip=0):
        try:
            users_data = self.collection.find().limit(limit).skip(skip)
            return [User.from_dict(data) for data in users_data]
        except Exception as e:
            print(f"Error retrieving users: {e}")
            return []
    
    def get_user_count(self):
        try:
            return self.collection.count_documents({})
        except Exception as e:
            print(f"Error counting users: {e}")
            return 0
    
    def get_users_by_date_range(self, start_date, end_date):
        try:
            users_data = self.collection.find({
                'created_at': {
                    '$gte': start_date,
                    '$lte': end_date
                }
            })
            return [User.from_dict(data) for data in users_data]
        except Exception as e:
            print(f"Error retrieving users by date: {e}")
            return []
    
    def delete_user(self, user_id):
        try:
            result = self.collection.delete_one({'user_id': user_id})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting user {user_id}: {e}")
            return False
