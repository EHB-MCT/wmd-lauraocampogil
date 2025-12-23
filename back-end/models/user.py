"""
Profile and behavior of the user
"""
from datetime import datetime
from utils.uid_generator import generate_uid


class User:
    def __init__(self, user_id=None, fingerprint=None, metadata=None):
        self.user_id = user_id or generate_uid()
        self.fingerprint = fingerprint or {}
        self.metadata = metadata or {}
        self.created_at = datetime.now()
        self.last_seen = datetime.now()
        self.total_interactions = 0
        self.total_sessions = 0
        
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'fingerprint': self.fingerprint,
            'metadata': self.metadata,
            'created_at': self.created_at,
            'last_seen': self.last_seen,
            'total_interactions': self.total_interactions,
            'total_sessions': self.total_sessions
        }
    def to_dict(self):
        """
        Convert User instance to dictionary for MongoDB storage
        """
        return {
            'user_id': self.user_id,
            'fingerprint': self.fingerprint,
            'metadata': self.metadata,
            'created_at': self.created_at,
            'last_seen': self.last_seen,
            'total_interactions': self.total_interactions,
            'total_sessions': self.total_sessions
        }
    
    @staticmethod
    def from_dict(data):
        user = User(
            user_id=data.get('user_id'),
            fingerprint=data.get('fingerprint', {}),
            metadata=data.get('metadata', {})
        )
        
        if 'created_at' in data:
            user.created_at = data['created_at']
        if 'last_seen' in data:
            user.last_seen = data['last_seen']
        
        user.total_interactions = data.get('total_interactions', 0)
        user.total_sessions = data.get('total_sessions', 0)
        
        return user
    
    def update_last_seen(self):
        self.last_seen = datetime.now()
    
    def increment_interactions(self):
        self.total_interactions += 1
    
    def increment_sessions(self):
        self.total_sessions += 1