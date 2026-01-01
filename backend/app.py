from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

from utils.database import init_db
init_db(app) 

from routes.tracking import tracking_bp
from routes.analytics import analytics_bp
from routes.admin import admin_bp

app.register_blueprint(tracking_bp, url_prefix='/api')
app.register_blueprint(analytics_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api')

@app.route('/')
def index():
    return {'message': 'Women\'s Football Analytics API', 'status': 'running'}

@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)