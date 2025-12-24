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

    @admin_bp.route('/users/<user_id>', methods=['GET'])
def get_user_details(user_id):

    try:
        user = user_repo.get_user_by_id(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        

        interactions_collection = get_collection('interactions')
        interactions = list(interactions_collection.find(
            {'user_id': user_id}
        ).sort('timestamp', -1).limit(500))
        

        interactions_data = [
            {
                'event_type': i['event_type'],
                'timestamp': datetime.fromtimestamp(i['timestamp']).isoformat(),
                'element': i.get('element'),
                'page_url': i.get('page_url'),
                'x': i.get('x'),
                'y': i.get('y')
            }
            for i in interactions
        ]
        

        sessions_collection = get_collection('sessions')
        sessions = list(sessions_collection.find({'user_id': user_id}))
        
        return jsonify({
            'success': True,
            'user': {
                'user_id': user.user_id,
                'created_at': user.created_at.isoformat() if hasattr(user.created_at, 'isoformat') else str(user.created_at),
                'last_seen': user.last_seen.isoformat() if hasattr(user.last_seen, 'isoformat') else str(user.last_seen),
                'total_interactions': user.total_interactions,
                'total_sessions': user.total_sessions,
                'fingerprint': user.fingerprint
            },
            'interactions': interactions_data,
            'sessions_count': len(sessions)
        }), 200
        
    except Exception as e:
        print(f"Error getting user details: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@admin_bp.route('/stats', methods=['GET'])
def get_overall_stats():
    try:
        users_collection = get_collection('users')
        interactions_collection = get_collection('interactions')
        sessions_collection = get_collection('sessions')
        
        total_users = users_collection.count_documents({})
        total_interactions = interactions_collection.count_documents({})
        total_sessions = sessions_collection.count_documents({})
        
        seven_days_ago = datetime.now() - timedelta(days=7)
        new_users_week = users_collection.count_documents({
            'created_at': {'$gte': seven_days_ago}
        })

        event_pipeline = [
            {'$group': {'_id': '$event_type', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
        event_stats = list(interactions_collection.aggregate(event_pipeline))

        user_pipeline = [
            {'$group': {'_id': '$user_id', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
        top_users = list(interactions_collection.aggregate(user_pipeline))
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'total_interactions': total_interactions,
                'total_sessions': total_sessions,
                'new_users_this_week': new_users_week,
                'avg_interactions_per_user': round(total_interactions / total_users, 2) if total_users > 0 else 0
            },
            'event_types': [
                {'type': item['_id'], 'count': item['count']}
                for item in event_stats
            ],
            'top_users': [
                {'user_id': item['_id'], 'interactions': item['count']}
                for item in top_users
            ]
        }), 200
        
    except Exception as e:
        print(f"Error getting stats: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500