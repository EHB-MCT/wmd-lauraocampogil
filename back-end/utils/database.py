"""
Database initialization and connection functions
"""

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os

# Global database client
_db_client = None
_database = None


def init_db(app):
    global _db_client, _database
    
    try:
        mongodb_uri = os.getenv('MONGODB_URI')
        
        if not mongodb_uri:
            raise ValueError("MONGODB_URI environment variable not set")
        
        _db_client = MongoClient(
            mongodb_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000
        )
        
        _db_client.admin.command('ping')
        
        db_name = os.getenv('MONGO_DB', 'womens_football_analytics')
        _database = _db_client[db_name]
        
        _create_indexes()
        
        print(f"✓ Successfully connected to MongoDB: {db_name}")
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        raise
    except Exception as e:
        print(f"✗ Database initialization error: {e}")
        raise


def get_db():
    if _database is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _database


def get_collection(collection_name):
    db = get_db()
    return db[collection_name]


def _create_indexes():
    db = get_db()
    
    try:
        db.users.create_index('user_id', unique=True)
        db.users.create_index('created_at')
        
        db.interactions.create_index([('user_id', 1), ('timestamp', -1)])
        db.interactions.create_index('event_type')
        db.interactions.create_index('timestamp')

        db.sessions.create_index([('user_id', 1), ('session_id', 1)])
        db.sessions.create_index('created_at')
        
        print("✓ Database indexes created successfully")
        
    except Exception as e:
        print(f"⚠ Warning: Could not create indexes: {e}")


def close_db():
    global _db_client
    if _db_client:
        _db_client.close()
        print("✓ Database connection closed")
