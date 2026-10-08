'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSound } from './sounds';

interface Scenario {
    id: string;
    name: string;
    emoji: string;
    description: string;
    config: {
        trafficIntensity: number;
        ambulanceFrequency: number;
        mode: 'fixed' | 'adaptive' | 'emergency';
    };
    color: string;
}

const scenarios: Scenario[] = [
    {
        id: 'rush-hour',
        name: 'Rush Hour',
        emoji: '🚗',
        description: 'Heavy traffic from all directions',
        config: { trafficIntensity: 50, ambulanceFrequency: 5, mode: 'adaptive' },
        color: 'from-orange-500/30 to-red-500/30',
    },
    {
        id: 'emergency',
        name: 'Emergency Response',
        emoji: '🚑',
        description: 'Ambulances approaching frequently',
        config: { trafficIntensity: 25, ambulanceFrequency: 40, mode: 'emergency' },
        color: 'from-red-500/30 to-pink-500/30',
    },
    {
        id: 'night',
        name: 'Night Mode',
        emoji: '🌃',
        description: 'Light traffic, calm streets',
        config: { trafficIntensity: 10, ambulanceFrequency: 5, mode: 'adaptive' },
        color: 'from-indigo-500/30 to-purple-500/30',
    },
    {
        id: 'unbalanced',
        name: 'Unbalanced',
        emoji: '🔀',
        description: 'Heavy on one direction only',
        config: { trafficIntensity: 35, ambulanceFrequency: 10, mode: 'adaptive' },
        color: 'from-cyan-500/30 to-blue-500/30',
    },
];

interface Props {
    onSelectScenario: (config: Scenario['config'], scenarioId?: string) => void;
    currentScenario?: string;
}

export default function TrafficScenarios({ onSelectScenario, currentScenario }: Props) {
    const sound = useSound();

    const handleSelect = (scenario: Scenario) => {
        sound.playMode();
        onSelectScenario(scenario.config, scenario.id);
    };

    return (
        <motion.div
            className="glass-card rounded-2xl p-5 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-purple-400 font-mono flex items-center gap-2">
                <span>🎬</span> Traffic Presets & Scenarios
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
                {scenarios.map((scenario) => (
                    <motion.button
                        key={scenario.id}
                        onClick={() => handleSelect(scenario)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-xl text-left transition-all border ${
                            currentScenario === scenario.id
                                ? 'border-cyan-400 bg-cyan-400/20 ring-1 ring-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                                : 'border-white/10 hover:border-white/30'
                        } bg-gradient-to-br ${scenario.color}`}
                    >
                        <div className="text-2xl mb-1">{scenario.emoji}</div>
                        <div className="text-xs font-bold text-white tracking-wide">{scenario.name}</div>
                        <div className="text-[11px] text-gray-300 mt-1 line-clamp-2 leading-tight">
                            {scenario.description}
                        </div>
                    </motion.button>
                ))}
            </div>
            <div className="mt-3.5 p-2.5 bg-white/5 rounded-lg text-[11px] text-gray-400 font-mono border border-white/5">
                <span className="text-cyan-400 font-bold">💡 Preset Logic:</span> Select a scenario to immediately tune
                flow rates, ambulance sirens, and AI priority heuristics.
            </div>
        </motion.div>
    );
}
