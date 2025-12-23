"""
Admin dashboard to view and manage all collected user data.
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

from utils.database import get_collection
from repositories.user_repository import UserRepository

admin_bp = Blueprint('admin', __name__)

user_repo = UserRepository()


@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    try:
        limit = min(int(request.args.get('limit', 50)), 100)
        skip = int(request.args.get('skip', 0))
        
        users = user_repo.get_all_users(limit=limit, skip=skip)
        total_count = user_repo.get_user_count()
        
        users_data = [
            {
                'user_id': user.user_id,
                'created_at': user.created_at.isoformat() if hasattr(user.created_at, 'isoformat') else str(user.created_at),
                'last_seen': user.last_seen.isoformat() if hasattr(user.last_seen, 'isoformat') else str(user.last_seen),
                'total_interactions': user.total_interactions,
                'total_sessions': user.total_sessions,
                'fingerprint': user.fingerprint
            }
            for user in users
        ]
        
        return jsonify({
            'success': True,
            'users': users_data,
            'pagination': {
                'total': total_count,
                'limit': limit,
                'skip': skip,
                'has_more': (skip + limit) < total_count
            }
        }), 200
        
    except Exception as e:
        print(f"Error getting users: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500