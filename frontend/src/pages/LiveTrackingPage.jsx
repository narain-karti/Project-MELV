import React from 'react';
import VideoSurveillance from '../components/tracking/VideoSurveillance';
import TacticalMap from '../components/tracking/TacticalMap';
import DigitalIdentityCard from '../components/tracking/DigitalIdentityCard';
import OcrConsole from '../components/tracking/OcrConsole';
import NotificationFeed from '../components/tracking/NotificationFeed';
import { MapPin, Video, Activity } from 'lucide-react';

export default function LiveTrackingPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left Column: Surveillance feeds + GIS Map (8 of 12 cols) */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-brand-dark-gray/30 pb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-acid mb-1 font-mono">Operations</div>
            <h2 className="editorial-headline text-4xl text-brand-paper">LIVE TRAJECTORY</h2>
          </div>
          <div className="mt-4 md:mt-0 text-[10px] font-mono font-bold uppercase text-brand-gray bg-brand-dark-gray px-3 py-1.5 inline-flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-acid mr-2 animate-pulse"></span>
            CLV NAGAR 1ST STREET
          </div>
        </div>

        {/* Dual Video Surveillance Stream */}
        <div className="bg-brand-paper border border-brand-black p-1 chamfer-card">
          <VideoSurveillance />
        </div>

        {/* Live GIS Map / 3D Digital Twin */}
        <div className="flex-1 min-h-[360px] bg-brand-paper border border-brand-black p-1 chamfer-card relative">
          <TacticalMap />
          <div className="absolute top-0 right-0 bg-brand-black text-brand-paper text-[9px] font-bold px-2 py-1 uppercase tracking-wider font-mono z-[400] border-l border-b border-brand-black">
            SPATIAL ENGINE
          </div>
        </div>
      </div>

      {/* Right Column: Identity Card + Terminal Stream + Dispatch Feed (4 of 12 cols) */}
      <div className="lg:col-span-4 flex flex-col space-y-6">
        <DigitalIdentityCard />
        <OcrConsole />
        <div className="flex-1 min-h-[220px]">
          <NotificationFeed />
        </div>
      </div>
    </div>
  );
}
