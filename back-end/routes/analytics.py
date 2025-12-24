"""
Retrieving analytics data
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

from utils.database import get_collection
from utils.data_validator import validate_query_params

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/user/<user_id>', methods=['GET'])
def get_user_analytics(user_id):
    try:
        interactions_collection = get_collection('interactions')
        
        recent_interactions = list(interactions_collection.find(
            {'user_id': user_id}
        ).sort('timestamp', -1).limit(100))
        
        clicked_elements = {}
        for interaction in recent_interactions:
            if interaction['event_type'] == 'click' and 'element' in interaction:
                element = interaction['element']
                clicked_elements[element] = clicked_elements.get(element, 0) + 1
        
        top_interests = sorted(clicked_elements.items(), key=lambda x: x[1], reverse=True)[:5]
        
        hour_activity = {}
        for interaction in recent_interactions:
            timestamp = interaction.get('timestamp')
            if timestamp:
                hour = datetime.fromtimestamp(timestamp).hour
                hour_activity[hour] = hour_activity.get(hour, 0) + 1
        
        peak_hours = sorted(hour_activity.items(), key=lambda x: x[1], reverse=True)[:3]
        
        engagement_score = len(recent_interactions) * 10
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'analytics': {
                'total_interactions': len(recent_interactions),
                'top_interests': [{'element': elem, 'clicks': count} for elem, count in top_interests],
                'peak_activity_hours': [{'hour': hour, 'interactions': count} for hour, count in peak_hours],
                'engagement_score': engagement_score
            },
            'recommendations': {
                'suggested_hashtags': _generate_hashtag_recommendations(clicked_elements),
                'optimal_post_time': _suggest_optimal_time(hour_activity)
            }
        }), 200
        
    except Exception as e:
        print(f"Error getting user analytics: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@analytics_bp.route('/trending', methods=['GET'])
def get_trending():
    try:
        interactions_collection = get_collection('interactions')
        
        yesterday = datetime.now() - timedelta(days=1)
        recent_clicks = list(interactions_collection.find({
            'event_type': 'click',
            'timestamp': {'$gte': yesterday.timestamp()}
        }))
        
        element_counts = {}
        for click in recent_clicks:
            element = click.get('element', '')
            if element.startswith('hashtag-'):
                hashtag = element.replace('hashtag-', '')
                element_counts[hashtag] = element_counts.get(hashtag, 0) + 1
        
        trending = sorted(element_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return jsonify({
            'success': True,
            'trending': [
                {
                    'hashtag': tag,
                    'clicks': count,
                    'trending_score': count * 100
                }
                for tag, count in trending
            ]
        }), 200
        
    except Exception as e:
        print(f"Error getting trending data: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


def _generate_hashtag_recommendations(clicked_elements):
    hashtags = []
    for element in clicked_elements:
        if 'hashtag' in element.lower():
            hashtags.append(element.replace('hashtag-', ''))
    
    related_hashtags = [
        'WomensFootball',
        'UWCL',
        'RedFlames',
        'WomenInSports',
        'FemaleSoccer'
    ]
    
    return hashtags[:3] + related_hashtags[:2]


def _suggest_optimal_time(hour_activity):
    if not hour_activity:
        return "09:00" 
    
    peak_hour = max(hour_activity.items(), key=lambda x: x[1])[0]
    
    return f"{peak_hour:02d}:00"
