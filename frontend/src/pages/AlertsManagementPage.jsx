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

  const handleAddTarget = (e) => {
    e.preventDefault();
    if (!newPlate.trim()) return;

    const newTarget = {
      plate_number: newPlate.trim().toUpperCase(),
      vehicle_desc: newDesc.trim() || 'Suspect Vehicle',
      category: newCategory,
      severity: 'CRITICAL',
      fir_number: `FIR-2026-BLR-${Math.floor(1000 + Math.random() * 9000)}`,
      flagged_by: 'Central Crime Branch (CCB)',
      registered_date: new Date().toISOString().split('T')[0],
      status: 'ACTIVE_PURSUIT'
    };

    setWatchlist([newTarget, ...watchlist]);
    setNewPlate('');
    setNewDesc('');
  };

  const handleExportDossier = () => {
    const reportText = `
========================================================================
             STATE POLICE DEPARTMENT - CRIME DISPATCH DOSSIER
                   PROJECT-MELV TRAJECTORY EVIDENCE LOG
========================================================================
Generated At: ${new Date().toISOString()}
Authority: State Traffic Management & Smart Cities Security Center
Jurisdiction: Bengaluru Central Business District (CBD)

ACTIVE HOTLIST TARGET IDENTIFIED:
------------------------------------------------------------------------
Plate Registration : KA03HA7712
Vehicle Model      : White Hyundai Creta (SUV)
Classification     : SUV (Confidence: 96.5%)
Color              : White
FIR Reference      : FIR-2026-BLR-0941
Infraction Type    : Stolen Vehicle / Highway Evasion

RECONSTRUCTED SPATIAL-TEMPORAL TRAJECTORY:
------------------------------------------------------------------------
1. Node CAM-01 [MG Road Northbound]       - 10:17:05 IST (Speed: 74 km/h)
2. Node CAM-02 [MG Road Trinity Junction]  - 10:18:42 IST (Speed: 89 km/h)
   Elapsed Corridor Duration: 97 seconds (2.4 km)
   Speed Limit Status: VIOLATION (+29 km/h over urban 60 km/h threshold)

NEXT-NODE INTERCEPT PREDICTION:
------------------------------------------------------------------------
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
    <div className="space-y-4 max-w-6xl mx-auto font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-surface-card border border-slate-800 p-3.5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <AlertOctagon className="w-4 h-4 text-crimson-alert" />
          <span className="font-bold text-slate-200">[TAB 05] LAW ENFORCEMENT & ALERTS DISPATCH</span>
        </div>

        <button
          onClick={handleExportDossier}
          className="chamfer-btn bg-crimson-alert hover:bg-red-500 text-white px-4 py-2 font-bold flex items-center justify-center space-x-2 shadow-hud-crimson transition-all"
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
        <div className="bg-crimson-alert/15 border-2 border-crimson-alert p-4 rounded-lg text-crimson-alert space-y-2 shadow-hud-crimson">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <Navigation className="w-5 h-5 text-crimson-alert animate-bounce" />
              <span>AUTOMATED INTERCEPT ADVISORY :: {interceptAlert.plate}</span>
            </div>
            <span className="text-[10px] bg-crimson-alert text-white px-2 py-0.5 rounded font-bold">
              ACTIVE PURSUIT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-crimson-alert/30 text-[11px] text-slate-200">
            <div>TARGET: <strong className="text-white">{interceptAlert.plate} (Wanted SUV)</strong></div>
            <div>PREDICTED INTERSECTION: <strong className="text-lime-hud">{interceptAlert.nodeName}</strong></div>
            <div>ESTIMATED ARRIVAL: <strong className="text-white">in ~{interceptAlert.etaSeconds}s</strong></div>
          </div>
        </div>
      )}

      {/* Add New Target Watchlist Form */}
      <div className="bg-surface-card border border-slate-800 p-4 rounded-lg">
        <div className="font-bold text-slate-200 mb-2">ADD VEHICLE TO CENTRAL BLACKLIST WATCH</div>
        <form onSubmit={handleAddTarget} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            type="text"
            value={newPlate}
            onChange={(e) => setNewPlate(e.target.value)}
            placeholder="PLATE NUMBER (e.g. KA01AB1234)"
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 uppercase focus:outline-none focus:border-lime-hud"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="DESCRIPTION (e.g. Black Scorpio)"
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-lime-hud"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-lime-hud"
          >
            <option value="Stolen Vehicle">Stolen Vehicle</option>
            <option value="Wanted Suspect">Wanted Suspect</option>
            <option value="Cloned Plate Evasion">Cloned Plate Evasion</option>
            <option value="Commercial Ban Infraction">Commercial Ban Infraction</option>
          </select>
          <button
            type="submit"
            className="chamfer-btn bg-lime-hud hover:bg-lime-400 text-black font-bold py-2 flex items-center justify-center space-x-1.5 shadow-hud-lime"
          >
            <Plus className="w-4 h-4" />
            <span>ENROLL TARGET</span>
          </button>
        </form>
      </div>

      {/* Active Watchlist Table */}
      <div className="bg-surface-card border border-slate-800 p-4 rounded-lg">
        <div className="font-bold text-slate-200 mb-2 flex items-center justify-between">
          <span>ACTIVE POLICE WATCHLIST & HOTLIST TARGETS</span>
          <span className="text-[10px] text-slate-400">TOTAL: {watchlist.length} TARGETS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="text-[10px] text-slate-400 border-b border-slate-800 pb-1">
              <tr>
                <th className="pb-1.5">REGISTRATION</th>
                <th className="pb-1.5">VEHICLE DETAILS</th>
                <th className="pb-1.5">CATEGORY</th>
                <th className="pb-1.5">FIR NUMBER</th>
                <th className="pb-1.5">FLAGGED BY</th>
                <th className="pb-1.5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {watchlist.map((w, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="py-2.5 font-bold text-crimson-alert font-mono">
                    <span className="bg-crimson-alert/15 px-2 py-0.5 rounded border border-crimson-alert/30">
                      {w.plate_number}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-200 font-sans">{w.vehicle_desc}</td>
                  <td className="py-2.5 text-slate-300 font-sans">{w.category}</td>
                  <td className="py-2.5 text-slate-400 font-mono text-[10px]">{w.fir_number}</td>
                  <td className="py-2.5 text-slate-400 font-sans text-[10px]">{w.flagged_by}</td>
                  <td className="py-2.5 text-right font-bold text-lime-hud">
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
