import requests
import re
import os

def download_weights():
    destination = "backend/data/traffic_analysis.pt"
    if os.path.exists(destination) and os.path.getsize(destination) > 1000000:
        print("Weights already exist:", destination)
        return True
        
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    file_id = "1y-IfToCjRXa3ZdC1JpnKRopC7mcQW-5z"
    session = requests.Session()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    r1 = session.get(f"https://drive.google.com/uc?id={file_id}&export=download", headers=headers)
    action_match = re.search(r'action="(https://drive\.usercontent\.google\.com/download)"', r1.text)
    if not action_match:
        if len(r1.content) > 1000000:
            with open(destination, "wb") as f:
                f.write(r1.content)
            print("Directly downloaded weights:", destination)
            return True
        else:
            print("Download form missing, length:", len(r1.content))
            return False
            
    action_url = action_match.group(1)
    inputs = dict(re.findall(r'<input type="hidden" name="([^"]+)" value="([^"]+)">', r1.text))
    with session.get(action_url, params=inputs, headers=headers, stream=True) as r2:
        r2.raise_for_status()
        with open(destination, "wb") as f:
            for chunk in r2.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)
    print("Downloaded weights:", destination, "size:", os.path.getsize(destination))
    return True

if __name__ == "__main__":
    download_weights()
