import React from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Car, Bike, Truck, ShieldAlert, CheckCircle2, Clock, MapPin } from 'lucide-react';

export default function DigitalIdentityCard() {
  const { digitalIdentity } = useTracking();

  if (!digitalIdentity) {
    return (
      <div className="bg-brand-paper border border-brand-black p-4 flex flex-col items-center justify-center h-44 text-brand-gray font-mono text-xs chamfer-card">
        <Car className="w-8 h-8 text-brand-dark-gray mb-2 animate-pulse" />
        <span className="uppercase font-bold tracking-widest text-[10px] text-brand-black">Awaiting Vehicle Pass-Through</span>
        <span className="text-[9px] text-brand-gray mt-1">CAMERA NODES ACTIVE</span>
      </div>
    );
  }

  const isBlacklist = digitalIdentity.isBlacklist;
  const isCommercial = digitalIdentity.plateType === 'commercial_yellow';

  const getVehicleIcon = (vClass) => {
    if (vClass?.includes('Two-wheeler') || vClass?.includes('Bicycle')) return <Bike className="w-6 h-6 text-brand-acid" />;
    if (vClass?.includes('Truck') || vClass?.includes('Bus') || vClass?.includes('LCV')) return <Truck className="w-6 h-6 text-brand-purple" />;
    return <Car className="w-6 h-6 text-brand-black" />;
  };

  return (
    <div
      className={`bg-[#141417] border p-4 flex flex-col justify-between transition-all duration-300 relative overflow-hidden rounded-lg shadow-xl ${
        isBlacklist
          ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
          : 'border-white/10 hover:border-brand-acid/40'
      }`}
    >
      {/* Top Identity Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 text-brand-paper p-2 rounded border border-white/10">
            {getVehicleIcon(digitalIdentity.vehicleClass)}
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-brand-gray font-bold">
              DIGITAL IDENTITY
            </div>
            <div className="text-xs font-bold text-white uppercase">
              {digitalIdentity.vehicleClass} • {digitalIdentity.color}
            </div>
          </div>
        </div>

        {isBlacklist ? (
          <span className="flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest animate-pulse rounded">
            <ShieldAlert className="w-3 h-3" />
            WANTED
          </span>
        ) : (
          <span className="flex items-center gap-1 bg-brand-acid/15 text-brand-acid border border-brand-acid/40 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest rounded">
            <CheckCircle2 className="w-3 h-3" />
            VERIFIED
          </span>
        )}
      </div>

      {/* Center: License Plate Display */}
      <div className="my-4 flex items-center justify-between">
        <div
          className={`px-3 py-1.5 border-2 flex items-center space-x-2 font-mono font-bold text-lg tracking-wider rounded ${
            isCommercial
              ? 'bg-[#FFD700] text-black border-amber-500'
              : 'bg-white text-black border-white shadow-md'
          }`}
        >
          <div className="flex flex-col items-center pr-2 border-r border-black/30 text-[9px] leading-tight">
            <span>IND</span>
          </div>
          <span className="pl-1 tracking-wider">{digitalIdentity.plate}</span>
        </div>

        <div className="text-right font-mono border border-brand-acid/30 px-2.5 py-1 bg-brand-acid/15 text-brand-acid rounded">
          <div className="text-[8px] uppercase tracking-widest font-bold text-brand-acid/70">Confidence</div>
          <div className="text-sm font-black">{digitalIdentity.confidence}%</div>
        </div>
      </div>

      {/* Bottom: Location & Timestamp */}
      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono pt-3 border-t border-white/10 text-brand-gray uppercase font-bold tracking-widest">
        <div className="flex items-center space-x-1.5 truncate">
          <MapPin className="w-3 h-3 text-brand-acid flex-shrink-0" />
          <span className="truncate text-white/80">{digitalIdentity.cameraName}</span>
        </div>
        <div className="flex items-center justify-end space-x-1.5">
          <Clock className="w-3 h-3 text-white/60" />
          <span className="text-white/80">{digitalIdentity.timestamp}</span>
        </div>
      </div>

      {/* Blacklist FIR Details if flagged */}
      {isBlacklist && digitalIdentity.blacklistInfo && (
        <div className="mt-3 pt-3 border-t border-brand-purple/30 text-[9px] font-mono text-brand-paper flex justify-between items-center bg-brand-purple p-2 chamfer-card font-bold uppercase tracking-widest">
          <span>{digitalIdentity.blacklistInfo.category}</span>
          <strong className="underline text-brand-acid">{digitalIdentity.blacklistInfo.fir_number}</strong>
        </div>
      )}
    </div>
  );
}
