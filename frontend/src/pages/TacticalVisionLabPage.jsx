import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTracking } from '../context/TrackingContext';
import { 
  Video, 
  Camera, 
  Radio, 
  Eye, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Layers, 
  Sliders, 
  Play, 
  Pause, 
  RotateCcw, 
  Car, 
  Gauge, 
  Clock, 
  Navigation, 
  Crosshair, 
  TrendingUp, 
  Cpu, 
  RefreshCw, 
  ExternalLink,
  Flame,
  ArrowUpRight,
  Zap,
  Box,
  CornerDownRight,
  ShieldCheck
} from 'lucide-react';
import bytetrackData from '../data/bytetrack_anpr_demo.json';
import trafficData from '../data/traffic_analysis_data.json';
import IntersectionDigitalTwin3D from '../components/tracking/IntersectionDigitalTwin3D';

export default function TacticalVisionLabPage() {
  const { isPlaying, setIsPlaying, setDigitalIdentity, setConsoleLogs, setNotifications } = useTracking();
  const [selectedCam, setSelectedCam] = useState('ROUNDABOUT-4WAY');
  const [streamMode, setStreamMode] = useState('baked'); // 'baked' (30 FPS hardware accelerated) or 'live' (FastAPI RTSP)
  const [videoTime, setVideoTime] = useState(0);
  const [activeTracks, setActiveTracks] = useState([]);
  
  // Backend Telemetry State (From FastAPI Master Server on :8000)
  const [backendOnline, setBackendOnline] = useState(true);
  const [backendTelemetry, setBackendTelemetry] = useState(null);

  // Counters for the session
  const [inflowCount, setInflowCount] = useState(1);
  const [outflowCount, setOutflowCount] = useState(0);

  const videoRef = useRef(null);

  const cameraMeta = {
    'ROUNDABOUT-4WAY': {
      id: 'ROUNDABOUT-4WAY',
      name: 'Supervision 4-Way Roundabout Intersection',
      videoSrc: '/videos/traffic_analysis.mp4',
      fps: '29.0',
      resolution: '1920x1080 (Full HD)',
      speedLimit: '40 km/h',
      modelType: 'Supervision Multi-Zone + ByteTrack + Trajectory Footprints'
    },
    'CAM-01': {
      id: 'CAM-01',
      name: 'CLV Nagar 1st St - West Gate (ECR)',
      videoSrc: '/videos/cam_01_annotated.mp4',
      fps: '29.92',
      resolution: '1080p Stream',
      speedLimit: '50 km/h',
      modelType: 'YOLOv8 + ByteTrack + ANPR + Footprints'
    },
    'CAM-02': {
      id: 'CAM-02',
      name: 'CLV Nagar 1st St - East Junction',
      videoSrc: '/videos/cam_02_annotated.mp4',
      fps: '29.92',
      resolution: '1080p Stream',
      speedLimit: '40 km/h',
      modelType: 'YOLOv8 + ByteTrack + ANPR + Footprints'
    }
  };

  const camConfig = cameraMeta[selectedCam] || cameraMeta['ROUNDABOUT-4WAY'];
  const isRoundabout = selectedCam === 'ROUNDABOUT-4WAY';

  // =========================================================================
  // REAL-TIME BACKEND TELEMETRY POLLING (FASTAPI PORT 8000)
  // =========================================================================
  useEffect(() => {
    let active = true;

    const fetchTelemetry = async () => {
      try {
        const queryCam = selectedCam === 'ROUNDABOUT-4WAY' ? 'CAM-01' : selectedCam;
        const res = await fetch(`http://localhost:8000/api/telemetry?camera=${queryCam}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setBackendTelemetry(data);
            setBackendOnline(true);
            if (data.metrics) {
              setInflowCount(data.metrics.inflow_count ?? 1);
              setOutflowCount(data.metrics.outflow_count ?? 0);
            }

            if (data.active_alerts && data.active_alerts.length > 0 && setDigitalIdentity) {
              const alertCar = data.active_alerts[0];
              setDigitalIdentity({
                plate: alertCar.plate,
                plateType: 'standard_private',
                vehicleClass: 'Wanted Target',
                color: 'White',
                confidence: (alertCar.conf * 100).toFixed(1),
                timestamp: alertCar.timestamp || new Date().toLocaleTimeString('en-IN') + ' IST',
                cameraName: camConfig.name,
                cameraId: selectedCam,
                isBlacklist: true,
                blacklistInfo: {
                  category: 'Stolen Vehicle / Alert',
                  fir_number: 'FIR-2026-CHN-KAN-0492',
                  severity: 'CRITICAL'
                }
              });
            }
          }
        } else {
          if (active) setBackendOnline(false);
        }
      } catch (err) {
        if (active) setBackendOnline(false);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1200);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedCam, camConfig.name, setDigitalIdentity]);

  // Video timeupdate hook
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setVideoTime(videoRef.current.currentTime);
  };

  const liveAlert = backendTelemetry?.active_alerts?.[0];
  const recentScannedPlates = backendTelemetry?.recent_scanned_plates || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-xs select-none">
      
      {/* Editorial Header Banner */}
      <div className="bg-brand-paper border-2 border-brand-black p-5 chamfer-card shadow-editorial flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-[10px] font-bold text-brand-paper bg-brand-black px-2 py-1 shadow-editorial uppercase tracking-widest">
              [ADVANCED VISION LAB]
            </span>
            <span className="text-brand-black font-bold uppercase tracking-widest text-[12px] md:text-sm">
              SUPERVISION 4-WAY INTERSECTION & CORRIDOR INTELLIGENCE
            </span>
          </div>
          <p className="text-brand-gray font-bold text-xs uppercase tracking-widest leading-relaxed">
            Multi-Zone Traffic Analysis (Roboflow Supervision × ByteTrack) + Ground-Plane Digital Twin + Thermal Congestion Heatmaps.
            Full 30 FPS hardware-accelerated playback with zero frame stutter.
          </p>
        </div>

        {/* Camera Feed Selector Switches */}
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 border-2 border-brand-black bg-brand-black text-brand-paper font-mono text-[10px] font-bold shadow-editorial">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-brand-acid animate-ping' : 'bg-red-500'}`}></span>
            <span>AI CORE: {backendOnline ? 'ONLINE (:8000)' : 'STANDALONE'}</span>
          </div>

          <div className="flex items-center border-2 border-brand-black shadow-editorial bg-white">
            <button
              onClick={() => setSelectedCam('ROUNDABOUT-4WAY')}
              className={`px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider transition-all ${
                selectedCam === 'ROUNDABOUT-4WAY' ? 'bg-brand-acid text-brand-black' : 'text-brand-gray hover:text-brand-black'
              }`}
            >
              4-WAY ROUNDABOUT
            </button>
            <button
              onClick={() => setSelectedCam('CAM-01')}
              className={`px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider transition-all border-l border-brand-black ${
                selectedCam === 'CAM-01' ? 'bg-brand-acid text-brand-black' : 'text-brand-gray hover:text-brand-black'
              }`}
            >
              CAM-01 (WEST)
            </button>
            <button
              onClick={() => setSelectedCam('CAM-02')}
              className={`px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider transition-all border-l border-brand-black ${
                selectedCam === 'CAM-02' ? 'bg-brand-acid text-brand-black' : 'text-brand-gray hover:text-brand-black'
              }`}
            >
              CAM-02 (EAST)
            </button>
          </div>
        </div>
      </div>

      {/* Main Vision Grid: 70% Left Video Stream / 30% Right Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Real-Time Annotated Video Stream & Digital Twin (8 of 12 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Video Viewport Container */}
          <div className="space-y-3">
            {/* Top Video Header & Mode Toggle */}
            <div className="bg-brand-paper border-2 border-brand-black px-4 py-3 chamfer-card shadow-editorial flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-acid animate-pulse"></span>
                <span className="font-bold text-brand-black uppercase tracking-widest text-[11px]">
                  {camConfig.name}
                </span>
                <span className="bg-brand-black text-brand-acid px-1.5 py-0.5 text-[8px] font-bold">
                  {camConfig.resolution}
                </span>
              </div>

              {/* Stream Mode Switcher */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setStreamMode('baked')}
                  className={`px-2.5 py-1 text-[9px] font-bold border border-brand-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[1px_1px_0px_#202020] ${
                    streamMode === 'baked' ? 'bg-brand-acid text-brand-black font-bold' : 'bg-white text-brand-gray hover:text-brand-black'
                  }`}
                >
                  <Radio className="w-3 h-3 text-brand-black animate-pulse" />
                  <span>30 FPS AI BAKE (SMOOTH LOOP)</span>
                </button>
                <button
                  onClick={() => setStreamMode('live')}
                  className={`px-2.5 py-1 text-[9px] font-bold border border-brand-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[1px_1px_0px_#202020] ${
                    streamMode === 'live' ? 'bg-brand-acid text-brand-black font-bold' : 'bg-white text-brand-gray hover:text-brand-black'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                  <span>LIVE RTSP MESH (:8000)</span>
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="relative bg-brand-black border-2 border-brand-black chamfer-card overflow-hidden shadow-editorial min-h-[460px] flex items-center justify-center">
              {streamMode === 'baked' ? (
                <div className="relative w-full h-[480px] bg-black flex items-center justify-center overflow-hidden">
                  <video
                    ref={videoRef}
                    key={`baked-${selectedCam}`}
                    src={camConfig.videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-3 left-3 bg-brand-black/90 border border-brand-acid text-brand-acid px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest shadow-editorial flex items-center gap-2 z-20">
                    <span className="w-2 h-2 rounded-full bg-brand-acid animate-ping"></span>
                    <span>30 FPS HARDWARE-ACCELERATED {isRoundabout ? 'SUPERVISION 4-WAY ENGINE' : 'AI VISION BAKE'}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-brand-black/90 border border-brand-black text-brand-paper px-2 py-1 text-[9px] font-bold uppercase tracking-widest shadow-editorial z-20">
                    TIMECODE: <span className="text-brand-acid">{videoTime.toFixed(1)}s</span>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-[480px] bg-black flex items-center justify-center">
                  <img
                    src={`http://localhost:8000/api/stream/cctv?camera=${selectedCam === 'ROUNDABOUT-4WAY' ? 'CAM-01' : selectedCam}`}
                    alt="Live CCTV Computer Vision Stream"
                    className="w-full h-full object-contain"
                    onError={() => {
                      console.warn("Backend live stream unavailable. Switching to 30 FPS pre-rendered video.");
                      setStreamMode('baked');
                    }}
                  />
                  <div className="absolute bottom-3 left-3 bg-brand-black/90 border border-brand-acid text-brand-acid px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest shadow-editorial flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                    <span>LIVE RTSP MESH STREAM (FASTAPI :8000)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tactical Status Ribbon */}
            <div className="bg-brand-paper border-2 border-brand-black p-3 chamfer-card shadow-editorial flex flex-wrap items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-wider">
              <span className="text-brand-gray flex items-center gap-1.5 mr-2">
                <Cpu className="w-3.5 h-3.5 text-brand-black" />
                PIPELINE: <strong className="text-brand-black bg-brand-acid px-1.5 py-0.5">{camConfig.modelType}</strong>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-brand-black text-brand-acid px-2 py-1 text-[8.5px] font-bold">
                  FPS: {camConfig.fps}
                </span>
                <span className="bg-white border border-brand-black px-2 py-1 text-[8.5px] font-bold text-brand-black">
                  RESOLUTION: {camConfig.resolution}
                </span>
                <span className="bg-brand-purple text-brand-paper px-2 py-1 text-[8.5px] font-bold">
                  FOOTPRINTS: ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* 3D Digital Twin & Thermal Blueprint (Directly below video) */}
          <div className="space-y-2">
            <IntersectionDigitalTwin3D currentTime={videoTime} isPlaying={isPlaying} />
          </div>

        </div>

        {/* Right Column: Live Tactical Analysis Panels (4 of 12 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {isRoundabout ? (
            /* ============================================================= */
            /* 4-WAY INTERSECTION SPECIFIC TELEMETRY PANELS                  */
            /* ============================================================= */
            <>
              {/* Panel 1: 4-Way Approach Inflow & Outflow Matrix */}
              <div className="bg-brand-paper border-2 border-brand-black p-4 chamfer-card shadow-editorial space-y-3">
                <div className="flex items-center justify-between border-b border-brand-black/20 pb-2">
                  <span className="font-bold text-brand-black uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-brand-acid bg-brand-black p-0.5" />
                    4-WAY APPROACH INFLOW / OUTFLOW
                  </span>
                  <span className="bg-brand-acid text-brand-black px-1.5 py-0.5 text-[8.5px] font-bold shadow-editorial">
                    SUPERVISION ZONES
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase">
                  <div className="bg-white border border-brand-black p-2 shadow-[1px_1px_0px_#202020]">
                    <div className="text-brand-gray text-[8px]">TOTAL OBSERVED</div>
                    <div className="text-lg font-black text-brand-black">{trafficData.kpis.total_vehicles_observed} VEHICLES</div>
                    <div className="text-brand-acid bg-brand-black px-1 text-[8px] inline-block mt-0.5">
                      {trafficData.kpis.peak_throughput}
                    </div>
                  </div>
                  <div className="bg-white border border-brand-black p-2 shadow-[1px_1px_0px_#202020]">
                    <div className="text-brand-gray text-[8px]">LEVEL OF SERVICE</div>
                    <div className="text-lg font-black text-brand-purple">{trafficData.kpis.level_of_service}</div>
                    <div className="text-brand-gray text-[8px] inline-block mt-0.5">
                      DELAY: {trafficData.kpis.mean_intersection_delay}
                    </div>
                  </div>
                </div>

                {/* 4 Approach Arm Detail Bars */}
                <div className="space-y-1.5 text-[9px] font-bold uppercase">
                  {Object.entries(trafficData.approaches).map(([key, app]) => (
                    <div key={key} className="p-2 bg-white border border-brand-black shadow-[1px_1px_0px_#202020] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: app.color }}></span>
                        <span className="text-brand-black">{key} ARM:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-brand-dark-gray">IN: <strong>{app.in_count}</strong></span>
                        <span className="text-brand-dark-gray">OUT: <strong>{app.out_count}</strong></span>
                        <span className="bg-brand-black text-brand-paper px-1 text-[8px]">{app.flow_rate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel 2: 12-Movement Turning Distribution & Conflict Analysis */}
              <div className="bg-brand-paper border-2 border-brand-black p-4 chamfer-card shadow-editorial space-y-3">
                <div className="flex items-center justify-between border-b border-brand-black/20 pb-2">
                  <span className="font-bold text-brand-black uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                    <CornerDownRight className="w-3.5 h-3.5 text-brand-purple bg-brand-paper border border-brand-black" />
                    TURNING MOVEMENTS & OD MATRIX
                  </span>
                  <span className="bg-brand-black text-brand-paper px-1.5 py-0.5 text-[8.5px] font-bold shadow-editorial">
                    BYTETRACK PATHS
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {trafficData.turning_matrix.map((tm, idx) => (
                    <div key={idx} className="p-2 bg-white border border-brand-black shadow-[1px_1px_0px_#202020] text-[9px] space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-brand-black">{tm.from} → {tm.to}</span>
                        <span className="bg-brand-acid text-brand-black px-1.5 py-0.2">{tm.movement}</span>
                      </div>
                      <div className="flex items-center justify-between text-[8px] text-brand-gray font-bold">
                        <span>VOLUME: {tm.count} VEH ({tm.pct}%)</span>
                        <span className={tm.conflict_risk === 'Low' ? 'text-green-600' : 'text-amber-600'}>
                          RISK: {tm.conflict_risk}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-black h-full" 
                          style={{ width: `${tm.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel 3: Vehicle Fleet Classification Distribution */}
              <div className="bg-brand-paper border-2 border-brand-black p-4 chamfer-card shadow-editorial space-y-3">
                <div className="flex items-center justify-between border-b border-brand-black/20 pb-2">
                  <span className="font-bold text-brand-black uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-brand-black" />
                    FLEET CLASSIFICATION METRICS
                  </span>
                  <span className="bg-brand-acid text-brand-black px-1.5 py-0.5 text-[8.5px] font-bold shadow-editorial">
                    YOLOv8 CLASSES
                  </span>
                </div>

                <div className="space-y-2 text-[9px] font-bold uppercase">
                  {trafficData.class_distribution.map((cls, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between text-brand-black">
                        <span>{cls.name}:</span>
                        <span>{cls.count} ({cls.pct}%)</span>
                      </div>
                      <div className="w-full bg-zinc-200 h-2 border border-brand-black">
                        <div 
                          className="h-full" 
                          style={{ width: `${cls.pct}%`, backgroundColor: cls.color }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel 4: Emergency Green Corridor Dispatch Button */}
              <div className="bg-brand-black border-2 border-brand-black p-4 chamfer-card shadow-editorial text-brand-paper space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-acid uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-brand-acid animate-pulse" />
                    EMERGENCY GREEN CORRIDOR
                  </span>
                  <span className="w-2 h-2 rounded-full bg-brand-acid animate-ping"></span>
                </div>
                <p className="text-[9px] text-brand-gray leading-relaxed uppercase">
                  Preempts roundabout circulatory flow to provide zero-wait green corridor for inbound emergency ambulances or VIP security convoys.
                </p>
                <button
                  onClick={() => {
                    if (setNotifications) {
                      setNotifications(prev => [
                        {
                          id: Date.now(),
                          title: 'GREEN CORRIDOR PREEMPTION ACTIVE',
                          desc: '4-Way Roundabout cleared for Emergency Convoy on West Expressway approach',
                          severity: 'critical',
                          timestamp: new Date().toLocaleTimeString('en-IN') + ' IST'
                        },
                        ...prev
                      ]);
                    }
                    alert('⚡ EMERGENCY GREEN CORRIDOR ACTIVATED:\nRoundabout entry metering signals throttled on North & East approaches. West Expressway granted continuous right-of-way transit.');
                  }}
                  className="w-full bg-brand-acid text-brand-black font-bold uppercase tracking-widest text-[10px] py-2.5 border border-brand-black shadow-editorial hover:bg-brand-paper transition-all"
                >
                  TRIGGER GREEN WAVE PREEMPTION
                </button>
              </div>
            </>
          ) : (
            /* ============================================================= */
            /* CORRIDOR SPECIFIC (CAM-01 / CAM-02) TELEMETRY PANELS          */
            /* ============================================================= */
            <>
              {/* Panel 1: Live Traffic Vehicle Density Matrix */}
              <div className="bg-brand-paper border-2 border-brand-black p-4 chamfer-card shadow-editorial space-y-3">
                <div className="flex items-center justify-between border-b border-brand-black/20 pb-2">
                  <span className="font-bold text-brand-black uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-brand-acid bg-brand-black p-0.5" />
                    VEHICLE DENSITY & FLOW MATRIX
                  </span>
                  <span className="bg-brand-acid text-brand-black px-1.5 py-0.5 text-[8.5px] font-bold shadow-editorial">
                    SUPERVISION API
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase">
                  <div className="bg-white border border-brand-black p-2 shadow-[1px_1px_0px_#202020]">
                    <div className="text-brand-gray text-[8.5px]">ACTIVE IN SCENE</div>
                    <div className="text-lg font-black text-brand-black">{selectedCam === 'CAM-01' ? 1 : 2} VEHICLES</div>
                    <div className="text-brand-acid bg-brand-black px-1 text-[8px] inline-block mt-0.5">
                      OPTIMAL LEVEL
                    </div>
                  </div>
                  <div className="bg-white border border-brand-black p-2 shadow-[1px_1px_0px_#202020]">
                    <div className="text-brand-gray text-[8.5px]">UNIQUE VEHICLES</div>
                    <div className="text-lg font-black text-brand-black">{selectedCam === 'CAM-01' ? 1 : 2} TRACKS</div>
                    <div className="text-brand-gray text-[8px] inline-block mt-0.5">
                      KANATHUR CORRIDOR
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-white border border-brand-black text-[9px] font-bold uppercase space-y-1 shadow-[1px_1px_0px_#202020]">
                  <div className="flex justify-between text-brand-dark-gray">
                    <span>GATE 1 (WEST GATE INBOUND):</span>
                    <span className="text-brand-black">{inflowCount} passed</span>
                  </div>
                  <div className="flex justify-between text-brand-dark-gray">
                    <span>GATE 2 (EAST JUNCTION OUTBOUND):</span>
                    <span className="text-brand-black">{outflowCount} passed</span>
                  </div>
                  <div className="flex justify-between text-brand-dark-gray border-t border-brand-black/10 pt-1">
                    <span>CORRIDOR FLOW BALANCE:</span>
                    <span className="text-brand-acid bg-brand-black px-1">ACTIVE TRANSIT OK</span>
                  </div>
                </div>
              </div>

              {/* Panel 2: Live ANPR Scanned Feed with Real Plate Crops */}
              <div className="bg-brand-paper border-2 border-brand-black p-4 chamfer-card shadow-editorial space-y-3">
                <div className="flex items-center justify-between border-b border-brand-black/20 pb-2">
                  <span className="font-bold text-brand-black uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-brand-purple bg-brand-paper border border-brand-black" />
                    LIVE ANPR SCANNED FEED
                  </span>
                  <span className="bg-brand-black text-brand-paper px-1.5 py-0.5 text-[8.5px] font-bold shadow-editorial">
                    CRNN + DISAMBIGUATION
                  </span>
                </div>

                {recentScannedPlates.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {recentScannedPlates.slice(-4).reverse().map((item, idx) => (
                      <div key={`${item.plate}-${idx}`} className={`p-2 border-2 ${item.is_alert ? 'border-brand-purple bg-brand-purple/10' : 'border-brand-black bg-white'} shadow-[2px_2px_0px_#202020] flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          {item.crop_base64 && (
                            <img src={item.crop_base64} alt="Plate Crop" className="h-7 border border-brand-black object-contain" />
                          )}
                          <div>
                            <div className="font-bold text-[11px] text-brand-black">
                              {item.plate}
                            </div>
                            <div className="text-[8.5px] text-brand-gray font-bold">
                              TRACK #{item.tracker_id} • {item.timestamp}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.5 ${item.is_alert ? 'bg-brand-purple text-brand-paper' : 'bg-brand-acid text-brand-black'}`}>
                            {item.is_alert ? 'HOTLIST' : `${(item.conf * 100).toFixed(0)}% OCR`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white border border-brand-black text-[10px] font-bold space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="bg-brand-black text-brand-acid px-2 py-0.5">TN 09 BK 4992</span>
                      <span className="text-brand-purple">CRITICAL HOTLIST</span>
                    </div>
                    <div className="text-brand-gray text-[8.5px]">
                      HYUNDAI CRETA • 97.4% CONFIDENCE • FIR-2026-CHN-KAN-0492
                    </div>
                  </div>
                )}
              </div>

              {/* Panel 3: Digital Footprint & Spatiotemporal Velocity */}
              <div className="bg-brand-paper border-2 border-brand-black p-4 chamfer-card shadow-editorial space-y-3">
                <div className="flex items-center justify-between border-b border-brand-black/20 pb-2">
                  <span className="font-bold text-brand-black uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-brand-black" />
                    DIGITAL FOOTPRINT TELEMETRY
                  </span>
                  <span className="bg-brand-black text-brand-acid px-1.5 py-0.5 text-[8.5px] font-bold shadow-editorial">
                    EDGE GRAPH
                  </span>
                </div>

                <div className="space-y-1.5 text-[9px] font-bold uppercase">
                  <div className="p-2 bg-white border border-brand-black shadow-[1px_1px_0px_#202020] flex justify-between">
                    <span className="text-brand-gray">SPATIAL CORRIDOR:</span>
                    <span className="text-brand-black">CLV Nagar 1st St (Chennai)</span>
                  </div>
                  <div className="p-2 bg-white border border-brand-black shadow-[1px_1px_0px_#202020] flex justify-between">
                    <span className="text-brand-gray">INTER-NODE DISTANCE:</span>
                    <span className="text-brand-black">0.30 KM (300 METERS)</span>
                  </div>
                  <div className="p-2 bg-white border border-brand-black shadow-[1px_1px_0px_#202020] flex justify-between">
                    <span className="text-brand-gray">COMPUTED SPEED:</span>
                    <span className="text-brand-acid bg-brand-black px-1.5">
                      38.6 km/h (Normal Flow)
                    </span>
                  </div>
                </div>
              </div>

              {/* Panel 4: Law Enforcement Intercept Action Button */}
              <div className="bg-brand-black border-2 border-brand-black p-4 chamfer-card shadow-editorial text-brand-paper space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-acid uppercase tracking-widest text-[10px]">
                    AUTOMATED DISPATCH UNIT
                  </span>
                  <span className="w-2 h-2 rounded-full bg-brand-acid animate-ping"></span>
                </div>
                <p className="text-[9px] text-brand-gray leading-relaxed uppercase">
                  Automated spatial dispatch calculates the next junction in the vehicle's vector and notifies law enforcement units before vehicle reaches intersection.
                </p>
                <button
                  onClick={() => {
                    if (setNotifications) {
                      setNotifications(prev => [
                        {
                          id: Date.now(),
                          title: 'TACTICAL INTERCEPT DISPATCHED',
                          desc: `Kanathur Patrol K-04 assigned to intercept at CLV Nagar East Junction`,
                          severity: 'critical',
                          timestamp: new Date().toLocaleTimeString('en-IN') + ' IST'
                        },
                        ...prev
                      ]);
                    }
                    alert('🚨 TACTICAL DISPATCH ISSUED:\nKanathur Intercept Patrol Unit K-04 notified to block East Junction exit onto Reddykuppam Road.');
                  }}
                  className="w-full bg-brand-acid text-brand-black font-bold uppercase tracking-widest text-[10px] py-2.5 border border-brand-black shadow-editorial hover:bg-brand-paper transition-all"
                >
                  DISPATCH INTERCEPT PATROL
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
