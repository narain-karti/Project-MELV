import React, { useState, useEffect } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { ShieldAlert, Activity, Wifi, HardDrive, Play, Pause, RotateCcw } from 'lucide-react';

export default function SystemTicker() {
  const { isPlaying, setIsPlaying, currentTime, setCurrentTime, blacklist } = useTracking();
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
    <header className="h-8 bg-[#0d0d10] border-b border-white/5 px-4 flex items-center justify-between text-xs font-mono select-none">
      {/* Left: Engine Live Telemetry */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-4 text-brand-gray text-[10px]">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3 h-3 text-brand-acid" />
            <span>AI INFERENCE: <strong className="text-brand-paper">14ms / FRAME</strong></span>
          </div>
          <div className="hidden md:flex items-center space-x-1.5">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span>MESH: <strong className="text-brand-paper">8 / 8 ACTIVE</strong></span>
          </div>
          <div className="hidden lg:flex items-center space-x-1.5">
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

      {/* Right: Watchlist Counter & System Clock */}
      <div className="flex items-center space-x-4">

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
