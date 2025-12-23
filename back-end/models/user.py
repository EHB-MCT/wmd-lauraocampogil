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