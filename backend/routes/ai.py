import os
import time
import google.generativeai as genai
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()

router = APIRouter()

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

MODEL_NAME = "gemini-2.0-flash"

@router.post("/generate")
async def generate_content(
    prompt: str = Form(...),
    image: UploadFile = File(None)
):
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured.")
    
    try:
        if image:
            content = await image.read()
            img = Image.open(io.BytesIO(content))
            inputs = [prompt, img]
        else:
            inputs = [prompt]

        model = genai.GenerativeModel(MODEL_NAME)

        # Try up to 2 times with a delay on rate limit
        for attempt in range(2):
            try:
                print(f"Calling model: {MODEL_NAME} (attempt {attempt + 1})")
                response = model.generate_content(inputs, stream=True)
                break
            except Exception as e:
                err_str = str(e)
                is_rate_limit = "429" in err_str or "ResourceExhausted" in err_str or "quota" in err_str.lower()
                if is_rate_limit and attempt == 0:
                    print("Rate limited, waiting 20 seconds before retry...")
                    time.sleep(20)
                    continue
                elif is_rate_limit:
                    raise HTTPException(status_code=429, detail="AI usage limit reached. Please wait about 30 seconds and try again.")
                else:
                    raise HTTPException(status_code=500, detail=f"AI model error: {err_str}")
        else:
            raise HTTPException(status_code=500, detail="AI request failed after retries.")

        def stream_generator():
            for chunk in response:
                if chunk.text:
                    yield chunk.text

        return StreamingResponse(stream_generator(), media_type="text/plain")
    except HTTPException:
        raise
    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
