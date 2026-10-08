'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    Volume2, 
    VolumeX, 
    Layers, 
    Sparkles, 
    RefreshCw, 
    Zap, 
    ArrowLeft, 
    ShieldAlert, 
    Activity,
    Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type { SimulationConfig, SimulationMetrics, AIDecision, Direction } from './types';
import TrafficSimulation3D from './TrafficSimulation3D';
import SimulationControls from './SimulationControls';
import TrafficScenarios from './TrafficScenarios';
import SignalSwitchLog from './SignalSwitchLog';
import MetricsDashboard from './MetricsDashboard';
import AIDecisionFlow from './AIDecisionFlow';
import ComparisonCharts from './ComparisonCharts';
import { soundManager, useSound } from './sounds';

export default function TrafficSimulationPage() {
    const sound = useSound();
    const [soundEnabled, setSoundEnabled] = useState(true);

    const [config, setConfig] = useState<SimulationConfig>({
        trafficIntensity: 35,
        ambulanceFrequency: 10,
        mode: 'adaptive',
        speed: 1,
        isRunning: true,
    });

    const [currentScenario, setCurrentScenario] = useState<string>('unbalanced');

    const [metrics, setMetrics] = useState<SimulationMetrics>({
        averageWaitTime: 5.8,
        totalVehiclesProcessed: 0,
        throughput: 14.2,
        signalEfficiency: 89.4,
        ambulanceResponseTime: 2.1,
        ambulancesProcessed: 0,
        timeSaved: 16.4,
    });

    const [decision, setDecision] = useState<AIDecision>({
        timestamp: Date.now(),
        action: 'Nominal Adaptive Allocation',
        reason: 'Scanning queue volume and wait times across 4 intersection corridors',
        priorityScores: { north: 3, south: 2, east: 5, west: 1 },
        selectedDirection: 'east',
        signalDuration: 14,
        emergencyOverride: false,
        currentMode: 'adaptive',
    });

    const [latestSwitch, setLatestSwitch] = useState<{
        from: Direction;
        to: Direction;
        reason: string;
    }>({
        from: 'north',
        to: 'east',
        reason: 'EAST has higher approaching density (5 vehicles waiting)',
    });

    const handleConfigChange = useCallback((newConfig: Partial<SimulationConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    }, []);

    const handleReset = useCallback(() => {
        setMetrics({
            averageWaitTime: 0,
            totalVehiclesProcessed: 0,
            throughput: 0,
            signalEfficiency: 85,
            ambulanceResponseTime: 0,
            ambulancesProcessed: 0,
            timeSaved: 0,
        });
        setConfig(prev => ({ ...prev, isRunning: true }));
    }, []);

    const handleSelectScenario = useCallback((scenarioConfig: { trafficIntensity: number; ambulanceFrequency: number; mode: 'fixed' | 'adaptive' | 'emergency' }, scenarioId?: string) => {
        setConfig(prev => ({
            ...prev,
            trafficIntensity: scenarioConfig.trafficIntensity,
            ambulanceFrequency: scenarioConfig.ambulanceFrequency,
            mode: scenarioConfig.mode,
            isRunning: true,
        }));
        if (scenarioId) {
            setCurrentScenario(scenarioId);
        }
    }, []);

    const handleSignalSwitch = useCallback((from: Direction, to: Direction, reason: string) => {
        setLatestSwitch({ from, to, reason });
        if (reason.includes('EMERGENCY') || reason.includes('Ambulance')) {
            sound.playError();
        } else {
            sound.playToggle();
        }
    }, [sound]);

    const toggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        soundManager.setEnabled(next);
        if (next) sound.playClick();
    };

    return (
        <div className="min-h-screen bg-[#07090e] text-white p-3 md:p-6 font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
            {/* Ambient cyberpunk glow effects */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[300px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[300px] bg-purple-500/10 blur-[140px] pointer-events-none rounded-full" />

            {/* Master Header */}
            <header className="relative z-10 glass-card rounded-2xl p-4 md:p-6 mb-6 border border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                                MODULE [09] • THREE.JS / R3F
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                WEBSTER ADAPTIVE SIGNAL AI
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                LIVE 60 FPS
                            </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                            <span className="text-cyan-400">TRAFFIC AI SIMULATION 3D</span>
                            <span className="text-xs font-mono text-gray-400 font-normal hidden sm:inline">
                                | 4-Way Autonomous Intersection Digital Twin
                            </span>
                        </h1>
                        <p className="text-xs text-gray-400 font-mono">
                            Multi-agent dynamic green-duration optimization with emergency vehicle green wave preemption.
                        </p>
                    </div>

                    <div className="flex items-center flex-wrap gap-2.5">
                        <button
                            onClick={toggleSound}
                            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                                soundEnabled
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                            }`}
                            title="Web Audio API Sound Synthesis"
                        >
                            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
                            <span>{soundEnabled ? 'Synthesizer On' : 'Muted'}</span>
                        </button>

                        <button
                            onClick={handleReset}
                            className="px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Re-Zero</span>
                        </button>

                        <Link
                            to="/sandbox"
                            className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#C8E84D] text-black border border-black hover:bg-white transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#141414]"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Return to Sandbox</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Master 3-Column Responsive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
                {/* Column 1: Controls & Scenarios (3 cols) */}
                <div className="lg:col-span-3 space-y-5">
                    <SimulationControls
                        config={config}
                        onConfigChange={handleConfigChange}
                        onReset={handleReset}
                    />

                    <TrafficScenarios
                        onSelectScenario={handleSelectScenario}
                        currentScenario={currentScenario}
                    />
                </div>

                {/* Column 2: 3D Canvas, Metrics Dashboard & Comparative Charts (6 cols) */}
                <div className="lg:col-span-6 space-y-5">
                    {/* Primary 3D Simulation Canvas */}
                    <TrafficSimulation3D
                        config={config}
                        onMetricsUpdate={setMetrics}
                        onDecisionUpdate={setDecision}
                        onSignalSwitch={handleSignalSwitch}
                    />

                    {/* Real-Time Metrics Counters */}
                    <MetricsDashboard metrics={metrics} />

                    {/* Recharts Analytics & Radar Matrix */}
                    <ComparisonCharts metrics={metrics} />
                </div>

                {/* Column 3: AI Heuristic Flow & Live Signal Switch Feed (3 cols) */}
                <div className="lg:col-span-3 space-y-5 flex flex-col">
                    <AIDecisionFlow decision={decision} />

                    <div className="flex-1">
                        <SignalSwitchLog latestSwitch={latestSwitch} />
                    </div>
                </div>
            </div>
        </div>
    );
}
