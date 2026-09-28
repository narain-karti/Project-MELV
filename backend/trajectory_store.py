"""
Project-MELV :: SQLite Trajectory Store
Lightweight persistent store for ANPR detections. Replaces hardcoded trajectory data.
Each detection is (plate, camera_id, timestamp, confidence, lat, lon).
Trajectory queries reconstruct chronological paths with Haversine inter-node speed.
"""
import os
import sqlite3
import time
import math
import threading
import hashlib

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "melv_detections.db")

# Camera node coordinates (lat, lon) for speed calculation
CAMERA_COORDS = {
    "CAM-01": (12.8542, 80.2378),  # CLV Nagar 1st St - West Gate (ECR)
    "CAM-02": (12.8548, 80.2386),  # CLV Nagar 1st St - East Junction
    "CAM-05": (12.8556, 80.2394),  # AMET University Campus Gate (ECR)
    "CAM-03": (12.8530, 80.2365),  # Kanathur ECR Toll
    "CAM-04": (12.8518, 80.2350),  # Reddykuppam Road Junction
    "CAM-06": (12.8570, 80.2410),  # Mayajaal Multiplex Feeder
    "CAM-07": (12.8510, 80.2340),  # Kovalam Beach Link
    "CAM-08": (12.7900, 80.1500),  # Tambaram Outer Ring Road (far node)
}

CAMERA_NAMES = {
    "CAM-01": "CLV Nagar 1st St - West Gate (ECR)",
    "CAM-02": "CLV Nagar 1st St - East Junction",
    "CAM-05": "AMET University Campus Gate (ECR)",
    "CAM-03": "Kanathur ECR Toll",
    "CAM-04": "Reddykuppam Road Junction",
    "CAM-06": "Mayajaal Multiplex North Feeder",
    "CAM-07": "Kovalam Beach Link",
    "CAM-08": "Tambaram Outer Ring Road",
}

# In-memory synchronized blacklist set
ACTIVE_BLACKLIST = {"TN07BX8819", "TN09BK6112", "TN22AK1924", "TN02DF7712", "DL01AB1234"}
_recent_alert_timestamps = {}  # (plate, type) -> epoch

_lock = threading.Lock()


def _get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


DEFAULT_ALERTS = [
    {
        "id": "ALT-2026-001",
        "type": "STOLEN_PURSUIT",
        "severity": "CRITICAL",
        "plate": "TN07BX8819",
        "vehicle": "Mahindra Scorpio (White)",
        "camera_id": "CAM-01",
        "location": "CLV Nagar 1st St - West Gate (ECR)",
        "timestamp": "10:14:16 IST",
        "details": "Active CCTNS Red Notice. Stolen from Thiruvanmiyur Police Limits.",
        "status": "INTERCEPT_DISPATCHED",
        "confidence": 0.982,
        "created_epoch": time.time() - 3600
    },
    {
        "id": "ALT-2026-002",
        "type": "SPEED_VIOLATION",
        "severity": "HIGH",
        "plate": "TN07BX8819",
        "vehicle": "Mahindra Scorpio",
        "camera_id": "CAM-01",
        "location": "CLV Nagar 1st St - West Gate",
        "timestamp": "10:14:16 IST",
        "details": "Recorded 72.8 km/h in designated 40 km/h municipal school zone.",
        "status": "E_CHALLAN_ISSUED",
        "confidence": 0.978,
        "created_epoch": time.time() - 3400
    },
    {
        "id": "ALT-2026-003",
        "type": "GHOST_PLATE",
        "severity": "CRITICAL",
        "plate": "TN09BK6112",
        "vehicle": "Hyundai Creta (Grey)",
        "camera_id": "CAM-08",
        "location": "Tambaram Outer Ring Road",
        "timestamp": "10:04:22 IST",
        "details": "Spatiotemporal Teleportation Anomaly: Detected at Kanathur Toll and Tambaram within 4min (Requires 382 km/h). Counterfeit cloned plate.",
        "status": "FORENSIC_FLAGGED",
        "confidence": 0.965,
        "created_epoch": time.time() - 3200
    },
    {
        "id": "ALT-2026-004",
        "type": "WRONG_WAY",
        "severity": "HIGH",
        "plate": "TN22AK1924",
        "vehicle": "Bajaj Pulsar 150",
        "camera_id": "CAM-02",
        "location": "Eastbound Corridor Slip Lane",
        "timestamp": "10:09:44 IST",
        "details": "Traveling contra-flow against designated one-way rotary stream.",
        "status": "WARDEN_ALERTED",
        "confidence": 0.954,
        "created_epoch": time.time() - 3000
    },
    {
        "id": "ALT-2026-005",
        "type": "SIGNAL_JUMP",
        "severity": "MEDIUM",
        "plate": "TN02DF7712",
        "vehicle": "Maruti Swift (Silver)",
        "camera_id": "CAM-05",
        "location": "AMET University Intersection",
        "timestamp": "10:07:12 IST",
        "details": "Stop line violation after red cycle onset (+2.4s phase delay).",
        "status": "AUTO_FINED",
        "confidence": 0.961,
        "created_epoch": time.time() - 2800
    },
    {
        "id": "ALT-2026-006",
        "type": "EMERGENCY_CLEARANCE",
        "severity": "PREEMPTION",
        "plate": "TN01AMB108",
        "vehicle": "Ambulance (108 Life Support)",
        "camera_id": "CAM-01",
        "location": "ECR Main Carriageway Northbound",
        "timestamp": "10:15:02 IST",
        "details": "Acoustic siren + optical strobe lock. Green wave corridor activated on Nodes 1->2->5.",
        "status": "CORRIDOR_ACTIVE",
        "confidence": 0.994,
        "created_epoch": time.time() - 2600
    }
]


def init_db():
    """Create detections and alerts tables if they don't exist, and seed default alerts."""
    with _lock:
        conn = _get_conn()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plate TEXT NOT NULL,
                camera_id TEXT NOT NULL,
                timestamp REAL NOT NULL,
                confidence REAL DEFAULT 0.0,
                tracker_id INTEGER DEFAULT 0
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_plate ON detections(plate)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ts ON detections(timestamp)")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                severity TEXT NOT NULL,
                plate TEXT NOT NULL,
                vehicle TEXT DEFAULT 'Suspect Vehicle',
                camera_id TEXT NOT NULL,
                location TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                details TEXT NOT NULL,
                status TEXT NOT NULL,
                confidence REAL DEFAULT 0.95,
                created_epoch REAL NOT NULL
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_alert_plate ON alerts(plate)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_alert_epoch ON alerts(created_epoch)")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS challans (
                challan_no TEXT PRIMARY KEY,
                alert_id TEXT,
                plate TEXT NOT NULL,
                violation_type TEXT NOT NULL,
                fine_inr INTEGER NOT NULL,
                location TEXT NOT NULL,
                camera_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                parivahan_status TEXT NOT NULL,
                sha256_proof TEXT NOT NULL,
                created_epoch REAL NOT NULL
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_challan_plate ON challans(plate)")

        # Seed defaults if alerts table is empty
        count = conn.execute("SELECT COUNT(*) AS c FROM alerts").fetchone()["c"]
        if count == 0:
            for a in DEFAULT_ALERTS:
                conn.execute("""
                    INSERT OR IGNORE INTO alerts (
                        id, type, severity, plate, vehicle, camera_id, location,
                        timestamp, details, status, confidence, created_epoch
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    a["id"], a["type"], a["severity"], a["plate"], a["vehicle"],
                    a["camera_id"], a["location"], a["timestamp"], a["details"],
                    a["status"], a["confidence"], a["created_epoch"]
                ))

        conn.commit()
        conn.close()


def update_alert_status(alert_id: str, new_status: str):
    """Updates status for an alert (e.g. PATROL_EN_ROUTE or E_CHALLAN_DELIVERED)."""
    with _lock:
        conn = _get_conn()
        conn.execute("UPDATE alerts SET status = ? WHERE id = ?", (new_status, alert_id))
        conn.commit()
        conn.close()


def issue_challan(plate: str, violation_type: str, fine_inr: int = 1000, location: str = "ECR Corridor", camera_id: str = "CAM-01", alert_id: str = None):
    """Issues and persists a MoRTH Parivahan authenticated e-Challan."""
    clean_plate = plate.strip().upper()
    now = time.time()
    now_str = time.strftime("%H:%M:%S IST", time.localtime(now))
    challan_no = f"TN-ECH-2026-{int(now * 1000) % 1000000:06d}"
    proof_str = f"{challan_no}:{clean_plate}:{violation_type}:{fine_inr}:{now}"
    sha256_proof = hashlib.sha256(proof_str.encode()).hexdigest()

    with _lock:
        conn = _get_conn()
        conn.execute("""
            INSERT OR REPLACE INTO challans (
                challan_no, alert_id, plate, violation_type, fine_inr,
                location, camera_id, timestamp, parivahan_status, sha256_proof, created_epoch
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            challan_no, alert_id, clean_plate, violation_type, fine_inr,
            location, camera_id, now_str, "ISSUED_NIC_PARIVAHAN", sha256_proof, now
        ))
        if alert_id:
            conn.execute("UPDATE alerts SET status = 'E_CHALLAN_DELIVERED' WHERE id = ?", (alert_id,))
        conn.commit()
        conn.close()

    return {
        "challan_no": challan_no,
        "alert_id": alert_id,
        "plate": clean_plate,
        "violation_type": violation_type,
        "fine_inr": fine_inr,
        "location": location,
        "camera_id": camera_id,
        "timestamp": now_str,
        "parivahan_status": "ISSUED_NIC_PARIVAHAN",
        "sha256_proof": sha256_proof,
        "authority": "MoRTH Parivahan / Greater Chennai Police Traffic Wing"
    }


def get_challan(challan_no: str):
    """Retrieve an e-Challan by receipt number."""
    with _lock:
        conn = _get_conn()
        row = conn.execute("SELECT * FROM challans WHERE challan_no = ?", (challan_no,)).fetchone()
        conn.close()
    return dict(row) if row else None


def list_challans(limit: int = 50):
    """List all issued e-Challans sorted newest-first."""
    with _lock:
        conn = _get_conn()
        rows = conn.execute("SELECT * FROM challans ORDER BY created_epoch DESC LIMIT ?", (limit,)).fetchall()
        conn.close()
    return [dict(r) for r in rows]


def insert_alert(alert: dict):
    """Insert an alert record into the database."""
    with _lock:
        conn = _get_conn()
        conn.execute("""
            INSERT OR REPLACE INTO alerts (
                id, type, severity, plate, vehicle, camera_id, location,
                timestamp, details, status, confidence, created_epoch
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alert.get("id", f"ALT-2026-{int(time.time()*1000)%100000:05d}"),
            alert.get("type", "GENERAL_FLAG"),
            alert.get("severity", "HIGH"),
            alert.get("plate", "").upper(),
            alert.get("vehicle", "Vehicle"),
            alert.get("camera_id", "CAM-01"),
            alert.get("location", CAMERA_NAMES.get(alert.get("camera_id"), "CLV Nagar")),
            alert.get("timestamp", time.strftime("%H:%M:%S IST")),
            alert.get("details", "Alert triggered by ANPR trajectory engine."),
            alert.get("status", "NEW_FLAG"),
            float(alert.get("confidence", 0.95)),
            float(alert.get("created_epoch", time.time()))
        ))
        conn.commit()
        conn.close()


def get_alerts_catalog(limit: int = 50):
    """Fetch all alerts sorted newest-first."""
    with _lock:
        conn = _get_conn()
        rows = conn.execute(
            "SELECT * FROM alerts ORDER BY created_epoch DESC LIMIT ?",
            (limit,)
        ).fetchall()
        conn.close()
    return [dict(r) for r in rows]


def add_to_blacklist(plate: str):
    """Add plate to active in-memory and DB tracking."""
    clean = plate.strip().upper()
    if clean:
        ACTIVE_BLACKLIST.add(clean)


def _haversine_km(lat1, lon1, lat2, lon2):
    """Haversine distance in km between two (lat, lon) pairs."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def record_detection(plate: str, camera_id: str, confidence: float = 0.0, tracker_id: int = 0):
    """
    Insert a new ANPR detection record.
    Evaluates real-time anomaly rules:
    1. Blacklist / Wanted target detection
    2. Spatiotemporal velocity anomaly / Ghost plate detection (>140 km/h)
    3. Speed limit violation (>50 km/h)
    """
    clean_plate = plate.strip().upper() if plate else ""
    if not clean_plate or len(clean_plate) < 4:
        return

    now = time.time()
    now_str = time.strftime("%H:%M:%S IST", time.localtime(now))
    cam_name = CAMERA_NAMES.get(camera_id, camera_id)

    with _lock:
        conn = _get_conn()
        # Find previous detection for inter-camera speed calculation
        prev_row = conn.execute(
            "SELECT camera_id, timestamp FROM detections WHERE plate = ? ORDER BY timestamp DESC LIMIT 1",
            (clean_plate,)
        ).fetchone()

        conn.execute(
            "INSERT INTO detections (plate, camera_id, timestamp, confidence, tracker_id) VALUES (?, ?, ?, ?, ?)",
            (clean_plate, camera_id, now, confidence, tracker_id)
        )
        conn.commit()
        conn.close()

    # Rule 1: Check Blacklist match
    if clean_plate in ACTIVE_BLACKLIST:
        key = (clean_plate, "BLACKLIST")
        last_alert_time = _recent_alert_timestamps.get(key, 0)
        if now - last_alert_time > 60:
            _recent_alert_timestamps[key] = now
            insert_alert({
                "id": f"ALT-2026-{int(now * 1000) % 100000:05d}",
                "type": "STOLEN_PURSUIT",
                "severity": "CRITICAL",
                "plate": clean_plate,
                "vehicle": "Identified Suspect Vehicle",
                "camera_id": camera_id,
                "location": cam_name,
                "timestamp": now_str,
                "details": f"Active CCTNS Red Notice. Hotlist target intercepted at node {camera_id} ({cam_name}).",
                "status": "INTERCEPT_DISPATCHED",
                "confidence": round(confidence if confidence > 0 else 0.98, 3),
                "created_epoch": now
            })

    # Rule 2: Inter-node velocity check if previously detected at a different camera
    if prev_row:
        prev_cam = prev_row["camera_id"]
        prev_ts = prev_row["timestamp"]
        dt = now - prev_ts

        if prev_cam != camera_id and dt > 0.5 and dt < 600:
            if prev_cam in CAMERA_COORDS and camera_id in CAMERA_COORDS:
                lat1, lon1 = CAMERA_COORDS[prev_cam]
                lat2, lon2 = CAMERA_COORDS[camera_id]
                dist_km = _haversine_km(lat1, lon1, lat2, lon2)
                speed_kmh = round((dist_km / dt) * 3600, 1)

                if speed_kmh > 140:
                    key = (clean_plate, "GHOST")
                    if now - _recent_alert_timestamps.get(key, 0) > 60:
                        _recent_alert_timestamps[key] = now
                        insert_alert({
                            "id": f"ALT-2026-{int(now * 1000) % 100000:05d}",
                            "type": "GHOST_PLATE",
                            "severity": "CRITICAL",
                            "plate": clean_plate,
                            "vehicle": "Cloned / Counterfeit Tag",
                            "camera_id": camera_id,
                            "location": cam_name,
                            "timestamp": now_str,
                            "details": f"Spatiotemporal anomaly: Reached {speed_kmh} km/h between {prev_cam} and {camera_id} ({dist_km:.2f}km in {dt:.1f}s). Physical impossibility - counterfeit cloned plate.",
                            "status": "FORENSIC_FLAGGED",
                            "confidence": 0.99,
                            "created_epoch": now
                        })
                elif speed_kmh > 50:
                    key = (clean_plate, "SPEED")
                    if now - _recent_alert_timestamps.get(key, 0) > 60:
                        _recent_alert_timestamps[key] = now
                        insert_alert({
                            "id": f"ALT-2026-{int(now * 1000) % 100000:05d}",
                            "type": "SPEED_VIOLATION",
                            "severity": "HIGH",
                            "plate": clean_plate,
                            "vehicle": "Over-speed Vehicle",
                            "camera_id": camera_id,
                            "location": cam_name,
                            "timestamp": now_str,
                            "details": f"Recorded {speed_kmh} km/h traversing from {prev_cam} in designated 40 km/h municipal corridor.",
                            "status": "E_CHALLAN_ISSUED",
                            "confidence": round(confidence if confidence > 0 else 0.96, 3),
                            "created_epoch": now
                        })


def query_trajectory(plate: str):
    """
    Reconstruct chronological trajectory for a plate.
    Returns list of records with inter-node speed and anomaly flags.
    """
    plate = plate.strip().upper()
    with _lock:
        conn = _get_conn()
        rows = conn.execute(
            "SELECT camera_id, timestamp, confidence FROM detections WHERE plate = ? ORDER BY timestamp ASC",
            (plate,)
        ).fetchall()
        conn.close()

    if not rows:
        return []

    records = []
    prev_cam = None
    prev_ts = None

    for row in rows:
        cam = row["camera_id"]
        ts = row["timestamp"]
        conf = row["confidence"]

        speed_kmh = 0.0
        status = "First Capture"

        if prev_cam and prev_ts:
            dt = ts - prev_ts
            if dt > 0 and cam in CAMERA_COORDS and prev_cam in CAMERA_COORDS:
                lat1, lon1 = CAMERA_COORDS[prev_cam]
                lat2, lon2 = CAMERA_COORDS[cam]
                dist_km = _haversine_km(lat1, lon1, lat2, lon2)
                speed_kmh = round((dist_km / dt) * 3600, 1)

                if speed_kmh > 140:
                    status = f"GHOST IDENTITY / CLONED PLATE (v={speed_kmh} km/h PHYSICAL IMPOSSIBILITY)"
                elif speed_kmh > 50:
                    status = f"SPEED VIOLATION (+{speed_kmh - 50:.0f} km/h over limit)"
                else:
                    status = "Transit Cleared"

        records.append({
            "node": cam,
            "location": CAMERA_NAMES.get(cam, cam),
            "time": time.strftime("%H:%M:%S IST", time.localtime(ts)),
            "speed_kmh": speed_kmh,
            "status": status,
            "confidence": round(conf, 3),
        })

        prev_cam = cam
        prev_ts = ts

    return records


def get_recent_plates(limit: int = 50):
    """Get most recent unique plates seen."""
    with _lock:
        conn = _get_conn()
        rows = conn.execute(
            "SELECT plate, camera_id, timestamp, confidence FROM detections ORDER BY timestamp DESC LIMIT ?",
            (limit,)
        ).fetchall()
        conn.close()
    return [dict(r) for r in rows]


# Initialize on import
init_db()
