import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import eventsData from '../data/events.json';
import camerasData from '../data/camera_nodes.json';
import blacklistData from '../data/blacklist.json';

const TrackingContext = createContext(null);

export const CYCLE_DURATION = 20.2; // Calibrated to 20.22s user CCTV footage length

export function TrackingProvider({ children }) {
  const [activeTab, setActiveTab] = useState('home');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mapMode, setMapMode] = useState('2d'); // '2d' (Leaflet) or '3d' (Digital Twin)
  
  // Dynamic State driven by the clock
  const [firedEventIds, setFiredEventIds] = useState(new Set());
  const [activeReticles, setActiveReticles] = useState({ 'CAM-01': null, 'CAM-02': null });
  const [digitalIdentity, setDigitalIdentity] = useState(null);
  const [activeTrajectory, setActiveTrajectory] = useState(null);
  const [interceptAlert, setInterceptAlert] = useState(null);
  
  // Audit Logs (monospaced terminal stream)
  const [consoleLogs, setConsoleLogs] = useState([
    { id: 1, time: '10:14:00', text: 'SYSTEM INGEST ONLINE :: KANATHUR MESH (2 REAL CAMERAS + 6 EDGE NODES)', type: 'info' },
    { id: 2, time: '10:14:01', text: 'EDGE AI ENGINE :: Perception365/VehicleNet-Y26n [14 INDIAN CLASSES] ACTIVE', type: 'success' },
    { id: 3, time: '10:14:02', text: 'GEODESIC MESH :: CLV NAGAR 1ST STREET (CHENNAI 603112) CALIBRATED', type: 'info' }
  ]);

  // Notifications Stack
  const [notifications, setNotifications] = useState([]);
  
  // Real-time Master Backend Connection State (FastAPI :8000)
  const [backendOnline, setBackendOnline] = useState(true);
  const [backendTelemetry, setBackendTelemetry] = useState(null);
  const lastProcessedPlateRef = useRef(null);

  // Poll Master Backend (:8000) for real-time OpenCV / YOLO / ANPR stream telemetry
  useEffect(() => {
    let active = true;
    const pollBackend = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/telemetry?camera=CAM-01');
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setBackendOnline(true);
            setBackendTelemetry(data);

            if (data.recent_scanned_plates && data.recent_scanned_plates.length > 0) {
              const latestPlate = data.recent_scanned_plates[data.recent_scanned_plates.length - 1];
              if (latestPlate && latestPlate.plate !== lastProcessedPlateRef.current) {
                lastProcessedPlateRef.current = latestPlate.plate;

                setDigitalIdentity({
                  plate: latestPlate.plate,
                  plateType: 'standard_private',
                  vehicleClass: latestPlate.is_alert ? 'Wanted Target' : `Vehicle Track #${latestPlate.tracker_id}`,
                  color: 'Extracted From Feed',
                  confidence: (latestPlate.conf * 100).toFixed(1),
                  timestamp: latestPlate.timestamp || new Date().toLocaleTimeString('en-IN') + ' IST',
                  cameraName: 'CLV Nagar 1st St - West Gate (ECR)',
                  cameraId: 'CAM-01',
                  isBlacklist: latestPlate.is_alert,
                  blacklistInfo: latestPlate.is_alert ? {
                    category: 'Active Pursuit / Blacklist',
                    fir_number: 'FIR-2026-CHN-KAN-0492',
                    severity: 'CRITICAL'
                  } : null
                });

                setConsoleLogs(prev => [
                  {
                    id: Date.now(),
                    time: latestPlate.timestamp?.split(' ')[0] || new Date().toLocaleTimeString('en-IN'),
                    text: `[CAM-01 LIVE] DETECT "${latestPlate.plate}" [Track #${latestPlate.tracker_id}] CONF: ${(latestPlate.conf * 100).toFixed(1)}%`,
                    type: latestPlate.is_alert ? 'critical' : 'normal'
                  },
                  ...prev.slice(0, 40)
                ]);

                if (latestPlate.is_alert) {
                  setNotifications(prev => [
                    {
                      id: Date.now(),
                      title: '⚠ WANTED TARGET IDENTIFIED',
                      desc: `Hotlist Match: ${latestPlate.plate} at CAM-01`,
                      severity: 'critical',
                      timestamp: latestPlate.timestamp
                    },
                    ...prev.slice(0, 15)
                  ]);
                }
              }
            }
          }
        } else {
          if (active) setBackendOnline(false);
        }
      } catch (err) {
        if (active) setBackendOnline(false);
      }
    };

    pollBackend();
    const interval = setInterval(pollBackend, 1200);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Internal clock ticker
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.1;
        if (next >= CYCLE_DURATION) {
          // Reset cycle
          setFiredEventIds(new Set());
          setActiveReticles({ 'CAM-01': null, 'CAM-02': null });
          setActiveTrajectory(null);
          setInterceptAlert(null);
          return 0;
        }
        return parseFloat(next.toFixed(1));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // State Machine: Trigger events matching currentTime
  useEffect(() => {
    eventsData.forEach(event => {
      // Fire if within 0.15s window and not already fired this cycle
      if (Math.abs(event.timestamp_video - currentTime) <= 0.15 && !firedEventIds.has(event.id)) {
        setFiredEventIds(prev => new Set(prev).add(event.id));

        // 1. Trigger HUD Reticle
        setActiveReticles(prev => ({
          ...prev,
          [event.camera_id]: {
            bbox: event.bbox_pct,
            plate: event.plate_number,
            confidence: (event.confidence_ocr * 100).toFixed(1),
            vehicleClass: event.vehicle_class,
            isBlacklist: event.is_blacklist
          }
        }));

        // Clear reticle after 2.2 seconds
        setTimeout(() => {
          setActiveReticles(prev => ({
            ...prev,
            [event.camera_id]: null
          }));
        }, 2200);

        // 2. Update Digital Vehicle Identity Card
        setDigitalIdentity({
          plate: event.plate_number,
          plateType: event.plate_type,
          vehicleClass: event.vehicle_class,
          color: event.vehicle_color,
          confidence: (event.confidence_ocr * 100).toFixed(1),
          timestamp: event.real_timestamp,
          cameraName: event.camera_name,
          cameraId: event.camera_id,
          isBlacklist: event.is_blacklist,
          blacklistInfo: event.blacklist_info
        });

        // 3. Monospace Terminal Log
        const logMsg = `[${event.camera_id}] DETECT "${event.plate_number}" [${event.vehicle_class}] CONF: ${(event.confidence_ocr * 100).toFixed(1)}%`;
        setConsoleLogs(prev => [
          {
            id: Date.now(),
            time: event.real_timestamp.split(' ')[0],
            text: logMsg,
            type: event.is_blacklist ? 'critical' : 'normal'
          },
          ...prev.slice(0, 40)
        ]);

        // 4. Notification Toast
        setNotifications(prev => [
          {
            id: Date.now(),
            title: event.is_blacklist ? '⚠ WANTED VEHICLE MATCH' : `Vehicle Detected (${event.camera_id})`,
            desc: `${event.vehicle_class} • ${event.plate_number} at ${event.camera_name}`,
            severity: event.is_blacklist ? 'critical' : 'info',
            timestamp: event.real_timestamp
          },
          ...prev.slice(0, 15)
        ]);

        // 5. Trajectory Stitching & Anomaly Logic
        if (event.trajectory_link) {
          const traj = event.trajectory_link;
          setActiveTrajectory({
            plate: event.plate_number,
            originCam: traj.origin_cam,
            destCam: event.camera_id,
            distanceKm: traj.distance_km,
            speedKmh: traj.computed_speed_kmh,
            status: traj.status,
            timestamp: event.real_timestamp
          });

          // Intercept Predictor if flagged
          if (traj.intercept_prediction) {
            setInterceptAlert({
              plate: event.plate_number,
              predictedNode: traj.intercept_prediction.predicted_node,
              nodeName: traj.intercept_prediction.node_name,
              etaSeconds: traj.intercept_prediction.eta_seconds,
              action: traj.intercept_prediction.recommended_action
            });
          }
        }
      }
    });
  }, [currentTime, firedEventIds]);

  return (
    <TrackingContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentTime,
        setCurrentTime,
        isPlaying,
        setIsPlaying,
        mapMode,
        setMapMode,
        activeReticles,
        setActiveReticles,
        digitalIdentity,
        setDigitalIdentity,
        activeTrajectory,
        setActiveTrajectory,
        interceptAlert,
        setInterceptAlert,
        consoleLogs,
        setConsoleLogs,
        notifications,
        setNotifications,
        backendOnline,
        backendTelemetry,
        cameras: camerasData,
        blacklist: blacklistData
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
}
