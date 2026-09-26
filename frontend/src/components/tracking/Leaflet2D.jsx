import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useTracking } from '../../context/TrackingContext';

// MG Road road-following curvature points between CAM-01 and CAM-02
const MG_ROAD_WAYPOINTS = [
  [12.9754, 77.6062], // CAM-01
  [12.9749, 77.6085],
  [12.9744, 77.6112],
  [12.9738, 77.6140],
  [12.9733, 77.6158],
  [12.9729, 77.6174]  // CAM-02
];

export default function Leaflet2D() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);
  const { cameras, activeTrajectory } = useTracking();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: [12.9740, 77.6120],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB DarkMatter Tiles (Free, Open, No API key)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Add Camera Nodes
      cameras.forEach(cam => {
        const isDemoNode = cam.type === 'physical_demo';
        const markerHtml = `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-6 h-6 rounded-full ${isDemoNode ? 'bg-lime-hud/30 animate-ping' : 'bg-slate-500/20'}"></span>
            <span class="w-3 h-3 rounded-full ${isDemoNode ? 'bg-lime-hud shadow-hud-lime' : 'bg-slate-400'} border border-black"></span>
            <span class="absolute -bottom-5 whitespace-nowrap bg-black/80 text-[9px] font-mono text-slate-200 px-1.5 py-0.5 rounded border border-slate-700">
              ${cam.id}
            </span>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: markerHtml,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker([cam.lat, cam.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${cam.id}</strong>: ${cam.name}`);
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
      // Draw road-following polyline
      const isViolation = activeTrajectory.status === 'SPEED_VIOLATION';
      polylineRef.current = L.polyline(MG_ROAD_WAYPOINTS, {
        color: isViolation ? '#FF3B30' : '#D4FF32',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);

      map.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] });
    }
  }, [activeTrajectory]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden border border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px] bg-slate-950" />

      {/* Trajectory Velocity Overlay HUD */}
      {activeTrajectory && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-black/90 border border-lime-hud/50 px-3 py-2 rounded-lg text-xs font-mono shadow-hud-lime flex items-center space-x-4">
          <div>
            <div className="text-[10px] text-slate-400">VEHICLE TRACKED</div>
            <div className="text-lime-hud font-bold text-sm">{activeTrajectory.plate}</div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div className="text-[10px] text-slate-400">CORRIDOR VELOCITY</div>
            <div className={`font-bold text-sm ${activeTrajectory.status === 'SPEED_VIOLATION' ? 'text-crimson-alert' : 'text-slate-100'}`}>
              {activeTrajectory.speedKmh} km/h
            </div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div className="text-[10px] text-slate-400">DISTANCE</div>
            <div className="text-slate-200 font-semibold">{activeTrajectory.distanceKm} km</div>
          </div>
        </div>
      )}
    </div>
  );
}
