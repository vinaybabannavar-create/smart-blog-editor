import requests
import json

def test_api():
    base_url = "http://localhost:8000/api/posts/"
    
    print("1. Testing GET /api/posts/")
    try:
        r = requests.get(base_url)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Error: {e}")

    print("\n2. Testing POST /api/posts/")
    payload = {
        "title": "Diagnostic Post",
        "content": {"root": {"children": []}},
        "status": "draft"
    }
    try:
        r = requests.post(base_url, json=payload)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
