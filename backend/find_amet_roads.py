import urllib.request
import json

overpass_url = 'https://overpass-api.de/api/interpreter'
# Small tight bounding box around AMET University (12.8544, 80.2376)
query = """[out:json][timeout:15];
(
  way["highway"](12.850,80.233,12.858,80.242);
  node["amenity"](12.850,80.233,12.858,80.242);
);
out center tags;
"""

req = urllib.request.Request(
    overpass_url,
    data=query.encode('utf-8'),
    headers={'User-Agent': 'ProjectMELV-UrbanTracking/1.0'}
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        print(f"Elements: {len(res.get('elements', []))}")
        for el in res.get('elements', []):
            tags = el.get('tags', {})
            name = tags.get('name', '')
            c = el.get('center', {}) or {'lat': el.get('lat'), 'lon': el.get('lon')}
            if name:
                print(f"[{el.get('type')}] {name} -> Lat: {c.get('lat')}, Lon: {c.get('lon')}")
except Exception as e:
    print('Overpass Err:', e)
