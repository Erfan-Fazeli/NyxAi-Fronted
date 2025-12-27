import requests
import os
import time

# Configuration
API_URL = "https://nyxai-bg-remover-production.up.railway.app"
ENDPOINT = "/api/remove-background"
API_KEY = "nyx1q2w3e4r5t6y7u8i9o0p"

TEST_IMAGES = [
    r"C:\Users\Nimas\Desktop\NyxAi-TM\23319.webp",
    r"C:\Users\Nimas\Desktop\NyxAi-TM\photo_2025-12-24_18-32-04.jpg"
]

def process_image(filepath):
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        return

    filename = os.path.basename(filepath)
    print(f"\n🖼️  Processing: {filename}")
    
    full_url = f"{API_URL}{ENDPOINT}"
    headers = {"X-API-Key": API_KEY}
    
    # Determine mime type
    ext = os.path.splitext(filename)[1].lower().replace('.', '')
    mime = f"image/{'jpeg' if ext in ['jpg', 'jpeg'] else ext}"
    
    try:
        with open(filepath, 'rb') as f:
            files = {'image': (filename, f, mime)}
            
            start_time = time.time()
            print("   ⏳ Uploading and processing...")
            response = requests.post(full_url, headers=headers, files=files)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                # Determine output extension based on Content-Type header
                content_type = response.headers.get('Content-Type', '')
                if 'webp' in content_type:
                    out_ext = 'webp'
                else:
                    out_ext = 'png'
                
                output_filename = f"final_quality_{os.path.splitext(filename)[0]}.{out_ext}"
                
                with open(output_filename, 'wb') as out_f:
                    out_f.write(response.content)
                    
                print(f"   ✅ Success! ({duration:.2f}s)")
                print(f"   💾 Saved to: {os.path.abspath(output_filename)}")
                print(f"   📄 Format: {out_ext.upper()}")
            else:
                print(f"   ❌ Failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
    except Exception as e:
        print(f"   ❌ Error: {e}")

def main():
    print("🚀 Starting Final Quality Check")
    print("=============================")
    
    for img_path in TEST_IMAGES:
        process_image(img_path)
        
    print("\n✅ Done. Please check the output files.")

if __name__ == "__main__":
    main()
