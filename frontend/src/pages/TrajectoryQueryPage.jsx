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
    <div className="space-y-6 max-w-5xl mx-auto font-mono text-xs">
      {/* Query Bar */}
      <div className="bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-black/20">
          <span className="font-bold text-brand-black uppercase tracking-widest text-[10px]">SPATIOTEMPORAL TRAJECTORY QUERY</span>
          <span className="text-[9px] text-brand-gray font-bold tracking-widest uppercase">INDEXED PLATES: <span className="text-brand-acid bg-brand-black px-1.5 py-0.5 ml-1">48,290</span></span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-brand-black absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ENTER VEHICLE REGISTRATION (e.g. KA04MB2040, DL01CZ4040)..."
              className="w-full bg-white border-2 border-brand-black pl-11 pr-4 py-3 text-brand-black font-bold uppercase tracking-widest focus:outline-none focus:border-brand-purple transition-colors chamfer-card shadow-editorial"
            />
          </div>
          <button
            type="submit"
            className="chamfer-btn bg-brand-acid text-brand-black px-8 font-bold text-[11px] uppercase tracking-widest border-2 border-brand-black hover:bg-white hover:-translate-y-1 hover:translate-x-1 transition-all shadow-editorial"
          >
            RECONSTRUCT
          </button>
        </form>

        {/* Quick query tags */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-[9px] font-bold tracking-widest uppercase text-brand-dark-gray">
          <span className="mr-2">SAMPLE QUERIES:</span>
          {Object.keys(SAMPLE_TRAJECTORIES).map((p) => (
            <button
              key={p}
              onClick={() => {
                setSearchQuery(p);
                setActiveResult(SAMPLE_TRAJECTORIES[p]);
              }}
              className="px-2 py-1 bg-brand-black text-brand-paper hover:bg-brand-acid hover:text-brand-black transition-colors shadow-editorial"
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
            <div className="bg-brand-purple border-2 border-brand-black p-4 text-brand-paper flex items-start space-x-4 shadow-editorial chamfer-card">
              <AlertTriangle className="w-8 h-8 flex-shrink-0 animate-bounce text-brand-acid" />
              <div>
                <strong className="text-sm font-mono uppercase tracking-widest block mb-1">⚠ CLONED NUMBER PLATE DETECTED</strong>
                <p className="text-[11px] font-sans text-brand-paper leading-relaxed">
                  {activeResult.anomalyDesc}
                </p>
              </div>
            </div>
          )}

          {/* Vehicle Metadata Header */}
          <div className="bg-brand-black border border-brand-black p-4 flex items-center justify-between shadow-editorial chamfer-card">
            <div className="flex items-center space-x-3">
              <div className="bg-white text-black px-3 py-1 rounded font-bold text-sm tracking-wider border border-brand-black shadow-editorial transform -skew-x-6">
                {activeResult.plate}
              </div>
              <div>
                <div className="font-bold text-brand-acid uppercase tracking-widest text-[11px]">{activeResult.vClass}</div>
                <div className="text-brand-gray text-[9px] uppercase tracking-widest mt-1">{activeResult.color} • State: {getStateFromPlate(activeResult.plate)}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-right">
              <div>
                <div className="text-[9px] text-brand-gray uppercase tracking-widest font-bold">DETECTED NODES</div>
                <div className="text-brand-acid font-bold text-sm uppercase">{activeResult.history.length} CAMERAS</div>
              </div>
            </div>
          </div>

          {/* Two-column: Timeline + Route Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chronological Timeline */}
            <div className="bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial space-y-6">
              <div className="text-[10px] font-bold text-brand-black border-b border-brand-black/20 pb-3 flex items-center justify-between uppercase tracking-widest">
                <span>CHRONOLOGICAL PATHWAY</span>
                <span className="text-[9px] text-brand-gray bg-brand-dark-gray px-2 py-1 text-brand-paper">SPATIO-TEMPORAL</span>
              </div>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-brand-black">
                {activeResult.history.map((step, idx) => (
                  <div key={idx} className="relative flex items-start justify-between group">
                    {/* Pin Dot */}
                    <div className={`absolute -left-6 top-1 w-4 h-4 flex items-center justify-center bg-brand-paper border-2 ${
                      step.speed.includes('IMPOSSIBLE') || step.speed.includes('VIOLATION') ? 'border-brand-purple shadow-editorial' : 'border-brand-black shadow-editorial'
                    }`}>
                      <div className={`w-1.5 h-1.5 ${
                        step.speed.includes('IMPOSSIBLE') || step.speed.includes('VIOLATION') ? 'bg-brand-purple' : 'bg-brand-black'
                      }`}></div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-bold text-brand-black flex items-center gap-2 uppercase tracking-widest text-[10px]">
                        <span className="bg-brand-black text-brand-paper px-1.5 py-0.5">{step.node}</span>
                        <span>{step.name}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-[9px] text-brand-gray font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-brand-black" />
                          {step.time}
                        </span>
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 ${
                          step.speed.includes('IMPOSSIBLE') || step.speed.includes('VIOLATION') ? 'bg-brand-purple text-brand-paper font-bold shadow-editorial -rotate-1' : 'bg-brand-acid text-brand-black border border-brand-black shadow-editorial rotate-1'
                        }`}>
                          <Gauge className="w-3 h-3" />
                          {step.speed}
                        </span>
                      </div>
                    </div>

                    {idx < activeResult.history.length - 1 && (
                      <div className="text-[9px] text-brand-gray font-mono font-bold uppercase tracking-widest">
                        <span>STEP {idx + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Wanted Vehicle FIR Info */}
              {activeResult.isWanted && (
                <div className="border-t border-brand-purple/30 pt-4 mt-4 flex items-center justify-between text-[9px] uppercase tracking-widest font-bold">
                  <div className="flex items-center gap-2 text-brand-purple">
                    <AlertTriangle className="w-4 h-4" />
                    <span>WANTED VEHICLE</span>
                  </div>
                  <span className="text-brand-black bg-brand-acid px-2 py-1 shadow-editorial">FIR: {activeResult.fir}</span>
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
    const lineColor = isAnomaly ? '#8050E8' : isWanted ? '#FF3B30' : '#C8E84D';
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
      const color = isAnomaly && isLast ? '#8050E8' : '#C8E84D';
      const textColor = '#202020';

      const icon = L.divIcon({
        className: 'trajectory-node-marker',
        html: `
          <div style="display:flex;align-items:center;justify-content:center;position:relative;">
            <span style="position:absolute;width:20px;height:20px;border-radius:0;background:${color}33;${isFirst || isLast ? 'animation:ping 1.5s infinite;' : ''}"></span>
            <span style="width:12px;height:12px;border-radius:0;background:${color};border:2px solid #202020;transform:rotate(45deg);"></span>
            <span style="position:absolute;top:16px;white-space:nowrap;background:#202020;color:${color};font-size:9px;font-family:monospace;font-weight:bold;padding:2px 6px;border:1px solid ${color};text-transform:uppercase;letter-spacing:1px;">${step.node}</span>
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
    <div className="bg-brand-paper border border-brand-black flex flex-col chamfer-card shadow-editorial overflow-hidden">
      <div className="px-4 py-3 bg-brand-black border-b border-brand-black flex items-center justify-between">
        <div className="text-[10px] font-bold text-brand-paper flex items-center gap-2 uppercase tracking-widest">
          <MapPin className="w-3.5 h-3.5 text-brand-acid" />
          SPATIAL ROUTE RECONSTRUCTION
        </div>
        <span className="text-[9px] text-brand-gray uppercase tracking-widest">{history.length} NODES PLOTTED</span>
      </div>
      <div ref={mapRef} className="flex-1 min-h-[300px] bg-brand-black relative" />
    </div>
  );
}
