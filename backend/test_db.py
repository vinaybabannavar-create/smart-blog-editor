import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def check_db():
    uri = "mongodb://localhost:27017"
    print(f"Attempting to connect to: {uri}")
    
    try:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=2000)
        # Force a connection verification
        await client.admin.command('ping')
        print("SUCCESS: MongoDB is running and accessible.")
        return True
    except Exception as e:
        print(f"FAILURE: Could not connect to MongoDB.")
        print(f"Error details: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(check_db())
