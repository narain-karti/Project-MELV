import React from 'react';
import { useTracking } from '../../context/TrackingContext';
import DigitalTwin3D from './DigitalTwin3D';
import Leaflet2D from './Leaflet2D';
import { Box, Layers } from 'lucide-react';

export default function TacticalMap() {
  const { mapMode, setMapMode } = useTracking();

  return (
    <div className="relative w-full h-[400px] bg-[#121215] border border-white/10 rounded-lg overflow-hidden flex flex-col shadow-2xl">
      {/* Top Map Header & Mode Selector */}
      <div className="h-9 px-3 bg-[#18181c] border-b border-white/10 flex items-center justify-between z-20 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            {mapMode === '3d' ? '3D URBAN MOBILITY DIGITAL TWIN' : '2D TACTICAL GIS MAP'}
          </span>
          <span className="text-[10px] text-white/50">
            [CHENNAI - KANATHUR MESH]
          </span>
        </div>

        {/* Quick Toggle Button */}
        <div className="flex items-center bg-black/60 p-0.5 rounded border border-white/15">
          <button
            onClick={() => setMapMode('3d')}
            className={`flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
              mapMode === '3d'
                ? 'bg-brand-acid text-black font-extrabold shadow-[0_0_8px_rgba(200,232,77,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>3D TWIN</span>
          </button>
          <button
            onClick={() => setMapMode('2d')}
            className={`flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
              mapMode === '2d'
                ? 'bg-brand-purple text-white font-extrabold shadow-[0_0_8px_rgba(128,80,232,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>2D GIS</span>
          </button>
        </div>
      </div>

      {/* Map Surface Render */}
      <div className="flex-1 w-full h-full relative bg-[#0a0a0c]">
        {mapMode === '3d' ? <DigitalTwin3D /> : <Leaflet2D />}
      </div>
    </div>
  );
}
