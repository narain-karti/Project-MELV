import React from 'react';
import VideoSurveillance from '../components/tracking/VideoSurveillance';
import TacticalMap from '../components/tracking/TacticalMap';
import DigitalIdentityCard from '../components/tracking/DigitalIdentityCard';
import OcrConsole from '../components/tracking/OcrConsole';
import NotificationFeed from '../components/tracking/NotificationFeed';

export default function LiveTrackingPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
      {/* Left Column: Surveillance feeds + GIS Map (7 of 12 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-3">
        <VideoSurveillance />
        <div className="flex-1 min-h-[320px]">
          <TacticalMap />
        </div>
      </div>

      {/* Right Column: Identity Card + Terminal Stream + Dispatch Feed (5 of 12 cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-3">
        <DigitalIdentityCard />
        <OcrConsole />
        <div className="flex-1 min-h-[220px]">
          <NotificationFeed />
        </div>
      </div>
    </div>
  );
}
