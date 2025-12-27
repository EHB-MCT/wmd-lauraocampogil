"""
Receiving and storing user tracking data.
"""

from flask import Blueprint, request, jsonify
from datetime import datetime

from utils.data_validator import validate_tracking_data, sanitize_tracking_data
from utils.database import get_collection
from repositories.user_repository import UserRepository
from models.user import User
from models.interaction import Interaction

tracking_bp = Blueprint('tracking', __name__)


user_repo = UserRepository()


@tracking_bp.route('/event', methods=['POST'])
def track_event():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        is_valid, error_message = validate_tracking_data(data)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_message
            }), 400
        clean_data = sanitize_tracking_data(data)
        
        user_id = clean_data['user_id']
        
        if not user_repo.user_exists(user_id):
            fingerprint = {
                'user_agent': request.headers.get('User-Agent'),
                'ip_address': request.remote_addr,
                'accept_language': request.headers.get('Accept-Language'),
                'screen_resolution': clean_data.get('metadata', {}).get('screen_resolution'),
                'timezone': clean_data.get('metadata', {}).get('timezone')
            }
            
            new_user = User(user_id=user_id, fingerprint=fingerprint)
            user_repo.create_user(new_user)

        interaction = Interaction(
            user_id=user_id,
            event_type=clean_data['event_type'],
            timestamp=clean_data['timestamp'],
            session_id=clean_data.get('session_id'),
            element=clean_data.get('element'),
            page_url=clean_data.get('page_url'),
            target=clean_data.get('target'),
            value=clean_data.get('value'),
            x=clean_data.get('x'),
            y=clean_data.get('y'),
            scroll_depth=clean_data.get('scroll_depth'),
            duration=clean_data.get('duration'),
            metadata=clean_data.get('metadata', {})
        )
        
        interactions_collection = get_collection('interactions')
        interactions_collection.insert_one(interaction.to_dict())
        
        user_repo.update_last_seen(user_id)
        user_repo.increment_interactions(user_id)
        
        return jsonify({
            'success': True,
            'message': 'Event tracked successfully'
        }), 201
        
    except Exception as e:
        print(f"Error tracking event: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@tracking_bp.route('/batch', methods=['POST'])
def track_batch():
    try:
        data = request.get_json()
        
        if not data or 'events' not in data:
            return jsonify({
                'success': False,
                'error': 'No events provided'
            }), 400
        
        events = data['events']
        
        if not isinstance(events, list):
            return jsonify({
                'success': False,
                'error': 'Events must be an array'
            }), 400
        

        if len(events) > 100:
            return jsonify({
                'success': False,
                'error': 'Maximum 100 events per batch'
            }), 400
        
        successful = 0
        failed = 0
        errors = []
        
        for event in events:
            is_valid, error_message = validate_tracking_data(event)
            if not is_valid:
                failed += 1
                errors.append(error_message)
                continue
            
            clean_data = sanitize_tracking_data(event)
            
            try:
                interaction = Interaction(
                    user_id=clean_data['user_id'],
                    event_type=clean_data['event_type'],
                    timestamp=clean_data['timestamp'],
                    **{k: v for k, v in clean_data.items() 
                if k not in ['user_id', 'event_type', 'timestamp']}
                )
                
                interactions_collection = get_collection('interactions')
                interactions_collection.insert_one(interaction.to_dict())
                
                successful += 1
                
            except Exception as e:
                failed += 1
                errors.append(str(e))
        
        return jsonify({
            'success': True,
            'processed': len(events),
            'successful': successful,
            'failed': failed,
            'errors': errors if errors else None
        }), 201
        
    except Exception as e:
        print(f"Error in batch tracking: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@tracking_bp.route('/session/start', methods=['POST'])
def start_session():
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data or 'session_id' not in data:
            return jsonify({
                'success': False,
                'error': 'user_id and session_id required'
            }), 400
        
        user_id = data['user_id']
        session_id = data['session_id']
        
        sessions_collection = get_collection('sessions')
        session_data = {
            'user_id': user_id,
            'session_id': session_id,
            'started_at': datetime.now(),
            'active': True
        }
        
        sessions_collection.insert_one(session_data)
        
        user_repo.increment_sessions(user_id)
        
        return jsonify({
            'success': True,
            'message': 'Session started',
            'session_id': session_id
        }), 201
        
    except Exception as e:
        print(f"Error starting session: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@tracking_bp.route('/session/end', methods=['POST'])
def end_session():
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data or 'session_id' not in data:
            return jsonify({
                'success': False,
                'error': 'user_id and session_id required'
            }), 400
        
        user_id = data['user_id']
        session_id = data['session_id']
        
        sessions_collection = get_collection('sessions')
        sessions_collection.update_one(
            {
                'user_id': user_id,
                'session_id': session_id
            },
            {
                '$set': {
                    'ended_at': datetime.now(),
                    'active': False
                }
            }
        )
        
        return jsonify({
            'success': True,
            'message': 'Session ended'
        }), 200
        
    except Exception as e:
        print(f"Error ending session: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
