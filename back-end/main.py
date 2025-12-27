from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

init_db(app)

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'name': 'Women\'s Football Analytics API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'health': '/health',
            'tracking': '/api/tracking',
            'analytics': '/api/analytics',
            'admin': '/api/admin'
        }
    }), 200

app.register_blueprint(tracking_bp, url_prefix='/api/tracking')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(admin_bp, url_prefix='/api/admin')



@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested resource was not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An internal error occurred'
    }), 500


if __name__ == '__main__':
    port = int(os.getenv('BACKEND_PORT', 5000))
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.getenv('FLASK_ENV') == 'development'
    )