import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import camerasData from '../data/camera_nodes.json';
import { Search, MapPin, Clock, Gauge, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

const RTO_STATE_MAP = {
  'KA': 'Karnataka', 'TN': 'Tamil Nadu', 'DL': 'Delhi', 'MH': 'Maharashtra',
  'UP': 'Uttar Pradesh', 'GJ': 'Gujarat', 'HR': 'Haryana', 'TS': 'Telangana',
  'AP': 'Andhra Pradesh', 'WB': 'West Bengal', 'KL': 'Kerala', 'RJ': 'Rajasthan',
  'PB': 'Punjab', 'CH': 'Chandigarh', 'GA': 'Goa', 'JH': 'Jharkhand',
  'BR': 'Bihar', 'OR': 'Odisha', 'MP': 'Madhya Pradesh', 'CG': 'Chhattisgarh'
};
const getStateFromPlate = (plate) => RTO_STATE_MAP[plate?.slice(0, 2)] || 'Unknown';

const SAMPLE_TRAJECTORIES = {
  'TN11AH4920': {
    plate: 'TN11AH4920',
    vClass: 'Motorcycle (Hero Splendor)',
    color: 'Black-Silver',
    isAnomaly: false,
    history: [
      { node: 'CAM-02', name: 'CLV Nagar 1st St - East Junction', time: '10:14:04 IST', speed: '36 km/h' },
      { node: 'CAM-01', name: 'CLV Nagar 1st St - West Gate (ECR)', time: '10:14:11 IST', speed: '38.6 km/h' },
      { node: 'CAM-05', name: 'AMET University Campus Gate (ECR)', time: '10:15:30 IST', speed: '42 km/h' }
    ]
  },
  'TN07BX8819': {
    plate: 'TN07BX8819',
    vClass: 'SUV (Mahindra Scorpio)',
    color: 'White',
    isAnomaly: false,
    isWanted: true,
    fir: 'FIR-2026-CHN-KAN-0492',
    history: [
      { node: 'CAM-05', name: 'AMET University Campus Gate (ECR)', time: '10:13:34 IST', speed: '68 km/h' },
      { node: 'CAM-01', name: 'CLV Nagar 1st St - West Gate (ECR)', time: '10:14:16 IST', speed: '72.8 km/h (VIOLATION)' },
      { node: 'CAM-02', name: 'CLV Nagar 1st St - East Junction', time: '10:14:31 IST (PREDICTED)', speed: 'INTERCEPT UNIT DISPATCHED' }
    ]
  },
  'TN09BK6112': {
    plate: 'TN09BK6112',
    vClass: 'Commercial Heavy / Tipper',
    color: 'Yellow',
    isAnomaly: true,
    anomalyDesc: 'CLONED NUMBER PLATE: Implied transit speed of 380 km/h between distant nodes indicates two distinct vehicles operating under identical registration.',
    history: [
      { node: 'CAM-01', name: 'CLV Nagar 1st St - ECR', time: '10:10:00 IST', speed: '35 km/h' },
      { node: 'CAM-06', name: 'Mayajaal Multiplex North ECR', time: '10:10:45 IST', speed: '42 km/h' },
      { node: 'CAM-08', name: 'Tambaram East Bypass (24 km away)', time: '10:14:30 IST', speed: '380 km/h [IMPOSSIBLE PHYSICAL VELOCITY]' }
    ]
  }
};

export default function TrajectoryQueryPage() {
  const [searchQuery, setSearchQuery] = useState('TN11AH4920');
  const [activeResult, setActiveResult] = useState(SAMPLE_TRAJECTORIES['TN11AH4920']);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (SAMPLE_TRAJECTORIES[query]) {
      setActiveResult(SAMPLE_TRAJECTORIES[query]);
    } else {
      // Create ad-hoc result for any query
      setActiveResult({
        plate: query,
        vClass: 'Sedan (Pass-through)',
        color: 'Dark Grey',
        isAnomaly: false,
        history: [
          { node: 'CAM-01', name: 'MG Road Northbound', time: '09:42:15 IST', speed: '54 km/h' },
          { node: 'CAM-02', name: 'MG Road - Trinity Junction', time: '09:45:00 IST', speed: '58 km/h' }
        ]
      });
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-mono text-xs">
      {/* Query Bar */}
      <div className="bg-surface-card border border-slate-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-200">[TAB 03] SPATIOTEMPORAL TRAJECTORY QUERY</span>
          <span className="text-[10px] text-slate-400">INDEXED PLATES: 48,290</span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ENTER VEHICLE REGISTRATION (e.g. KA04MB2040, KA03HA7712, DL01CZ4040)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-slate-100 uppercase tracking-wider focus:outline-none focus:border-lime-hud transition-colors"
            />
          </div>
          <button
            type="submit"
            className="chamfer-btn bg-lime-hud hover:bg-lime-400 text-black px-6 font-bold shadow-hud-lime"
          >
            RECONSTRUCT
          </button>
        </form>

        {/* Quick query tags */}
        <div className="flex items-center space-x-2 mt-3 text-[10px] text-slate-400">
          <span>SAMPLE QUERIES:</span>
          {Object.keys(SAMPLE_TRAJECTORIES).map((p) => (
            <button
              key={p}
              onClick={() => {
                setSearchQuery(p);
                setActiveResult(SAMPLE_TRAJECTORIES[p]);
              }}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-lime-hud text-slate-300"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Query Result Card */}
      {activeResult && (
        <div className="space-y-3">
          {/* Anomaly Banner if Cloned Plate */}
          {activeResult.isAnomaly && (
            <div className="bg-crimson-alert/20 border-2 border-crimson-alert p-3 rounded-lg text-crimson-alert flex items-start space-x-3 shadow-hud-crimson">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-bounce" />
              <div>
                <strong className="text-sm">⚠ CLONED NUMBER PLATE DETECTED</strong>
                <p className="text-[11px] font-sans text-slate-200 mt-0.5">
                  {activeResult.anomalyDesc}
                </p>
              </div>
            </div>
          )}

          {/* Vehicle Metadata Header */}
          <div className="bg-surface-card border border-slate-800 p-3.5 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white text-black px-3 py-1 rounded font-bold text-sm tracking-wider border border-black">
                {activeResult.plate}
              </div>
              <div>
                <div className="font-bold text-slate-200">{activeResult.vClass}</div>
                <div className="text-slate-400 text-[10px]">{activeResult.color} • State: {getStateFromPlate(activeResult.plate)}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-right">
              <div>
                <div className="text-[10px] text-slate-400">DETECTED NODES</div>
                <div className="text-lime-hud font-bold text-sm">{activeResult.history.length} CAMERAS</div>
              </div>
            </div>
          </div>

          {/* Two-column: Timeline + Route Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Chronological Timeline */}
            <div className="bg-surface-card border border-slate-800 p-4 rounded-lg space-y-4">
              <div className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>CHRONOLOGICAL JOURNEY PATHWAY</span>
                <span className="text-[10px] text-slate-400">SPATIAL-TEMPORAL STITCHING</span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                {activeResult.history.map((step, idx) => (
                  <div key={idx} className="relative flex items-start justify-between group">
                    {/* Pin Dot */}
                    <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 flex items-center justify-center ${
                      step.speed.includes('IMPOSSIBLE') || step.speed.includes('VIOLATION') ? 'border-crimson-alert shadow-hud-crimson' : 'border-lime-hud shadow-hud-lime'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        step.speed.includes('IMPOSSIBLE') || step.speed.includes('VIOLATION') ? 'bg-crimson-alert' : 'bg-lime-hud'
                      }`}></div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span className="text-lime-hud">[{step.node}]</span>
                        <span>{step.name}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {step.time}
                        </span>
                        <span className={`flex items-center gap-1 ${
                          step.speed.includes('IMPOSSIBLE') || step.speed.includes('VIOLATION') ? 'text-crimson-alert font-bold' : 'text-slate-300'
                        }`}>
                          <Gauge className="w-3 h-3 text-cyan-hud" />
                          {step.speed}
                        </span>
                      </div>
                    </div>

                    {idx < activeResult.history.length - 1 && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        <span>TRANSIT STEP {idx + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Wanted Vehicle FIR Info */}
              {activeResult.isWanted && (
                <div className="border-t border-crimson-alert/30 pt-3 flex items-center gap-2 text-[10px]">
                  <AlertTriangle className="w-4 h-4 text-crimson-alert" />
                  <span className="text-crimson-alert font-bold">WANTED VEHICLE</span>
                  <span className="text-slate-400">FIR: {activeResult.fir}</span>
                </div>
              )}
            </div>

            {/* Route Map */}
            <TrajectoryRouteMap history={activeResult.history} isAnomaly={activeResult.isAnomaly} isWanted={activeResult.isWanted} />
          </div>
        </div>
      )}
    </div>
  );
}

// Inline mini Leaflet map for trajectory visualization
function TrajectoryRouteMap({ history, isAnomaly, isWanted }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Build camera coordinate lookup
  const camCoords = {};
  camerasData.forEach(c => { camCoords[c.id] = [c.lat, c.lng]; });

  useEffect(() => {
    if (!mapRef.current) return;

    // Cleanup previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const coords = history
      .map(s => camCoords[s.node])
      .filter(Boolean);

    if (coords.length === 0) return;

    const map = L.map(mapRef.current, {
      center: coords[0],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Fit bounds to all coords
    if (coords.length > 1) {
      map.fitBounds(coords, { padding: [40, 40] });
    }

    // Draw trajectory polyline
    const lineColor = isAnomaly ? '#FF3B30' : isWanted ? '#F59E0B' : '#D4FF32';
    L.polyline(coords, {
      color: lineColor,
      weight: 4,
      opacity: 0.9,
      dashArray: isAnomaly ? '8, 6' : undefined
    }).addTo(map);

    // Add camera node markers
    history.forEach((step, idx) => {
      const coord = camCoords[step.node];
      if (!coord) return;

      const isFirst = idx === 0;
      const isLast = idx === history.length - 1;
      const color = isAnomaly && isLast ? '#FF3B30' : '#D4FF32';

      const icon = L.divIcon({
        className: 'trajectory-node-marker',
        html: `
          <div style="display:flex;align-items:center;justify-content:center;position:relative;">
            <span style="position:absolute;width:20px;height:20px;border-radius:50%;background:${color}33;${isFirst || isLast ? 'animation:ping 1.5s infinite;' : ''}"></span>
            <span style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid #000;"></span>
            <span style="position:absolute;top:14px;white-space:nowrap;background:rgba(0,0,0,0.9);color:${color};font-size:9px;font-family:monospace;font-weight:bold;padding:1px 5px;border-radius:3px;border:1px solid ${color}44;">${step.node}</span>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker(coord, { icon }).addTo(map);
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [history, isAnomaly, isWanted]);

  return (
    <div className="bg-surface-card border border-slate-800 rounded-lg overflow-hidden flex flex-col">
      <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-lime-hud" />
          SPATIAL ROUTE RECONSTRUCTION
        </div>
        <span className="text-[10px] text-slate-400">{history.length} NODES PLOTTED</span>
      </div>
      <div ref={mapRef} className="flex-1 min-h-[280px] bg-slate-950" />
    </div>
  );
}
