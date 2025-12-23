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

@app.route('/')
def home():
    return "Hello, World!"

if __name__ == '__main__':
    port = int(os.getenv('BACKEND_PORT', 5000))
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.getenv('FLASK_ENV') == 'development'
    )