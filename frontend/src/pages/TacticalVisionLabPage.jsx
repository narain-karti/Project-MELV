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
  Cpu
} from 'lucide-react';
import bytetrackData from '../data/bytetrack_anpr_demo.json';

export default function TacticalVisionLabPage() {
  const { isPlaying, setIsPlaying, setDigitalIdentity, setConsoleLogs, setNotifications } = useTracking();
  const [selectedCam, setSelectedCam] = useState('CAM-01');
  const [videoTime, setVideoTime] = useState(0);
  const [activeTracks, setActiveTracks] = useState([]);
  
  // Layer Toggles
  const [showBoxes, setShowBoxes] = useState(true);
  const [showByteTrack, setShowByteTrack] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showANPR, setShowANPR] = useState(true);
  const [showZones, setShowZones] = useState(true);

  // Counters for the current session
  const [inflowCount, setInflowCount] = useState(14);
  const [outflowCount, setOutflowCount] = useState(12);

  const videoRef = useRef(null);
  const animFrameRef = useRef(null);

  const cameraMeta = {
    'CAM-01': {
      name: 'CLV Nagar 1st St - West Gate (ECR)',
      videoSrc: '/videos/cam_01_upstream.mp4',
      fps: '29.92',
      resolution: '1080p Stream',
      speedLimit: '50 km/h'
    },
    'CAM-02': {
      name: 'CLV Nagar 1st St - East Junction',
      videoSrc: '/videos/cam_02_downstream.mp4',
      fps: '29.92',
      resolution: '1080p Stream',
      speedLimit: '40 km/h'
    }
  };

  const camConfig = cameraMeta[selectedCam];
  const camData = bytetrackData[selectedCam] || { zones: {}, timeline: [] };

  // Sync detections & ByteTrack state with video current time
  const syncFrame = useCallback((t) => {
    const timeline = camData.timeline || [];
    if (timeline.length === 0) {
      setActiveTracks([]);
      return;
    }

    // Find closest frame entry
    let closest = null;
    let minDiff = 0.65;
    for (let i = 0; i < timeline.length; i++) {
      const diff = Math.abs(timeline[i].t - t);
      if (diff < minDiff) {
        minDiff = diff;
        closest = timeline[i];
      }
    }

    if (closest && closest.tracks) {
      setActiveTracks(closest.tracks);

      // Check if any tracked vehicle is wanted
      const wantedVehicle = closest.tracks.find(tr => tr.is_blacklist);
      if (wantedVehicle && setDigitalIdentity) {
        setDigitalIdentity({
          plate: wantedVehicle.plate,
          plateType: 'standard_private',
          vehicleClass: wantedVehicle.class,
          color: 'White',
          confidence: wantedVehicle.ocr_conf.toFixed(1),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST',
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
    } else {
      setActiveTracks([]);
    }
  }, [camData, camConfig.name, selectedCam, setDigitalIdentity]);

  // Video playback loop
  useEffect(() => {
    let active = true;

    const tick = () => {
      if (active && videoRef.current) {
        const t = videoRef.current.currentTime || 0;
        setVideoTime(t);
        syncFrame(t);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [syncFrame]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle Seek
  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setVideoTime(val);
      syncFrame(val);
    }
  };

  // Active wanted target in frame?
  const activeAlert = activeTracks.find(t => t.is_blacklist || t.speed_kmh > 65);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-xs select-none">
      
      {/* Editorial Header Banner */}
      <div className="bg-brand-paper border-2 border-brand-black p-5 chamfer-card shadow-editorial flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-[10px] font-bold text-brand-paper bg-brand-black px-2 py-1 shadow-editorial uppercase tracking-widest">
              [UNIFIED VISION ENGINE]
            </span>
            <span className="text-brand-black font-bold uppercase tracking-widest text-[12px] md:text-sm">
              YOLOV8 + BYTETRACK + ANPR OCR + DENSITY MATRIX
            </span>
          </div>
          <p className="text-brand-gray font-bold text-xs uppercase tracking-widest">
            Multi-stage edge computer vision demonstration running on real Kanathur CCTV footage. 
            Object detection, multi-target ByteTrack ID persistent tracking, license plate OCR, and spatiotemporal trajectory reconstruction.
          </p>
        </div>

        {/* Cam Switcher & Status */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => setSelectedCam('CAM-01')}
            className={`px-3 py-2 border-2 border-brand-black font-bold text-[10px] uppercase tracking-wider transition-all shadow-editorial ${
              selectedCam === 'CAM-01' ? 'bg-brand-acid text-brand-black' : 'bg-white text-brand-black hover:bg-brand-paper'
            }`}
          >
            CAM-01 (West Gate)
          </button>
          <button
            onClick={() => setSelectedCam('CAM-02')}
            className={`px-3 py-2 border-2 border-brand-black font-bold text-[10px] uppercase tracking-wider transition-all shadow-editorial ${
              selectedCam === 'CAM-02' ? 'bg-brand-acid text-brand-black' : 'bg-white text-brand-black hover:bg-brand-paper'
            }`}
          >
            CAM-02 (East Junction)
          </button>
        </div>
      </div>

      {/* Critical Wanted Vehicle Alert Banner (if target detected in video) */}
      {activeAlert && (
        <div className="bg-brand-purple border-2 border-brand-black p-4 text-brand-paper flex items-center justify-between shadow-editorial chamfer-card animate-pulse">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-7 h-7 text-brand-acid animate-bounce flex-shrink-0" />
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-brand-acid">
                CRITICAL PURSUIT ALERT :: TARGET LOCKED [{activeAlert.plate}]
              </div>
              <div className="text-[10px] uppercase tracking-wider text-brand-paper mt-0.5">
                {activeAlert.is_blacklist ? 'WANTED VEHICLE IDENTIFIED ON POLICE HOTLIST' : 'CORRIDOR SPEED LIMIT VIOLATION'} • 
                SPEED: <strong className="text-brand-acid">{activeAlert.speed_kmh} km/h</strong> (LIMIT: {camConfig.speedLimit})
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="bg-brand-black text-brand-acid text-[9px] px-2 py-1 font-bold border border-brand-black shadow-editorial">
              INTERCEPT ETA: ~14s
            </span>
          </div>
        </div>
      )}

      {/* Main Vision Stage & HUD Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Real CCTV Video Player + Overlays (8 of 12 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="relative bg-brand-black border-2 border-brand-black chamfer-card overflow-hidden h-[440px] shadow-editorial flex flex-col justify-between">
            
            {/* Raw HTML5 Video Element */}
            <div className="absolute inset-0 bg-brand-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                src={camConfig.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* SVG Overlay Layer for ByteTrack Motion Trails & Counting Zones */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {/* Zone 1: Entry Polygon */}
                {showZones && (
                  <>
                    <polygon
                      points={selectedCam === 'CAM-01' ? "0,130 200,130 230,340 0,340" : "340,260 590,260 680,430 260,430"}
                      fill="rgba(200, 232, 77, 0.12)"
                      stroke="#C8E84D"
                      strokeWidth="2"
                      strokeDasharray="6,4"
                    />
                    <text
                      x={selectedCam === 'CAM-01' ? 15 : 360}
                      y={selectedCam === 'CAM-01' ? 150 : 285}
                      fill="#C8E84D"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ZONE A: INFLOW [{inflowCount}]
                    </text>

                    {/* Zone 2: Exit Polygon */}
                    <polygon
                      points={selectedCam === 'CAM-01' ? "480,130 750,130 750,400 450,400" : "170,190 380,190 380,320 130,320"}
                      fill="rgba(128, 80, 232, 0.12)"
                      stroke="#8050E8"
                      strokeWidth="2"
                      strokeDasharray="6,4"
                    />
                    <text
                      x={selectedCam === 'CAM-01' ? 500 : 180}
                      y={selectedCam === 'CAM-01' ? 150 : 210}
                      fill="#8050E8"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ZONE B: OUTFLOW [{outflowCount}]
                    </text>
                  </>
                )}

                {/* ByteTrack Historical Motion Trails (TraceAnnotator) */}
                {showTrails && activeTracks.map((tr) => {
                  if (!tr.trail || tr.trail.length < 2) return null;
                  const pointsStr = tr.trail.map(pt => `${pt[0]}%,${pt[1]}%`).join(' ');
                  const trailColor = tr.is_blacklist ? '#8050E8' : '#C8E84D';
                  return (
                    <polyline
                      key={`trail-${tr.tracker_id}`}
                      points={pointsStr}
                      fill="none"
                      stroke={trailColor}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeOpacity="0.8"
                      strokeDasharray="4,2"
                    />
                  );
                })}
              </svg>

              {/* Bounding Boxes, ByteTrack IDs, and ANPR Floating Chips */}
              {activeTracks.map((tr) => {
                const isBlacklist = tr.is_blacklist;
                const isSpeeding = tr.speed_kmh > 65;
                const frameColor = isBlacklist ? 'border-brand-purple' : 'border-brand-acid';

                return (
                  <div
                    key={`track-${tr.tracker_id}`}
                    className="absolute pointer-events-none z-20 transition-all duration-100"
                    style={{
                      left: `${tr.bbox.x}%`,
                      top: `${tr.bbox.y}%`,
                      width: `${tr.bbox.w}%`,
                      height: `${tr.bbox.h}%`,
                    }}
                  >
                    {/* Bounding Box Frame */}
                    {showBoxes && (
                      <div className={`w-full h-full relative border-2 ${frameColor} shadow-[0_0_12px_rgba(0,0,0,0.5)]`}>
                        {/* 4 Corner Accents */}
                        <div className={`absolute -top-1.5 -left-1.5 w-3 h-3 border-t-[3px] border-l-[3px] ${frameColor}`}></div>
                        <div className={`absolute -top-1.5 -right-1.5 w-3 h-3 border-t-[3px] border-r-[3px] ${frameColor}`}></div>
                        <div className={`absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-[3px] border-l-[3px] ${frameColor}`}></div>
                        <div className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-[3px] border-r-[3px] ${frameColor}`}></div>

                        {/* Centroid Reticle */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-1.5 h-1.5 rounded-full ${isBlacklist ? 'bg-brand-purple animate-ping' : 'bg-brand-acid animate-pulse'}`}></div>
                        </div>

                        {/* Top Floating ANPR Chip (Video 1 extraction) */}
                        {showANPR && (
                          <div
                            className={`absolute -top-7 left-0 whitespace-nowrap px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-brand-black shadow-[2px_2px_0px_#202020] flex items-center gap-1.5 ${
                              isBlacklist
                                ? 'bg-brand-purple text-brand-paper animate-pulse'
                                : 'bg-brand-acid text-brand-black'
                            }`}
                          >
                            <span>{tr.plate}</span>
                            <span className="opacity-80 text-[8.5px]">[{tr.ocr_conf}%]</span>
                            {isBlacklist && (
                              <span className="bg-brand-black text-brand-paper px-1 py-0.2 text-[8px]">WANTED</span>
                            )}
                          </div>
                        )}

                        {/* ByteTrack ID Badge + Speed Badge (Video 2 tracking) */}
                        {showByteTrack && (
                          <div className="absolute -bottom-5 left-0 whitespace-nowrap bg-brand-black text-brand-paper px-1.5 py-0.5 text-[8.5px] font-mono font-bold uppercase tracking-wider shadow-editorial border border-brand-black flex items-center gap-1.5">
                            <span className="text-brand-acid">#TRK-{tr.tracker_id}</span>
                            <span className="text-brand-gray">|</span>
                            <span>{tr.class}</span>
                            <span className="text-brand-gray">|</span>
                            <span className={isSpeeding ? 'text-brand-purple font-black' : 'text-brand-paper'}>
                              {tr.speed_kmh} km/h
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Video Header HUD */}
            <div className="relative z-30 p-3 flex items-center justify-between bg-gradient-to-b from-brand-black/90 to-transparent">
              <div className="flex items-center space-x-2">
                <span className="bg-brand-black text-brand-acid px-2 py-1 font-bold text-[10px] border border-brand-black shadow-editorial flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{selectedCam}</span>
                </span>
                <span className="bg-brand-paper text-brand-black px-2 py-1 font-bold text-[10px] border border-brand-black shadow-editorial truncate max-w-[220px]">
                  {camConfig.name}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-[10px] font-bold">
                <span className="bg-brand-acid text-brand-black px-2 py-1 border border-brand-black shadow-editorial flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>{camConfig.fps} FPS</span>
                </span>
                <span className="bg-brand-black text-brand-paper px-2 py-1 shadow-editorial border border-brand-black">
                  {activeTracks.length > 0 ? (
                    <span className="text-brand-acid">{activeTracks.length} TRACKS LOCKED</span>
                  ) : (
                    <span className="text-brand-gray">ACTIVE SCAN</span>
                  )}
                </span>
              </div>
            </div>

            {/* Video Bottom HUD */}
            <div className="relative z-30 p-3 flex items-center justify-between bg-gradient-to-t from-brand-black/90 to-transparent">
              <div className="flex items-center space-x-2 bg-brand-paper text-brand-black px-2 py-1 border border-brand-black shadow-editorial">
                <Eye className="w-3.5 h-3.5 text-brand-purple" />
                <span className="text-[10px]">PIPELINE: <strong className="text-brand-black">YOLOv8x + ByteTrack + PaddleOCR</strong></span>
              </div>

              <div className="bg-brand-black text-brand-paper px-2 py-1 shadow-editorial border border-brand-black text-[10px] flex items-center gap-2">
                <span className="text-brand-gray">TIMECODE:</span>
                <span className="text-brand-acid font-bold">{videoTime.toFixed(1)}s / 20.2s</span>
              </div>
            </div>
          </div>

          {/* Playback Controls & Scrubber */}
          <div className="bg-brand-paper border-2 border-brand-black p-3 chamfer-card shadow-editorial flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <button
                onClick={togglePlay}
                className="bg-brand-acid text-brand-black border border-brand-black p-2 font-bold shadow-editorial hover:bg-white transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    setVideoTime(0);
                    syncFrame(0);
                  }
                }}
                className="bg-brand-black text-brand-paper border border-brand-black p-2 font-bold shadow-editorial hover:bg-brand-dark-gray transition-colors"
                title="Restart Loop"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="text-[10px] font-bold text-brand-black uppercase pl-2">
                SCRUBBER:
              </div>
            </div>

            {/* Time Slider */}
            <input
              type="range"
              min="0"
              max="20.2"
              step="0.1"
              value={videoTime}
              onChange={handleSeek}
              className="w-full flex-1 accent-brand-acid cursor-pointer"
            />

            {/* Quick Seek Jumps */}
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = selectedCam === 'CAM-01' ? 11.5 : 4.5;
                  }
                }}
                className="text-[9px] bg-brand-black text-brand-acid px-2 py-1 border border-brand-black shadow-editorial hover:bg-brand-acid hover:text-brand-black font-bold uppercase transition-colors"
              >
                Jump: Bike Pass
              </button>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 16.0;
                  }
                }}
                className="text-[9px] bg-brand-purple text-brand-paper px-2 py-1 border border-brand-black shadow-editorial hover:bg-brand-black font-bold uppercase transition-colors"
              >
                Jump: Wanted SUV
              </button>
            </div>
          </div>

          {/* Interactive Vision Layer Toggles */}
          <div className="bg-brand-paper border-2 border-brand-black p-3 chamfer-card shadow-editorial flex flex-wrap items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-wider">
            <span className="text-brand-gray flex items-center gap-1 mr-2">
              <Sliders className="w-3.5 h-3.5 text-brand-black" />
              VISUAL LAYERS:
            </span>

            <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2 py-1 border border-brand-black shadow-[1px_1px_0px_#202020]">
              <input type="checkbox" checked={showBoxes} onChange={(e) => setShowBoxes(e.target.checked)} className="accent-brand-acid" />
              <span className="text-brand-black">YOLO BBoxes</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2 py-1 border border-brand-black shadow-[1px_1px_0px_#202020]">
              <input type="checkbox" checked={showByteTrack} onChange={(e) => setShowByteTrack(e.target.checked)} className="accent-brand-acid" />
              <span className="text-brand-black">ByteTrack IDs</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2 py-1 border border-brand-black shadow-[1px_1px_0px_#202020]">
              <input type="checkbox" checked={showTrails} onChange={(e) => setShowTrails(e.target.checked)} className="accent-brand-acid" />
              <span className="text-brand-black">Motion Trails</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2 py-1 border border-brand-black shadow-[1px_1px_0px_#202020]">
              <input type="checkbox" checked={showANPR} onChange={(e) => setShowANPR(e.target.checked)} className="accent-brand-acid" />
              <span className="text-brand-black">ANPR Plates</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2 py-1 border border-brand-black shadow-[1px_1px_0px_#202020]">
              <input type="checkbox" checked={showZones} onChange={(e) => setShowZones(e.target.checked)} className="accent-brand-acid" />
              <span className="text-brand-black">Counting Zones</span>
            </label>
          </div>
        </div>

        {/* Right Column: 4 Live Tactical Analysis Panels (4 of 12 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
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
                <div className="text-brand-gray text-[8.5px]">ACTIVE IN FOV</div>
                <div className="text-lg font-black text-brand-black">{activeTracks.length} VEHICLES</div>
                <div className="text-brand-acid bg-brand-black px-1 text-[8px] inline-block mt-0.5">
                  OPTIMAL LEVEL
                </div>
              </div>
              <div className="bg-white border border-brand-black p-2 shadow-[1px_1px_0px_#202020]">
                <div className="text-brand-gray text-[8.5px]">CORRIDOR FLOW</div>
                <div className="text-lg font-black text-brand-black">42 VEH / MIN</div>
                <div className="text-brand-gray text-[8px] inline-block mt-0.5">
                  ECR ARTERIAL LINK
                </div>
              </div>
            </div>

            <div className="p-2 bg-white border border-brand-black text-[9px] font-bold uppercase space-y-1 shadow-[1px_1px_0px_#202020]">
              <div className="flex justify-between text-brand-dark-gray">
                <span>ZONE A (INFLOW COUNT):</span>
                <span className="text-brand-black">{inflowCount} passed</span>
              </div>
              <div className="flex justify-between text-brand-dark-gray">
                <span>ZONE B (OUTFLOW COUNT):</span>
                <span className="text-brand-black">{outflowCount} passed</span>
              </div>
              <div className="flex justify-between text-brand-dark-gray border-t border-brand-black/10 pt-1">
                <span>CORRIDOR RETENTION:</span>
                <span className="text-brand-acid bg-brand-black px-1">2 CURRENTLY IN TRANSIT</span>
              </div>
            </div>
          </div>

          {/* Panel 2: Live ANPR Extraction & Plate Inspector (Video 1 Pipeline) */}
          <div className="bg-brand-paper border-2 border-brand-black p-4 chamfer-card shadow-editorial space-y-3">
            <div className="flex items-center justify-between border-b border-brand-black/20 pb-2">
              <span className="font-bold text-brand-black uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-brand-purple bg-brand-paper border border-brand-black" />
                ACTIVE ANPR DECODER
              </span>
              <span className="bg-brand-black text-brand-paper px-1.5 py-0.5 text-[8.5px] font-bold shadow-editorial">
                CRNN OCR
              </span>
            </div>

            {activeTracks.length > 0 ? (
              <div className="space-y-2">
                {activeTracks.slice(0, 2).map((tr) => (
                  <div key={tr.plate} className={`p-2.5 border-2 ${tr.is_blacklist ? 'border-brand-purple bg-brand-purple/10' : 'border-brand-black bg-white'} shadow-[2px_2px_0px_#202020] space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[12px] bg-brand-black text-brand-paper px-2 py-0.5 inline-block">
                        {tr.plate}
                      </div>
                      <span className={`text-[8.5px] font-bold px-1.5 py-0.5 ${tr.is_blacklist ? 'bg-brand-purple text-brand-paper' : 'bg-brand-acid text-brand-black'}`}>
                        {tr.is_blacklist ? 'HOTLIST' : 'VALID HSRP'}
                      </span>
                    </div>
                    <div className="text-[9px] text-brand-dark-gray font-bold uppercase flex justify-between">
                      <span>CLASS: {tr.class}</span>
                      <span>OCR CONF: {tr.ocr_conf}%</span>
                    </div>
                    <div className="text-[8.5px] text-brand-gray font-bold uppercase truncate">
                      STATE: Tamil Nadu (TN) • RTO: Tambaram / Chennai South
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-white border border-brand-black text-center text-brand-gray text-[9px] uppercase font-bold">
                Awaiting vehicle pass-through in current video cycle...
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
                  {activeTracks[0] ? `${activeTracks[0].speed_kmh} km/h` : '38.6 km/h (Normal)'}
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

        </div>

      </div>

    </div>
  );
}
