'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { SimulationConfig, TrafficMode } from './types';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useSound } from './sounds';

interface Props {
    config: SimulationConfig;
    onConfigChange: (newConfig: Partial<SimulationConfig>) => void;
    onReset: () => void;
}

export default function SimulationControls({ config, onConfigChange, onReset }: Props) {
    const sound = useSound();

    const handlePlayPause = () => {
        if (config.isRunning) sound.playStop();
        else sound.playStart();
        onConfigChange({ isRunning: !config.isRunning });
    };

    const handleReset = () => {
        sound.playReset();
        onReset();
    };

    const handleTrafficIntensityChange = (value: number) => {
        sound.playSlide();
        onConfigChange({ trafficIntensity: value });
    };

    const handleAmbulanceFrequencyChange = (value: number) => {
        sound.playSlide();
        onConfigChange({ ambulanceFrequency: value });
    };

    const handleModeChange = (mode: TrafficMode) => {
        if (config.mode !== mode) {
            sound.playMode();
            onConfigChange({ mode });
        }
    };

    const handleSpeedChange = (speed: number) => {
        if (config.speed !== speed) {
            sound.playToggle();
            onConfigChange({ speed });
        }
    };

    return (
        <div className="space-y-4">
            {/* Play/Pause/Reset Controls */}
            <motion.div
                className="glass-card rounded-2xl p-5 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-cyan-400 font-mono">
                    Control Deck
                </h3>
                <div className="flex gap-2.5">
                    <button
                        onClick={handlePlayPause}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-md ${
                            config.isRunning
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                        }`}
                    >
                        {config.isRunning ? (
                            <>
                                <Pause className="w-3.5 h-3.5" /> Pause
                            </>
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5 fill-current" /> Run
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-3.5 py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-all flex items-center gap-1.5"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                </div>
            </motion.div>

            {/* Traffic Intensity */}
            <motion.div
                className="glass-card rounded-2xl p-5 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 font-mono flex items-center gap-1.5">
                        <span>🚗</span> Inflow Density
                    </h3>
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                        {config.trafficIntensity} cars/min
                    </span>
                </div>
                <div className="space-y-2 mt-3">
                    <input
                        type="range"
                        min="10"
                        max="60"
                        step="5"
                        value={config.trafficIntensity}
                        onChange={(e) => handleTrafficIntensityChange(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                        <span>10 (Sparse)</span>
                        <span>35 (Moderate)</span>
                        <span>60 (Saturated)</span>
                    </div>
                </div>
            </motion.div>

            {/* Ambulance Frequency */}
            <motion.div
                className="glass-card rounded-2xl p-5 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 font-mono flex items-center gap-1.5">
                        <span>🚑</span> Ambulance Ratio
                    </h3>
                    <span className="font-mono text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">
                        {config.ambulanceFrequency}%
                    </span>
                </div>
                <div className="space-y-2 mt-3">
                    <input
                        type="range"
                        min="0"
                        max="40"
                        step="5"
                        value={config.ambulanceFrequency}
                        onChange={(e) => handleAmbulanceFrequencyChange(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                        <span>0% (None)</span>
                        <span>20% (Standard)</span>
                        <span>40% (Surge)</span>
                    </div>
                </div>
            </motion.div>

            {/* AI Mode Selection */}
            <motion.div
                className="glass-card rounded-2xl p-5 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-purple-400 font-mono flex items-center gap-1.5">
                    <span>🧠</span> Signal Strategy Engine
                </h3>
                <div className="space-y-2">
                    {(['fixed', 'adaptive', 'emergency'] as TrafficMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => handleModeChange(mode)}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-left transition-all border ${
                                config.mode === mode
                                    ? 'bg-purple-500/25 border-purple-400/70 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                            }`}
                        >
                            <div className="font-bold text-xs font-mono">
                                {mode === 'fixed' && '⏱️ Fixed Timer (Legacy RTO)'}
                                {mode === 'adaptive' && '🎯 AI Adaptive (Webster + Queue)'}
                                {mode === 'emergency' && '🚨 Emergency Green Corridor'}
                            </div>
                            <div className="text-[11px] mt-0.5 opacity-75 leading-tight">
                                {mode === 'fixed' && 'Static cyclic rotation (15s fixed phase)'}
                                {mode === 'adaptive' && 'Real-time queue & density weighted dynamic allocation'}
                                {mode === 'emergency' && 'Instant priority preemption for emergency vehicles'}
                            </div>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Speed Multiplier */}
            <motion.div
                className="glass-card rounded-2xl p-5 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono flex items-center gap-1.5">
                        <span>⚡</span> Simulation Warp
                    </h3>
                    <span className="font-mono text-xs font-bold text-cyan-400">{config.speed}x Realtime</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[0.5, 1, 2, 4].map((speed) => (
                        <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`py-2 rounded-lg text-xs font-bold font-mono transition-all border ${
                                config.speed === speed
                                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
