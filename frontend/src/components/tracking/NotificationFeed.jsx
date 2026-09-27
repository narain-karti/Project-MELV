import React from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Bell, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

export default function NotificationFeed() {
  const { notifications, interceptAlert } = useTracking();

  return (
    <div className="bg-brand-paper border border-brand-black flex flex-col h-full font-mono text-xs chamfer-card shadow-editorial">
      {/* Feed Header */}
      <div className="h-8 px-3 bg-brand-black border-b border-brand-black flex items-center justify-between text-brand-paper">
        <div className="flex items-center space-x-2">
          <Bell className="w-3.5 h-3.5 text-brand-purple" />
          <span className="text-[10px] font-bold text-brand-paper uppercase tracking-widest">
            SYSTEM DISPATCH FEED
          </span>
        </div>
        <span className="text-[9px] text-brand-gray uppercase tracking-widest">
          REAL-TIME
        </span>
      </div>

      {/* Intercept Alert Banner if active */}
      {interceptAlert && (
        <div className="m-3 p-3 bg-brand-purple border border-brand-black text-brand-paper text-[10px] space-y-2 animate-pulse chamfer-card shadow-editorial uppercase tracking-widest">
          <div className="flex items-center space-x-1.5 font-bold">
            <Navigation className="w-4 h-4 text-brand-acid animate-bounce" />
            <span>INTERCEPT ADVISORY :: {interceptAlert.plate}</span>
          </div>
          <div className="text-brand-paper text-[9px]">
            PREDICTED NODE: <strong>{interceptAlert.nodeName} ({interceptAlert.predictedNode})</strong>
          </div>
          <div className="flex justify-between items-center text-[9px] pt-2 border-t border-brand-black/20 font-bold">
            <span>ETA: ~{interceptAlert.etaSeconds}s</span>
            <span className="underline text-brand-acid">{interceptAlert.action}</span>
          </div>
        </div>
      )}

      {/* List of Notification Toasts */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center text-brand-gray text-[10px] py-8 uppercase tracking-widest">
            MONITORING CITY CAMERA FEEDS...
          </div>
        ) : (
          notifications.map((n) => {
            const isCritical = n.severity === 'critical';
            return (
              <div
                key={n.id}
                className={`p-3 border transition-all chamfer-card ${
                  isCritical
                    ? 'bg-brand-black border-brand-black text-brand-purple shadow-editorial'
                    : 'bg-white border-brand-black text-brand-black shadow-editorial'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[10px] uppercase tracking-widest">
                  <span className="flex items-center space-x-1.5">
                    {isCritical ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-brand-purple" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-brand-acid" />
                    )}
                    <span className={isCritical ? 'text-brand-paper' : 'text-brand-black'}>{n.title}</span>
                  </span>
                  <span className="text-[9px] text-brand-gray font-normal">{n.timestamp}</span>
                </div>
                <div className={`text-[11px] mt-2 font-sans ${isCritical ? 'text-brand-gray' : 'text-brand-dark-gray'}`}>
                  {n.desc}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
