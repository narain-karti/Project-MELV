import urllib.request
import json

overpass_url = 'https://overpass-api.de/api/interpreter'
query = """[out:json];
way["name"="C.L.V. Nagar 1st Street"](12.850,80.233,12.858,80.246);
out geom;
"""

req = urllib.request.Request(
    overpass_url,
    data=query.encode('utf-8'),
    headers={'User-Agent': 'ProjectMELV-UrbanTracking/1.0'}
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        for el in res.get('elements', []):
            print("Way ID:", el.get('id'))
            geometry = el.get('geometry', [])
            print("Geometry points:", json.dumps(geometry, indent=2))
except Exception as e:
    print('Err:', e)
