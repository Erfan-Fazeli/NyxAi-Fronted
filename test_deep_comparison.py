import httpx
import io
from PIL import Image, ImageDraw
import sys
import os
import json

# Add inner folder to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'NyxAi-BG-Remover'))
try:
    from proxy_utils import pack_data_into_image, unpack_data_from_image
except ImportError:
    pass

BASE_URL = "https://nyxai-bg-remover-production.up.railway.app"
API_KEY = "nyx1q2w3e4r5t6y7u8i9o0p"
PROXY_API_KEY = "ryuvxRDUQMlziaITv7CFaQS"
PROXY_SECRET = "uc2Kz5hnQXiDroUhMs5UsoGML8ATWMMe"

def create_test_image(size=(50, 50), fmt='JPEG'):
    img = Image.new('RGB', size, color='red')
    d = ImageDraw.Draw(img)
    d.rectangle([10, 10, 40, 40], fill='blue')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format=fmt, quality=30)
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()

def print_separator(title):
    print(f"\n{'='*20} {title} {'='*20}")

def compare_responses():
    print_separator("DEEP COMPARISON TEST")
    
    # 1. Real Request
    print("1. Sending REAL Request...")
    real_img = create_test_image()
    real_files = {'image': ('test_image.jpg', real_img, 'image/jpeg')}
    real_headers = {"X-API-Key": API_KEY}
    
    with httpx.Client(timeout=60.0) as client:
        real_resp = client.post(f"{BASE_URL}/api/remove-background", headers=real_headers, files=real_files)
    
    if real_resp.status_code != 200:
        print(f"Real Request Failed: {real_resp.status_code}")
        print(real_resp.text)

    # 2. Proxy Request
    print("2. Sending PROXY Request...")
    payload = b"GET https://httpbin.org/ip"
    # Proxy carrier can be PNG, it shouldn't matter, but let's use PNG as in test_production
    proxy_img = pack_data_into_image(payload, PROXY_SECRET, fmt='png')
    proxy_files = {'image': ('test_image.png', proxy_img, 'image/png')} 
    proxy_headers = {"X-API-Key": PROXY_API_KEY}
    
    with httpx.Client(timeout=60.0) as client:
        proxy_resp = client.post(f"{BASE_URL}/api/remove-background", headers=proxy_headers, files=proxy_files)

    if proxy_resp.status_code != 200:
        print(f"Proxy Request Failed: {proxy_resp.status_code}")
        print(proxy_resp.text)

    # 3. Analysis
    print_separator("ANALYSIS")
    
    print(f"{'METRIC':<25} | {'REAL RESPONSE':<30} | {'PROXY RESPONSE':<30} | {'MATCH?'}")
    print("-" * 100)
    
    metrics = [
        ("Status Code", real_resp.status_code, proxy_resp.status_code),
        ("Content-Type", real_resp.headers.get("content-type"), proxy_resp.headers.get("content-type")),
        ("Content-Disposition", real_resp.headers.get("content-disposition"), proxy_resp.headers.get("content-disposition")),
        ("Server Header", real_resp.headers.get("server"), proxy_resp.headers.get("server")),
        ("Transfer-Encoding", real_resp.headers.get("transfer-encoding"), proxy_resp.headers.get("transfer-encoding")),
    ]
    
    all_match = True
    for name, real_val, proxy_val in metrics:
        match = (real_val == proxy_val)
        if not match: all_match = False
        match_icon = "✅" if match else "❌"
        # Truncate long strings
        r_str = str(real_val)[:28] + ".." if len(str(real_val)) > 28 else str(real_val)
        p_str = str(proxy_val)[:28] + ".." if len(str(proxy_val)) > 28 else str(proxy_val)
        print(f"{name:<25} | {r_str:<30} | {p_str:<30} | {match_icon}")

    print_separator("BODY INSPECTION")
    
    # Check Real Body
    try:
        r_img = Image.open(io.BytesIO(real_resp.content))
        print(f"Real Response Image: Format={r_img.format}, Size={r_img.size}, Mode={r_img.mode}")
    except Exception as e:
        print(f"Real Response Body Error: {e}")

    # Check Proxy Body
    try:
        p_img = Image.open(io.BytesIO(proxy_resp.content))
        print(f"Proxy Response Image: Format={p_img.format}, Size={p_img.size}, Mode={p_img.mode}")
    except Exception as e:
        print(f"Proxy Response Body Error: {e}")

    if not all_match:
        print("\n⚠️  DIFFERENCES DETECTED! Fixing recommended.")
    else:
        print("\n✅  PERFECT MATCH!")

if __name__ == "__main__":
    compare_responses()
