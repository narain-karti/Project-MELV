# PROJECT-MELV: City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking & Urban Mobility Digital Twin
## Complete System Documentation & Technical Blueprint
**Problem Statement ID:** 26127  
**Problem Statement Title:** City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking and Urban Traffic Analytics  
**Event:** Smart India Hackathon (SIH)  
**Target Beneficiaries:** State Police Departments, Traffic Management Centers, Smart Cities Mission, Ministry of Road Transport and Highways (MoRTH)  
**Official Repository:** [https://github.com/narain-karti/Project-MELV.git](https://github.com/narain-karti/Project-MELV.git)  
**Document Version:** 1.0 (Master Release)

---

## 1. Executive Summary & Problem Context

Modern urban centers deploy dense networks of closed-circuit television (CCTV) and Automatic Number Plate Recognition (ANPR) cameras. In Indian metropolises (e.g., Bengaluru, Delhi, Mumbai, Chennai), municipal authorities operate between 5,000 and 15,000 cameras. 

However, **95% of these cameras operate as isolated, single-frame silos**:
* They perform primitive localized OCR on whatever vehicle crosses the immediate camera view.
* They **cannot link vehicle movement across time and space**.
* If a stolen vehicle crosses Camera 1 at 10:00 AM and Camera 8 at 10:15 AM, legacy systems have no automated mechanism to reconstruct the travel corridor, estimate travel speed, predict the next intersection, or correlate macro-traffic congestion trends.
* Centralized video streaming of 1,000+ 1080p feeds exhausts city fiber/4G bandwidth (requiring >5 Gbps sustained uplink) and overloads cloud GPU clusters.

### The Project-MELV Solution
**Project-MELV** (Multi-Camera Edge-AI License & Vehicle Trajectory Engine) resolves this fundamental gap by introducing a **Spatiotemporal Urban Mobility Digital Twin** powered by **Edge-AI nodes**. 

Instead of streaming raw video to a central server, lightweight edge nodes (e.g., NVIDIA Jetson Orin Nano / Raspberry Pi 5) run localized vehicle detection (`VehicleNet-Y26n` by IISc Bengaluru), license plate localization, and character recognition (PaddleOCR with Indian plate grammar heuristics). The edge nodes transmit **tiny 200-byte telemetry packets** over cellular/fiber networks to a centralized Digital Twin engine. The platform stitches these asynchronous detections into **chronological spatial-temporal trajectories**, visualizes them on **interactive 3D/2D GIS city maps**, derives macro-traffic dynamics (density, OD matrices, bottlenecks), and triggers automated law-enforcement alerts in real time.

---

## 2. Official Problem Statement vs. Project-MELV Solution

| Component | Official PS 26127 Requirement | Traditional Legacy Approach | Project-MELV Proposed Solution |
| :--- | :--- | :--- | :--- |
| **Pillar 1: ANPR & OCR Engine** | >90% accuracy in real-world conditions (varying light, weather, angled shots, motion blur, dirty/damaged plates). | Generic Western COCO models (YOLOv8x) + basic Tesseract/EasyOCR. Fails on Indian 2-row plates and auto-rickshaws. | **IISc AIM VehicleNet-Y26n** (14 fine-grained Indian vehicle classes trained on Bengaluru Police UVH-26 dataset) + YOLO plate crop + **PaddleOCR PP-OCRv4** with 2-row heuristic splitter & Indian RTO grammar parser. |
| **Pillar 2: Trajectory Tracking** | Reconstruct complete travel path of any plate chronologically across the city network with timestamps, direction, and route on GIS map. | Manual human review of multiple CCTV video archives across police stations. | **Spatiotemporal Directed Graph Engine** that automatically matches plate hashes across camera nodes, draws road-snapped trajectory vectors, and calculates dynamic transit speed. |
| **Pillar 3: Macro Traffic Analytics** | City-wide dynamics: density heatmaps, origin-destination (OD) flows, congestion bottlenecks, speed trends. | Separate manual traffic surveys or proprietary sensor loops (inductive loops) with limited coverage. | **Autonomous Mobility Analytics Engine** aggregating telemetry across all nodes: real-time OD matrix, hourly volume curves (morning/evening peaks), and vehicle modal split (autos, bikes, cars, trucks). |
| **Pillar 4: Real-time Alert System** | Flag blacklisted vehicles and suspicious route anomalies in real time. | Static database lookup on single camera passes without velocity context. | **Multi-Tier Security Engine**: (1) Blacklist hotlist matching, (2) **Cloned Plate / Ghost Identity Detection** (physical impossibility velocity check), (3) **Next-Camera Intercept Predictor** for patrol units. |
| **Architecture & Scalability** | Scalable, enterprise-grade software platform for city-wide multi-camera networks. | Centralized cloud video ingestion (fails at 100+ cameras due to network bandwidth saturation). | **Edge-to-Digital-Twin Mesh**: Camera poles process video locally; 99.8% network bandwidth reduction via 200-byte telemetry packets. |

---

## 3. The Digital Twin Paradigm: Why It Wins in SIH

### 3.1 What is the Urban Mobility Digital Twin?
A **Digital Twin** is a dynamic, software-based virtual replica of a physical system that updates in real time using sensor telemetry. In Project-MELV:
1. **The Physical Twin:** The physical city—roads, intersections, traffic lights, vehicles, and CCTV camera poles.
2. **The Sensor Ingestion Fabric:** Distributed edge camera nodes detecting vehicle instances.
3. **The Virtual Digital Twin:** A live 3D/2D spatiotemporal model of the city where:
   * Every detected vehicle becomes a **Persistent Digital Entity** (`Digital Identity Card` with registration, classification, color, trajectory history, and velocity vector).
   * Every road corridor becomes a **Dynamic Graph Edge** with real-time velocity, vehicle count, and congestion status.
   * City authorities can inspect historical journeys, run "what-if" traffic simulations, and dispatch law enforcement proactively.

### 3.2 Strategic Advantage for SIH Judging
In Smart India Hackathon evaluations, standard computer vision entries present isolated video detection demos. Framing Project-MELV as a **City-Wide Digital Twin**:
* Direct alignment with the **Smart Cities Mission** and **MoRTH Intelligent Transportation Systems (ITS)** guidelines.
* Solves the macro-to-micro problem: police care about the micro level (tracking one suspect vehicle), while municipal commissioners care about the macro level (overall city congestion and bottlenecks). The Digital Twin satisfies both from a single data source.
* Provides a future-proof roadmap: allows integration with traffic signal controllers (Adaptive Traffic Control Systems - ATCS) and emergency green corridors.

---

## 4. 3D Digital Twin Mapping vs. 2D Leaflet: Feasibility & Architecture

### 4.1 Brutal Honesty Feasibility Analysis
* **Can a 3D city map with real-time animated trajectories be built using free, open-source tools?**  
  **Yes.** Using **MapLibre GL JS** combined with **Deck.gl (`TripsLayer`)**.
* **Will it run smoothly on a judge's laptop without crashing or lagging?**  
  **Yes, provided WebGL hardware acceleration is utilized.** Deck.gl was developed by Uber specifically to render hundreds of thousands of animated GPS trips over 3D extruded city buildings at 60 frames per second.
* **What are the risks during a live pitch?**  
  If the venue's projector or an older presentation laptop has faulty graphics drivers, heavy 3D rendering can stutter or drop WebGL context.
* **The Bulletproof Solution: Dual-Mode Engine (`[ 2D TACTICAL ] | [ 3D DIGITAL TWIN ]`)**  
  Project-MELV implements an instant one-click toggle:
  * **3D Digital Twin Mode:** Built with **Deck.gl + MapLibre GL JS**. Features 45° isometric camera tilt, 3D extruded dark building footprints, and glowing neon animated trajectory ribbons (`TripsLayer`) with synchronized timecode progression matching the surveillance video feeds.
  * **2D Tactical HUD Mode:** Built with **Leaflet.js + CartoDB DarkMatter**. Zero external dependencies, ultra-lightweight, 100% fail-safe fallback.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        3D DIGITAL TWIN MAP ARCHITECTURE                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Surveillance Video Master Clock: currentTime (e.g., t = 4.25s)]                       │
│                                  │                                                     │
│                                  ▼                                                     │
│ [Deck.gl TripsLayer] ───────────────────────────────────────────────────────────────┐   │
│  • Trajectory Waypoints: [[lng, lat, z, t_start], ... [lng, lat, z, t_end]]        │   │
│  • Current Time Uniform: currentTime                                               │   │
│  • Trail Length: 1.8s (creates glowing fading comet trail behind the vehicle)      │   │
│  • Color: Acid Lime (#D4FF32) for standard / Neon Crimson (#FF3B30) for blacklist  │   │
│                                  │                                                     │
│                                  ▼                                                     │
│ [MapLibre GL JS 3D Canvas] ─────────────────────────────────────────────────────────   │
│  • Pitch: 45° | Bearing: -17.6° | Zoom: 15.5                                           │
│  • 3D Building Layer: Fill-extrusion of city blocks in translucent obsidian slate     │
│  • Camera Nodes: Glowing 3D beacon cylinders pulsing at node coordinates               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Deep-Tech System Architecture

```
                                  PHYSICAL EDGE LAYER
  ┌─────────────────────────────────┐             ┌─────────────────────────────────┐
  │ CCTV Pole 01 (MG Road North)    │             │ CCTV Pole 02 (Trinity Junction) │
  │ RTSP 1080p Stream @ 25 FPS      │             │ RTSP 1080p Stream @ 25 FPS      │
  │ [NVIDIA Jetson Orin / Pi 5]     │             │ [NVIDIA Jetson Orin / Pi 5]     │
  │                                 │             │                                 │
  │ 1. IISc VehicleNet-Y26n         │             │ 1. IISc VehicleNet-Y26n         │
  │ 2. YOLOv8 Indian Plate Detector │             │ 2. YOLOv8 Indian Plate Detector │
  │ 3. PaddleOCR PP-OCRv4 + Grammar │             │ 3. PaddleOCR PP-OCRv4 + Grammar │
  └────────────────┬────────────────┘             └────────────────┬────────────────┘
                   │                                               │
                   │ 200-Byte JSON Telemetry                       │ 200-Byte JSON Telemetry
                   │ (99.8% Bandwidth Reduction)                   │ (4G / 5G / Fiber)
                   ▼                                               ▼
  ═══════════════════════════════════════════════════════════════════════════════════════
                             CENTRAL DIGITAL TWIN PLATFORM
  ═══════════════════════════════════════════════════════════════════════════════════════
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │ Ingestion & Message Broker (FastAPI)  │
                       └───────────────────┬───────────────────┘
                                           │
             ┌─────────────────────────────┼─────────────────────────────┐
             ▼                             ▼                             ▼
  ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
  │ Spatiotemporal Graph │      │ Anomaly & Security   │      │ Macro Urban Flow     │
  │ Trajectory Stitching │      │ Alert Engine         │      │ Analytics Engine     │
  ├──────────────────────┤      ├──────────────────────┤      ├──────────────────────┤
  │ • Node pair matching │      │ • Blacklist hotlist  │      │ • Hourly volume peaks│
  │ • Delta-t velocity   │      │ • Cloned plate speed │      │ • OD zone matrices   │
  │ • Road curve fitting │      │ • Intercept predictor│      │ • Modal share (auto) │
  └──────────┬───────────┘      └──────────┬───────────┘      └──────────┬───────────┘
             │                             │                             │
             └─────────────────────────────┼─────────────────────────────┘
                                           │
                                           ▼
  ┌──────────────────────────────────────────────────────────────────────────────────┐
  │                  TACTICAL COMMAND CENTER WEB APPLICATION                         │
  │                        (Neo-Brutalist Cyber-Industrial)                          │
  ├──────────────────────────────────────────────────────────────────────────────────┤
  │ Tab 1: Live Multi-Camera Trajectory Tracking (Dual Video + 3D/2D GIS Twin)       │
  │ Tab 2: AI Inspector & Ingestion Sandbox (Live Judge Testing Drag-and-Drop)       │
  │ Tab 3: Trajectory Query & Spatial Graph (Historical plate search & clone check)  │
  │ Tab 4: Macro Traffic Flow & Urban Analytics (Recharts volume, OD matrix)         │
  │ Tab 5: Alerts & Law Enforcement Dispatch (Watchlist & Next-node intercept)       │
  │ Tab 6: Edge Topology & System Health (Network mesh, bandwidth saved: 99.8%)      │
  └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Detailed Technical Subsystems

### 6.1 Subsystem A: Vehicle Detection & Classification (`VehicleNet-Y26n`)
* **Model Foundation:** Fine-tuned YOLO nano architecture developed by the **AI for Integrated Mobility (AIM) group at IISc Bengaluru**.
* **Dataset:** Trained on the **UVH-26 dataset**, comprising over 26,000 annotated surveillance frames from the **Bengaluru Traffic Police (Safe City project)**.
* **14 Fine-Grained Classes:**
  1. Hatchback, 2. Sedan, 3. SUV, 4. MUV, 5. Bus, 6. Truck, 7. Three-wheeler (Auto-rickshaw), 8. Two-wheeler (Motorcycle/Scooter), 9. LCV (Light Commercial Vehicle), 10. Mini-bus, 11. Tempo-traveller, 12. Bicycle, 13. Van, 14. Other.
* **Edge Metrics:** Inference latency: ~12ms on CPU, ~3.2ms on NVIDIA Jetson TensorRT; model size: ~6.2 MB.

### 6.2 Subsystem B: Indian Plate Localization & PaddleOCR Engine
* **Plate Detection:** Custom YOLOv8n plate locator yielding normalized bounding box $[x_{min}, y_{min}, w, h]$.
* **Two-Row Plate Segmentation Heuristic:**
  $$\text{Aspect Ratio} = \frac{\text{bbox.height}}{\text{bbox.width}}$$
  If $\text{Aspect Ratio} > 0.45$ (characteristic of two-wheelers, auto-rickshaws, and commercial carriers):
  $$\text{Row}_1 = \text{Crop}(0 \to 0.52 \cdot h), \quad \text{Row}_2 = \text{Crop}(0.48 \cdot h \to 1.0 \cdot h)$$
  Both sub-crops are passed independently to the OCR recognizer and concatenated.
* **Image Preprocessing:** Grayscale conversion &rarr; Bilateral Filter ($d=9, \sigma_r=75, \sigma_s=75$) to strip road mud and rain streaks &rarr; Adaptive Otsu Thresholding.
* **Indian RTO Grammar Normalization:**
  * Regex validation against standard formats: `^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$` or `^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$`.
  * Positional character correction:
    * Index 0–1 (State Code): `0` &rarr; `O`, `8` &rarr; `B`, `1` &rarr; `I`.
    * Index 2–3 (RTO District): `O/D` &rarr; `0`, `B` &rarr; `8`, `I/L` &rarr; `1`, `Z` &rarr; `2`, `S` &rarr; `5`.
    * Index 4–5 (Series Alphabet): `0` &rarr; `O`, `8` &rarr; `B`, `1` &rarr; `I`, `5` &rarr; `S`.
    * Index 6–9 (Vehicle Number): `O` &rarr; `0`, `B` &rarr; `8`, `I` &rarr; `1`, `S` &rarr; `5`, `Z` &rarr; `2`.
  * RTO Code validation across all 36 Indian States and Union Territories.

### 6.3 Subsystem C: Spatiotemporal Trajectory & Velocity Reconstruction
* When a vehicle with registration $P$ is observed at Camera $C_A$ at time $t_A$, and subsequently at Camera $C_B$ at time $t_B$:
  $$\Delta t = t_B - t_A \quad (\text{seconds})$$
  $$d_{AB} = \text{Road Network Distance along geometry } \mathcal{G}_{AB} \quad (\text{meters})$$
  $$v_{avg} = \left( \frac{d_{AB}}{\Delta t} \right) \times 3.6 \quad (\text{km/h})$$
* **Trajectory Rendering:** The line connecting $C_A$ and $C_B$ is not a straight Euclidean vector. It is an interpolated polyline $\mathcal{P} = [(lat_1, lng_1), (lat_2, lng_2), \dots, (lat_k, lng_k)]$ tracing the real physical curves of the roadway.

### 6.4 Subsystem D: Law Enforcement Anomaly Engine
1. **Cloned Plate / Ghost Identity Detection:**
   * If plate $P$ is detected at $C_A$ and $C_C$ such that:
     $$v_{implied} = \frac{\text{Distance}(C_A, C_C)}{|t_C - t_A|} > v_{max\_physical} \quad (\text{e.g., } 140\text{ km/h in city traffic})$$
   * **Alert:** Immediate critical notification of **Plate Cloning / Stolen Vehicle Identity Fraud**.
2. **Next-Camera Intercept Prediction:**
   * Given origin $C_A$, destination $C_B$, directional heading $\theta$, and current velocity $v$:
     $$C_{next} = \arg\max_{C_i \in \text{Neighbors}(C_B)} P(C_i \mid C_A, C_B, \text{Hour})$$
     $$t_{arrival} \approx t_B + \frac{d(C_B, C_{next})}{v_{avg}}$$
   * The platform automatically marks the predicted node and estimated time of arrival (ETA), allowing police dispatchers to alert the nearest mobile patrol unit.

---

## 7. Benefits, Real-World Impact & Stakeholder Value

### 7.1 For State Police & Traffic Law Enforcement
* **Automated Pursuit without High-Speed Chases:** High-speed police pursuits in crowded Indian city streets endanger civilian lives. Project-MELV tracks suspect vehicles unobtrusively across nodes and predicts their exit junction for clean interception.
* **Elimination of Cloned Plates:** Criminal syndicates frequently duplicate legitimate license plates on stolen cars. Project-MELV flags impossible velocity jumps instantaneously.
* **Evidence-Grade Digital Dossier:** One-click PDF generation containing timestamped video crops, plate extractions, confidence metrics, and GPS route history admissible in court proceedings.

### 7.2 For Municipal Corporations & Smart City Planners
* **Dynamic Origin-Destination (OD) Matrix:** Replaces costly manual roadside surveys. Authorities know exactly what percentage of vehicles entering the city from Outer Ring Road are destined for Whitefield vs. Electronic City.
* **Congestion Hotspot Detection:** Measures real clearance rates across intersections to identify whether delays stem from signal timings or physical road bottlenecks.
* **Modal Share Optimization:** Tracks the proportion of two-wheelers, auto-rickshaws, and public transit buses to guide decisions on dedicated bus lanes or electric vehicle charging infrastructure.

### 7.3 Bandwidth and Infrastructure Cost Savings
* **Centralized Video Model (1,000 Cameras):**
  $$1,000 \times 4\text{ Mbps (1080p H.264)} = 4,000\text{ Mbps } (4\text{ Gbps sustained)}$$
  Bandwidth cost: Millions of rupees annually; requires massive cloud ingest clusters.
* **Project-MELV Edge Model (1,000 Cameras):**
  Average vehicle crossings: ~30 vehicles/minute/camera = 0.5 vehicles/sec.
  Telemetry packet: ~200 bytes.
  $$1,000 \times 0.5 \times 200\text{ bytes} = 100\text{ KB/sec } (\approx 800\text{ Kbps total})$$
  **Bandwidth reduction: 99.98%**. Runs comfortably on standard 4G/5G cellular SIM cards at each camera pole.

---

## 8. Pros, Cons, Tradeoffs & Edge Case Handling

| Concern / Challenge | Risk Level | Mitigation in Project-MELV |
| :--- | :--- | :--- |
| **Two-Row License Plates (Scooters / Commercial)** | High in India | Heuristic aspect-ratio detector splits plates horizontally if $h/w > 0.45$. |
| **Non-Standard & Regional Fonts** | Medium | Positional grammar substitution + RTO state dictionary auto-correction. |
| **Camera Occlusion in Dense Traffic** | Medium | Temporal tracking persists vehicle identity across frames until clear plate visibility is obtained. |
| **Extreme Weather / Night Low-Light** | Medium | Contrast-limited adaptive histogram equalization (CLAHE) + bilateral filtering in the edge pipeline. |
| **Network Disconnection at Camera Pole** | Low | Edge node maintains a local SQLite buffer of telemetry packets and bursts them upon reconnection. |
| **Client-Side WebGL Rendering Performance** | Low | Dual-mode switch: 3D Deck.gl Digital Twin for high-end GPUs, instant 2D Leaflet mode for low-power laptops. |

---

## 9. Open-Source Dependencies, Pre-Trained Models & Resource Links

All components in Project-MELV are built on permissible open-source frameworks:

| Component | Library / Model Name | Source / Repository Link | Purpose |
| :--- | :--- | :--- | :--- |
| **Indian Vehicle Classifier** | `VehicleNet-Y26n` | [Hugging Face: Perception365/VehicleNet-Y26n](https://huggingface.co/Perception365/VehicleNet-Y26n) | 14-class Indian traffic vehicle detection (IISc Bengaluru AIM Group, UVH-26 dataset). |
| **License Plate Locator** | `YOLOv8n License Plate` | [Hugging Face: keremberke/yolov8n-license-plate](https://huggingface.co/keremberke/yolov8n-license-plate-detection) | High-precision plate bounding box regression. |
| **OCR Text Engine** | `PaddleOCR (PP-OCRv4)` | [GitHub: PaddlePaddle/PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) | Ultra-lightweight alphanumeric text detection and recognition. |
| **3D Trajectory Rendering** | `Deck.gl (TripsLayer)` | [deck.gl Official / npm: @deck.gl/geo-layers](https://deck.gl/docs/api-reference/geo-layers/trips-layer) | Hardware-accelerated 3D animated trajectory ribbons with timecode uniforms. |
| **3D Basemap & Building Extrusion** | `MapLibre GL JS` | [MapLibre GL JS GitHub](https://github.com/maplibre/maplibre-gl-js) | Free, open-source 3D WebGL vector map rendering without commercial API keys. |
| **2D Fallback Tactical Map** | `Leaflet` & `React-Leaflet` | [Leafletjs.com](https://leafletjs.com/) | 100% reliable 2D dark basemap with CartoDB DarkMatter tiles. |
| **Macro Analytics Charts** | `Recharts` | [Recharts.org](https://recharts.org/) | Responsive SVG charts for hourly volume, modal share, and OD matrices. |
| **Backend API Server** | `FastAPI` & `Uvicorn` | [FastAPI Tiangolo](https://fastapi.tiangolo.com/) | High-performance asynchronous REST backend for the Tab 2 Judge Testing Sandbox. |
| **Core Web Application** | `React 18` + `Vite` | [Vitejs.dev](https://vite.dev/) | Sub-millisecond HMR, zero-bloat frontend build tool. |
| **Styling & Icons** | `Tailwind CSS` + `Lucide React` | [TailwindCSS](https://tailwindcss.com/) / [Lucide](https://lucide.dev/) | Neo-Brutalist Cyber-Industrial tactical design system with chamfered cut-corners. |

---

## 10. SIH Pitch Deck Outline (Slide-by-Slide Winning Script)

Use this exact structure for the PowerPoint/PDF presentation submitted to SIH evaluators:

* **Slide 1: Title & Identity**
  * *Headline:* Project-MELV: City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking & Urban Mobility Digital Twin.
  * *Subtext:* Problem Statement 26127 | Smart Cities Mission & Law Enforcement Intelligence.
* **Slide 2: The Ground Reality & The Pain Point**
  * *Visual:* Graphic showing isolated CCTV cameras creating data silos.
  * *Key Point:* 10,000 cameras across the city, yet police still manually review hours of footage to track a single vehicle. 4 Gbps streaming saturates city networks.
* **Slide 3: The Breakthrough — Edge-to-Digital-Twin Mesh**
  * *Visual:* Diagram showing camera pole running `VehicleNet-Y26n` &rarr; 200-byte telemetry &rarr; 3D Digital Twin.
  * *Key Metric:* **99.8% network bandwidth reduction**.
* **Slide 4: Deep Tech AI Pipeline (The Indian Context)**
  * *Visual:* Visual breakdown of IISc's 14-class `VehicleNet-Y26n` + 2-Row Plate Splitter + Indian RTO grammar parser.
  * *Why we win:* We didn't use generic Western models; we built for Indian traffic reality (auto-rickshaws, two-wheelers, damaged plates).
* **Slide 5: Live Demonstration — Dual Camera Trajectory Reconstruction**
  * *Visual:* Screenshots of the Neo-Brutalist interface with Camera 1, Camera 2, and the 3D/2D GIS map plotting the vehicle trajectory with real velocity.
* **Slide 6: Law Enforcement Intelligence & Anomaly Detection**
  * *Visual:* UI showing a Blacklist Alert and Cloned Plate Velocity Warning.
  * *Key Feature:* Next-Camera Intercept Predictor (*"Suspect heading East on MG Road &rarr; Next node CAM-04 in 3m 40s"*).
* **Slide 7: Macro Urban Traffic Dynamics (City Planning)**
  * *Visual:* Recharts graphs showing dual peak hours, vehicle class breakdown, and the Origin-Destination flow matrix.
* **Slide 8: The Live Testing Sandbox (Proof of Real AI)**
  * *Visual:* Tab 2 showing a judge dragging their own photo and watching live inference execute in 1.5 seconds.
* **Slide 9: Scalability & Hardware Economics**
  * *Numbers:* Deployment cost per camera pole ($120 for edge unit vs. $3,000 for centralized GPU server capacity).
* **Slide 10: Conclusion & Roadmap**
  * *Vision:* Project-MELV transforms passive surveillance cameras into an autonomous urban mobility nervous system.

---

## 11. Project Repository & Setup Instructions

```bash
# Clone the official repository
git clone https://github.com/narain-karti/Project-MELV.git
cd Project-MELV

# Install Frontend Dependencies
cd frontend
npm install

# Run the Command Center Web Application
npm run dev

# Backend Setup (For Tab 2 Live Ingestion Sandbox)
cd ../backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
