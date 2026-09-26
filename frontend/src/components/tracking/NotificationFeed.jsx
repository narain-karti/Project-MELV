import React from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Bell, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

export default function NotificationFeed() {
  const { notifications, interceptAlert } = useTracking();

  return (
    <div className="bg-surface-card border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full font-mono text-xs shadow-md">
      {/* Feed Header */}
      <div className="h-8 px-3 bg-surface-dark border-b border-slate-800 flex items-center justify-between text-slate-300">
        <div className="flex items-center space-x-2">
          <Bell className="w-3.5 h-3.5 text-cyan-hud" />
          <span className="text-[11px] font-bold text-slate-200">
            SYSTEM DISPATCH FEED
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          REAL-TIME
        </span>
      </div>

      {/* Intercept Alert Banner if active */}
      {interceptAlert && (
        <div className="m-2 p-2.5 bg-crimson-alert/15 border-2 border-crimson-alert rounded text-crimson-alert text-[11px] space-y-1 animate-pulse">
          <div className="flex items-center space-x-1.5 font-bold">
            <Navigation className="w-4 h-4 text-crimson-alert animate-bounce" />
            <span>INTERCEPT ADVISORY :: {interceptAlert.plate}</span>
          </div>
          <div className="text-slate-200 text-[10px]">
            PREDICTED NODE: <strong>{interceptAlert.nodeName} ({interceptAlert.predictedNode})</strong>
          </div>
          <div className="flex justify-between items-center text-[10px] pt-1 border-t border-crimson-alert/30">
            <span>ETA: ~{interceptAlert.etaSeconds}s</span>
            <span className="font-bold underline">{interceptAlert.action}</span>
          </div>
        </div>
      )}

      {/* List of Notification Toasts */}
      <div className="flex-1 p-2.5 overflow-y-auto space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center text-slate-400 text-[11px] py-8">
            MONITORING CITY CAMERA FEEDS...
          </div>
        ) : (
          notifications.map((n) => {
            const isCritical = n.severity === 'critical';
            return (
              <div
                key={n.id}
                className={`p-2 rounded border transition-all ${
                  isCritical
                    ? 'bg-crimson-alert/10 border-crimson-alert/50 text-crimson-alert'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[11px]">
                  <span className="flex items-center space-x-1.5">
                    {isCritical ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-crimson-alert" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{n.title}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
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
