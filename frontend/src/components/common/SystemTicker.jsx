import React, { useState, useEffect } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { ShieldAlert, Activity, Wifi, HardDrive, Box, Layers, Play, Pause, RotateCcw } from 'lucide-react';

export default function SystemTicker() {
  const { isPlaying, setIsPlaying, currentTime, setCurrentTime, mapMode, setMapMode, blacklist } = useTracking();
  const [clock, setClock] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-10 bg-brand-black border-b border-brand-dark-gray/30 px-4 flex items-center justify-between text-xs font-mono select-none">
      {/* Left: Branding & Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-acid animate-pulse"></span>
          <span className="font-display font-bold tracking-wider text-brand-paper text-xs uppercase">
            PROJECT-MELV
          </span>
          <span className="bg-brand-acid/15 text-brand-acid px-1.5 py-0.2 rounded-sm text-[9px] font-bold border border-brand-acid/30">
            SIH-26127
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-4 text-brand-gray text-[10px] pl-4 border-l border-brand-dark-gray/40">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3 h-3 text-brand-teal" />
            <span>AI ENGINE: <strong className="text-brand-paper">ONLINE (14ms)</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Wifi className="w-3 h-3 text-brand-acid" />
            <span>NODES: <strong className="text-brand-paper">8 / 8 MESH</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <HardDrive className="w-3 h-3 text-brand-purple" />
            <span>BANDWIDTH REDUCTION: <strong className="text-brand-acid">99.82%</strong></span>
          </div>
        </div>
      </div>

      {/* Center: Playback / Simulation Controls */}
      <div className="flex items-center space-x-2 bg-brand-dark-gray/40 px-2 py-0.5 rounded border border-brand-dark-gray/50">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1 hover:text-brand-acid transition-colors"
          title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-brand-acid" />}
        </button>
        <button
          onClick={() => setCurrentTime(0)}
          className="p-1 hover:text-brand-teal transition-colors"
          title="Reset Simulation Cycle"
        >
          <RotateCcw className="w-3.5 h-3.5 text-brand-gray" />
        </button>
        <div className="text-[10px] text-brand-paper font-semibold w-16 text-center">
          T+ {currentTime.toFixed(1)}s
        </div>
      </div>

      {/* Right: Map Toggle & System Clock */}
      <div className="flex items-center space-x-4">
        {/* 3D / 2D Map Toggle */}
        <div className="flex items-center bg-brand-dark-gray/40 p-0.5 rounded border border-brand-dark-gray/50">
          <button
            onClick={() => setMapMode('3d')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
              mapMode === '3d'
                ? 'bg-brand-acid text-brand-black shadow-editorial'
                : 'text-brand-gray hover:text-brand-paper'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>3D TWIN</span>
          </button>
          <button
            onClick={() => setMapMode('2d')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
              mapMode === '2d'
                ? 'bg-brand-purple text-brand-paper shadow-editorial'
                : 'text-brand-gray hover:text-brand-paper'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>2D TACTICAL</span>
          </button>
        </div>

        {/* Watchlist Counter */}
        <div className="hidden sm:flex items-center space-x-1.5 text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30 text-[9px]">
          <ShieldAlert className="w-3 h-3" />
          <span>HOTLIST: <strong className="text-red-300">{blacklist.length} TARGETS</strong></span>
        </div>

        {/* Real-time Clock */}
        <div className="text-brand-gray text-[10px] font-bold tracking-wider">
          {clock}
        </div>
      </div>
    </header>
  );
}
