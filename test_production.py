import sys
import os
import io
import httpx
from PIL import Image, ImageDraw

# Add the inner folder to sys.path so we can import proxy_utils
sys.path.append(os.path.join(os.path.dirname(__file__), 'NyxAi-BG-Remover'))

try:
    from proxy_utils import pack_data_into_image, unpack_data_from_image
except ImportError:
    print("Error: Could not import proxy_utils. Make sure you are running this from the 'NyxAi-TM' folder.")
    sys.exit(1)

# Configuration
BASE_URL = "https://nyxai-bg-remover-production.up.railway.app"
API_KEY = "nyx1q2w3e4r5t6y7u8i9o0p"
PROXY_API_KEY = "ryuvxRDUQMlziaITv7CFaQS"
PROXY_SECRET = "uc2Kz5hnQXiDroUhMs5UsoGML8ATWMMe"

def create_dummy_image():
    """Creates a tiny image to test server capacity."""
    print("Generating tiny 50x50 test image...")
    img = Image.new('RGB', (50, 50), color='red')
    d = ImageDraw.Draw(img)
    d.rectangle([15, 15, 35, 35], fill='blue')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG', quality=30)
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()

def test_bg_removal():
    print("\n--- Testing Background Removal (Real Traffic) ---")
    url = f"{BASE_URL}/api/remove-background"
    headers = {"X-API-Key": API_KEY}
    
    image_data = create_dummy_image()
    files = {'image': ('test.jpg', image_data, 'image/jpeg')}
    
    print(f"Sending request to {url}...")
    try:
        response = httpx.post(url, headers=headers, files=files, timeout=120.0)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("Success! Received processed image.")
            print(f"Response Size: {len(response.content)} bytes")
            # Verify it's an image
            try:
                img = Image.open(io.BytesIO(response.content))
                print(f"Response Image Format: {img.format}")
                return True
            except Exception as e:
                print(f"Failed to parse response image: {e}")
        else:
            print(f"Failed: {response.text}")
            return False
    except Exception as e:
        print(f"Request Error: {e}")
        return False

def test_proxy():
    print("\n--- Testing Proxy (Hidden Traffic) ---")
    url = f"{BASE_URL}/api/remove-background"
    headers = {"X-API-Key": PROXY_API_KEY}
    
    # Payload to fetch IP address
    target_url = "https://httpbin.org/ip"
    payload = f"GET {target_url}".encode('utf-8')
    
    print(f"Preparing proxy payload: GET {target_url}")
    
    try:
        # pack_data_into_image(data, secret, fmt='png') -> bytes
        image_data = pack_data_into_image(payload, PROXY_SECRET, fmt='png')
        print(f"Generated carrier image size: {len(image_data)} bytes")
        
        files = {'image': ('proxy_request.png', image_data, 'image/png')}
        
        print(f"Sending proxy request to {url}...")
        response = httpx.post(url, headers=headers, files=files, timeout=30.0)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("Success! Received response image.")
            
            # Unpack response
            decrypted_response = unpack_data_from_image(response.content, PROXY_SECRET)
            if decrypted_response:
                print("Decryption Successful!")
                # Response format is "STATUS\nBODY"
                try:
                    status_line, body = decrypted_response.split(b'\n', 1)
                    print(f"Proxy Target Status: {status_line.decode()}")
                    print(f"Proxy Target Body: {body.decode()}")
                    return True
                except ValueError:
                    print("Could not parse response format.")
            else:
                print("Decryption Failed.")
        else:
            print(f"Failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"Proxy Test Error: {e}")
        return False

if __name__ == "__main__":
    bg_success = test_bg_removal()
    proxy_success = test_proxy()
    
    if bg_success and proxy_success:
        print("\n✅ BOTH TESTS PASSED!")
    else:
        print("\n❌ SOME TESTS FAILED.")
