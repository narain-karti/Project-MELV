import requests
import re
import os
import sys

def download_traffic_video():
    destination = "backend/data/traffic_analysis.mov"
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    
    file_id = "1qadBd7lgpediafCpL_yedGjQPk-FLK-W"
    print(f"Connecting to Google Drive for file ID {file_id}...")
    
    session = requests.Session()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    r1 = session.get(f"https://drive.google.com/uc?id={file_id}&export=download", headers=headers)
    print("Handshake 1 status:", r1.status_code)
    
    action_match = re.search(r'action="(https://drive\.usercontent\.google\.com/download)"', r1.text)
    if not action_match:
        print("No confirmation form found directly. Checking direct stream headers...")
        if "video" in r1.headers.get("Content-Type", "") or int(r1.headers.get("Content-Length", 0)) > 1000000:
            with open(destination, "wb") as f:
                f.write(r1.content)
            print("Directly downloaded:", destination)
            return True
        else:
            print("Error: Could not find download form in response:", r1.text[:300])
            return False
            
    action_url = action_match.group(1)
    inputs = dict(re.findall(r'<input type="hidden" name="([^"]+)" value="([^"]+)">', r1.text))
    print("Found download form parameters:", inputs)
    
    print("Starting binary download...")
    with session.get(action_url, params=inputs, headers=headers, stream=True) as r2:
        r2.raise_for_status()
        total = int(r2.headers.get("Content-Length", 0))
        print(f"Content-Type: {r2.headers.get('Content-Type')}, Size: {total / (1024*1024):.2f} MB")
        
        downloaded = 0
        with open(destination, "wb") as f:
            for chunk in r2.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    sys.stdout.write(f"\rProgress: {downloaded / (1024*1024):.1f} MB / {total / (1024*1024):.1f} MB")
                    sys.stdout.flush()
    print("\nDownload complete:", destination)
    return True

if __name__ == "__main__":
    download_traffic_video()
