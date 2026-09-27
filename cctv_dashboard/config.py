"""
Project-MELV :: CCTV Traffic Vision Engine Configuration
Central configuration for real-time YOLOv8 + ByteTrack + License Plate Recognition + Zone Density pipeline.
"""
import os
import numpy as np

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Model Weights
VEHICLE_MODEL_PATH = os.path.join(BASE_DIR, "yolov8n.pt")
LICENSE_PLATE_MODEL_PATH = os.path.join(BASE_DIR, "models", "license_plate_detector.pt")

# Default Video Feeds
DEFAULT_VIDEO_PATH = os.path.join(BASE_DIR, "cctv.mp4")
SECONDARY_VIDEO_PATH = os.path.join(BASE_DIR, "frontend", "public", "videos", "cam_02_downstream.mp4")

# Detection Classes (COCO Dataset indices for vehicles)
# 2: car, 3: motorcycle, 5: bus, 7: truck
COCO_VEHICLE_CLASSES = [2, 3, 5, 7]
CLASS_NAMES_MAP = {
    2: 'Car',
    3: 'Motorcycle',
    5: 'Bus',
    7: 'Truck'
}

# Detection Confidence Thresholds
VEHICLE_CONF_THRESHOLD = 0.35
PLATE_CONF_THRESHOLD = 0.25
OCR_CONF_THRESHOLD = 0.40
OCR_LOCK_THRESHOLD = 0.70

# Blacklisted / Flagged Wanted License Plates (CCTNS National Crime Watchlist)
BLACKLIST_PLATES = [
    "TN07BX8819",  # White Mahindra Scorpio (Stolen Vehicle / FIR-2026-CHN-KAN-0492)
    "MH12QZ9901",  # Dark Blue Scorpio (Organized Crime / CCB Flag)
    "DL01CZ4040",  # Silver Honda City (Repeated Toll Evasion / Cloned Plate)
    "AB12CDE",     # Tutorial Reference Blacklist Plate
    "TN09BK4589",  # Commercial Heavy Vehicle Day-Ban Infraction
    "XYZ999"       # Benchmark Test Target
]

# Character-Level Disambiguation Mappings (Felipe Tambasco / ANPR Heuristics)
DICT_CHAR_TO_INT = {
    'O': '0',
    'D': '0',
    'Q': '0',
    'I': '1',
    'L': '1',
    'T': '1',
    'Z': '2',
    'J': '3',
    'A': '4',
    'S': '5',
    'G': '6',
    'B': '8'
}

DICT_INT_TO_CHAR = {
    '0': 'O',
    '1': 'I',
    '2': 'Z',
    '3': 'J',
    '4': 'A',
    '5': 'S',
    '6': 'G',
    '8': 'B'
}

# Standard Indian RTO State Codes for Validation
INDIAN_STATE_CODES = {
    "AP": "Andhra Pradesh", "AR": "Arunachal Pradesh", "AS": "Assam", "BR": "Bihar",
    "CG": "Chhattisgarh", "CH": "Chandigarh", "DD": "Daman & Diu", "DL": "Delhi",
    "DN": "Dadra & Nagar Haveli", "GA": "Goa", "GJ": "Gujarat", "HP": "Himachal Pradesh",
    "HR": "Haryana", "JH": "Jharkhand", "JK": "Jammu & Kashmir", "KA": "Karnataka",
    "KL": "Kerala", "LA": "Ladakh", "LD": "Lakshadweep", "MH": "Maharashtra",
    "ML": "Meghalaya", "MN": "Manipur", "MP": "Madhya Pradesh", "MZ": "Mizoram",
    "NL": "Nagaland", "OD": "Odisha", "PB": "Punjab", "PY": "Puducherry",
    "RJ": "Rajasthan", "SK": "Sikkim", "TN": "Tamil Nadu", "TR": "Tripura",
    "TS": "Telangana", "UK": "Uttarakhand", "UP": "Uttar Pradesh", "WB": "West Bengal",
    "BH": "Bharat Series"
}

# Default Density Polygon Zones (calibrated proportionally to frame width & height)
def get_default_zones(width: int, height: int):
    """
    Returns polygon zones for Entry (Inflow) and Exit (Outflow)
    normalized to the video dimensions.
    """
    # Zone 1: Entry / Upstream Zone
    entry_poly = np.array([
        [int(width * 0.02), int(height * 0.35)],
        [int(width * 0.32), int(height * 0.35)],
        [int(width * 0.38), int(height * 0.85)],
        [int(width * 0.02), int(height * 0.85)]
    ], dtype=np.int32)

    # Zone 2: Exit / Downstream Zone
    exit_poly = np.array([
        [int(width * 0.62), int(height * 0.35)],
        [int(width * 0.98), int(height * 0.35)],
        [int(width * 0.98), int(height * 0.90)],
        [int(width * 0.58), int(height * 0.90)]
    ], dtype=np.int32)

    return {
        'entry': entry_poly,
        'exit': exit_poly
    }
