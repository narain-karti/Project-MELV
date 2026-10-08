'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, AlertTriangle, ShieldCheck, Activity, CheckCircle2, Zap } from 'lucide-react';
import type { AIDecision, Direction } from './types';

interface Props {
    decision?: AIDecision;
}

const directionEmoji: Record<Direction, string> = {
    north: '⬆️',
    south: '⬇️',
    east: '➡️',
    west: '⬅️',
};

const directionColors: Record<Direction, string> = {
    north: '#3b82f6',
    south: '#10b981',
    east: '#f59e0b',
    west: '#8b5cf6',
};

export default function AIDecisionFlow({ decision }: Props) {
    const directions: Direction[] = ['north', 'south', 'east', 'west'];
    const scores = decision?.priorityScores || { north: 0, south: 0, east: 0, west: 0 };
    const maxScore = Math.max(...Object.values(scores), 1);
    const selectedDir = decision?.selectedDirection || decision?.activeDirection || 'east';
    const isEmergency = decision?.emergencyOverride || false;

    return (
        <motion.div
            className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
        >
            {/* Header with AI Engine status */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Cpu className="w-4 h-4 animate-spin-slow" />
                    </span>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                            AI Decision Engine Heuristics
                        </h3>
                        <div className="text-[10px] text-gray-400 font-mono">Webster Adaptive Queue Heuristic</div>
                    </div>
                </div>

                {isEmergency ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                        <AlertTriangle className="w-3 h-3" /> Emergency Override
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" /> Nominal Flow
                    </span>
                )}
            </div>

            {/* Current Active Action Card */}
            <div className={`p-4 rounded-xl border font-mono transition-all ${
                isEmergency 
                    ? 'bg-red-950/30 border-red-500/40 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                    : 'bg-white/[0.04] border-white/10 text-gray-200'
            }`}>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
                    <span>Current Action Executed</span>
                    <span className="text-cyan-400 font-bold">Phase: {decision?.signalDuration || 15}s allocated</span>
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-base">{directionEmoji[selectedDir]}</span>
                    <span>{decision?.action || `Signal: ${selectedDir.toUpperCase()}`}</span>
                </div>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-white/5">
                    {decision?.reason || decision?.reasoning || 'Calibrating intersection queue metrics...'}
                </p>
            </div>

            {/* Live Priority Scoring Bars */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" /> Lane Demand Scoring
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Density & Wait Weighting</span>
                </div>

                <div className="space-y-2">
                    {directions.map((dir) => {
                        const val = scores[dir] || 0;
                        const pct = Math.min(Math.round((val / maxScore) * 100), 100);
                        const isChosen = dir === selectedDir;

                        return (
                            <div key={dir} className="space-y-1 font-mono text-xs">
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5">
                                        <span>{directionEmoji[dir]}</span>
                                        <span className={`font-bold uppercase ${isChosen ? 'text-cyan-300' : 'text-gray-300'}`}>
                                            {dir} Approach
                                        </span>
                                        {isChosen && (
                                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                                                ACTIVE GREEN
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-bold text-gray-200">
                                        {val.toFixed(0)} <span className="text-gray-400 text-[10px]">pts</span>
                                    </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/5 p-0.5">
                                    <motion.div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                            backgroundColor: isChosen ? '#00f0ff' : directionColors[dir],
                                            boxShadow: isChosen ? '0 0 10px #00f0ff' : 'none'
                                        }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* AI Decision Cycle Summary */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                    <div className="text-[10px] text-gray-400 uppercase">Green Phase Range</div>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5">8s – 30s</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                    <div className="text-[10px] text-gray-400 uppercase">Cycle Mode</div>
                    <div className="text-sm font-bold text-purple-400 mt-0.5 capitalize">
                        {decision?.currentMode || 'Adaptive AI'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
