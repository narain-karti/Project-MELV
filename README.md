# Project-MELV: City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking & Urban Mobility Digital Twin

[![Smart India Hackathon](https://img.shields.io/badge/SIH-Problem%20Statement%2026127-blue.svg)](https://www.sih.gov.in/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Edge AI](https://img.shields.io/badge/Edge%20AI-IISc%20VehicleNet--Y26n-green.svg)](https://huggingface.co/Perception365/VehicleNet-Y26n)
[![Design](https://img.shields.io/badge/UI%20Design-Neo--Brutalist%20Cyber--Industrial-purple.svg)]()

> **Smart India Hackathon — Problem Statement ID:** `26127`  
> **Title:** *City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking and Urban Traffic Analytics*  
> **Theme:** Smart Automation / Transportation / Law Enforcement  

---

## 🚀 Overview

**Project-MELV** (Multi-Camera Edge-AI License & Vehicle Trajectory Engine) is an enterprise-grade spatiotemporal surveillance platform that transforms isolated CCTV networks into an integrated **Urban Mobility Digital Twin**.

Instead of saturating city bandwidth by streaming raw 1080p feeds to the cloud, Project-MELV deploys **Edge-AI perception models** at camera poles. These edge units process live video locally, classify 14 fine-grained Indian vehicle classes using **IISc Bengaluru's `VehicleNet-Y26n`**, extract license plates, and transmit **compact 200-byte telemetry packets** (>99.8% bandwidth reduction). 

The central Digital Twin engine stitches these asynchronous detections into **chronological GIS trajectories**, computes real-time travel speeds, detects plate cloning anomalies, predicts next-intersection intercept vectors for police units, and visualizes city-wide traffic dynamics in 3D/2D.

---

## 🏛️ System Architecture

```
[ Camera Pole 01 ] ──► Edge AI (VehicleNet-Y26n + PaddleOCR) ──┐
                                                                 ├──► [ 200-Byte Telemetry ] ──► [ Central Digital Twin ]
[ Camera Pole 02 ] ──► Edge AI (VehicleNet-Y26n + PaddleOCR) ──┘                                           │
                                                                                                           ├── 3D/2D Tactical GIS Map
                                                                                                           ├── Cloned Plate Anomaly
                                                                                                           ├── Next-Node Intercept
                                                                                                           └── Urban Flow Analytics
```

---

## 📑 Core Documentation Links

* 📘 **[Full System Documentation & Pitch Blueprint (PROJECT_MELV_MASTER_DOCUMENTATION.md)](PROJECT_MELV_MASTER_DOCUMENTATION.md)**: Exhaustive technical manual, digital twin feasibility, benefits, ROI, hardware specs, and 10-slide SIH pitch deck script.
* 🛠️ **[Master Prototype Build Specification (ANPR_Trajectory_Master_BuildSpec.md)](ANPR_Trajectory_Master_BuildSpec.md)**: Complete frontend & backend build instructions formatted for coding agents and developers.

---

## 🌟 Key Features

1. **High-Precision Indian ANPR Engine (>90% Accuracy):**
   * Uses **IISc Bengaluru AIM Group's `VehicleNet-Y26n`** fine-tuned on the `UVH-26` Bengaluru Police traffic dataset (14 vehicle classes).
   * Aspect-ratio heuristic for **two-row Indian plates** (scooters, autos, commercial vehicles).
   * Indian RTO syntax normalizer with positional character disambiguation.
2. **Interactive 3D Digital Twin & 2D Tactical GIS Map:**
   * Hardware-accelerated 3D animated trajectory ribbons via **Deck.gl (`TripsLayer`)** and **MapLibre GL JS**.
   * One-click fail-safe switch to **2D Leaflet Tactical Map** for guaranteed 60 FPS performance on any laptop.
3. **Law Enforcement Intelligence & Anomaly Engine:**
   * **Cloned Plate / Ghost Identity Detection:** Flags physically impossible travel speeds between distant cameras.
   * **Next-Camera Intercept Predictor:** Projects travel vectors to calculate the suspect's next junction and arrival ETA.
4. **AI Inspector & Ingestion Sandbox (The Judge Test Lab):**
   * Dedicated tab allowing hackathon judges to drag and drop arbitrary photos/clips for live unscripted model inference.
5. **Macro Urban Traffic Analytics:**
   * Real-time Origin-Destination (OD) flow matrices, hourly volume curves (morning/evening peaks), and vehicle modal splits.

---

## 🎨 UI/UX Design System
Built with a **Neo-Brutalist / Cyber-Industrial Command Center** aesthetic:
* **Palette:** Deep Obsidian (`#0A0D12`), Translucent Slate (`#0F172A`), Acid Lime (`#D4FF32`), Neon Crimson (`#FF3B30`).
* **Geometry:** Custom diagonal chamfered cut-corner containers (`clip-path: polygon(...)`).
* **HUD Reticles:** Surveillance corner brackets, crosshairs, and live monospace telemetry feeds.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Framer Motion
* **GIS & 3D Maps:** Deck.gl (`@deck.gl/geo-layers`), MapLibre GL JS, Leaflet (`react-leaflet`)
* **Analytics:** Recharts
* **Backend:** Python 3.10+, FastAPI, Uvicorn
* **AI/CV Models:** Ultralytics YOLOv8, `Perception365/VehicleNet-Y26n`, PaddleOCR PP-OCRv4

---

## 👥 Authors
* Developed for **Smart India Hackathon (SIH)** — Problem Statement 26127
