'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Clock, Gauge, Zap, ShieldAlert, Award, Compass } from 'lucide-react';
import type { SimulationMetrics } from './types';
import AnimatedCounter from '../../components/AnimatedCounter';

interface Props {
    metrics: SimulationMetrics;
}

export default function MetricsDashboard({ metrics }: Props) {
    const getTrend = (value: number, baseline: number) => {
        if (value > baseline * 1.1) return 'up';
        if (value < baseline * 0.9) return 'down';
        return 'stable';
    };

    const metricCards = [
        {
            id: 'wait_time',
            label: 'Avg Queue Wait',
            value: metrics.averageWaitTime,
            unit: 's',
            trend: getTrend(metrics.averageWaitTime, 8),
            icon: Clock,
            accent: 'cyan',
            improving: metrics.averageWaitTime < 7,
            description: 'Cumulative idle duration per vehicle'
        },
        {
            id: 'throughput',
            label: 'Junction Throughput',
            value: metrics.throughput,
            unit: ' /min',
            trend: getTrend(metrics.throughput, 12),
            icon: Gauge,
            accent: 'emerald',
            improving: metrics.throughput > 10,
            description: 'Vehicles traversing stopline per minute'
        },
        {
            id: 'efficiency',
            label: 'Signal Efficiency',
            value: metrics.signalEfficiency,
            unit: '%',
            trend: 'up',
            icon: Zap,
            accent: 'purple',
            improving: metrics.signalEfficiency > 80,
            description: 'Green wave bandwidth utilization'
        },
        {
            id: 'ambulances',
            label: 'Emergency Clearance',
            value: metrics.ambulancesProcessed,
            unit: ' units',
            trend: 'stable',
            icon: ShieldAlert,
            accent: 'red',
            improving: true,
            description: 'Ambulances routed via priority preempt'
        },
        {
            id: 'response_time',
            label: 'Ambulance Transit',
            value: metrics.ambulanceResponseTime,
            unit: 's',
            trend: getTrend(metrics.ambulanceResponseTime, 5),
            icon: Compass,
            accent: 'amber',
            improving: metrics.ambulanceResponseTime < 4,
            description: 'Average intersection clearance time'
        },
        {
            id: 'time_saved',
            label: 'Delay Avoided vs RTO',
            value: metrics.timeSaved,
            unit: '%',
            trend: 'up',
            icon: Award,
            accent: 'acid',
            improving: true,
            description: 'Latency saved vs fixed 15s timer'
        },
    ];

    const getBorderColor = (accent: string) => {
        switch (accent) {
            case 'cyan': return 'border-cyan-500/30 hover:border-cyan-400';
            case 'emerald': return 'border-emerald-500/30 hover:border-emerald-400';
            case 'purple': return 'border-purple-500/30 hover:border-purple-400';
            case 'red': return 'border-red-500/30 hover:border-red-400';
            case 'amber': return 'border-amber-500/30 hover:border-amber-400';
            case 'acid': return 'border-[#C8E84D]/40 hover:border-[#C8E84D]';
            default: return 'border-white/10';
        }
    };

    const getTextColor = (accent: string) => {
        switch (accent) {
            case 'cyan': return 'text-cyan-400';
            case 'emerald': return 'text-emerald-400';
            case 'purple': return 'text-purple-400';
            case 'red': return 'text-red-400';
            case 'amber': return 'text-amber-400';
            case 'acid': return 'text-[#C8E84D]';
            default: return 'text-white';
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    Real-Time Micro-Analytics & Telemetry
                </h3>
                <span className="text-[10px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                    Total Processed: <strong className="text-white font-bold">{metrics.totalVehiclesProcessed}</strong>
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {metricCards.map((card) => {
                    const IconComponent = card.icon;
                    return (
                        <motion.div
                            key={card.id}
                            whileHover={{ y: -2 }}
                            className={`glass-card p-3.5 rounded-2xl border transition-all ${getBorderColor(card.accent)}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={`p-1.5 rounded-lg bg-white/5 ${getTextColor(card.accent)}`}>
                                    <IconComponent className="w-3.5 h-3.5" />
                                </span>
                                <div className="flex items-center gap-1 text-[10px] font-mono">
                                    {card.trend === 'up' && (
                                        <span className={card.improving ? 'text-emerald-400 flex items-center' : 'text-amber-400 flex items-center'}>
                                            <TrendingUp className="w-3 h-3" />
                                        </span>
                                    )}
                                    {card.trend === 'down' && (
                                        <span className={card.improving ? 'text-emerald-400 flex items-center' : 'text-red-400 flex items-center'}>
                                            <TrendingDown className="w-3 h-3" />
                                        </span>
                                    )}
                                    {card.trend === 'stable' && (
                                        <span className="text-gray-400 flex items-center">
                                            <Minus className="w-3 h-3" />
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-medium">
                                {card.label}
                            </div>

                            <div className="mt-1 text-lg font-black font-mono tracking-tight flex items-baseline gap-0.5 text-white">
                                <AnimatedCounter end={card.value} decimals={card.id === 'ambulances' ? 0 : 1} />
                                <span className={`text-[11px] font-mono font-semibold ${getTextColor(card.accent)}`}>
                                    {card.unit}
                                </span>
                            </div>

                            <div className="mt-1 text-[9px] text-gray-400 font-mono truncate">
                                {card.description}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
