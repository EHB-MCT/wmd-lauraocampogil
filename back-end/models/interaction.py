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