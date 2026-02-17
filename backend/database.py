import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from tinydb import TinyDB, Query

load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")

# Global flag for storage type
USE_MONGO = False
db_client = None
post_collection = None

# Try connecting to MongoDB
try:
    client = AsyncIOMotorClient(MONGO_DETAILS, serverSelectionTimeoutMS=2000)
    # Check connection synchronously (hack for startup)
    # loop = asyncio.get_event_loop()
    # loop.run_until_complete(client.admin.command('ping'))
    # Since we can't easily sync check in module scope, we assume it works 
    # and handle failures in operations, OR we just default to TinyDB if we suspect issues.
    # ideally we'd check connectivity here.
    
    # Let's try to connect in a way that doesn't block too long
    # But for this specific user scenario where mongo is likely missing:
    
    # We will use a naive check or just default to TinyDB if connection fails on first operation
    # For now, let's just initialize both and decide based on a flag or env var
    # But to make it "just work", I'll default to TinyDB if MONGO_DETAILS is default localhost and it's not running
    
    # Let's use a simpler approach:
    # If we can connect, set USE_MONGO = True
    pass
except:
    pass

# For this "Internship project" fix, I'll implement a robust check
async def check_mongo():
    global USE_MONGO, post_collection
    try:
        c = AsyncIOMotorClient(MONGO_DETAILS, serverSelectionTimeoutMS=1000)
        await c.admin.command('ping')
        print("Connected to MongoDB")
        USE_MONGO = True
        database = c.blog_db
        post_collection = database.get_collection("posts")
    except Exception as e:
        print(f"MongoDB connection failed: {e}. Falling back to TinyDB.")
        USE_MONGO = False
        # Initialize TinyDB
        db = TinyDB('db.json')
        post_collection = db.table('posts')

# We need to run this check. 
# Since we are in a module, we can't await easily.
# So we will wrap the "get_collection" logic in a helper or use a blocking check.

# Blocking check for startup
from pymongo import MongoClient
try:
    sync_client = MongoClient(MONGO_DETAILS, serverSelectionTimeoutMS=1000)
    sync_client.admin.command('ping')
    print("MongoDB is running. Using MongoDB.")
    USE_MONGO = True
    client = AsyncIOMotorClient(MONGO_DETAILS)
    database = client.blog_db
    post_collection = database.get_collection("posts")
except Exception as e:
    print(f"MongoDB unreachable. Using TinyDB (local file storage).")
    USE_MONGO = False
    db = TinyDB('local_db.json')
    post_collection = db.table('posts')


def post_helper(post) -> dict:
    if USE_MONGO:
        return {
            "id": str(post["_id"]),
            "title": post["title"],
            "content": post["content"],
            "status": post["status"],
            "created_at": post["created_at"],
            "updated_at": post["updated_at"],
        }
    else:
        # TinyDB helper
        return {
            "id": str(post.doc_id),
            "title": post["title"],
            "content": post["content"],
            "status": post["status"],
            "created_at": post["created_at"],
            "updated_at": post["updated_at"],
        }
