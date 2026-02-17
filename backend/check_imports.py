import sys
import os

try:
    print("Testing imports...")
    import fastapi
    print("FastAPI OK")
    import motor
    print("Motor OK")
    import tinydb
    print("TinyDB OK")
    import google.generativeai
    print("Google GenerativeAI OK")
    
    # Try importing internal modules
    sys.path.append(os.getcwd())
    import database
    print("database.py OK")
    import schemas
    print("schemas.py OK")
    from models import post_model
    print("post_model.py OK")
    from routes import posts, ai
    print("Routes OK")
    print("All imports SUCCESSFUL")
except Exception as e:
    import traceback
    print(f"IMPORT FAILED: {e}")
    traceback.print_exc()
