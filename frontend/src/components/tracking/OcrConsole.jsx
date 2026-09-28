import React, { useEffect, useRef } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Terminal, ShieldAlert } from 'lucide-react';

export default function OcrConsole() {
  const { consoleLogs } = useTracking();
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [consoleLogs]);

  return (
    <div className="bg-[#141417] border border-white/10 overflow-hidden flex flex-col h-48 font-mono text-xs rounded-lg shadow-xl">
      {/* Console Header */}
      <div className="h-8 px-3 bg-[#18181c] border-b border-white/10 flex items-center justify-between text-brand-paper">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-brand-acid" />
          <span className="text-[10px] font-bold text-brand-paper uppercase tracking-widest">
            EDGE TELEMETRY STREAM
          </span>
          <span className="text-[9px] text-brand-gray uppercase tracking-widest hidden sm:inline">
            [EASYOCR + RTO GRAMMAR]
          </span>
        </div>
        <span className="w-2 h-2 bg-brand-acid animate-pulse rounded-full"></span>
      </div>

      {/* Terminal Content */}
      <div ref={containerRef} className="flex-1 p-3 overflow-y-auto space-y-1.5 bg-brand-black text-[10px] uppercase tracking-wider">
        {consoleLogs.map((log) => {
          const isCritical = log.type === 'critical';
          const isSuccess = log.type === 'success';

          return (
            <div
              key={log.id}
              className={`flex items-start space-x-2 leading-relaxed ${
                isCritical
                  ? 'text-brand-paper bg-brand-purple px-1 font-bold'
                  : isSuccess
                  ? 'text-brand-acid'
                  : 'text-brand-gray'
              }`}
            >
              <span className="text-brand-dark-gray text-[9px] flex-shrink-0 select-none">
                [{log.time}]
              </span>
              {isCritical && <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-brand-paper mt-0.5" />}
              <span className="break-all">{log.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
