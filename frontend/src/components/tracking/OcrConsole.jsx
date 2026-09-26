import React, { useEffect, useRef } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Terminal, ShieldAlert } from 'lucide-react';

export default function OcrConsole() {
  const { consoleLogs } = useTracking();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  return (
    <div className="bg-surface-card border border-slate-800 rounded-lg overflow-hidden flex flex-col h-48 font-mono text-xs shadow-md">
      {/* Console Header */}
      <div className="h-8 px-3 bg-surface-dark border-b border-slate-800 flex items-center justify-between text-slate-300">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-lime-hud" />
          <span className="text-[11px] font-bold text-slate-200">
            EDGE TELEMETRY STREAM
          </span>
          <span className="text-[10px] text-slate-400">
            [PADDLEOCR + RTO GRAMMAR]
          </span>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 p-2.5 overflow-y-auto space-y-1.5 bg-obsidian/90 text-[11px]">
        {consoleLogs.map((log) => {
          const isCritical = log.type === 'critical';
          const isSuccess = log.type === 'success';

          return (
            <div
              key={log.id}
              className={`flex items-start space-x-2 leading-relaxed ${
                isCritical
                  ? 'text-crimson-alert bg-crimson-alert/10 px-1 rounded font-bold'
                  : isSuccess
                  ? 'text-lime-hud'
                  : 'text-slate-300'
              }`}
            >
              <span className="text-slate-400 text-[10px] flex-shrink-0 select-none">
                [{log.time}]
              </span>
              {isCritical && <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-crimson-alert mt-0.5" />}
              <span className="break-all">{log.text}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
