"""
Validates tracking data before database storage.
"""

from datetime import datetime
from utils.uid_generator import is_valid_uid, is_valid_session_id


ALLOWED_EVENT_TYPES = [
    'click',
    'hover',
    'scroll',
    'page_view',
    'session_start',
    'session_end',
    'element_focus',
    'mouse_move',
    'key_press',
    'form_submit'
]

MAX_STRING_LENGTH = 500
MAX_URL_LENGTH = 2000


def validate_tracking_data(data):
    if not isinstance(data, dict):
        return False, "Data must be a dictionary"
    
    required_fields = ['user_id', 'event_type', 'timestamp']
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    if not is_valid_uid(data['user_id']):
        return False, "Invalid user_id format"

    if data['event_type'] not in ALLOWED_EVENT_TYPES:
        return False, f"Invalid event_type. Must be one of: {', '.join(ALLOWED_EVENT_TYPES)}"
    
    if not isinstance(data['timestamp'], (int, float)):
        return False, "Timestamp must be a number"
    
    current_time = datetime.now().timestamp()
    time_diff = abs(current_time - data['timestamp'])
    
    if time_diff > 3600:
        return False, "Timestamp is too far from current time"
    
    if 'session_id' in data:
        if not is_valid_session_id(data['session_id']):
            return False, "Invalid session_id format"
    
    string_fields = ['element', 'page_url', 'target', 'value']
    for field in string_fields:
        if field in data:
            if not isinstance(data[field], str):
                return False, f"{field} must be a string"
            
            max_length = MAX_URL_LENGTH if field == 'page_url' else MAX_STRING_LENGTH
            if len(data[field]) > max_length:
                return False, f"{field} exceeds maximum length of {max_length}"
    
    numeric_fields = ['x', 'y', 'scroll_depth', 'duration']
    for field in numeric_fields:
        if field in data:
            if not isinstance(data[field], (int, float)):
                return False, f"{field} must be a number"
            
            # Reasonable bounds for coordinates and metrics
            if field in ['x', 'y'] and (data[field] < 0 or data[field] > 10000):
                return False, f"{field} must be between 0 and 10000"
            
            if field == 'scroll_depth' and (data[field] < 0 or data[field] > 100):
                return False, "scroll_depth must be between 0 and 100"
            
            if field == 'duration' and (data[field] < 0 or data[field] > 86400000):
                return False
    
    return True, None


def sanitize_tracking_data(data):
    sanitized = {}
    
    allowed_fields = [
        'user_id', 'session_id', 'event_type', 'timestamp',
        'element', 'page_url', 'target', 'value',
        'x', 'y', 'scroll_depth', 'duration',
        'metadata'
    ]
    
    for field in allowed_fields:
        if field in data:
            if isinstance(data[field], str):
                sanitized[field] = data[field].replace('<', '').replace('>', '').strip()
            else:
                sanitized[field] = data[field]
    
    return sanitized


def validate_user_data(data):
    if not isinstance(data, dict):
        return False, "Data must be a dictionary"
    
    if 'user_id' not in data:
        return False, "Missing required field: user_id"
    
    if not is_valid_uid(data['user_id']):
        return False, "Invalid user_id format"
    
    return True, None


def validate_query_params(params):
    if 'limit' in params:
        try:
            limit = int(params['limit'])
            if limit < 1 or limit > 1000:
                return False, "Limit must be between 1 and 1000"
        except (ValueError, TypeError):
            return False, "Limit must be an integer"
    
    date_fields = ['start_date', 'end_date']
    for field in date_fields:
        if field in params:
            try:
                datetime.fromisoformat(params[field])
            except (ValueError, TypeError):
                return False, f"{field} must be in ISO format (YYYY-MM-DD)"
    
    return True, None
