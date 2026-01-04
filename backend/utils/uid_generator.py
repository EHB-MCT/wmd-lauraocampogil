"""
Unique user identifiers for tracking purposes
"""

import uuid
from datetime import datetime


def generate_uid():
    unique_id = uuid.uuid4().hex[:12]
    return f"user_{unique_id}"


def generate_session_id():
    unique_id = uuid.uuid4().hex[:12]
    timestamp = int(datetime.now().timestamp())
    return f"session_{unique_id}_{timestamp}"


def is_valid_uid(uid):
    if not uid or not isinstance(uid, str):
        return False
    
    if not uid.startswith('user_'):
        return False
    
    uid_part = uid.replace('user_', '')
    
    if len(uid_part) != 12:
        return False
    
    try:
        int(uid_part, 16) 
        return True
    except ValueError:
        return False


def is_valid_session_id(session_id):
    if not session_id or not isinstance(session_id, str):
        return False
    
    if not session_id.startswith('session_'):
        return False
    
    parts = session_id.split('_')
    if len(parts) != 3:
        return False
    try:
        int(parts[1], 16)
    except ValueError:
        return False
    
    try:
        int(parts[2])
        return True
    except ValueError:
        return False
