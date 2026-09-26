import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useTracking } from '../../context/TrackingContext';

// CLV Nagar 1st Street, Kanathur, Chennai (Way ID 767936872)
const CLV_NAGAR_WAYPOINTS = [
  [12.852973, 80.241519], // CAM-01 (ECR Junction / West Entrance)
  [12.853041, 80.242680], // Mid-block West
  [12.853081, 80.243362], // Cross street intersection
  [12.853089, 80.243665], // Mid-block East
  [12.853104, 80.244261], // CAM-02 (East Residential Junction)
  [12.853110, 80.244436]  // Reddykuppam Feeder connection
];

export default function Leaflet2D() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);
  const corridorLineRef = useRef(null);
  const vehicleMarkerRef = useRef(null);
  const { cameras, activeTrajectory, currentTime } = useTracking();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map centered on CLV Nagar 1st Street, Kanathur, Chennai
      const map = L.map(mapContainerRef.current, {
        center: [12.8531, 80.2430],
        zoom: 17,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB DarkMatter Tiles (High contrast, tactical dark mode)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Baseline Street Corridor line
      corridorLineRef.current = L.polyline(CLV_NAGAR_WAYPOINTS, {
        color: '#334155',
        weight: 3,
        opacity: 0.6,
        dashArray: '4, 6'
      }).addTo(map);

      // Add Camera Nodes
      cameras.forEach(cam => {
        const isDemoNode = cam.type === 'physical_demo';
        const markerHtml = `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-7 h-7 rounded-full ${isDemoNode ? 'bg-lime-hud/30 animate-ping' : 'bg-slate-500/20'}"></span>
            <span class="w-3.5 h-3.5 rounded-full ${isDemoNode ? 'bg-lime-hud shadow-hud-lime' : 'bg-slate-400'} border-2 border-black flex items-center justify-center">
              <span class="w-1 h-1 rounded-full bg-black"></span>
            </span>
            <span class="absolute -bottom-5 whitespace-nowrap bg-black/90 text-[9px] font-mono ${isDemoNode ? 'text-lime-hud font-bold border-lime-hud/50' : 'text-slate-300 border-slate-700'} px-1.5 py-0.5 rounded border shadow-lg">
              ${cam.id}: ${cam.street || cam.name.split(' - ')[0]}
            </span>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: markerHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([cam.lat, cam.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${cam.id}</strong>: ${cam.name}<br/><span style="color:#94a3b8;font-size:11px;">${cam.zone}, Chennai</span>`);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [cameras]);

  // Update Trajectory Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (activeTrajectory) {
      // Draw active highlighted trajectory line
      const isViolation = activeTrajectory.status === 'SPEED_VIOLATION';
      polylineRef.current = L.polyline(CLV_NAGAR_WAYPOINTS, {
        color: isViolation ? '#FF3B30' : '#D4FF32',
        weight: 5,
        opacity: 0.95,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);
    }
  }, [activeTrajectory]);

  // Live Vehicle Marker Position Interpolation along CLV Nagar 1st Street
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let targetLat = null;
    let targetLng = null;
    let isWanted = false;
    let label = '';

    // Phase 1: Motorcycle (t=4.0 to 12.5) moving East to West (CAM-02 -> CAM-01)
    if (currentTime >= 4.0 && currentTime <= 12.5) {
      const progress = Math.min(1, Math.max(0, (currentTime - 4.0) / 8.0));
      // Interpolate along waypoints from CAM-02 (index 4) towards CAM-01 (index 0)
      const start = CLV_NAGAR_WAYPOINTS[4];
      const end = CLV_NAGAR_WAYPOINTS[0];
      targetLat = start[0] + (end[0] - start[0]) * progress;
      targetLng = start[1] + (end[1] - start[1]) * progress;
      label = 'TN11AH4920 [Motorcycle]';
      isWanted = false;
    }
    // Phase 2: SUV Stolen Alert (t=16.0 to 19.8) moving West to East (CAM-01 -> CAM-02)
    else if (currentTime >= 16.0 && currentTime <= 20.0) {
      const progress = Math.min(1, Math.max(0, (currentTime - 16.0) / 4.0));
      const start = CLV_NAGAR_WAYPOINTS[0];
      const end = CLV_NAGAR_WAYPOINTS[4];
      targetLat = start[0] + (end[0] - start[0]) * progress;
      targetLng = start[1] + (end[1] - start[1]) * progress;
      label = '⚠ TN07BX8819 [WANTED SUV]';
      isWanted = true;
    }

    if (targetLat !== null && targetLng !== null) {
      const markerHtml = `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 rounded-full ${isWanted ? 'bg-crimson-alert/40 animate-ping' : 'bg-lime-hud/30 animate-pulse'}"></span>
          <div class="w-4 h-4 rounded-full ${isWanted ? 'bg-crimson-alert shadow-hud-crimson' : 'bg-lime-hud shadow-hud-lime'} border-2 border-black flex items-center justify-center">
            <span class="w-1.5 h-1.5 rounded-full bg-black"></span>
          </div>
          <div class="absolute -top-7 whitespace-nowrap bg-black/95 text-[10px] font-mono font-bold ${isWanted ? 'text-crimson-alert border-crimson-alert' : 'text-lime-hud border-lime-hud'} px-2 py-0.5 rounded border shadow-lg">
            ${label}
          </div>
        </div>
      `;

      const vehicleIcon = L.divIcon({
        className: 'vehicle-tracker-marker',
        html: markerHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      if (!vehicleMarkerRef.current) {
        vehicleMarkerRef.current = L.marker([targetLat, targetLng], { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
      } else {
        vehicleMarkerRef.current.setLatLng([targetLat, targetLng]);
        vehicleMarkerRef.current.setIcon(vehicleIcon);
      }
    } else {
      if (vehicleMarkerRef.current) {
        map.removeLayer(vehicleMarkerRef.current);
        vehicleMarkerRef.current = null;
      }
    }
  }, [currentTime]);

  return (
    <div className="relative w-full h-full min-h-[340px] rounded-lg overflow-hidden border border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full min-h-[340px] bg-slate-950" />

      {/* Street Name Badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-black/85 border border-slate-800 px-3 py-1.5 rounded text-[11px] font-mono text-slate-300 flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-bold text-slate-100">CLV Nagar 1st Street, Kanathur</span>
        <span className="text-slate-500">|</span>
        <span className="text-lime-hud">Chennai, Tamil Nadu</span>
      </div>

      {/* Trajectory Velocity Overlay HUD */}
      {activeTrajectory && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-black/90 border border-lime-hud/50 px-3 py-2 rounded-lg text-xs font-mono shadow-hud-lime flex items-center space-x-4">
          <div>
            <div className="text-[10px] text-slate-400">VEHICLE TRACKED</div>
            <div className="text-lime-hud font-bold text-sm">{activeTrajectory.plate}</div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <div className="text-[10px] text-slate-400">SPEED (INTER-NODE)</div>
            <div className="text-white font-bold text-sm">
              {activeTrajectory.speedKmh} <span className="text-[10px] text-slate-400">km/h</span>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <div className="text-[10px] text-slate-400">STATUS</div>
            <div className={`font-bold ${activeTrajectory.status === 'SPEED_VIOLATION' ? 'text-crimson-alert' : 'text-emerald-400'}`}>
              {activeTrajectory.status}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
