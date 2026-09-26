import React from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Car, Bike, Truck, ShieldAlert, CheckCircle2, Clock, MapPin } from 'lucide-react';

export default function DigitalIdentityCard() {
  const { digitalIdentity } = useTracking();

  if (!digitalIdentity) {
    return (
      <div className="bg-surface-card border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center h-44 text-slate-400 font-mono text-xs">
        <Car className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
        <span>AWAITING VEHICLE PASS-THROUGH...</span>
        <span className="text-[10px] text-slate-400 mt-1">CAMERA NODES ACTIVE</span>
      </div>
    );
  }

  const isBlacklist = digitalIdentity.isBlacklist;
  const isCommercial = digitalIdentity.plateType === 'commercial_yellow';

  const getVehicleIcon = (vClass) => {
    if (vClass?.includes('Two-wheeler') || vClass?.includes('Bicycle')) return <Bike className="w-6 h-6 text-lime-hud" />;
    if (vClass?.includes('Truck') || vClass?.includes('Bus') || vClass?.includes('LCV')) return <Truck className="w-6 h-6 text-cyan-hud" />;
    return <Car className="w-6 h-6 text-slate-200" />;
  };

  return (
    <div
      className={`bg-surface-card border rounded-lg p-3.5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
        isBlacklist
          ? 'border-crimson-alert shadow-hud-crimson bg-crimson-alert/5'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Identity Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          {getVehicleIcon(digitalIdentity.vehicleClass)}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              DIGITAL VEHICLE IDENTITY
            </div>
            <div className="text-xs font-bold text-slate-200">
              {digitalIdentity.vehicleClass} • {digitalIdentity.color}
            </div>
          </div>
        </div>

        {isBlacklist ? (
          <span className="flex items-center gap-1 bg-crimson-alert/20 text-crimson-alert border border-crimson-alert/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            WANTED
          </span>
        ) : (
          <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            VERIFIED
          </span>
        )}
      </div>

      {/* Center: License Plate Display */}
      <div className="my-2.5 flex items-center justify-between">
        <div
          className={`px-3 py-1.5 rounded border-2 flex items-center space-x-2 font-mono font-bold text-base tracking-wider ${
            isCommercial
              ? 'bg-amber-400 text-black border-black'
              : 'bg-white text-slate-900 border-slate-400'
          }`}
        >
          <div className="flex flex-col items-center pr-1.5 border-r border-black/30 text-[8px] leading-tight">
            <span>IND</span>
          </div>
          <span>{digitalIdentity.plate}</span>
        </div>

        <div className="text-right font-mono">
          <div className="text-[10px] text-slate-400">OCR CONFIDENCE</div>
          <div className="text-sm font-bold text-lime-hud">{digitalIdentity.confidence}%</div>
        </div>
      </div>

      {/* Bottom: Location & Timestamp */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-slate-800 text-slate-400">
        <div className="flex items-center space-x-1.5 truncate">
          <MapPin className="w-3 h-3 text-cyan-hud flex-shrink-0" />
          <span className="truncate">{digitalIdentity.cameraName}</span>
        </div>
        <div className="flex items-center justify-end space-x-1.5">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{digitalIdentity.timestamp}</span>
        </div>
      </div>

      {/* Blacklist FIR Details if flagged */}
      {isBlacklist && digitalIdentity.blacklistInfo && (
        <div className="mt-2 pt-2 border-t border-crimson-alert/30 text-[10px] font-mono text-crimson-alert flex justify-between items-center bg-crimson-alert/10 p-1.5 rounded">
          <span>{digitalIdentity.blacklistInfo.category}</span>
          <strong className="underline">{digitalIdentity.blacklistInfo.fir_number}</strong>
        </div>
      )}
    </div>
  );
}
