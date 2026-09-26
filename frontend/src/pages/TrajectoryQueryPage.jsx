import React, { useState } from 'react';
import { Search, MapPin, Clock, Gauge, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

const SAMPLE_TRAJECTORIES = {
  'KA04MB2040': {
    plate: 'KA04MB2040',
    vClass: 'Three-wheeler (Auto-rickshaw)',
    color: 'Yellow-Green',
    isAnomaly: false,
    history: [
      { node: 'CAM-01', name: 'MG Road Northbound', time: '10:14:22 IST', speed: '52 km/h' },
      { node: 'CAM-02', name: 'MG Road - Trinity Junction', time: '10:16:37 IST', speed: '64 km/h' },
      { node: 'CAM-04', name: 'Old Airport Road', time: '10:22:10 IST', speed: '48 km/h' }
    ]
  },
  'KA03HA7712': {
    plate: 'KA03HA7712',
    vClass: 'SUV (Hyundai Creta)',
    color: 'White',
    isAnomaly: false,
    isWanted: true,
    fir: 'FIR-2026-BLR-0941',
    history: [
      { node: 'CAM-01', name: 'MG Road Northbound', time: '10:17:05 IST', speed: '74 km/h' },
      { node: 'CAM-02', name: 'MG Road - Trinity Junction', time: '10:18:42 IST', speed: '89 km/h (VIOLATION)' },
      { node: 'CAM-05', name: 'Indiranagar 100ft Road', time: '10:24:18 IST', speed: '68 km/h' }
    ]
  },
  'DL01CZ4040': {
    plate: 'DL01CZ4040',
    vClass: 'Sedan (Honda City)',
    color: 'Silver',
    isAnomaly: true,
    anomalyDesc: 'CLONED NUMBER PLATE: Implied transit speed of 360 km/h between distant nodes indicates two distinct vehicles operating under identical registration.',
    history: [
      { node: 'CAM-01', name: 'MG Road Central', time: '10:10:00 IST', speed: '45 km/h' },
      { node: 'CAM-08', name: 'Silk Board Flyover (18 km away)', time: '10:13:00 IST', speed: '360 km/h [IMPOSSIBLE]' }
    ]
  }
};

export default function TrajectoryQueryPage() {
  const [searchQuery, setSearchQuery] = useState('KA04MB2040');
  const [activeResult, setActiveResult] = useState(SAMPLE_TRAJECTORIES['KA04MB2040']);

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
                <div className="text-slate-400 text-[10px]">{activeResult.color} • State: Karnataka</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-right">
              <div>
                <div className="text-[10px] text-slate-400">DETECTED NODES</div>
                <div className="text-lime-hud font-bold text-sm">{activeResult.history.length} CAMERAS</div>
              </div>
            </div>
          </div>

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
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-lime-hud flex items-center justify-center shadow-hud-lime">
                    <div className="w-1.5 h-1.5 rounded-full bg-lime-hud"></div>
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
                      <span className="flex items-center gap-1 text-slate-300">
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
          </div>
        </div>
      )}
    </div>
  );
}
