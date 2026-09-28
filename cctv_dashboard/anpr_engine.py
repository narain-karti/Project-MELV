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
    def preprocess_plate(plate_crop: np.ndarray, is_two_row: bool = False) -> np.ndarray:
        """
        Adverse-Weather Robust Preprocessing Pipeline (Rain, Dust, Dirty Plates, Glare):
        1. Specular Glare / Reflection Suppression (removes headlight / rain glare spots)
        2. LAB Luminance CLAHE (recovers dark characters on dirty/faded plates)
        3. Morphological Top-Hat minus Black-Hat (isolates characters under uneven illumination)
        4. Bilateral edge-preserving filtering (smooths grain without blurring character edges)
        5. Otsu Adaptive Inverse Binarization with morphological healing
        """
        if plate_crop is None or plate_crop.size == 0:
            return None

        # Resize if plate is too small to ensure OCR character clarity
        h, w = plate_crop.shape[:2]
        if h < 36 or w < 100:
            scale = max(36 / max(h, 1), 100 / max(w, 1))
            plate_crop = cv2.resize(plate_crop, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
            h, w = plate_crop.shape[:2]

        # 1. Specular Reflection / Glare Suppression (common in wet / rain conditions)
        if len(plate_crop.shape) == 3:
            # Detect overexposed glare highlights (>248 in all channels)
            glare_mask = cv2.inRange(plate_crop, np.array([245, 245, 245]), np.array([255, 255, 255]))
            if np.count_nonzero(glare_mask) > 0 and (np.count_nonzero(glare_mask) / (h * w)) < 0.25:
                plate_crop = cv2.inpaint(plate_crop, glare_mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)

            # 2. Contrast Enhancement in LAB Luminance Space
            lab = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(4, 4))
            cl = clahe.apply(l)
            enhanced_bgr = cv2.cvtColor(cv2.merge((cl, a, b)), cv2.COLOR_LAB2BGR)
            gray = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2GRAY)
        else:
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(4, 4))
            gray = clahe.apply(plate_crop)

        # 3. Morphological Top-Hat - Black-Hat Transform
        # Corrects non-uniform illumination from vehicle headlights, shadows, and mud streaks
        kernel_size = max(3, int(min(h, w) / 8))
        if kernel_size % 2 == 0:
            kernel_size += 1
        morph_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_size, kernel_size))
        tophat = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, morph_kernel)
        blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, morph_kernel)
        illum_corrected = cv2.add(cv2.subtract(gray, blackhat), tophat)

        # 4. Bilateral Edge-Preserving Filter (suppresses rain streaks & dust grain)
        smoothed = cv2.bilateralFilter(illum_corrected, d=7, sigmaColor=50, sigmaSpace=50)

        # 5. Otsu Adaptive Inverse Binarization
        _, thresh = cv2.threshold(smoothed, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        # 6. Morphological stroke bridge (repairs characters broken by water droplets)
        bridge_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        healed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, bridge_kernel)

        return healed

    @staticmethod
    def is_two_row_plate(crop: np.ndarray) -> bool:
        """Determines if license plate is double-row based on aspect ratio (w/h < 2.6)."""
        if crop is None or crop.size == 0:
            return False
        h, w = crop.shape[:2]
        aspect_ratio = w / max(h, 1)
        return aspect_ratio < 2.6

    @staticmethod
    def disambiguate_text(raw_text: str) -> str:
        """
        Applies Bayesian position-aware heuristic disambiguation for Indian vehicle plates.
        Removes HSRP 'IND' header watermark and enforces state/series letter-digit structure.
        """
        # Clean: keep only uppercase alphanumeric
        clean = re.sub(r'[^A-Za-z0-9]', '', raw_text).upper()

        # Remove Indian HSRP watermark 'IND' if present at start
        if clean.startswith('IND') and len(clean) > 8:
            clean = clean[3:]

        if len(clean) < 4:
            return clean

        chars = list(clean)
        n = len(chars)

        # Special Case: Bharat Series (e.g., 22BH1234AA)
        if n >= 9 and "".join(chars[2:4]) in ['BH', '8H', 'RH', 'SH']:
            # Pos 0-1: Year digits
            chars[0] = DICT_CHAR_TO_INT.get(chars[0], chars[0])
            chars[1] = DICT_CHAR_TO_INT.get(chars[1], chars[1])
            # Pos 2-3: 'BH'
            chars[2] = 'B'
            chars[3] = 'H'
            # Pos 4-7: 4 Digits
            for i in range(4, min(8, n)):
                chars[i] = DICT_CHAR_TO_INT.get(chars[i], chars[i])
            # Remaining: Series Letters
            for i in range(8, n):
                chars[i] = DICT_INT_TO_CHAR.get(chars[i], chars[i])
            return "".join(chars)

        # Standard Indian Plate Structure:
        # Pos 0-1: State Code (Letters only, e.g. TN, KA, DL, MH, KL)
        if n >= 2:
            chars[0] = DICT_INT_TO_CHAR.get(chars[0], chars[0])
            chars[1] = DICT_INT_TO_CHAR.get(chars[1], chars[1])

        # Pos 2-3: District RTO Code (Digits only, e.g. 07, 11, 01, 22)
        if n >= 4:
            chars[2] = DICT_CHAR_TO_INT.get(chars[2], chars[2])
            chars[3] = DICT_CHAR_TO_INT.get(chars[3], chars[3])

        # Last 4 characters: Must be Digits (e.g. 8819, 4920, 2612)
        if n >= 8:
            for i in range(n - 4, n):
                chars[i] = DICT_CHAR_TO_INT.get(chars[i], chars[i])

        # Characters between district code and last 4 numbers: Series (Letters)
        if n > 8:
            for i in range(4, n - 4):
                chars[i] = DICT_INT_TO_CHAR.get(chars[i], chars[i])

        return "".join(chars)

    @staticmethod
    def is_valid_plate(plate_text: str) -> bool:
        """Validates plate against Indian RTO standards, Bharat Series, and International format."""
        if not plate_text or len(plate_text) < 6:
            return False

        indian_pattern = r'^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$'
        bharat_pattern = r'^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$'
        uk_pattern = r'^[A-Z]{2}[0-9]{2}[A-Z]{3}$'

        if re.match(indian_pattern, plate_text) or re.match(bharat_pattern, plate_text) or re.match(uk_pattern, plate_text):
            return True

        # Check valid state prefix
        if len(plate_text) >= 2 and plate_text[:2] in INDIAN_STATE_CODES:
            return True

        return False

    def read_plate(self, plate_crop: np.ndarray):
        """
        Runs full adverse-weather OCR extraction pipeline on cropped plate:
        1. Checks for 2-row (double-line) Indian plates
        2. Preprocessing with de-glaring, CLAHE, and Top-Hat morphological filtering
        3. EasyOCR extraction with fallback
        4. Position-aware Indian RTO disambiguation
        """
        if plate_crop is None or plate_crop.size == 0 or self.reader is None:
            return None, 0.0

        is_two_row = self.is_two_row_plate(plate_crop)

        # Handle Two-Row Indian Plates (Split into top line and bottom line)
        if is_two_row:
            h = plate_crop.shape[0]
            top_half = plate_crop[0:int(h * 0.58), :]
            bottom_half = plate_crop[int(h * 0.42):, :]

            p_top = self.preprocess_plate(top_half, is_two_row=True)
            p_bot = self.preprocess_plate(bottom_half, is_two_row=True)

            try:
                res_top = self.reader.readtext(p_top) if p_top is not None else []
                res_bot = self.reader.readtext(p_bot) if p_bot is not None else []

                text_top = "".join([re.sub(r'[^A-Za-z0-9]', '', t[1]).upper() for t in res_top])
                text_bot = "".join([re.sub(r'[^A-Za-z0-9]', '', t[1]).upper() for t in res_bot])

                combined = text_top + text_bot
                if len(combined) >= 6:
                    conf_top = np.mean([t[2] for t in res_top]) if res_top else 0.8
                    conf_bot = np.mean([t[2] for t in res_bot]) if res_bot else 0.8
                    avg_conf = (conf_top + conf_bot) / 2.0
                    return self.disambiguate_text(combined), float(avg_conf)
            except Exception:
                pass

        # Standard Single-Row Pipeline
        thresh = self.preprocess_plate(plate_crop)
        if thresh is None:
            return None, 0.0

        try:
            results = self.reader.readtext(thresh)
            if not results:
                # Fallback to reading raw crop
                results = self.reader.readtext(plate_crop)

            if not results:
                return None, 0.0

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
        except Exception:
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
