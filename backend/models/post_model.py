from database import post_collection, post_helper, USE_MONGO
from bson.objectid import ObjectId
from datetime import datetime
from tinydb import Query

async def retrieve_posts():
    posts = []
    if USE_MONGO:
        async for post in post_collection.find():
            posts.append(post_helper(post))
    else:
        # TinyDB
        all_posts = post_collection.all()
        for post in all_posts:
            # Need to attach doc_id or handle it in helper
            # TinyDB objects have doc_id but strict dict acccess might miss it
            # The post_helper expects an object with doc_id
            posts.append(post_helper(post))
    return posts

async def add_post(post_data: dict) -> dict:
    if "created_at" not in post_data:
        post_data["created_at"] = datetime.utcnow().isoformat()
    if "updated_at" not in post_data:
        post_data["updated_at"] = datetime.utcnow().isoformat()
        
    if USE_MONGO:
        post = await post_collection.insert_one(post_data)
        new_post = await post_collection.find_one({"_id": post.inserted_id})
        return post_helper(new_post)
    else:
        # TinyDB
        # TinyDB requires json serializable, datetime isn't by default
        # Ensure dates are strings (isoformat)
        doc_id = post_collection.insert(post_data)
        new_post = post_collection.get(doc_id=doc_id)
        return post_helper(new_post)

async def retrieve_post(id: str) -> dict:
    if USE_MONGO:
        try:
            post = await post_collection.find_one({"_id": ObjectId(id)})
            if post:
                return post_helper(post)
        except:
            pass
    else:
        # TinyDB
        try:
            post = post_collection.get(doc_id=int(id))
            if post:
                return post_helper(post)
        except:
            pass
    return None

async def update_post(id: str, data: dict):
    if len(data) < 1:
        return False
        
    if "updated_at" not in data:
         data["updated_at"] = datetime.utcnow().isoformat()

    if USE_MONGO:
        try:
            post = await post_collection.find_one({"_id": ObjectId(id)})
            if post:
                updated_post = await post_collection.update_one(
                    {"_id": ObjectId(id)}, {"$set": data}
                )
                if updated_post:
                    return True
        except:
            pass
    else:
        # TinyDB
        try:
            if post_collection.update(data, doc_ids=[int(id)]):
                return True
        except:
            pass
    return False

async def delete_post(id: str):
    if USE_MONGO:
        try:
            post = await post_collection.find_one({"_id": ObjectId(id)})
            if post:
                await post_collection.delete_one({"_id": ObjectId(id)})
                return True
        except:
            pass
    else:
        # TinyDB
        try:
            if post_collection.remove(doc_ids=[int(id)]):
                return True
        except:
            pass
    return False
