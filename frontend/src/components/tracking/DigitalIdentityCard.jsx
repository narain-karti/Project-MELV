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
      className={`bg-brand-paper border p-4 flex flex-col justify-between transition-all duration-300 relative overflow-hidden chamfer-card ${
        isBlacklist
          ? 'border-brand-purple shadow-editorial'
          : 'border-brand-black shadow-editorial hover:-translate-y-1 hover:-translate-x-1'
      }`}
    >
      {/* Top Identity Header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-black/20">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-black text-brand-paper p-1.5">
            {getVehicleIcon(digitalIdentity.vehicleClass)}
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-brand-gray font-bold">
              DIGITAL IDENTITY
            </div>
            <div className="text-xs font-bold text-brand-black uppercase">
              {digitalIdentity.vehicleClass} • {digitalIdentity.color}
            </div>
          </div>
        </div>

        {isBlacklist ? (
          <span className="flex items-center gap-1 bg-brand-purple text-brand-paper border border-brand-black px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest animate-pulse -rotate-2 shadow-editorial">
            <ShieldAlert className="w-3 h-3" />
            WANTED
          </span>
        ) : (
          <span className="flex items-center gap-1 bg-brand-black text-brand-acid border border-brand-black px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest rotate-1">
            <CheckCircle2 className="w-3 h-3" />
            VERIFIED
          </span>
        )}
      </div>

      {/* Center: License Plate Display */}
      <div className="my-4 flex items-center justify-between">
        <div
          className={`px-3 py-1.5 border-2 flex items-center space-x-2 font-mono font-bold text-lg tracking-wider transform -skew-x-6 ${
            isCommercial
              ? 'bg-[#FFD700] text-black border-black'
              : 'bg-white text-brand-black border-brand-black shadow-editorial'
          }`}
        >
          <div className="flex flex-col items-center pr-2 border-r border-brand-black text-[9px] leading-tight">
            <span>IND</span>
          </div>
          <span className="pl-1">{digitalIdentity.plate}</span>
        </div>

        <div className="text-right font-mono border border-brand-black px-2 py-1 bg-brand-acid text-brand-black rotate-1">
          <div className="text-[8px] uppercase tracking-widest font-bold">Confidence</div>
          <div className="text-sm font-bold">{digitalIdentity.confidence}%</div>
        </div>
      </div>

      {/* Bottom: Location & Timestamp */}
      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono pt-3 border-t border-brand-black/20 text-brand-gray uppercase font-bold tracking-widest">
        <div className="flex items-center space-x-1.5 truncate">
          <MapPin className="w-3 h-3 text-brand-black flex-shrink-0" />
          <span className="truncate">{digitalIdentity.cameraName}</span>
        </div>
        <div className="flex items-center justify-end space-x-1.5">
          <Clock className="w-3 h-3 text-brand-black" />
          <span>{digitalIdentity.timestamp}</span>
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
