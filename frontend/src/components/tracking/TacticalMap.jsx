import React from 'react';
import { useTracking } from '../../context/TrackingContext';
import DigitalTwin3D from './DigitalTwin3D';
import Leaflet2D from './Leaflet2D';
import { Box, Layers } from 'lucide-react';

export default function TacticalMap() {
  const { mapMode, setMapMode } = useTracking();

  return (
    <div className="relative w-full h-[400px] bg-surface-card border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-xl">
      {/* Top Map Header & Mode Selector */}
      <div className="h-9 px-3 bg-surface-dark border-b border-slate-800 flex items-center justify-between z-20 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-hud animate-ping"></span>
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            {mapMode === '3d' ? '3D URBAN MOBILITY DIGITAL TWIN' : '2D TACTICAL GIS MAP'}
          </span>
          <span className="text-[10px] text-slate-400">
            [CHENNAI - KANATHUR MESH]
          </span>
        </div>

        {/* Quick Toggle Button */}
        <div className="flex items-center bg-black/50 p-0.5 rounded border border-slate-700">
          <button
            onClick={() => setMapMode('3d')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              mapMode === '3d'
                ? 'bg-lime-hud text-black shadow-hud-lime'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>3D TWIN</span>
          </button>
          <button
            onClick={() => setMapMode('2d')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              mapMode === '2d'
                ? 'bg-cyan-hud text-black shadow-hud-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>2D GIS</span>
          </button>
        </div>
      </div>

      {/* Map Surface Render */}
      <div className="flex-1 w-full h-full relative">
        {mapMode === '3d' ? <DigitalTwin3D /> : <Leaflet2D />}
      </div>
    </div>
  );
}
