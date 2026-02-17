from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.posts import router as PostRouter
from routes.ai import router as AIRouter
import uvicorn
import os

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(PostRouter, tags=["Posts"], prefix="/api/posts")
app.include_router(AIRouter, tags=["AI"], prefix="/api/ai")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to Smart Blog Editor API"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
