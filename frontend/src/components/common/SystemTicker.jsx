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
    <header className="h-11 bg-obsidian border-b border-slate-800/80 px-4 flex items-center justify-between text-xs font-mono select-none">
      {/* Left: Branding & Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-hud animate-pulse shadow-hud-lime"></span>
          <span className="font-display font-bold tracking-wider text-slate-100 text-sm">
            PROJECT-MELV
          </span>
          <span className="bg-lime-hud/10 text-lime-hud px-1.5 py-0.5 rounded text-[10px] font-semibold border border-lime-hud/30">
            SIH-26127
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-3 text-slate-400 pl-4 border-l border-slate-800">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-hud" />
            <span>AI ENGINE: <strong className="text-slate-200">ONLINE (14ms)</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>NODES: <strong className="text-slate-200">8 / 8 MESH</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span>BANDWIDTH REDUCTION: <strong className="text-lime-hud">99.82%</strong></span>
          </div>
        </div>
      </div>

      {/* Center: Playback / Simulation Controls */}
      <div className="flex items-center space-x-2 bg-surface-card px-2.5 py-1 rounded border border-slate-800">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1 hover:text-lime-hud transition-colors"
          title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-hazard" /> : <Play className="w-3.5 h-3.5 text-lime-hud" />}
        </button>
        <button
          onClick={() => setCurrentTime(0)}
          className="p-1 hover:text-cyan-hud transition-colors"
          title="Reset Simulation Cycle"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
        </button>
        <div className="text-[11px] text-slate-300 font-semibold w-16 text-center">
          T+ {currentTime.toFixed(1)}s
        </div>
      </div>

      {/* Right: Map Toggle & System Clock */}
      <div className="flex items-center space-x-4">
        {/* 3D / 2D Map Toggle */}
        <div className="flex items-center bg-surface-card p-0.5 rounded border border-slate-800">
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
            <span>2D TACTICAL</span>
          </button>
        </div>

        {/* Watchlist Counter */}
        <div className="hidden sm:flex items-center space-x-1.5 text-crimson-alert bg-crimson-alert/10 px-2 py-0.5 rounded border border-crimson-alert/30">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>HOTLIST: <strong>{blacklist.length} TARGETS</strong></span>
        </div>

        {/* Real-time Clock */}
        <div className="text-slate-300 font-bold tracking-wider">
          {clock}
        </div>
      </div>
    </header>
  );
}
