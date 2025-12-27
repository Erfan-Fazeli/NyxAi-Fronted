import requests
import os
import time
import sys

# Configuration
API_URL = "https://nyxai-bg-remover-production.up.railway.app"  # Update this if different
ENDPOINT = "/api/remove-background"
API_KEY = "nyx1q2w3e4r5t6y7u8i9o0p"
IMAGE_PATH = r"C:\Users\Nimas\Desktop\NyxAi-TM\photo_2025-12-24_18-32-04.jpg"
OUTPUT_PATH = "output_removed_bg.png"

def test_background_removal():
    full_url = f"{API_URL}{ENDPOINT}"
    
    if not os.path.exists(IMAGE_PATH):
        print(f"❌ Error: Image not found at {IMAGE_PATH}")
        return

    print(f"🚀 Testing Background Removal API")
    print(f"   URL: {full_url}")
    print(f"   Image: {IMAGE_PATH}")
    
    headers = {
        "X-API-Key": API_KEY
    }
    
    files = {
        'image': ('image.jpg', open(IMAGE_PATH, 'rb'), 'image/jpeg')
    }
    
    start_time = time.time()
    
    try:
        print("⏳ Sending request... (This might take a moment if the server is waking up)")
        response = requests.post(full_url, headers=headers, files=files)
        
        duration = time.time() - start_time
        
        if response.status_code == 200:
            with open(OUTPUT_PATH, 'wb') as f:
                f.write(response.content)
            print(f"✅ Success! Background removed in {duration:.2f}s")
            print(f"   Saved to: {os.path.abspath(OUTPUT_PATH)}")
        elif response.status_code == 503:
            print(f"⚠️ Service Unavailable (503). The server might be building or starting up.")
            print(f"   Response: {response.text}")
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error. Is the URL correct? ({API_URL})")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    test_background_removal()
