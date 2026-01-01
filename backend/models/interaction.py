"""
User interaction event (click, hover, scroll)
"""
from datetime import datetime


class Interaction:
    def __init__(self, user_id, event_type, timestamp=None, **kwargs):
        self.user_id = user_id
        self.event_type = event_type
        self.timestamp = timestamp or datetime.now().timestamp()
        
        # Optional fields
        self.session_id = kwargs.get('session_id')
        self.element = kwargs.get('element')
        self.page_url = kwargs.get('page_url')
        self.target = kwargs.get('target')
        self.value = kwargs.get('value')
        self.x = kwargs.get('x')
        self.y = kwargs.get('y')
        self.scroll_depth = kwargs.get('scroll_depth')
        self.duration = kwargs.get('duration')
        self.metadata = kwargs.get('metadata', {})
        
        # Auto-generated fields
        self.created_at = datetime.now()
            def to_dict(self):
        data = {
            'user_id': self.user_id,
            'event_type': self.event_type,
            'timestamp': self.timestamp,
            'created_at': self.created_at
        }
        
        optional_fields = [
            'session_id', 'element', 'page_url', 'target', 'value',
            'x', 'y', 'scroll_depth', 'duration', 'metadata'
        ]
        
        for field in optional_fields:
            value = getattr(self, field, None)
            if value is not None:
                data[field] = value
        
        return data
    
    @staticmethod
    def from_dict(data):
        interaction = Interaction(
            user_id=data['user_id'],
            event_type=data['event_type'],
            timestamp=data.get('timestamp'),
            **{k: v for k, v in data.items() if k not in ['user_id', 'event_type', 'timestamp', 'created_at']}
        )
        if 'created_at' in data:
            interaction.created_at = data['created_at']
        
        return interaction