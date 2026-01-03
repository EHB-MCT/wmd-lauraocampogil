from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://admin:admin123@mongodb:27017/womens_football_analytics?authSource=admin')
client = MongoClient(MONGODB_URI)
db = client['womens_football_analytics']

# Collections
sessions_collection = db['sessions']
events_collection = db['events']
users_collection = db['users']

# Create indexes
def create_indexes():
    try:
        sessions_collection.create_index([("user_id", 1)])
        sessions_collection.create_index([("session_id", 1)])
        events_collection.create_index([("user_id", 1)])
        events_collection.create_index([("session_id", 1)])
        events_collection.create_index([("timestamp", 1)])
        print("✓ Database indexes created successfully")
    except Exception as e:
        print(f"Error creating indexes: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e)
        }), 500

@app.route('/api/tracking/session/start', methods=['POST', 'OPTIONS'])
def start_session():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.json
    session_data = {
        'user_id': data.get('user_id'),
        'session_id': data.get('session_id'),
        'fingerprint': data.get('fingerprint'),
        'start_time': datetime.utcnow(),
        'active': True
    }
    
    result = sessions_collection.insert_one(session_data)
    
    return jsonify({
        'success': True,
        'session_id': session_data['session_id']  # FIXED: was session_ta
    }), 201

@app.route('/api/tracking/session/end', methods=['POST', 'OPTIONS'])
def end_session():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.json
    sessions_collection.update_one(
        {'session_id': data.get('session_id')},
        {'$set': {
            'end_time': datetime.utcnow(),
            'active': False
        }}
    )
    
    return jsonify({'success': True}), 200

@app.route('/api/tracking/event', methods=['POST', 'OPTIONS'])
def track_event():
    if request.method == 'OPTIONS':
        return '', 204
    
    event_data = request.json
    event_data['timestamp'] = datetime.utcnow()
    
    events_collection.insert_one(event_data)
    
    return jsonify({'success': True}), 201

@app.route('/api/tracking/batch', methods=['POST', 'OPTIONS'])
def batch_events():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.json
    events = data.get('events', [])
    
    for event in events:
        event['timestamp'] = datetime.utcnow()
    
    if events:
        events_collection.insert_many(events)
    
    return jsonify({
        'success': True,
        'count': len(events)
    }), 201

@app.route('/api/analytics/user/<user_id>', methods=['GET', 'OPTIONS'])
def get_user_analytics(user_id):
    if request.method == 'OPTIONS':
        return '', 204
    
    # Get user events
    events = list(events_collection.find({'user_id': user_id}).sort('timestamp', -1).limit(100))
    
    # Calculate analytics
    total_events = events_collection.count_documents({'user_id': user_id})
    
    analytics = {
        'total_events': total_events,
        'recent_events': len(events),
        'most_common_events': _get_top_events(user_id)
    }
    
    return jsonify({
        'success': True,
        'analytics': analytics
    }), 200

@app.route('/api/analytics/trending', methods=['GET', 'OPTIONS'])
def get_trending():
    if request.method == 'OPTIONS':
        return '', 204
    
    # Mock trending data
    trending = [
        {'hashtag': '#WomensFootball', 'engagement': 15234},
        {'hashtag': '#UWCL', 'engagement': 12456},
        {'hashtag': '#RedFlames', 'engagement': 9876},
        {'hashtag': '#WomenInSports', 'engagement': 8543},
        {'hashtag': '#FemaleSoccer', 'engagement': 7321}
    ]
    
    return jsonify({
        'success': True,
        'trending': trending
    }), 200

def _get_top_events(user_id, limit=5):
    pipeline = [
        {'$match': {'user_id': user_id}},
        {'$group': {
            '_id': '$event_type',
            'count': {'$sum': 1}
        }},
        {'$sort': {'count': -1}},
        {'$limit': limit}
    ]
    
    results = list(events_collection.aggregate(pipeline))
    return [{'event_type': r['_id'], 'count': r['count']} for r in results]

if __name__ == '__main__':
    try:
        client.admin.command('ping')
        print("✓ Successfully connected to MongoDB:", db.name)
        create_indexes()
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
    
    app.run(host='0.0.0.0', port=5001, debug=True)