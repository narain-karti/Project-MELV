import React, { useState } from 'react';
import { useTracking } from '../context/TrackingContext';
import { ShieldAlert, Plus, Download, Navigation, AlertOctagon, Check } from 'lucide-react';

export default function AlertsManagementPage() {
  const { blacklist, interceptAlert } = useTracking();
  const [watchlist, setWatchlist] = useState(blacklist);
  const [newPlate, setNewPlate] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Stolen Vehicle');
  const [dossierDownloaded, setDossierDownloaded] = useState(false);

  const handleAddTarget = async (e) => {
    e.preventDefault();
    const cleanPlate = newPlate.trim().toUpperCase();
    if (!cleanPlate) return;

    const newTarget = {
      plate_number: cleanPlate,
      vehicle_desc: newDesc.trim() || 'Suspect Vehicle',
      category: newCategory,
      severity: 'CRITICAL',
      fir_number: `FIR-2026-CHN-KAN-${Math.floor(1000 + Math.random() * 9000)}`,
      flagged_by: 'Kanathur Police Station, Chennai',
      registered_date: new Date().toISOString().split('T')[0],
      status: 'ACTIVE_PURSUIT'
    };

    setWatchlist([newTarget, ...watchlist]);
    setNewPlate('');
    setNewDesc('');

    try {
      await fetch('http://localhost:8000/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate: cleanPlate, reason: newCategory })
      });
    } catch (err) {
      console.warn('Backend alert update fallback:', err);
    }
  };

  const handleExportDossier = () => {
    const reportText = `
========================================================================
             TAMIL NADU POLICE DEPARTMENT - DISPATCH DOSSIER
                   PROJECT-MELV TRAJECTORY EVIDENCE LOG
========================================================================
Generated At: ${new Date().toISOString()}
Authority: Greater Chennai Police & Smart Cities Command Center
Jurisdiction: East Coast Road (SH 49) / Kanathur Police Division

ACTIVE HOTLIST TARGET IDENTIFIED:
------------------------------------------------------------------------
Plate Registration : TN07BX8819
Vehicle Model      : White Mahindra Scorpio (SUV)
Classification     : SUV (Confidence: 96.9%)
Color              : White
FIR Reference      : FIR-2026-CHN-KAN-0492
Infraction Type    : Stolen Vehicle / High-Speed Corridor Evasion

RECONSTRUCTED SPATIAL-TEMPORAL TRAJECTORY:
------------------------------------------------------------------------
1. Node CAM-05 [AMET University Campus Gate (ECR)]  - 10:13:34 IST (Speed: 68 km/h)
2. Node CAM-01 [CLV Nagar 1st St - West Gate (ECR)] - 10:14:16 IST (Speed: 72.8 km/h)
   Elapsed Corridor Duration: 42 seconds (0.85 km)
   Speed Limit Status: VIOLATION (+22.8 km/h over urban 50 km/h threshold)

NEXT-NODE INTERCEPT PREDICTION:
------------------------------------------------------------------------
Target Node        : Node CAM-02 [CLV Nagar 1st St - East Junction]
Predicted ETA      : 14 Seconds from current position
Tactical Advisory  : Dispatch Kanathur Intercept Unit K-04 to block exit onto Reddykuppam Rd

Predicted Heading : Eastbound towards Old Airport Road
Next Target Node  : CAM-04 (Domlur Flyover Ramp)
Estimated Arrival : 10:22:22 IST (ETA: ~3 minutes 40 seconds)
Recommended Action: Automated Intercept Alert Dispatched to Beat Patrol 14

AUTHENTICATION HASH: 9fa87b32c041ee6d901842eb3a8712
========================================================================
`.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `POLICE_EVIDENCE_DOSSIER_KA03HA7712.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setDossierDownloaded(true);
    setTimeout(() => setDossierDownloaded(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <AlertOctagon className="w-6 h-6 text-brand-purple" />
          <span className="font-bold text-brand-black uppercase tracking-widest text-[11px] md:text-sm">LAW ENFORCEMENT & ALERTS DISPATCH</span>
        </div>

        <button
          onClick={handleExportDossier}
          className="chamfer-btn bg-brand-purple text-brand-paper px-6 py-3 font-bold flex items-center justify-center space-x-2 shadow-editorial border-2 border-brand-black hover:bg-brand-black hover:text-brand-purple transition-all"
        >
          {dossierDownloaded ? (
            <>
              <Check className="w-4 h-4" />
              <span>DOSSIER EXPORTED</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>EXPORT INCIDENT DOSSIER</span>
            </>
          )}
        </button>
      </div>

      {/* Active Intercept Alert Card if available */}
      {interceptAlert && (
        <div className="bg-brand-purple border-2 border-brand-black p-5 chamfer-card text-brand-paper space-y-4 shadow-editorial transform -rotate-1">
          <div className="flex items-center justify-between border-b border-brand-black/20 pb-3">
            <div className="flex items-center space-x-3 font-bold text-sm uppercase tracking-widest">
              <Navigation className="w-6 h-6 text-brand-acid animate-bounce" />
              <span>AUTOMATED INTERCEPT ADVISORY :: {interceptAlert.plate}</span>
            </div>
            <span className="text-[10px] bg-brand-black text-brand-acid px-3 py-1 font-bold shadow-editorial rotate-2">
              ACTIVE PURSUIT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] font-bold uppercase tracking-widest">
            <div>TARGET: <strong className="text-brand-acid block mt-1">{interceptAlert.plate} (Wanted SUV)</strong></div>
            <div>PREDICTED INTERSECTION: <strong className="text-brand-acid block mt-1">{interceptAlert.nodeName}</strong></div>
            <div>ESTIMATED ARRIVAL: <strong className="text-brand-acid block mt-1">in ~{interceptAlert.etaSeconds}s</strong></div>
          </div>
        </div>
      )}

      {/* Add New Target Watchlist Form */}
      <div className="bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial">
        <div className="font-bold text-brand-black uppercase tracking-widest text-[11px] mb-4 border-b border-brand-black/20 pb-3">ADD VEHICLE TO CENTRAL BLACKLIST WATCH</div>
        <form onSubmit={handleAddTarget} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={newPlate}
            onChange={(e) => setNewPlate(e.target.value)}
            placeholder="PLATE NUMBER (e.g. KA01AB1234)"
            className="bg-white border-2 border-brand-black chamfer-card shadow-editorial px-4 py-3 text-brand-black uppercase font-bold tracking-widest focus:outline-none focus:border-brand-purple placeholder:text-brand-gray"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="DESCRIPTION (e.g. Black Scorpio)"
            className="bg-white border-2 border-brand-black chamfer-card shadow-editorial px-4 py-3 text-brand-black font-bold tracking-widest uppercase focus:outline-none focus:border-brand-purple placeholder:text-brand-gray"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-white border-2 border-brand-black chamfer-card shadow-editorial px-4 py-3 text-brand-black font-bold tracking-widest uppercase focus:outline-none focus:border-brand-purple"
          >
            <option value="Stolen Vehicle">Stolen Vehicle</option>
            <option value="Wanted Suspect">Wanted Suspect</option>
            <option value="Cloned Plate Evasion">Cloned Plate Evasion</option>
            <option value="Commercial Ban Infraction">Commercial Ban Infraction</option>
          </select>
          <button
            type="submit"
            className="chamfer-btn bg-brand-acid text-brand-black font-bold py-3 flex items-center justify-center space-x-2 border-2 border-brand-black shadow-editorial hover:bg-brand-black hover:text-brand-acid transition-all uppercase tracking-widest"
          >
            <Plus className="w-5 h-5" />
            <span>ENROLL TARGET</span>
          </button>
        </form>
      </div>

      {/* Active Watchlist Table */}
      <div className="bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial">
        <div className="font-bold text-brand-black uppercase tracking-widest text-[11px] mb-4 border-b border-brand-black/20 pb-3 flex items-center justify-between">
          <span>ACTIVE POLICE WATCHLIST & HOTLIST TARGETS</span>
          <span className="text-[9px] text-brand-gray bg-brand-black text-brand-paper px-2 py-1 shadow-editorial">TOTAL: {watchlist.length} TARGETS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] uppercase tracking-widest">
            <thead className="text-[9px] text-brand-gray border-b border-brand-black pb-2 font-bold">
              <tr>
                <th className="pb-2">REGISTRATION</th>
                <th className="pb-2">VEHICLE DETAILS</th>
                <th className="pb-2">CATEGORY</th>
                <th className="pb-2">FIR NUMBER</th>
                <th className="pb-2">FLAGGED BY</th>
                <th className="pb-2 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-black/20">
              {watchlist.map((w, idx) => (
                <tr key={idx} className="hover:bg-brand-acid/30 transition-colors">
                  <td className="py-3 font-bold text-brand-purple font-mono">
                    <span className="bg-brand-purple text-brand-paper px-2 py-1 border border-brand-black shadow-editorial -rotate-1 inline-block">
                      {w.plate_number}
                    </span>
                  </td>
                  <td className="py-3 text-brand-black font-bold">{w.vehicle_desc}</td>
                  <td className="py-3 text-brand-black font-bold">{w.category}</td>
                  <td className="py-3 text-brand-dark-gray font-mono">{w.fir_number}</td>
                  <td className="py-3 text-brand-dark-gray font-sans">{w.flagged_by}</td>
                  <td className="py-3 text-right font-bold text-brand-black bg-white/50">
                    {w.status || 'WATCHLIST'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
