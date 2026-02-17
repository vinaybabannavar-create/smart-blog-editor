from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class PostSchema(BaseModel):
    title: str = Field(...)
    content: Dict[str, Any] = Field(...)
    status: str = Field(...)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        schema_extra = {
            "example": {
                "title": "My First Post",
                "content": {"root": {}},
                "status": "draft",
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00"
            }
        }

class UpdatePostModel(BaseModel):
    title: Optional[str]
    content: Optional[Dict[str, Any]]
    status: Optional[str]
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        schema_extra = {
            "example": {
                "title": "My Updated Post",
                "content": {"root": {}},
                "status": "published",
                "updated_at": "2023-01-01T00:00:00"
            }
        }

def ResponseModel(data, message):
    return {
        "data": [data],
        "code": 200,
        "message": message,
    }

def ErrorResponseModel(error, code, message):
    return {"error": error, "code": code, "message": message}
