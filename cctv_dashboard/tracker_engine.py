"""
Project-MELV :: CCTV Traffic Vision Engine
Integrates:
1. Felipe Tambasco's ANPR Pipeline (containment, preprocessing, EasyOCR, character mapping, confidence lock)
2. Roboflow's Multi-Zone Traffic Analysis (YOLOv8 + ByteTrack + PolygonZones + TraceAnnotator Footprints)
3. Direct OpenCV/Supervision frame baking (Zero CSS overlays, 100% true computer vision pipeline)
"""
import cv2
import numpy as np
from ultralytics import YOLO
import supervision as sv

from .config import (
    VEHICLE_MODEL_PATH,
    LICENSE_PLATE_MODEL_PATH,
    COCO_VEHICLE_CLASSES,
    CLASS_NAMES_MAP,
    VEHICLE_CONF_THRESHOLD,
    PLATE_CONF_THRESHOLD,
    BLACKLIST_PLATES,
    get_default_zones
)
from .anpr_engine import ANPREngine, HistoricalVehicleRegistry


class TrafficVisionEngine:
    def __init__(self, vehicle_weights: str = None, plate_weights: str = None):
        """
        Initializes the dual YOLO models, ByteTrack tracker,
        Supervision annotators, and ANPR recognition engine.
        """
        v_weights = vehicle_weights or VEHICLE_MODEL_PATH
        p_weights = plate_weights or LICENSE_PLATE_MODEL_PATH

        try:
            print(f"[VisionEngine] Loading vehicle model: {v_weights}...")
            self.vehicle_model = YOLO(v_weights)
        except Exception as e:
            print(f"[VisionEngine WARNING] Could not load YOLO vehicle model ({e}). Using mock/fallback detector.")
            self.vehicle_model = None

        try:
            print(f"[VisionEngine] Loading license plate model: {p_weights}...")
            self.plate_model = YOLO(p_weights)
        except Exception as e:
            print(f"[VisionEngine WARNING] Could not load YOLO plate model ({e}). Using mock/fallback detector.")
            self.plate_model = None


        print("[VisionEngine] Initializing Supervision ByteTrack & TraceAnnotator...")
        self.byte_tracker = sv.ByteTrack(
            track_activation_threshold=0.25,
            lost_track_buffer=30,
            minimum_matching_threshold=0.8,
            frame_rate=30
        )
        self.trace_annotator = sv.TraceAnnotator(
            trace_length=60,
            thickness=2,
            position=sv.Position.CENTER
        )

        print("[VisionEngine] Initializing ANPR OCR Engine...")
        self.anpr = ANPREngine()
        self.registry = HistoricalVehicleRegistry(BLACKLIST_PLATES)

        # Polygon Counting Zones (initialized on first frame with known dimensions)
        self.zones_initialized = False
        self.entry_zone = None
        self.exit_zone = None
        self.entry_zone_annotator = None
        self.exit_zone_annotator = None

        # Cumulative Flow Statistics
        self.total_unique_vehicles = set()
        self.inflow_count = 0
        self.outflow_count = 0
        self.tracked_in_entry = set()
        self.tracked_in_exit = set()

    def _init_zones(self, width: int, height: int):
        """Initializes polygon zones and supervision annotators based on video resolution."""
        zones = get_default_zones(width, height)

        self.entry_zone = sv.PolygonZone(
            polygon=zones['entry'],
            triggering_anchors=[sv.Position.CENTER]
        )
        self.exit_zone = sv.PolygonZone(
            polygon=zones['exit'],
            triggering_anchors=[sv.Position.CENTER]
        )

        self.entry_zone_annotator = sv.PolygonZoneAnnotator(
            zone=self.entry_zone,
            color=sv.Color(200, 232, 77),  # Acid-lime
            thickness=2,
            text_thickness=1,
            text_scale=0.5
        )
        self.exit_zone_annotator = sv.PolygonZoneAnnotator(
            zone=self.exit_zone,
            color=sv.Color(128, 80, 232),  # Electric-purple
            thickness=2,
            text_thickness=1,
            text_scale=0.5
        )
        self.zones_initialized = True

    def process_frame(self, frame: np.ndarray, frame_idx: int = 0):
        """
        Executes the complete multi-stage computer vision pipeline on a single video frame:
        1. Vehicle Detection (YOLOv8 COCO)
        2. ByteTrack Tracking & Motion Trails
        3. License Plate Detection (Custom YOLO weights)
        4. Spatial Containment (get_car)
        5. Preprocessing & OCR Extraction
        6. Disambiguation & Historical Confidence Locking
        7. Direct OpenCV/Supervision Annotation onto Frame
        
        Returns:
            annotated_frame: np.ndarray (OpenCV BGR with baked annotations)
            metrics: dict of live density, cumulative counts, and alerts
            detected_plates_this_frame: list of plate data dicts
        """
        if frame is None:
            return None, {}, []

        height, width = frame.shape[:2]
        if not self.zones_initialized:
            self._init_zones(width, height)

        annotated_frame = frame.copy()

        # =========================================================================
        # 1. VEHICLE DETECTION & BYTETRACK MULTI-OBJECT TRACKING
        # =========================================================================
        vehicle_boxes_and_ids = []
        if self.vehicle_model is not None:
            v_results = self.vehicle_model(
                annotated_frame,
                conf=VEHICLE_CONF_THRESHOLD,
                classes=COCO_VEHICLE_CLASSES,
                verbose=False
            )[0]

            detections = sv.Detections.from_ultralytics(v_results)
            # Update ByteTrack tracker with detected vehicle boxes
            detections = self.byte_tracker.update_with_detections(detections)

            # Draw motion trail footprints behind each vehicle
            annotated_frame = self.trace_annotator.annotate(
                scene=annotated_frame,
                detections=detections
            )

            # Build list of active vehicle boxes and IDs: [x1, y1, x2, y2, tracker_id]
            if detections.tracker_id is not None:
                for xyxy, tid in zip(detections.xyxy, detections.tracker_id):
                    vehicle_boxes_and_ids.append([xyxy[0], xyxy[1], xyxy[2], xyxy[3], int(tid)])
                    self.total_unique_vehicles.add(int(tid))
        else:
            detections = sv.Detections.empty()

        # =========================================================================
        # 2. LICENSE PLATE DETECTION (Custom YOLO Weights)
        # =========================================================================
        plate_detections = sv.Detections.empty()
        if self.plate_model is not None:
            p_results = self.plate_model(
                frame,
                conf=PLATE_CONF_THRESHOLD,
                verbose=False
            )[0]
            plate_detections = sv.Detections.from_ultralytics(p_results)


        detected_plates_this_frame = []

        if len(plate_detections) > 0:
            for p_xyxy in plate_detections.xyxy:
                x1_p, y1_p, x2_p, y2_p = map(int, p_xyxy)


                # Ensure valid coordinates within frame boundaries
                x1_p, y1_p = max(0, x1_p), max(0, y1_p)
                x2_p, y2_p = min(width, x2_p), min(height, y2_p)

                if (x2_p - x1_p) < 10 or (y2_p - y1_p) < 6:
                    continue

                # A. Enforce Spatial Containment (get_car)
                matched_veh_box, parent_tracker_id = self.anpr.get_car(
                    (x1_p, y1_p, x2_p, y2_p),
                    vehicle_boxes_and_ids
                )

                # B. Crop & Preprocess License Plate
                plate_crop = frame[y1_p:y2_p, x1_p:x2_p]

                # Draw license plate bounding box highlight
                cv2.rectangle(annotated_frame, (x1_p, y1_p), (x2_p, y2_p), (0, 255, 255), 2)

                if parent_tracker_id is not None:
                    # C. OCR Recognition & Disambiguation
                    plate_text, ocr_conf = self.anpr.read_plate(plate_crop)

                    # D. Update Historical Confidence Registry
                    record = self.registry.register_or_update(
                        tracker_id=parent_tracker_id,
                        plate_text=plate_text,
                        ocr_conf=ocr_conf,
                        plate_crop=plate_crop,
                        vehicle_class="Vehicle"
                    )

                    if plate_text:
                        detected_plates_this_frame.append({
                            'tracker_id': parent_tracker_id,
                            'plate': record['best_plate'],
                            'conf': record['best_conf'],
                            'is_alert': record['is_alert'],
                            'crop': plate_crop,
                            'frame_idx': frame_idx
                        })

        # =========================================================================
        # 3. POLYGON ZONE DENSITY & DIRECTIONAL FLOW
        # =========================================================================
        entry_mask = self.entry_zone.trigger(detections=detections)
        exit_mask = self.exit_zone.trigger(detections=detections)

        # Directional flow counter (Entry -> Exit)
        if detections.tracker_id is not None:
            for tid, in_entry, in_exit in zip(detections.tracker_id, entry_mask, exit_mask):
                tid_int = int(tid)
                if in_entry and tid_int not in self.tracked_in_entry:
                    self.tracked_in_entry.add(tid_int)
                    self.inflow_count += 1

                if in_exit and tid_int not in self.tracked_in_exit:
                    self.tracked_in_exit.add(tid_int)
                    self.outflow_count += 1

        # Draw supervision polygon zones on the frame
        annotated_frame = self.entry_zone_annotator.annotate(scene=annotated_frame)
        annotated_frame = self.exit_zone_annotator.annotate(scene=annotated_frame)

        # =========================================================================
        # 4. RENDER VEHICLE LABELS, TRACKER IDS & ALERT CALLOUTS
        # =========================================================================
        active_alerts_count = 0

        if detections.tracker_id is not None:
            for xyxy, tid, cls_id in zip(detections.xyxy, detections.tracker_id, detections.class_id):
                tid_int = int(tid)
                x1, y1, x2, y2 = map(int, xyxy)
                class_name = CLASS_NAMES_MAP.get(int(cls_id), "Vehicle")

                record = self.registry.get(tid_int)
                best_plate = record['best_plate'] if record else "SCANNING..."
                best_conf = record['best_conf'] if record else 0.0
                is_alert = record['is_alert'] if record else False

                if is_alert:
                    active_alerts_count += 1

                # Visual palette: intense RED for alert, LIME/CYAN for normal
                box_color = (0, 0, 255) if is_alert else (77, 232, 200)  # BGR
                box_thickness = 3 if is_alert else 2

                # A. Vehicle Bounding Box
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), box_color, box_thickness)

                # B. Corner Brackets (Tactical Edge Style)
                bracket_len = min(20, int((x2 - x1) * 0.2))
                # Top-left
                cv2.line(annotated_frame, (x1, y1), (x1 + bracket_len, y1), box_color, box_thickness + 2)
                cv2.line(annotated_frame, (x1, y1), (x1, y1 + bracket_len), box_color, box_thickness + 2)
                # Top-right
                cv2.line(annotated_frame, (x2, y1), (x2 - bracket_len, y1), box_color, box_thickness + 2)
                cv2.line(annotated_frame, (x2, y1), (x2, y1 + bracket_len), box_color, box_thickness + 2)
                # Bottom-left
                cv2.line(annotated_frame, (x1, y2), (x1 + bracket_len, y2), box_color, box_thickness + 2)
                cv2.line(annotated_frame, (x1, y2), (x1, y2 - bracket_len), box_color, box_thickness + 2)
                # Bottom-right
                cv2.line(annotated_frame, (x2, y2), (x2 - bracket_len, y2), box_color, box_thickness + 2)
                cv2.line(annotated_frame, (x2, y2), (x2, y2 - bracket_len), box_color, box_thickness + 2)

                # C. Two-Tier Label
                line1 = f"#ID {tid_int} | {class_name}"
                line2 = f"PLATE: {best_plate} ({best_conf * 100:.0f}%)" if best_conf > 0 else f"PLATE: {best_plate}"

                if is_alert:
                    line1 = f"!!! WANTED TARGET: {tid_int} !!!"
                    line2 = f"[WANTED: {best_plate}]"

                # Background text badges
                font = cv2.FONT_HERSHEY_SIMPLEX
                scale = 0.45
                thickness = 1

                (w1, h1), _ = cv2.getTextSize(line1, font, scale, thickness)
                (w2, h2), _ = cv2.getTextSize(line2, font, scale, thickness)
                badge_w = max(w1, w2) + 12
                badge_h = h1 + h2 + 14

                badge_y1 = max(0, y1 - badge_h)
                badge_y2 = badge_y1 + badge_h
                badge_x2 = min(width, x1 + badge_w)

                # Draw filled background badge
                bg_color = (0, 0, 180) if is_alert else (32, 32, 32)
                cv2.rectangle(annotated_frame, (x1, badge_y1), (badge_x2, badge_y2), bg_color, -1)
                cv2.rectangle(annotated_frame, (x1, badge_y1), (badge_x2, badge_y2), box_color, 1)

                # Draw text lines
                text_color1 = (255, 255, 255) if is_alert else (200, 232, 77)
                text_color2 = (255, 255, 255)
                cv2.putText(annotated_frame, line1, (x1 + 6, badge_y1 + h1 + 4), font, scale, text_color1, thickness, cv2.LINE_AA)
                cv2.putText(annotated_frame, line2, (x1 + 6, badge_y1 + h1 + h2 + 9), font, scale, text_color2, thickness, cv2.LINE_AA)

        # =========================================================================
        # 5. SEMI-TRANSPARENT HUD OVERLAY (TOP-RIGHT CORNER)
        # =========================================================================
        hud_w, hud_h = 280, 105
        hud_x1 = width - hud_w - 15
        hud_y1 = 15
        hud_x2 = hud_x1 + hud_w
        hud_y2 = hud_y1 + hud_h

        # Alpha overlay rectangle
        overlay = annotated_frame.copy()
        cv2.rectangle(overlay, (hud_x1, hud_y1), (hud_x2, hud_y2), (20, 20, 20), -1)
        cv2.addWeighted(overlay, 0.82, annotated_frame, 0.18, 0, annotated_frame)
        cv2.rectangle(annotated_frame, (hud_x1, hud_y1), (hud_x2, hud_y2), (77, 232, 200), 1)

        # HUD Text Statistics
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(annotated_frame, "CCTV TRAFFIC & ANPR HUD", (hud_x1 + 10, hud_y1 + 20), font, 0.42, (200, 232, 77), 1, cv2.LINE_AA)
        cv2.line(annotated_frame, (hud_x1 + 10, hud_y1 + 26), (hud_x2 - 10, hud_y1 + 26), (60, 60, 60), 1)

        active_density = len(vehicle_boxes_and_ids)
        cv2.putText(annotated_frame, f"Active Vehicles in Scene: {active_density}", (hud_x1 + 10, hud_y1 + 44), font, 0.38, (220, 220, 220), 1, cv2.LINE_AA)
        cv2.putText(annotated_frame, f"Unique Vehicles Counted : {len(self.total_unique_vehicles)}", (hud_x1 + 10, hud_y1 + 62), font, 0.38, (220, 220, 220), 1, cv2.LINE_AA)
        cv2.putText(annotated_frame, f"Flow (In: {self.inflow_count} | Out: {self.outflow_count})", (hud_x1 + 10, hud_y1 + 80), font, 0.38, (220, 220, 220), 1, cv2.LINE_AA)

        alert_color = (0, 0, 255) if active_alerts_count > 0 else (100, 255, 100)
        cv2.putText(annotated_frame, f"Active Security Alerts  : {active_alerts_count}", (hud_x1 + 10, hud_y1 + 96), font, 0.38, alert_color, 1, cv2.LINE_AA)

        # Return metrics summary
        metrics = {
            'active_density': active_density,
            'unique_count': len(self.total_unique_vehicles),
            'inflow_count': self.inflow_count,
            'outflow_count': self.outflow_count,
            'active_alerts': active_alerts_count,
            'total_scanned_plates': len(self.registry.registry)
        }

        return annotated_frame, metrics, detected_plates_this_frame
