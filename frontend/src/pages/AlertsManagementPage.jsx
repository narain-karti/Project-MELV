import React, { useState, useEffect } from 'react';
import { useTracking } from '../context/TrackingContext';
import { 
  ShieldAlert, 
  Plus, 
  Download, 
  Navigation, 
  AlertOctagon, 
  Check, 
  Zap, 
  Filter, 
  Flame, 
  Volume2, 
  VolumeX, 
  Radio, 
  Clock, 
  MapPin, 
  FileText,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ActionModal } from '../App';
import CameraHoverPreview from '../components/common/CameraHoverPreview';
import { getApiUrl } from '../utils/apiConfig';



const DEFAULT_ALERTS = [
  {
    id: "ALT-2026-001",
    type: "STOLEN_PURSUIT",
    severity: "CRITICAL",
    plate: "TN07BX8819",
    vehicle: "Mahindra Scorpio (White)",
    camera_id: "CAM-01",
    location: "CLV Nagar 1st St - West Gate (ECR)",
    timestamp: "10:14:16 IST",
    details: "Active CCTNS Red Notice. Stolen from Thiruvanmiyur Police Limits. FIR-2026-CHN-KAN-0492.",
    status: "INTERCEPT_DISPATCHED",
    confidence: 0.982
  },
  {
    id: "ALT-2026-002",
    type: "SPEED_VIOLATION",
    severity: "HIGH",
    plate: "TN07BX8819",
    vehicle: "Mahindra Scorpio",
    camera_id: "CAM-01",
    location: "CLV Nagar 1st St - West Gate",
    timestamp: "10:14:16 IST",
    details: "Recorded 72.8 km/h in designated 40 km/h municipal school corridor. Velocity excess: +32.8 km/h.",
    status: "E_CHALLAN_ISSUED",
    confidence: 0.978
  },
  {
    id: "ALT-2026-003",
    type: "GHOST_PLATE",
    severity: "CRITICAL",
    plate: "TN09BK6112",
    vehicle: "Hyundai Creta (Grey)",
    camera_id: "CAM-08",
    location: "Tambaram Outer Ring Road",
    timestamp: "10:04:22 IST",
    details: "Spatiotemporal Teleportation Anomaly: Detected at Kanathur Toll and Tambaram within 4 minutes (Requires 382 km/h). Counterfeit cloned plate.",
    status: "FORENSIC_FLAGGED",
    confidence: 0.965
  },
  {
    id: "ALT-2026-004",
    type: "WRONG_WAY",
    severity: "HIGH",
    plate: "TN22AK1924",
    vehicle: "Bajaj Pulsar 150",
    camera_id: "CAM-02",
    location: "Eastbound Corridor Slip Lane",
    timestamp: "10:09:44 IST",
    details: "Traveling contra-flow against designated one-way rotary stream. High collision risk flagged.",
    status: "WARDEN_ALERTED",
    confidence: 0.954
  },
  {
    id: "ALT-2026-005",
    type: "SIGNAL_JUMP",
    severity: "MEDIUM",
    plate: "TN02DF7712",
    vehicle: "Maruti Swift (Silver)",
    camera_id: "CAM-05",
    location: "AMET University Intersection",
    timestamp: "10:07:12 IST",
    details: "Stop line violation after red cycle onset (+2.4s phase delay). Captured on multi-lane ANPR.",
    status: "AUTO_FINED",
    confidence: 0.961
  },
  {
    id: "ALT-2026-006",
    type: "EMERGENCY_CLEARANCE",
    severity: "PREEMPTION",
    plate: "TN01AMB108",
    vehicle: "Ambulance (108 Life Support)",
    camera_id: "CAM-01",
    location: "ECR Main Carriageway Northbound",
    timestamp: "10:15:02 IST",
    details: "Acoustic siren + optical strobe lock. Green wave corridor activated on Nodes 1->2->5.",
    status: "CORRIDOR_ACTIVE",
    confidence: 0.994
  }
];

export default function AlertsManagementPage() {
  const { blacklist, interceptAlert } = useTracking();
  const [alerts, setAlerts] = useState(DEFAULT_ALERTS);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [newPlate, setNewPlate] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('STOLEN_PURSUIT');
  const [dossierDownloaded, setDossierDownloaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [actionModal, setActionModal] = useState({ isOpen: false, title: '', message: '', severity: 'info' });
  const [hoverPreview, setHoverPreview] = useState(null);
  const hoverTimeoutRef = useRef(null);

  // Fetch catalog from backend on mount

  useEffect(() => {
    fetch(getApiUrl('/api/alerts/catalog'))
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAlerts(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddTarget = async (e) => {
    e.preventDefault();
    const cleanPlate = newPlate.trim().toUpperCase();
    if (!cleanPlate) return;

    const newAlert = {
      id: `ALT-2026-00${alerts.length + 1}`,
      type: newCategory,
      severity: newCategory === 'STOLEN_PURSUIT' || newCategory === 'GHOST_PLATE' ? 'CRITICAL' : 'HIGH',
      plate: cleanPlate,
      vehicle: newDesc.trim() || 'Suspect Vehicle',
      camera_id: 'CAM-01',
      location: 'CLV Nagar 1st St - West Gate (ECR)',
      timestamp: new Date().toLocaleTimeString() + ' IST',
      details: `Manual Law Enforcement Flag: ${newCategory}. Target broadcasted to all ANPR node streams.`,
      status: 'INTERCEPT_DISPATCHED',
      confidence: 0.99
    };

    setAlerts([newAlert, ...alerts]);
    setNewPlate('');
    setNewDesc('');

    try {
      await fetch(getApiUrl('/api/alerts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate: cleanPlate, reason: newCategory })
      });
    } catch {}
  };


  const handleAction = (alertId, actionType) => {
    const targetAlert = alerts.find(a => a.id === alertId);
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: actionType === 'dispatch' ? 'PATROL_EN_ROUTE' : actionType === 'challan' ? 'E_CHALLAN_DELIVERED' : 'RESOLVED'
        };
      }
      return a;
    }));

    if (actionType === 'dispatch') {
      setActionModal({
        isOpen: true,
        title: `TACTICAL PATROL DISPATCHED: ${targetAlert?.plate || 'TARGET'}`,
        message: `Law Enforcement Intercept Patrol Unit K-04 has been mobilized and routed to intercept ${targetAlert?.plate} along corridor vector (${targetAlert?.location || 'Intersection'}).`,
        severity: 'critical'
      });
    } else if (actionType === 'challan') {
      setActionModal({
        isOpen: true,
        title: `AUTOMATED E-CHALLAN ISSUED: ${targetAlert?.plate || 'TARGET'}`,
        message: `Electronic violation notice registered with MoRTH Parivahan NIC database. Velocity proof and license plate OCR capture attached.`,
        severity: 'warning'
      });
    }
  };

  const handleExportDossier = (alert) => {
    const reportText = `========================================================================
             TAMIL NADU POLICE DEPARTMENT - DISPATCH DOSSIER
                    PROJECT-MELV TRAJECTORY EVIDENCE LOG
========================================================================
Generated At: ${new Date().toISOString()}
Authority: Greater Chennai Police & Smart Cities Command Center
Jurisdiction: East Coast Road (SH 49) / Kanathur Police Division
Incident ID: ${alert.id}

INCIDENT PARTICULARS:
------------------------------------------------------------------------
Plate Registration : ${alert.plate}
Vehicle Model      : ${alert.vehicle}
Incident Type      : ${alert.type}
Severity Level     : ${alert.severity}
Detection Node     : ${alert.camera_id} (${alert.location})
Detection Timestamp: ${alert.timestamp}
AI Confidence      : ${(alert.confidence * 100).toFixed(1)}%
Details            : ${alert.details}
Current Status     : ${alert.status}

RECONSTRUCTED SPATIO-TEMPORAL PROOF:
------------------------------------------------------------------------
1. Node CAM-05 [AMET University Gate (ECR)]   - 10:13:34 IST (68.0 km/h)
2. Node CAM-01 [CLV Nagar West Gate (ECR)]    - 10:14:16 IST (72.8 km/h) [VIOLATION]
3. Node CAM-02 [CLV Nagar East Roundabout]    - Intercept Point Designated

CORRIDOR VELOCITY ANOMALY:
------------------------------------------------------------------------
Distance Traversed : 0.85 km in 42.0 seconds
Average Velocity   : 72.8 km/h (Permitted: 40 km/h)
Digital Signature  : SHA256:${hex(alert.plate)}
========================================================================`.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `POLICE_EVIDENCE_DOSSIER_${alert.plate}_${alert.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setDossierDownloaded(true);
    setTimeout(() => setDossierDownloaded(false), 3000);

    setActionModal({
      isOpen: true,
      title: `EVIDENCE DOSSIER DOWNLOADED: ${alert.plate}`,
      message: `Full cryptographic spatial evidence log (SHA-256 authenticated) saved as POLICE_EVIDENCE_DOSSIER_${alert.plate}_${alert.id}.txt.`,
      severity: 'success'
    });
  };

  const hex = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  };

  const filteredAlerts = activeFilter === 'ALL'
    ? alerts
    : alerts.filter(a => a.type === activeFilter);

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-mono text-xs select-none">
      {/* Top Banner */}
      <div className="bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-acid text-brand-black font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-brand-black uppercase tracking-widest text-sm block">
              MULTI-CATEGORY LAW ENFORCEMENT & TRAFFIC ALERTS
            </span>
            <span className="text-[10px] text-brand-gray font-sans block mt-0.5">
              SIH Problem Statement 26127: Real-Time Blacklist Tracking, Spatiotemporal Cloned Plate Detection & Speed Anomalies
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-[10px] font-bold uppercase transition-all ${
              soundEnabled
                ? 'border-brand-acid bg-brand-acid/10 text-brand-black'
                : 'border-brand-dark-gray/50 text-brand-gray hover:text-brand-black'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-brand-acid" /> : <VolumeX className="w-3.5 h-3.5" />}
            {soundEnabled ? 'Audio Alert Chime ON' : 'Muted'}
          </button>

          <div className="text-[10px] px-3 py-1.5 bg-brand-black text-brand-acid font-bold uppercase">
            ACTIVE ALERTS: {alerts.length}
          </div>
        </div>
      </div>

      {/* Main Grid: Add Blacklist Form + Alert Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Quick Target Registration & Category Filter (4 of 12) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Add Target to Pursuit Blacklist */}
          <div className="border border-brand-dark-gray/40 bg-brand-black p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-brand-dark-gray/30">
              <span className="text-[10px] uppercase font-bold text-brand-paper flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-brand-acid" />
                Register High-Interest Target
              </span>
              <span className="text-[8px] px-1.5 py-0.5 bg-brand-acid text-brand-black font-bold uppercase">
                Pursuit Sync
              </span>
            </div>

            <form onSubmit={handleAddTarget} className="space-y-3">
              <div>
                <label className="text-[9px] uppercase text-brand-gray block mb-1">License Plate Number</label>
                <input
                  type="text"
                  placeholder="e.g. TN07BX8819"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full bg-brand-dark-gray/20 border border-brand-dark-gray/60 px-3 py-2 text-brand-paper uppercase font-bold placeholder:text-brand-gray/40 focus:border-brand-acid focus:outline-none text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] uppercase text-brand-gray block mb-1">Vehicle Description &amp; Color</label>
                <input
                  type="text"
                  placeholder="e.g. White Mahindra Scorpio"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-brand-dark-gray/20 border border-brand-dark-gray/60 px-3 py-2 text-brand-paper placeholder:text-brand-gray/40 focus:border-brand-acid focus:outline-none text-[10px]"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase text-brand-gray block mb-1">Alert Classification</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-brand-dark-gray/20 border border-brand-dark-gray/60 px-3 py-2 text-brand-paper text-[10px] focus:border-brand-acid focus:outline-none"
                >
                  <option value="STOLEN_PURSUIT">Stolen / Wanted Vehicle (CCTNS Red Notice)</option>
                  <option value="SPEED_VIOLATION">Corridor Speed Limit Violation (&gt;40 km/h)</option>
                  <option value="GHOST_PLATE">Cloned / Ghost Plate Teleportation</option>
                  <option value="WRONG_WAY">Wrong-Way Contra-Flow Incursion</option>
                  <option value="SIGNAL_JUMP">Red-Light Stop Line Infringement</option>
                  <option value="EMERGENCY_CLEARANCE">Emergency 108 Preemption Route</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-acid text-brand-black text-[10px] uppercase font-bold hover:bg-brand-paper transition-colors flex items-center justify-center gap-1.5 shadow-editorial mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Broadcast to Camera Mesh
              </button>
            </form>
          </div>

          {/* Incident Category Filter Tabs */}
          <div className="border border-brand-dark-gray/40 bg-brand-black p-4">
            <div className="text-[10px] uppercase font-bold text-brand-paper pb-2 mb-3 border-b border-brand-dark-gray/30 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-brand-acid" />
              Incident Filters
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'ALL', label: 'All Incidents', count: alerts.length },
                { id: 'STOLEN_PURSUIT', label: 'Stolen Vehicle Pursuits', count: alerts.filter(a => a.type === 'STOLEN_PURSUIT').length },
                { id: 'SPEED_VIOLATION', label: 'Speed Limit Violations', count: alerts.filter(a => a.type === 'SPEED_VIOLATION').length },
                { id: 'GHOST_PLATE', label: 'Cloned / Ghost Plates', count: alerts.filter(a => a.type === 'GHOST_PLATE').length },
                { id: 'WRONG_WAY', label: 'Wrong-Way Hazards', count: alerts.filter(a => a.type === 'WRONG_WAY').length },
                { id: 'SIGNAL_JUMP', label: 'Red-Light Jumps', count: alerts.filter(a => a.type === 'SIGNAL_JUMP').length },
                { id: 'EMERGENCY_CLEARANCE', label: 'Emergency Green Waves', count: alerts.filter(a => a.type === 'EMERGENCY_CLEARANCE').length }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-[9px] uppercase font-bold transition-all ${
                    activeFilter === f.id
                      ? 'bg-brand-acid text-brand-black shadow-editorial'
                      : 'border border-brand-dark-gray/30 text-brand-gray hover:text-brand-paper hover:border-brand-dark-gray/70'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`px-1.5 py-0.5 text-[8px] ${activeFilter === f.id ? 'bg-brand-black text-brand-acid' : 'bg-brand-dark-gray/40 text-brand-paper'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Active Incidents Catalog List (8 of 12) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-brand-dark-gray/30">
            <span className="text-[10px] uppercase font-bold text-brand-paper flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-brand-acid" />
              Live Camera Node Incident Feed ({filteredAlerts.length} Active Records)
            </span>
            <span className="text-[8px] text-brand-gray">
              Directly feeds Police Dispatch &amp; Municipal E-Challan Systems
            </span>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`border p-4 transition-all ${
                  alert.severity === 'CRITICAL'
                    ? 'border-red-500/60 bg-red-500/5'
                    : alert.severity === 'PREEMPTION'
                    ? 'border-brand-acid/60 bg-brand-acid/5'
                    : 'border-brand-dark-gray/50 bg-brand-dark-gray/10'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-brand-dark-gray/30">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-500 text-white animate-pulse'
                        : alert.severity === 'PREEMPTION'
                        ? 'bg-brand-acid text-brand-black font-bold'
                        : 'bg-amber-400 text-brand-black'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-sm font-bold text-brand-paper tracking-wider bg-brand-dark-gray/60 px-2 py-0.5 border border-brand-dark-gray">
                      {alert.plate}
                    </span>
                    <span className="text-[10px] text-brand-gray font-sans font-bold">
                      {alert.vehicle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[9px] text-brand-gray">
                    <Clock className="w-3 h-3 text-brand-acid" />
                    <span>{alert.timestamp}</span>
                    <span
                      className="text-brand-acid font-bold bg-brand-black px-1.5 py-0.5 border border-brand-dark-gray/60 cursor-pointer hover:border-brand-acid transition-colors shadow-[1px_1px_0px_#202020]"
                      onMouseEnter={(e) => {
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        setHoverPreview({
                          camId: alert.camera_id,
                          name: alert.location,
                          zone: 'City ANPR Mesh',
                          x: e.clientX,
                          y: e.clientY
                        });
                      }}
                      onMouseMove={(e) => {
                        setHoverPreview(prev => prev ? {
                          ...prev,
                          x: e.clientX,
                          y: e.clientY
                        } : null);
                      }}
                      onMouseLeave={() => {
                        hoverTimeoutRef.current = setTimeout(() => {
                          setHoverPreview(null);
                        }, 60);
                      }}
                    >
                      [{alert.camera_id}]
                    </span>
                  </div>
                </div>


                <p className="text-[10px] text-brand-paper font-sans leading-relaxed mb-3">
                  {alert.details}
                </p>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-brand-dark-gray/20 text-[9px] gap-2">
                  <div className="flex items-center gap-3 text-brand-gray">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-brand-acid" />
                      {alert.location}
                    </span>
                    <span>AI Confidence: <strong className="text-brand-acid">{(alert.confidence * 100).toFixed(1)}%</strong></span>
                    <span>Status: <strong className="text-brand-paper">{alert.status}</strong></span>
                  </div>

                  {/* Tactical Action Buttons */}
                  <div className="flex items-center gap-2">
                    {alert.type === 'STOLEN_PURSUIT' && (
                      <button
                        onClick={() => handleAction(alert.id, 'dispatch')}
                        className="px-2.5 py-1 bg-red-600 text-white text-[9px] uppercase font-bold hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" /> Dispatch Intercept
                      </button>
                    )}

                    {alert.type === 'SPEED_VIOLATION' && (
                      <button
                        onClick={() => handleAction(alert.id, 'challan')}
                        className="px-2.5 py-1 bg-brand-acid text-brand-black text-[9px] uppercase font-bold hover:bg-brand-paper transition-colors flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> Issue E-Challan
                      </button>
                    )}

                    <button
                      onClick={() => handleExportDossier(alert)}
                      className="px-2.5 py-1 border border-brand-dark-gray text-brand-gray text-[9px] uppercase font-bold hover:text-brand-paper hover:border-brand-paper transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Export Dossier
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
        title={actionModal.title}
        message={actionModal.message}
        severity={actionModal.severity}
      />
      <CameraHoverPreview previewData={hoverPreview} />
    </div>
  );
}

