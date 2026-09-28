"""
Project-MELV :: ANPR Engine
Implements Felipe Tambasco's Automatic Number Plate Recognition pipeline:
- Plate-to-vehicle spatial containment (get_car)
- Preprocessing (Grayscale + Binary Inverse Thresholding)
- EasyOCR character extraction
- Character disambiguation heuristics (Letters <-> Digits)
- Historical Maximum-Confidence Tracking Lock
"""
import re
import cv2
import numpy as np
import torch
try:
    import easyocr
except Exception as e:
    easyocr = None
    print(f"[ANPR WARNING] easyocr could not be loaded ({e}). Falling back to spatial ANPR detection.")

from .config import (
    DICT_CHAR_TO_INT,
    DICT_INT_TO_CHAR,
    INDIAN_STATE_CODES,
    BLACKLIST_PLATES,
    OCR_CONF_THRESHOLD,
    OCR_LOCK_THRESHOLD
)

class ANPREngine:
    def __init__(self, use_gpu: bool = None):
        """Initializes the EasyOCR reader with CUDA if available."""
        if use_gpu is None:
            use_gpu = torch.cuda.is_available()
        self.use_gpu = use_gpu
        self.reader = None
        if easyocr is not None:
            try:
                print(f"[ANPR] Initializing EasyOCR (GPU={self.use_gpu})...")
                self.reader = easyocr.Reader(['en'], gpu=self.use_gpu)
                print("[ANPR] EasyOCR Reader initialized successfully.")
            except Exception as e:
                print(f"[ANPR WARNING] EasyOCR initialization failed: {e}")
                self.reader = None
        else:
            print("[ANPR] EasyOCR module unavailable; fallback detection active.")


    @staticmethod
    def get_car(plate_bbox, vehicle_bboxes_and_ids):
        """
        Assigns a detected license plate bounding box to its parent vehicle.
        
        Args:
            plate_bbox: (x1_p, y1_p, x2_p, y2_p)
            vehicle_bboxes_and_ids: list of [x1_v, y1_v, x2_v, y2_v, tracker_id]
            
        Returns:
            (parent_vehicle_bbox, tracker_id) or (None, None) if not contained
        """
        x1_p, y1_p, x2_p, y2_p = plate_bbox
        matched_vehicle = None
        matched_id = None
        max_overlap = -1

        for veh in vehicle_bboxes_and_ids:
            x1_v, y1_v, x2_v, y2_v, tid = veh
            
            # Strict containment check: plate is fully inside vehicle box
            if x1_p >= x1_v and y1_p >= y1_v and x2_p <= x2_v and y2_p <= y2_v:
                return (veh[:4], tid)
            
            # Fallback intersection check: calculate area of plate inside vehicle
            inter_x1 = max(x1_p, x1_v)
            inter_y1 = max(y1_p, y1_v)
            inter_x2 = min(x2_p, x2_v)
            inter_y2 = min(y2_p, y2_v)
            
            if inter_x2 > inter_x1 and inter_y2 > inter_y1:
                inter_area = (inter_x2 - inter_x1) * (inter_y2 - inter_y1)
                plate_area = max(1, (x2_p - x1_p) * (y2_p - y1_p))
                overlap_ratio = inter_area / plate_area
                
                # If at least 70% of plate is inside vehicle box
                if overlap_ratio > 0.70 and overlap_ratio > max_overlap:
                    max_overlap = overlap_ratio
                    matched_vehicle = veh[:4]
                    matched_id = tid

        if matched_id is not None:
            return (matched_vehicle, matched_id)
            
        return (None, None)

    @staticmethod
    def preprocess_plate(plate_crop: np.ndarray) -> np.ndarray:
        """
        Preprocesses cropped license plate sub-image:
        1. Grayscale conversion
        2. Bilateral filter (dust/streak suppression while preserving edges)
        3. CLAHE contrast enhancement
        4. Binary inverse thresholding (Otsu-adaptive)
        Forces dark characters onto a stark white background.
        """
        if plate_crop is None or plate_crop.size == 0:
            return None

        # Convert to grayscale
        if len(plate_crop.shape) == 3:
            gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)
        else:
            gray = plate_crop.copy()

        # Resize if plate is too small to improve OCR legibility
        h, w = gray.shape
        if h < 32 or w < 90:
            scale = max(32 / max(h, 1), 90 / max(w, 1))
            gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

        # Bilateral filter removes noise while keeping edges sharp
        filtered = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)

        # Contrast enhancement via CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(filtered)

        # Apply binary inverse thresholding with Otsu's adaptive threshold
        _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        return thresh

    @staticmethod
    def disambiguate_text(raw_text: str) -> str:
        """
        Applies character-level heuristic mapping to resolve OCR ambiguity
        based on standard registration formatting (Letters in state/series, Digits in numbers).
        """
        # Clean: keep only uppercase alphanumeric characters
        clean = re.sub(r'[^A-Za-z0-9]', '', raw_text).upper()
        if len(clean) < 4:
            return clean

        chars = list(clean)

        # Positions 0 and 1: State Code (Must be Alphabetic)
        if len(chars) >= 2:
            chars[0] = DICT_INT_TO_CHAR.get(chars[0], chars[0])
            chars[1] = DICT_INT_TO_CHAR.get(chars[1], chars[1])

        # Positions 2 and 3: District Code (Must be Digits)
        if len(chars) >= 4:
            chars[2] = DICT_CHAR_TO_INT.get(chars[2], chars[2])
            chars[3] = DICT_CHAR_TO_INT.get(chars[3], chars[3])

        # Last 4 characters should be numeric digits
        if len(chars) >= 8:
            for i in range(len(chars) - 4, len(chars)):
                chars[i] = DICT_CHAR_TO_INT.get(chars[i], chars[i])

        return "".join(chars)

    @staticmethod
    def is_valid_plate(plate_text: str) -> bool:
        """Checks if plate text matches standard Indian RTO or European/UK format."""
        if not plate_text or len(plate_text) < 6:
            return False

        # Indian format: e.g. TN11AH4920, KA04MB2040, 22BH1234AA
        indian_pattern = r'^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$'
        bharat_pattern = r'^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$'
        # Standard UK/European format: e.g. AB12CDE
        uk_pattern = r'^[A-Z]{2}[0-9]{2}[A-Z]{3}$'

        if re.match(indian_pattern, plate_text) or re.match(bharat_pattern, plate_text) or re.match(uk_pattern, plate_text):
            return True

        # Check state prefix
        if len(plate_text) >= 2 and plate_text[:2] in INDIAN_STATE_CODES:
            return True

        return False

    def read_plate(self, plate_crop: np.ndarray):
        """
        Runs full OCR extraction pipeline on a cropped plate:
        Preprocessing -> EasyOCR -> Sanitization -> Disambiguation.
        
        Returns:
            (plate_text, ocr_confidence) or (None, 0.0)
        """
        if plate_crop is None or plate_crop.size == 0:
            return None, 0.0

        thresh = self.preprocess_plate(plate_crop)
        if thresh is None:
            return None, 0.0

        if self.reader is None:
            return None, 0.0

        try:
            results = self.reader.readtext(thresh)

            if not results:
                # Fallback to reading raw crop
                results = self.reader.readtext(plate_crop)

            if not results:
                return None, 0.0

            # Combine all detected text blocks
            combined_text = ""
            conf_sum = 0.0
            count = 0

            for bbox, text, conf in results:
                clean_part = re.sub(r'[^A-Za-z0-9]', '', text).upper()
                if clean_part:
                    combined_text += clean_part
                    conf_sum += conf
                    count += 1

            if count == 0:
                return None, 0.0

            avg_conf = conf_sum / count
            disambiguated = self.disambiguate_text(combined_text)

            return disambiguated, float(avg_conf)
        except Exception as e:
            # Safe catch for OpenCV/EasyOCR dimension errors
            return None, 0.0


class HistoricalVehicleRegistry:
    """
    Maintains persistent memory of tracked vehicles and locks maximum-confidence
    plate readings across frames.
    """
    def __init__(self, blacklist=None):
        self.blacklist = set(blacklist or BLACKLIST_PLATES)
        self.registry = {}  # tracker_id -> dict of properties

    def register_or_update(self, tracker_id: int, plate_text: str, ocr_conf: float, plate_crop: np.ndarray, vehicle_class: str = "Vehicle"):
        """
        Updates tracking registry using Felipe Tambasco's Historical Max-Confidence Lock:
        Whenever ocr_conf > current best_conf, update best_plate.
        Once ocr_conf > 0.70, lock the plate.
        """
        if tracker_id not in self.registry:
            self.registry[tracker_id] = {
                'tracker_id': tracker_id,
                'best_plate': plate_text or "SCANNING...",
                'best_conf': ocr_conf if plate_text else 0.0,
                'locked': (ocr_conf >= OCR_LOCK_THRESHOLD) if plate_text else False,
                'vehicle_class': vehicle_class,
                'is_alert': (plate_text in self.blacklist) if plate_text else False,
                'plate_crop': plate_crop,
                'first_seen_frame': 0,
                'last_seen_frame': 0,
                'trajectory_history': []
            }
            return self.registry[tracker_id]

        record = self.registry[tracker_id]
        record['vehicle_class'] = vehicle_class

        # Update plate if new plate is valid and has higher confidence
        if plate_text and len(plate_text) >= 4:
            if not record['locked'] or ocr_conf > record['best_conf']:
                if ocr_conf > record['best_conf']:
                    record['best_plate'] = plate_text
                    record['best_conf'] = ocr_conf
                    record['plate_crop'] = plate_crop
                    if ocr_conf >= OCR_LOCK_THRESHOLD:
                        record['locked'] = True

            # Re-evaluate blacklist match
            if record['best_plate'] in self.blacklist or plate_text in self.blacklist:
                record['is_alert'] = True

        return record

    def get(self, tracker_id: int):
        return self.registry.get(tracker_id, None)

    def get_all_alerts(self):
        return [rec for rec in self.registry.values() if rec.get('is_alert', False)]
