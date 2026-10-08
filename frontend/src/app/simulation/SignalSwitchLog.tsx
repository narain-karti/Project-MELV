'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Direction } from './types';

interface SignalSwitchEntry {
    id: string;
    timestamp: Date;
    from: Direction;
    to: Direction;
    reason: string;
}

interface Props {
    latestSwitch?: {
        from: Direction;
        to: Direction;
        reason: string;
    };
}

const directionColors: Record<Direction, string> = {
    north: '#3b82f6',
    south: '#10b981',
    east: '#f59e0b',
    west: '#8b5cf6',
};

const directionEmoji: Record<Direction, string> = {
    north: '⬆️',
    south: '⬇️',
    east: '➡️',
    west: '⬅️',
};

export default function SignalSwitchLog({ latestSwitch }: Props) {
    const [entries, setEntries] = useState<SignalSwitchEntry[]>([]);
    const counterRef = React.useRef(1);

    useEffect(() => {
        if (latestSwitch) {
            const newEntry: SignalSwitchEntry = {
                id: `switch-${Date.now()}-${counterRef.current++}`,
                timestamp: new Date(),
                from: latestSwitch.from,
                to: latestSwitch.to,
                reason: latestSwitch.reason,
            };
            setEntries(prev => [newEntry, ...prev.slice(0, 9)]);
        }
    }, [latestSwitch]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    return (
        <motion.div
            className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col h-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
        >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                        🚦 Live Signal Switch Log
                    </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                    REALTIME
                </span>
            </div>

            {entries.length === 0 ? (
                <div className="text-center py-10 text-gray-400 flex flex-col items-center justify-center flex-1">
                    <div className="text-3xl mb-2">🚦</div>
                    <p className="text-xs font-mono font-medium">Awaiting Signal Transitions</p>
                    <p className="text-[11px] opacity-70 mt-1">Start simulation to stream live switch telemetry</p>
                </div>
            ) : (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1.5 custom-scrollbar flex-1">
                    <AnimatePresence initial={false}>
                        {entries.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -30, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                                className={`p-3 rounded-xl border text-xs font-mono ${
                                    index === 0
                                        ? 'bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black/60 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                                        : 'bg-white/[0.03] border-white/10'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] text-gray-400 font-mono">{formatTime(entry.timestamp)}</span>
                                    {index === 0 && (
                                        <span className="text-[9px] font-bold px-2 py-0.5 bg-cyan-400/20 text-cyan-300 rounded-full border border-cyan-400/40 animate-pulse">
                                            ACTIVE NOW
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs"
                                        style={{ backgroundColor: `${directionColors[entry.from]}25`, color: directionColors[entry.from] }}
                                    >
                                        {directionEmoji[entry.from]} {entry.from.toUpperCase()}
                                    </div>
                                    <div className="text-sm font-bold text-gray-400">→</div>
                                    <div
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs"
                                        style={{ backgroundColor: `${directionColors[entry.to]}25`, color: directionColors[entry.to] }}
                                    >
                                        {directionEmoji[entry.to]} {entry.to.toUpperCase()}
                                    </div>
                                </div>
                                <div className={`text-[11px] p-2 rounded-lg leading-relaxed ${
                                    entry.reason.includes('EMERGENCY') || entry.reason.includes('Ambulance')
                                        ? 'bg-red-500/20 text-red-200 border border-red-500/40'
                                        : 'bg-white/5 text-gray-300 border border-white/5'
                                }`}>
                                    {entry.reason}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {entries.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="text-center p-2 bg-white/5 rounded-lg border border-white/5">
                        <div className="text-gray-400 text-[10px]">Total Shifts</div>
                        <div className="text-base font-bold text-cyan-400">{entries.length}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg border border-white/5">
                        <div className="text-gray-400 text-[10px]">Emergency Preempts</div>
                        <div className="text-base font-bold text-red-400">
                            {entries.filter(e => e.reason.includes('Emergency') || e.reason.includes('EMERGENCY')).length}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400 mb-2">Corridor Channels</div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                    {(['north', 'south', 'east', 'west'] as Direction[]).map(dir => (
                        <div key={dir} className="flex items-center gap-1.5 text-gray-300">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: directionColors[dir] }} />
                            <span>{directionEmoji[dir]} {dir.toUpperCase()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
