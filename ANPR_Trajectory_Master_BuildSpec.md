# City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking & Urban Traffic Analytics
## Prototype Master Build Specification (v2.0 — SIH Edition)
**Problem Statement ID:** 26127  
**Category:** Smart India Hackathon (SIH) — State Police / Smart Cities / Ministry of Road Transport  
**Document Purpose:** Production-grade blueprint and execution manual for developing a winning hackathon prototype. Formatted directly for coding agents (Claude, Cursor, Antigravity) and development teams.

---

## 0. Executive Vision & Hackathon Strategy

To win Smart India Hackathon Problem Statement 26127, the platform must deliver on two critical fronts:
1. **Flawless Live Demonstration Reliability:** Live stage presentations fail when multi-stream video pipelines drop frames, choke CPU/GPU, or freeze. The core multi-camera trajectory tracking is built around synchronized feeds and pre-calibrated GIS event streams that guarantee 60 FPS fluid rendering on any judge's laptop without internet dependency.
2. **Defensible Technical Depth:** SIH judges probe for real AI. When judges ask, *"Can we upload our own photo or clip to see if your AI actually works?"*, the platform provides a dedicated **"AI Inspector & Ingestion Sandbox"** tab running live inference using Indian-tailored models.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                PLATFORM ARCHITECTURE                                   │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│  TAB 1: LIVE TRAJECTORY TRACKING         │  TAB 2: AI INSPECTOR & TEST SANDBOX         │
│  • Calibrated 2-Camera Synchronized Feed │  • Interactive Judge Upload (Image / Video) │
│  • Leaflet GIS Real-time Trajectory Map  │  • Live IISc VehicleNet-Y26n Inference      │
│  • Digital Vehicle Identity Card         │  • Live YOLO Plate Crop + PaddleOCR         │
│  • Dynamic Speed & Velocity Anomaly Calc │  • Indian RTO Regex Normalizer              │
│  • Monospace Real-Time Audit Ticker      │  • Digital Footprint Extraction             │
├──────────────────────────────────────────┴─────────────────────────────────────────────┤
│  SUPPORTING INTELLIGENCE TABS:                                                          │
│  • Tab 3: Trajectory Query & Spatial Graph (Multi-hop path history & clone detection) │
│  • Tab 4: Macro Traffic Flow & Urban Analytics (Density heatmaps, OD matrix, peak hrs) │
│  • Tab 5: Alerts & Law Enforcement Dispatch (Blacklist, Next-node intercept prediction) │
│  • Tab 6: Edge Topology & Network Health (1,000+ camera edge-compute architecture)     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Problem Statement Requirements Mapping

| PS 26127 Mandatory Requirement | How This Platform Solves It | Technical Implementation |
| :--- | :--- | :--- |
| **1. High-Accuracy ANPR & OCR (>90%)** | Handles real Indian conditions: multi-class vehicles, two-row plates, dirty/angled plates, RTO validation. | **IISc AIM VehicleNet-Y26n** (14 classes) + YOLO Plate Detector + **PaddleOCR PP-OCRv4** with Indian Plate Grammar Rules. |
| **2. Single Plate Trajectory Tracking** | Reconstructs complete spatial-temporal path across camera nodes chronologically with timestamps & speed. | **Leaflet GIS Map** with curved road-snapped polylines, velocity vectors, and direction tracking. |
| **3. Macro Traffic Flow & Analytics** | Aggregated city dynamics: density heatmaps, OD patterns, bottleneck detection, average speeds. | **Recharts Interactive Dashboard** displaying dual peak hours, vehicle modal shares, and OD flow matrices. |
| **4. Real-time Alert & Anomaly Engine** | Flags blacklisted vehicles, speed violations, and suspicious route anomalies. | **Cloned Plate Velocity Anomaly Engine** (detects impossible travel speeds across nodes) + **Next-Camera Intercept Prediction**. |

---

## 2. AI Model Selection & Pipeline Architecture

### 2.1 Vehicle Detection & Classification: `Perception365/VehicleNet-Y26n`
* **Source:** Hugging Face ([Perception365/VehicleNet-Y26n](https://huggingface.co/Perception365/VehicleNet-Y26n)), developed by the **AI for Integrated Mobility (AIM) group at the Indian Institute of Science (IISc), Bengaluru**.
* **Dataset Foundation:** Trained on the **iisc-aim/UVH-26** dataset derived from Safe City traffic surveillance cameras provided by the **Bengaluru Traffic Police**.
* **Why This Model Wins in SIH:**
  * Standard COCO models only recognize 80 generic classes and miss the nuances of Indian traffic.
  * `VehicleNet-Y26n` detects **14 fine-grained Indian vehicle classes**:
    1. Hatchback
    2. Sedan
    3. SUV
    4. MUV
    5. Bus
    6. Truck
    7. Three-wheeler (Auto-rickshaw)
    8. Two-wheeler (Motorcycle / Scooter)
    9. LCV (Light Commercial Vehicle)
    10. Mini-bus
    11. Tempo-traveller
    12. Bicycle
    13. Van
    14. Other
  * **Model Variant:** Nano (`Y26n`) — optimized for ultra-low latency edge inference (~12ms CPU, ~3ms GPU), making it directly deployable on roadside edge units (NVIDIA Jetson / Raspberry Pi 5).

### 2.2 License Plate Detection: YOLOv8 Indian Plate Detector
* **Model:** YOLOv8n fine-tuned on Indian license plates (`keremberke/yolov8n-license-plate-detection` or `MKgoud/License-Plate-Recognizer`).
* **Input:** Vehicle bounding box crop from Step 2.1.
* **Output:** High-precision bounding box coordinates for the number plate.

### 2.3 Character Recognition (OCR): PaddleOCR PP-OCRv4 + Indian Normalization
* **Model:** PaddleOCR (Mobile PP-OCRv4 direction classifier + detector + recognizer).
* **Indian License Plate Processing Pipeline (Crucial for SIH):**
  1. **Two-Row Plate Detection Heuristic:**
     * In India, ~70% of two-wheelers and commercial vehicles have two-line square plates.
     * Rule: If $\frac{\text{plate\_height}}{\text{plate\_width}} > 0.45$, the plate is classified as a two-row format. The image is split horizontally into Top Half (State + District Code, e.g., `KA 04`) and Bottom Half (Series + Number, e.g., `MB 2040`), OCR'd separately, and concatenated.
  2. **Preprocessing:** Grayscale conversion &rarr; Bilateral Filter (smooths road dust/noise while keeping edges crisp) &rarr; Adaptive Otsu Thresholding.
  3. **Indian RTO Syntax Validation & Character Correction:**
     * Standard Indian Plate Regex: `^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$` or `^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$` (BH Series).
     * **Positional OCR Disambiguation:**
       * Letters position (indices 0, 1 and series characters): `0` &rarr; `O`, `8` &rarr; `B`, `1` &rarr; `I`, `5` &rarr; `S`.
       * Numbers position (indices 2, 3 and last 4 digits): `O/D` &rarr; `0`, `B` &rarr; `8`, `I/L` &rarr; `1`, `S` &rarr; `5`, `Z` &rarr; `2`.
     * Validates state code against standard Indian RTO lookup (`KA`, `DL`, `MH`, `TN`, `UP`, `GJ`, `HR`, `TS`, `AP`, `WB`, `KL`, `RJ`, etc.).

---

## 3. System Architecture & Edge Computing Pitch

### The Core Answer to the Bandwidth Question
When judges ask: *"How will you scale this to 1,000 cameras without choking the network?"*

```
[Camera Pole: Edge AI Node (Jetson Orin Nano / Pi 5)]
  ├── RTSP 1080p Video Stream (Processed locally in RAM)
  ├── Step 1: VehicleNet-Y26n (Detects Auto, Bike, Car, Truck)
  ├── Step 2: YOLOv8 Plate Detector (Crops Plate)
  ├── Step 3: PaddleOCR + RTO Validator
  └── OUTPUT: Lightweight JSON Telemetry (~200 Bytes)
           │
           │  (4G / 5G / Fiber: 99.8% bandwidth reduction)
           ▼
[Central Traffic Command Platform]
  ├── Time-series Spatial Graph (Stitches Trajectories across Nodes)
  ├── Real-time Anomaly Engine (Cloned Plates, Speed Violations)
  ├── GIS Leaflet Command Dashboard (Operators & Dispatch)
  └── High-res image crop uploaded ONLY when an alert/blacklist fires
```

---

## 4. UI/UX Specification & Neo-Brutalist Cyber-Industrial Design System

### 4.0 Design System: Neo-Brutalist / Cyber-Industrial Command Center
To make this platform visually unforgettable for hackathon judges, the UI avoids generic SaaS admin templates. Instead, it adopts a **Neo-Brutalist / Cyber-Industrial Tactical C4i** aesthetic combining raw terminal authority with high-contrast surveillance hardware styling.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [01] LIVE SURVEILLANCE FEED                    [02] DIGITAL IDENTITY DOSSIER          │
│ ┌──────────────────────────────────────────┐   ┌────────────────────────────────────┐ │
│ │ CAM-01 [● 28.4 FPS] [HD-1080p]           │   │ 🚘 KA04MB2040    THREE-WHEELER     │ │
│ │  ┌───┐                                   │   │ CONF: 96.2%      COLOR: YEL/GRN    │ │
│ │  │ + │ TARGET LOCKED [ACID LIME #D4FF32] │   │ [ STATUS: CLEARED ]                │ │
│ │  └───┘                                   │   └────────────────────────────────────┘ │
│ └──────────────────────────────────────────┘   [03] REAL-TIME MONOSPACE OCR LOG       │
│ [04] TACTICAL GIS LEAFLET MAP (DARK MATTER)    ┌────────────────────────────────────┐ │
│ ┌──────────────────────────────────────────┐   │ > [10:14:22] DETECT "KA04MB2040"   │ │
│ │ (● CAM-01) ─────── 64 km/h ──────► (● 02)│   │ > [10:14:23] RTO: BENGALURU CEN OK │ │
│ └──────────────────────────────────────────┘   │ > [10:14:24] TRAJECTORY STITCHED   │ │
│                                                └────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Key Design Tokens & Rules:
1. **Chamfered / Beveled Polygon Geometry:**
   * Instead of generic rounded borders (`rounded-lg`), video panels, data cards, and telemetry chips feature **diagonal chamfered (cut) corners**.
   * CSS Implementation: Using `clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))` or custom pseudo-element borders.
   * This gives the UI the tactile look of a hardened military/police tactical display.
2. **High-Contrast Tactical Color Palette:**
   * **Obsidian Canvas (`#0A0D12`):** Ultra-dark matte background preventing screen glare during projector/laptop demos.
   * **Translucent Slate Surface (`#0F172A` / `#161F30`):** High-density cards with crisp 1px borders (`border-slate-800`).
   * **Acid Lime / Chartreuse Primary (`#D4FF32` / `#CCFF00`):** High-visibility neon accent for active target reticles, confirmed OCR hits, active trajectory paths, and online node status.
   * **Neon Crimson Alert (`#FF3B30`):** Reserved exclusively for high-priority infractions (Blacklist hits, Cloned Plate speed anomalies).
   * **Hazard Amber Warning (`#F59E0B`):** Speed violations and anomalous route delays.
   * **Terminal White (`#EDEDED`) & Muted Slate (`#94A3B8`):** Clean, high-legibility body text and secondary metadata.
3. **Numbered Heavy Modular Cards (`01`, `02`, `03`, `04`):**
   * Prominent bold index numbers on card headers (`[ 01 ] CAM-01 (MG ROAD UPSTREAM)`).
   * In the Tab 2 Judge Sandbox, each AI pipeline stage is presented as a distinct modular numbered step (`01 VEHICLE DETECTION`, `02 PLATE LOCALIZATION`, `03 OCR PARSER`, `04 RTO DIGITAL IDENTITY`).
4. **Bracketed Micro-UI & Monospace Elements:**
   * Buttons and actionable chips use technical brackets: `[ TRACE PATH ]`, `[ EXPORT DOSSIER ]`, `[ DISPATCH PATROL ]`, `[ RUN INFERENCE ]`.
   * Plate numbers, timestamps, GPS coordinates, and telemetry logs use crisp monospace font (`JetBrains Mono` or `Fira Code`).
   * Section headers use bold geometric grotesque (`Syne` or `Outfit` Bold).
5. **Surveillance HUD Video Reticles:**
   * Corner-bracket targeting reticles (`[  ]`) over detected vehicles with center crosshair (`+`).
   * Subtle animated scanline overlay on video frames simulating genuine CCTV hardware feeds.

---

### Tab 1: Live Trajectory Tracking (Flagship Screen)
* **Top Screen (Surveillance Wall):**
  * Two video players side-by-side representing Camera 1 (Upstream) and Camera 2 (Downstream), styled in chamfered containers with thin border glow.
  * Surveillance HUD overlay: Camera ID, live timestamp, FPS counter (`28.4 FPS`), and animated corner-bracket reticles (`[ ]`) locking onto detected vehicles in **Acid Lime (`#D4FF32`)**.
* **Bottom Left / Center (GIS Tactical Map):**
  * Built using **Leaflet.js** with dark-mode basemap tiles (`CartoDB.DarkMatter`).
  * Features Camera Node 1 and Camera Node 2 as glowing pulse markers.
  * When a vehicle passes Cam 1: Radar ping animation in Acid Lime at Node 1.
  * When the vehicle reaches Cam 2: An animated polyline draws along the real road geometry between Cam 1 and Cam 2.
  * Trajectory badge displays: Distance ($d = 2.4\text{ km}$), Time Elapsed ($\Delta t = 2\text{m } 15\text{s}$), and Computed Velocity ($v = 64\text{ km/h}$).
* **Top Right (Digital Vehicle Identity Card):**
  * Auto-updates when a vehicle is confirmed:
    * Detected Plate Number (High-contrast Indian plate chip: Yellow for commercial, White for private, Green for EV).
    * Vehicle Class (Hatchback, Auto-rickshaw, Two-wheeler, etc. from `VehicleNet-Y26n`).
    * Vehicle Color & Confidence Score (e.g. `95.4%`).
    * First Observed Node & Timestamp.
* **Bottom Right (Dual Intelligence Feeds):**
  * **OCR Audit Terminal:** Monospace real-time feed simulating backend edge stream (`[12:04:12] CAM-01 :: UVH26-NANO :: DETECT "KA04MB2040" [CONF: 96.2%]`).
  * **System Alert Feed:** Chronological stack showing detections, reconstructed trajectories, and amber/red security alerts.

### Tab 2: AI Inspector & Ingestion Sandbox (The Judge Test Lab)
* **Purpose:** Allows judges to drop any image or short MP4 video to verify live, unscripted AI execution.
* **Features:**
  * **Drag-and-Drop Dropzone:** Supports `.jpg`, `.png`, `.mp4`.
  * **Live Inference Trigger:** Sends file to the Python FastAPI backend running `VehicleNet-Y26n` + YOLO Plate Crop + PaddleOCR.
  * **Multi-Stage Visual Output (Numbered Modular Cards `01`–`04`):**
    * `01 VEHICLE CLASSIFIER`: Full frame with detected vehicle bounding box and class label from `VehicleNet-Y26n`.
    * `02 PLATE LOCALIZATION`: Cropped number plate with thresholding preview.
    * `03 OCR PARSER`: Extracted character sequence with per-character confidence scores.
    * `04 RTO DIGITAL IDENTITY`: Extracted Digital Identity card with RTO state validation.
  * **Preset Quick-Test Gallery:** Includes 3 pre-loaded real Indian traffic scenarios (Night rain, Two-row scooter plate, Angled auto-rickshaw) for rapid demonstration if judges don't have their own media.

### Tab 3: Trajectory Query & Spatial Graph
* **Plate Search Bar:** Instant query for any vehicle registration (e.g. `KA01AB1234`).
* **Multi-Node Journey Reconstruction:**
  * Visual timeline plotting every camera node that detected the vehicle across the city.
  * Leaflet map displaying the multi-hop route across the full camera network.
* **Cloned Plate / Ghost Vehicle Anomaly Engine:**
  * Calculates interval velocity: $v = \frac{\Delta \text{distance}}{\Delta \text{time}}$.
  * If implied speed exceeds physical limits (e.g., seen at Node 1 at 10:00 AM and Node 8 [18 km away] at 10:04 AM &rarr; $270\text{ km/h}$):
    * **CRITICAL ALERT in Neon Crimson (`#FF3B30`):** *"SUSPECTED CLONED NUMBER PLATE — Two distinct vehicles operating under identical registration simultaneously."*

### Tab 4: Macro Traffic Flow & Urban Analytics
* **Hourly Traffic Density:** Line chart comparing current flow against historical averages, showing morning (9:00–11:30 AM) and evening (6:00–9:00 PM) peaks.
* **Vehicle Modal Split:** Donut chart showing breakdown from `VehicleNet-Y26n` (e.g. 46% Two-wheelers, 28% Private Cars, 14% Three-wheelers, 8% Heavy Vehicles, 4% Buses).
* **Origin-Destination (OD) Flow Matrix:** Interactive heatmap showing major vehicle movement patterns between city zones (e.g. Whitefield &rarr; Silk Board, Koramangala &rarr; Indiranagar).
* **Congestion Hotspot Index:** Table ranking the top 5 bottleneck corridors with real-time average clearance speeds.

### Tab 5: Alerts & Law Enforcement Dispatch
* **Active Hotlist / Blacklist Management:**
  * Searchable table of flagged plates with flags for: Stolen Vehicle, Traffic Evasion, Wanted Suspect, Expired Fitness/Permit.
  * Form to add/remove plates from active watchlist.
* **Next-Camera Intercept Predictor (High Impact Feature):**
  * When a blacklisted vehicle hits Cam-01 heading toward Cam-02:
  * Platform calculates trajectory vector and highlights:
    * *"Target heading Eastbound on Outer Ring Road at ~58 km/h."*
    * *"Predicted Next Node: CAM-04 (Bellandur Junction) in 3 mins 40 secs."*
    * *"Action: Automated Intercept Alert Dispatched to Beat Patrol Unit 14."*
* **Export Dossier:** Generates a printable / downloadable Incident Summary PDF containing timestamped photos, vehicle specs, and trajectory coordinates for police evidence (`[ EXPORT INCIDENT DOSSIER ]`).

### Tab 6: Edge Topology & System Health
* **City Network Overview:** Map displaying the city-wide mesh (2 physical demo nodes + 18 simulated live edge nodes).
* **Edge Node Telemetry:** Live heartbeat status, camera uptime (99.8%), local CPU temperature, FPS throughput (28.4 FPS), and total bandwidth saved metric (e.g. *"4.8 TB video avoided &rarr; 84 MB telemetry transmitted"*).

---

## 5. Master Tech Stack & Libraries

| Domain | Selected Technology | Specific Package / Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | `react`, `react-dom`, `vite` | Ultra-fast startup, sub-millisecond hot reload, zero bundle bloat. |
| **Styling & UI Kit** | Tailwind CSS + Lucide Icons | `tailwindcss`, `lucide-react`, `clsx` | Neo-Brutalist / Cyber-Industrial design tokens: chamfered polygon cards, acid-lime `#D4FF32` HUD accents, and monospace telemetry. |
| **Interactive GIS Map** | Leaflet.js | `leaflet`, `react-leaflet` | 100% reliable, zero external API key requirements, runs offline with cached tiles or local GeoJSON. |
| **Data Visualization** | Recharts | `recharts` | Clean, responsive charting for volume trends, modal splits, and congestion indices. |
| **Animation & Motion** | Framer Motion | `framer-motion` | Smooth card transitions, slide-in alert toasts, and map marker radar pings. |
| **Backend & Inference API** | Python 3.10+ FastAPI | `fastapi`, `uvicorn`, `python-multipart` | Powers the Tab 2 Live Inspector sandbox and offline batch video processor. |
| **Vehicle AI Model** | Hugging Face YOLO | `ultralytics`, `huggingface_hub` | **IISc AIM VehicleNet-Y26n** fine-tuned on UVH-26 dataset. |
| **Plate Detection & OCR** | YOLOv8 + PaddleOCR | `ultralytics`, `paddlepaddle`, `paddleocr` | High-accuracy text extraction on low-resolution / motion-blurred Indian plates. |

---

## 6. Directory Structure

```
Project-MELV/
├── ANPR_Trajectory_Master_BuildSpec.md   # This master specification
├── backend/                              # Python AI Inference & Processing Engine
│   ├── app.py                           # FastAPI server for Tab 2 Live Inspector
│   ├── requirements.txt                 # ultralytics, paddleocr, fastapi, etc.
│   ├── models/                          # Downloaded weights directory
│   │   ├── vehiclenet_y26n.pt           # IISc AIM VehicleNet model
│   │   └── plate_detector_yolov8n.pt    # License plate detector
│   ├── pipeline/
│   │   ├── vehicle_detector.py          # Wrapper for VehicleNet-Y26n (14 classes)
│   │   ├── plate_crop.py                # Plate bounding box locator
│   │   ├── ocr_engine.py                # PaddleOCR + 2-row splitter + RTO regex
│   │   └── batch_process_video.py       # Offline script to generate events.json
│   └── sample_media/                    # Pre-packaged test images for the judge sandbox
│       ├── test_car_hsrp.jpg
│       ├── test_scooter_2row.jpg
│       └── test_auto_night.jpg
│
└── frontend/                             # React + Vite Command Center Web App
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── public/
    │   ├── videos/                      # Looping camera demo feeds
    │   │   ├── cam_01_upstream.mp4
    │   │   └── cam_02_downstream.mp4
    │   └── assets/                      # Silhouettes, badges, audio alert blip
    └── src/
        ├── App.jsx                      # Navigation shell & top system ticker
        ├── index.css                    # Tailwind + custom glassmorphism styles
        ├── context/
        │   └── TrackingContext.jsx      # Global state for synchronized events
        ├── data/
        │   ├── events.json              # Pre-processed detection events from 2 videos
        │   ├── camera_nodes.json        # Coordinates and metadata for all city nodes
        │   ├── blacklist.json           # Flagged registrations with infraction data
        │   └── synthetic_analytics.json # Realistic Indian traffic flow time-series
        ├── components/
        │   ├── common/
        │   │   ├── SystemTicker.jsx     # Live clock, engine status, edge bandwidth
        │   │   ├── Sidebar.jsx          # Tab navigation with badge alerts
        │   │   └── ReticleOverlay.jsx   # Corner-bracket HUD targeting box
        │   ├── tracking/
        │   │   ├── VideoSurveillance.jsx# Dual video players with synchronized overlays
        │   │   ├── TacticalMap.jsx      # Leaflet GIS map with animated trajectory
        │   │   ├── DigitalIdentityCard.jsx # Vehicle silhouette, plate chip, confidence
        │   │   ├── OcrConsole.jsx       # Monospace scrolling terminal
        │   │   └── NotificationFeed.jsx # Chronological alert toasts
        │   ├── sandbox/
        │   │   ├── LiveInspector.jsx    # Judge image/video upload & inference panel
        │   │   └── PipelineBreakdown.jsx# Multi-stage visual debug cards
        │   ├── analytics/
        │   │   ├── TrafficVolumeChart.jsx # Hourly peaks line chart
        │   │   ├── ModalSplitChart.jsx  # Vehicle classes pie chart
        │   │   └── ODMatrixHeatmap.jsx  # Origin-destination flow table
        │   └── alerts/
        │       ├── BlacklistManager.jsx # Watchlist table + add/remove modal
        │       └── InterceptPredictor.jsx# Next-node intercept tactical alert
        └── pages/
            ├── LiveTrackingPage.jsx     # Tab 1
            ├── LiveInspectorPage.jsx    # Tab 2
            ├── TrajectoryQueryPage.jsx  # Tab 3
            ├── TrafficAnalyticsPage.jsx # Tab 4
            ├── AlertsManagementPage.jsx # Tab 5
            └── EdgeNetworkPage.jsx      # Tab 6
```

---

## 7. Data Schemas

### 7.1 Detection Event Schema (`events.json`)
Generated offline by running `batch_process_video.py` on the two demo clips.
```json
[
  {
    "event_id": "EVT-20260927-001",
    "camera_id": "CAM-01",
    "camera_name": "MG Road Northbound (Node A)",
    "timestamp_video": 4.25,
    "real_timestamp": "2026-09-27T10:14:22.400Z",
    "plate_number": "KA04MB2040",
    "plate_type": "standard_private",
    "confidence_ocr": 0.962,
    "vehicle_class": "Three-wheeler",
    "vehicle_color": "Yellow-Green",
    "confidence_vehicle": 0.941,
    "bbox_video": { "x": 312, "y": 140, "w": 180, "h": 120 },
    "frame_resolution": { "w": 1920, "h": 1080 }
  }
]
```

### 7.2 Camera Node GIS Schema (`camera_nodes.json`)
```json
[
  {
    "camera_id": "CAM-01",
    "name": "MG Road Northbound (Node 1)",
    "lat": 12.9754,
    "lng": 77.6062,
    "zone": "Central Business District",
    "type": "physical_demo",
    "status": "online",
    "edge_fps": 28.5
  },
  {
    "camera_id": "CAM-02",
    "name": "MG Road - Trinity Junction (Node 2)",
    "lat": 12.9729,
    "lng": 77.6174,
    "zone": "Central Business District",
    "type": "physical_demo",
    "status": "online",
    "edge_fps": 29.1
  }
]
```

### 7.3 Blacklist Hotlist Schema (`blacklist.json`)
```json
[
  {
    "plate_number": "KA03HA7712",
    "vehicle_desc": "White Hyundai Creta (SUV)",
    "category": "Stolen Vehicle",
    "severity": "CRITICAL",
    "fir_number": "FIR-2026-BLR-0941",
    "flagged_by": "Indiranagar Police Station",
    "registered_date": "2026-09-21"
  }
]
```

---

## 8. State Machine & Event Synchronization Engine

To guarantee zero latency drift between the two looping video players and the GIS map:

```javascript
// Master Synchronization Pseudocode (TrackingContext.jsx)
const MASTER_CYCLE_DURATION = 15.0; // Seconds for both videos to loop identically

function onMasterClockTick(currentTime) {
  // 1. Query events scheduled for the current cycle timestamp
  const activeEvents = events.filter(e => 
    Math.abs(e.timestamp_video - currentTime) < 0.25 && !e.hasFired
  );

  activeEvents.forEach(event => {
    // 2. Render HUD Bounding Box on specific camera panel
    triggerReticle(event.camera_id, event.bbox_video, event.plate_number);
    
    // 3. Update Digital Identity Card
    setDigitalIdentity({
      plate: event.plate_number,
      vehicleClass: event.vehicle_class,
      color: event.vehicle_color,
      confidence: event.confidence_ocr,
      timestamp: event.real_timestamp,
      camera: event.camera_name
    });

    // 4. Output to Monospace OCR Terminal
    logToConsole(`[${event.camera_id}] READ "${event.plate_number}" (${(event.confidence_ocr * 100).toFixed(1)}%)`);

    // 5. Ping Camera Node on Leaflet Map
    pingMapMarker(event.camera_id);

    // 6. Multi-Camera Trajectory Check
    if (activeTrajectoryPlates.has(event.plate_number)) {
      const originEvent = activeTrajectoryPlates.get(event.plate_number);
      const distanceMeters = 2400; // Calibrated distance between Cam-01 and Cam-02
      const timeDeltaSeconds = Math.abs(event.timestamp_video - originEvent.timestamp_video);
      const speedKmh = Math.round((distanceMeters / timeDeltaSeconds) * 3.6);

      // Draw animated road-following polyline on Leaflet
      drawAnimatedTrajectory(originEvent.camera_id, event.camera_id, speedKmh);

      // Anomaly Check: Velocity Exceeded
      if (speedKmh > 100) {
        dispatchAlert("SPEED_ANOMALY", `High-Speed Hazard: ${speedKmh} km/h`);
      }

      // Hotlist Check: Blacklist Plate
      if (isBlacklisted(event.plate_number)) {
        dispatchAlert("BLACKLIST_MATCH", `Wanted Vehicle Identified: ${event.plate_number}`);
        triggerNextNodePrediction(event.camera_id, speedKmh);
      }
    } else {
      activeTrajectoryPlates.set(event.plate_number, event);
    }

    event.hasFired = true;
  });
}
```

---

## 9. Step-by-Step Implementation Roadmap

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EXECUTION TIMELINE                                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: REPOSITORY SETUP & CORE UI SHELL                                              │
│  [Step 1] Initialize Vite + React project with Tailwind CSS & Lucide Icons             │
│  [Step 2] Build high-impact Dark Control Room layout (Sidebar, System Ticker, Tabs)     │
│  [Step 3] Set up Leaflet.js container with custom dark CartoDB tiles                   │
│                                                                                        │
│ PHASE 2: AI BACKEND & MODEL PIPELINE (OFFLINE & SANDBOX)                              │
│  [Step 4] Set up Python environment with ultralytics & paddleocr                       │
│  [Step 5] Integrate Perception365/VehicleNet-Y26n model weights                        │
│  [Step 6] Build Indian plate OCR preprocessor (2-row splitter + RTO regex engine)      │
│  [Step 7] Build FastAPI server (`app.py`) for Tab 2 Live Inspector sandbox             │
│  [Step 8] Run offline batch script on 2 demo clips to generate `events.json`           │
│                                                                                        │
│ PHASE 3: LIVE TRACKING SYNCHRONIZATION (TAB 1)                                         │
│  [Step 9] Wire dual synchronized video players with HUD reticle bounding boxes         │
│  [Step 10] Connect state machine: Video currentTime -> events.json -> Leaflet ping     │
│  [Step 11] Implement animated road-following curved trajectory polyline & speed calc   │
│  [Step 12] Wire Digital Identity Card & Monospace OCR Console                          │
│                                                                                        │
│ PHASE 4: ANALYTICS, ALERTS & POLISH (TABS 3-6)                                         │
│  [Step 13] Build Tab 2 (Live Inspector drag-and-drop test sandbox for judges)          │
│  [Step 14] Build Tab 3 (Trajectory Search by plate) & Tab 4 (Urban Analytics Recharts) │
│  [Step 15] Implement Tab 5 Next-Node Intercept Predictor & Cloned Plate Detection      │
│  [Step 16] Final visual polish: Scanline shaders, audio alert toggle, audit ledger     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Required Assets Checklist

Before running the core tracking demo, verify the following assets are placed in `frontend/public/`:
1. `videos/cam_01_upstream.mp4` — High-definition traffic video representing Camera 1.
2. `videos/cam_02_downstream.mp4` — Corresponding traffic video representing Camera 2.
3. GPS coordinates for the two camera locations on Google Maps (e.g., MG Road, Bengaluru).
4. Road curve waypoints: 5–10 intermediate lat/lng coordinates between Cam 1 and Cam 2 so the animated Leaflet polyline hugs the curve of the actual avenue.
5. 2–3 target plate numbers designated as "Blacklisted" for the live alert demonstration.
6. Sample test photos in `backend/sample_media/` for the judge sandbox tab.

---

## 11. Defensible SIH Q&A Cheat Sheet

| Judge Question | The Winning Answer |
| :--- | :--- |
| **"Why did you choose VehicleNet-Y26n instead of standard YOLOv8?"** | *"Standard YOLOv8 is trained on COCO, which only understands generic western cars and trucks. VehicleNet-Y26n was built by IISc Bengaluru's AIM group specifically on Indian traffic data (UVH-26) from Bengaluru Police cameras. It accurately distinguishes auto-rickshaws, two-wheelers, tempo-travellers, and mini-buses with 14 granular classes."* |
| **"How does your OCR handle damaged or two-row scooter plates?"** | *"We built an aspect-ratio classifier: if plate height/width > 0.45, our pipeline splits the plate horizontally into two sub-crops before passing them to PaddleOCR. We also run an Indian RTO syntax normalizer that uses positional grammar to auto-correct character confusion (e.g., turning 'O' into '0' in numeric slots)."* |
| **"Is this entire demo just pre-recorded?"** | *"Our multi-camera tracking simulation uses pre-processed telemetry to demonstrate city-scale GIS synchronization without network latency. However, you can switch right now to our **AI Inspector Sandbox tab**, upload any picture from your phone, and watch our live pipeline detect the vehicle, crop the plate, and read the characters in under two seconds."* |
| **"How does the alert system catch stolen or cloned plates?"** | *"Our Spatiotemporal Velocity Engine tracks the $\Delta t$ between consecutive camera detections. If a single plate is recorded at two distant nodes faster than the physical speed limit permits, it immediately triggers an automated 'Cloned Plate / Ghost Identity' alert."* |
