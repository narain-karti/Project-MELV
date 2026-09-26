# City-Wide ANPR Trajectory Tracking — Prototype Build Specification
**For: Smart India Hackathon, Problem Statement 26127**
**Purpose: This document is a complete build spec, written to be handed directly to an AI coding agent (Claude Code, Cursor, etc.) to implement.**

---

## 0. Instructions for the coding agent (read first)

You are building a **hackathon demo web app**, not a production city-scale system. The goal is a polished, reliable, visually striking simulation that runs perfectly on a judge's laptop with no internet dependency and no risk of live-inference failure.

Before writing code, check whether the user has provided the assets listed in **Section 3**. If any are missing or ambiguous, **stop and ask the user for them** rather than guessing placeholder values — especially the pixel-coordinate mappings, since guessing these will make the whole demo visually wrong. If the user hasn't decided on something in **Section 14 (Open Decisions)**, ask them before proceeding on that part.

Build in the order given in **Section 13**. Everything is a single-page web app (no login, no multi-user concerns).

---

## 1. Problem Statement Recap

City ANPR camera networks currently work in isolated silos. The platform must: (1) read plates accurately (>90% target) under real-world conditions, (2) reconstruct a single vehicle's trajectory across multiple cameras on a map, (3) aggregate all camera data into city-wide traffic analytics (density, OD patterns, congestion, heatmaps), and (4) alert on blacklisted plates or anomalous routes.

## 2. Demo Scope & Philosophy

- **2 real camera feeds** (user-provided videos, looping), standing in for a city network.
- **Real AI, pre-computed**: vehicle + plate detection and OCR are actually run once, offline, on the 2 videos. The frontend replays these real results in sync with the looping video — so it's genuinely AI-driven, but has zero chance of lagging, misfiring, or failing live on stage.
- **Static map imagery, not live tiles**: the 2D map is a provided screenshot with CSS/pixel-positioned markers — no network calls, no tile-load delay during judging.
- **Everything else** (city-wide scale, historical volume, blacklist DB) is simulated with clearly-structured mock data, and the pitch narrative is honest about it ("this is 2 of N nodes; the engine scales horizontally").

## 3. Required Assets From the User (checklist — ask if missing)

| # | Asset | Format |
|---|---|---|
| 1 | Two CCTV demo videos | `.mp4`, note resolution/fps of each |
| 2 | Schematic "road line" background image (where the two video windows sit) | image file |
| 3 | Real 2D map screenshot of the same road stretch | image file |
| 4 | Position of each video window on the road-line image | x%, y%, width%, height% (or ask user to eyeball it, agent can adjust) |
| 5 | Position of each camera's real-world point on the map screenshot | x%, y% pixel coordinates |
| 6 | The actual road path between the two points on the map screenshot | ordered list of x%,y% points tracing the curve, so the animated line follows the real road, not a straight line |
| 7 | Real-world distance between the two camera points | meters (for speed calc) — user can estimate from Google Maps |
| 8 | 2–3 demo blacklist plate numbers | text |
| 9 | Color theme | default proposed in Section 10 if not specified |

## 4. Architecture (demo-specific)

```
Offline (run once, before the demo):
  video.mp4 → YOLOv8 (vehicle detect) → plate detector (crop) → OCR (PaddleOCR)
     → manual QA pass on the handful of detections → events.json

Runtime (in-browser, no backend required):
  video.currentTime (via timeupdate event)
     → compare to events.json timestamps
     → fire matching event → update UI state (identity card, map, notifications, alerts)
```

A backend is **not required** for the core demo — everything can run as a static frontend reading local JSON. Add a lightweight backend only if you want the "Trajectory Search" tab to feel like a real query system (optional, see Section 6).

## 5. Tech Stack

| Concern | Recommendation | Why |
|---|---|---|
| Frontend | React (Vite) | fast iteration, component-based, matches your existing stack |
| Charts | Recharts or Chart.js | analytics tab line/bar/heatmap charts |
| Map | Plain `<img>` + absolutely-positioned CSS markers | zero network dependency; use Leaflet only if you want live tiles as a stretch goal |
| State | React Context or Zustand | simple global event-driven state |
| Detection pipeline (offline) | Python: `ultralytics` (YOLOv8), `paddleocr` | you already know YOLO from prior work |
| Styling | Tailwind CSS | fast to build the dark control-room look |
| Animation | Framer Motion | smooth marker movement, card transitions, notification slide-in |

## 6. Left Sidebar — Tabs

| Tab | Purpose | Key content |
|---|---|---|
| **Live Tracking** (home) | Default view, the main demo | see Section 7 |
| **Trajectory Search** | Query any plate, see full historical path | search box → timeline of all its detections → path drawn on map |
| **Traffic Analytics** | Macro traffic flow (satisfies PS requirement directly) | hourly volume line chart, day-of-week bar chart, vehicle-type distribution pie chart, top OD pairs table, average speed trend, congestion heatmap-by-hour |
| **Alerts & Blacklist** | Manage flagged plates, view incident log | table of blacklist entries (add/remove), chronological alert log with severity color coding |
| **Camera Network** | System health / node status | map of all camera nodes (your 2 real + N mock pins), uptime %, last-heartbeat time — shows the "city-scale" story |
| **Detection Log** | Raw audit trail | every detection event with confidence score, flags low-confidence reads for manual review |
| **Reports** *(stretch)* | Export | "Generate Incident Report" button → downloadable PDF summary of a selected trajectory |

Historical/analytics data is synthetic — generate a `synthetic_analytics.json` with plausible hourly patterns (morning/evening peaks) rather than hardcoding flat numbers, so the charts look real.

## 7. Home Page ("Live Tracking") — Detailed Layout

**Top zone — the road-line diagram:**
Road-line background image as the container. Two video elements (`autoplay loop muted`) absolutely positioned on top at the coordinates from Section 3, styled with a thin glowing border so they read as "camera feed windows," not just floating videos. Overlay a bounding box (`<div>` positioned per the event's bbox, scaled to the video's displayed size) with the plate text as a small label chip whenever a detection event is active for that camera.

**Right column, upper — Digital Identity Card:**
States: *idle* (empty/greyed placeholder) → *detecting* (scanning animation) → *confirmed* (filled). Fields: plate number, vehicle type, color, confidence %, first-seen camera + timestamp, auto-generated silhouette icon matching detected vehicle type.

**Right column, below identity card — OCR console:**
Small monospace terminal-style feed, auto-scrolling: `[12:04:21] Cam-01 → crop(214,88) → "TN 07 BZ 4521" (94.2%)`. This is the visible, undeniable proof that OCR is actually implemented — don't skip it, judges will look for it.

**Center-bottom — the real 2D map:**
Map screenshot as background image. On a fired detection event: a marker drops at that camera's point with a radar-ping pulse animation. When the **same plate** is later detected on the second camera, a second marker drops, and a line animates drawing itself along the pre-traced road path (Section 3, item 6) from point A to point B — not a straight line. Label the line with computed distance and elapsed time, and derive average speed from those two numbers, displayed next to it.

**Far right — Notification feed:**
Vertically scrolling, newest on top, slide-in animation. Event types and copy:
- `Vehicle detected — Cam-01 (TN 07 BZ 4521)`
- `Digital identity created`
- `Re-identified — Cam-02`
- `Trajectory reconstructed — 2.3 km · 3m 40s · avg 37 km/h`
- Alerts in red/amber: `⚠ Blacklist match` / `⚠ Speed anomaly — possible plate clone`

## 8. Event Data Schema

```json
{
  "camera_id": "CAM-01",
  "timestamp_video": 4.2,
  "plate": "TN07BZ4521",
  "confidence": 0.942,
  "vehicle_type": "sedan",
  "vehicle_color": "white",
  "bbox": { "x": 214, "y": 88, "w": 120, "h": 60 },
  "frame_dims": { "w": 1280, "h": 720 }
}
```

`events.json` is an array of these, one per detected frame you choose to keep (you don't need every frame — pick 3-5 clean detection moments per video for a clean demo). `timestamp_video` is the exact second (matching `video.currentTime`) at which this should fire.

## 9. Interaction / Animation State Machine (pseudocode)

```
on video[cam].timeupdate:
  for event in events where event.camera_id == cam and not event.fired and video.currentTime >= event.timestamp_video:
    fire(event)

fire(event):
  draw bounding box + label on that video panel (auto-clear after ~1.5s)
  update Digital Identity Card → state: confirmed, fields from event
  push notification: "Vehicle detected — {camera_id} ({plate})"
  drop map marker at that camera's mapped point, with pulse animation

  if this plate already has a marker on the OTHER camera:
    animate path line between the two points along the pre-traced road path
    compute distance (provided) / time delta (between the two event timestamps, real-world — see note)
      note: since both cameras loop independently, treat elapsed time as illustrative and label it as such,
      or script the two video loops to a shared master clock so the gap is a real, consistent number each loop
    push notification: "Trajectory reconstructed — {distance} · {time} · avg {speed}"
    run anomaly check: if implied speed > plausible_max (e.g. 120 km/h) → push alert "Speed anomaly — possible plate clone"
    check plate against blacklist.json → if match, push alert "Blacklist match" (styled red, maybe a short audio blip)

  mark event.fired = true

on video loop restart:
  after a short delay, reset identity card to idle, clear map markers, reset all events.fired = false
```

**Important for a clean demo loop:** since both videos loop on their own timers, make sure the two clips are the *same length* and started in sync (or triggered from one shared JS clock rather than two independent `<video>` elements looping natively) — otherwise the "vehicle seen at Cam-01" and "same vehicle at Cam-02" moments will drift apart after the first loop and the timing/speed numbers won't make sense.

## 10. Visual & Creative Direction

**Reference UIs to draw from** (show these to whoever designs it):
- **FlightRadar24** — closest real-world analog to what you're building: live object tracking on a map + a side info panel per tracked object.
- **Palantir Gotham/Foundry** — dark, data-dense control-room aesthetic.
- **Tesla FSD visualization / Waymo debug view** — bounding boxes with corner-bracket "AR targeting" style, confidence readouts.
- **SOC/NOC dashboards** (Splunk, Darktrace) — alert feeds, severity color coding, system-health strips.

**Specific effects to add:**
- Corner-bracket targeting reticle instead of a plain rectangle for the bounding box (looks far more "AI-native").
- Radar-ping pulse (expanding, fading ring) on every new map marker.
- Glassmorphic cards (frosted translucent panels) — matches your own past UI direction, works well against a dark background.
- Dark theme, deep navy/charcoal base with a single accent (violet or teal) for active states, red/amber reserved only for alerts — keeps alerts visually loud.
- A thin top "system status" ticker bar: live clock, "AI Engine: Online," camera count, uptime % — cheap to build, big impact on judges' sense of it being a "real platform."
- Animated count-up numbers on the analytics tab (0 → final value on tab load).
- Subtle animated scanline or grid texture over the video panels — reinforces "this is a surveillance feed," not just an embedded video.
- Optional: a soft audio blip on blacklist alerts only (muted by default, toggle in corner) — powerful in a live judging room, use sparingly.

## 11. Detection Pipeline — Build Steps (offline, run once)

1. **Vehicle detection**: pretrained YOLOv8n (COCO classes already include car/truck/bus/motorcycle) — no training needed for this part.
2. **Plate detection**: use a pretrained license-plate YOLO model (several open weights exist for this, e.g. via Roboflow Universe) to crop the plate region from each detected vehicle.
3. **OCR**: run PaddleOCR on the cropped plate image to get text + confidence.
4. **QA pass**: since you only need 3-5 clean detections per video, manually verify/correct these specific outputs rather than trusting raw pipeline output — accuracy must be visually perfect in the demo.
5. **Decision point** — if pretrained plate detection performs poorly on your specific two videos (bad angle, low light, etc.): label ~50-100 frames from your own footage in Roboflow and quick-fine-tune YOLOv8n on just those. Only do this if step 2 clearly underperforms — don't default to training if the pretrained model already works.

## 12. Suggested Project Structure

```
/frontend
  /public
    /videos        (cam-01.mp4, cam-02.mp4)
    /images        (road-line-bg.png, map-screenshot.png)
  /src
    /components    (VideoPanel, IdentityCard, OcrConsole, MapView, NotificationFeed, Sidebar, AlertBadge)
    /pages         (LiveTracking, TrajectorySearch, Analytics, Alerts, CameraNetwork, DetectionLog)
    /data          (events.json, cameras.json, blacklist.json, synthetic_analytics.json, road_path.json)
    /state         (TrackingContext.js)
/pipeline           (Python: detect.py, ocr.py — offline, not shipped in the demo build)
```

## 13. Build Order

1. Frontend shell: sidebar + routing between tabs, static layout with placeholder data.
2. Wire the two videos into the road-line background at correct positions.
3. Run the offline detection pipeline on the real videos → produce `events.json`.
4. Implement the state machine (Section 9): bounding box overlay, identity card, notification feed.
5. Map markers + road-snapped path animation + distance/speed calc.
6. Alerts (blacklist + speed anomaly).
7. Analytics tab with synthetic data + charts.
8. Visual polish pass (Section 10 effects).
9. Trajectory Search + Camera Network + Detection Log tabs (in that priority if time is short).

## 14. Open Decisions (ask the user if not already specified)

- Live Leaflet map (real tiles) vs. static screenshot — spec above assumes static; confirm before building a live-tile version.
- Whether to add a small backend for "Trajectory Search," or keep it fully client-side over local JSON.
- Exact theme accent color (default: deep navy/charcoal + violet accent, red/amber reserved for alerts).
- Whether an audio alert is wanted at all.
- Target device for the judging demo (laptop resolution) — layout should be designed to that exact screen size, not just "responsive."
