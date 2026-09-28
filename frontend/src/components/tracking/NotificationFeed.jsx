import React from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Bell, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

export default function NotificationFeed() {
  const { notifications, interceptAlert } = useTracking();

  return (
    <div className="bg-[#141417] border border-white/10 flex flex-col h-full font-mono text-xs rounded-lg shadow-xl">
      {/* Feed Header */}
      <div className="h-8 px-3 bg-[#18181c] border-b border-white/10 flex items-center justify-between text-brand-paper">
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

      {/* List of Notification Toasts - scrollable with exactly 4 rows visible */}
      <div className="p-2 overflow-y-auto max-h-[258px] space-y-1.5 scrollbar-thin">
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
                className={`px-2.5 py-1.5 border transition-all rounded h-[62px] flex flex-col justify-center flex-shrink-0 ${
                  isCritical
                    ? 'bg-red-500/10 border-red-500/40 text-red-200'
                    : 'bg-white/5 border-white/10 text-brand-paper hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[10px] uppercase tracking-widest">
                  <span className="flex items-center space-x-1.5 truncate pr-2">
                    {isCritical ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-brand-acid flex-shrink-0" />
                    )}
                    <span className={`truncate ${isCritical ? 'text-red-300' : 'text-white'}`}>{n.title}</span>
                  </span>
                  <span className="text-[9px] text-white/40 font-normal whitespace-nowrap flex-shrink-0">{n.timestamp}</span>
                </div>
                <div className={`text-[10px] mt-1 font-sans line-clamp-1 truncate ${isCritical ? 'text-red-200/80' : 'text-white/70'}`}>
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
