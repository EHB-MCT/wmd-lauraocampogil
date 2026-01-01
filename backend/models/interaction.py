"""
Interaction Model
Represents a single user interaction event
"""

from datetime import datetime

class Interaction:
    def __init__(self, user_id, event_type, data=None, timestamp=None):
        self.user_id = user_id
        self.event_type = event_type
        self.data = data or {}
        self.timestamp = timestamp or datetime.utcnow()
        self.session_id = data.get('session_id') if data else None
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'event_type': self.event_type,
            'timestamp': self.timestamp,
            'session_id': self.session_id,
            'data': self.data
        }
    
    @staticmethod
    def from_dict(data):
        return Interaction(
            user_id=data.get('user_id'),
            event_type=data.get('event_type'),
            data=data.get('data'),
            timestamp=data.get('timestamp')
        )
