from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from schemas import PostSchema, UpdatePostModel, ResponseModel, ErrorResponseModel
from models.post_model import (
    add_post,
    retrieve_posts,
    retrieve_post,
    update_post,
    delete_post,
)

router = APIRouter()

@router.post("/", response_description="Post data added into the database")
async def add_post_data(post: PostSchema = Body(...)):
    post = jsonable_encoder(post)
    new_post = await add_post(post)
    return ResponseModel(new_post, "Post added successfully.")

@router.get("/", response_description="Posts retrieved")
async def get_posts():
    posts = await retrieve_posts()
    if posts:
        return ResponseModel(posts, "Posts data retrieved successfully")
    return ResponseModel(posts, "Empty list returned")

@router.get("/{id}", response_description="Post data retrieved")
async def get_post_data(id: str):
    post = await retrieve_post(id)
    if post:
        return ResponseModel(post, "Post data retrieved successfully")
    return ErrorResponseModel("An error occurred.", 404, "Post doesn't exist.")

@router.patch("/{id}")
async def update_post_data(id: str, req: UpdatePostModel = Body(...)):
    req = {k: v for k, v in req.dict().items() if v is not None}
    updated_post = await update_post(id, req)
    if updated_post:
        return ResponseModel("Post with ID: {} name update is successful".format(id), "Post name updated successfully")
    return ErrorResponseModel("An error occurred", 404, "There was an error updating the post data.")

@router.delete("/{id}", response_description="Post data deleted from the database")
async def delete_post_data(id: str):
    deleted_post = await delete_post(id)
    if deleted_post:
        return ResponseModel("Post with ID: {} removed".format(id), "Post deleted successfully")
    return ErrorResponseModel("An error occurred", 404, "Post with id {0} doesn't exist".format(id))
