import React from 'react';
import VideoSurveillance from '../components/tracking/VideoSurveillance';
import TacticalMap from '../components/tracking/TacticalMap';
import DigitalIdentityCard from '../components/tracking/DigitalIdentityCard';
import OcrConsole from '../components/tracking/OcrConsole';
import NotificationFeed from '../components/tracking/NotificationFeed';
import { MapPin, Video, Activity } from 'lucide-react';

export default function LiveTrackingPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
      {/* Left Column: Surveillance feeds + GIS Map (8 of 12 cols) */}
      <div className="lg:col-span-8 flex flex-col space-y-3">
        {/* Street & Camera Pair Identification Bar */}
        <div className="bg-surface-card border border-slate-800 rounded-lg px-3.5 py-2 flex flex-wrap items-center justify-between text-xs font-mono shadow-md">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-hud animate-pulse"></span>
            <span className="text-slate-400">STREET:</span>
            <span className="text-white font-bold tracking-wide">CLV NAGAR 1ST STREET, KANATHUR</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-hud">CHENNAI, TN 603112</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center space-x-3 mt-1 sm:mt-0">
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>CAM-01: <strong className="text-slate-200">WEST (ECR GATE)</strong></span>
            </span>
            <span className="text-slate-600">⟷</span>
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>CAM-02: <strong className="text-slate-200">EAST JUNCTION</strong></span>
            </span>
          </div>
        </div>

        {/* Dual Video Surveillance Stream */}
        <VideoSurveillance />

        {/* Live GIS Map / 3D Digital Twin */}
        <div className="flex-1 min-h-[360px]">
          <TacticalMap />
        </div>
      </div>

      {/* Right Column: Identity Card + Terminal Stream + Dispatch Feed (4 of 12 cols) */}
      <div className="lg:col-span-4 flex flex-col space-y-3">
        <DigitalIdentityCard />
        <OcrConsole />
        <div className="flex-1 min-h-[220px]">
          <NotificationFeed />
        </div>
      </div>
    </div>
  );
}
