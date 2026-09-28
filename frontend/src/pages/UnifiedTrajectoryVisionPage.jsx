import React, { useState, useRef, useEffect } from 'react';
import VideoSurveillance from '../components/tracking/VideoSurveillance';
import TacticalMap from '../components/tracking/TacticalMap';
import DigitalIdentityCard from '../components/tracking/DigitalIdentityCard';
import OcrConsole from '../components/tracking/OcrConsole';
import NotificationFeed from '../components/tracking/NotificationFeed';
import IntersectionDigitalTwin3D from '../components/tracking/IntersectionDigitalTwin3D';
import { ActionModal } from '../App';
import { getApiUrl } from '../utils/apiConfig';
import { useTracking } from '../context/TrackingContext';
import { 
  Eye, 
  Layers, 
  Cpu, 
  Activity, 
  MapPin, 
  ShieldAlert, 
  Radio, 
  Car, 
  Gauge, 
  ArrowDown, 
  Video, 
  Sliders, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function UnifiedTrajectoryVisionPage() {
  const { isPlaying, setIsPlaying } = useTracking();
  const [selectedCam, setSelectedCam] = useState('ROUNDABOUT-4WAY');
  const [videoTime, setVideoTime] = useState(0);
  const [actionModal, setActionModal] = useState({ isOpen: false, title: '', message: '', severity: 'info' });
  const [backendOnline, setBackendOnline] = useState(true);
  const [backendTelemetry, setBackendTelemetry] = useState(null);

  const videoRef = useRef(null);
  const visionLabRef = useRef(null);

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

  useEffect(() => {
    let active = true;
    const fetchTelemetry = async () => {
      try {
        const queryCam = selectedCam === 'ROUNDABOUT-4WAY' ? 'CAM-01' : selectedCam;
        const res = await fetch(getApiUrl(`/api/telemetry?camera=${queryCam}`));
        if (res.ok && active) {
          const data = await res.json();
          setBackendTelemetry(data);
          setBackendOnline(true);
        }
      } catch {
        if (active) setBackendOnline(false);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedCam]);

  const scrollToVisionLab = () => {
    visionLabRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 font-mono select-none max-w-[1600px] mx-auto pb-12">
      {/* =========================================================================
          TOP SECTION: LIVE TRAJECTORY (DUAL CAMERAS + GIS MAP + OCR CONSOLE)
         ========================================================================= */}
      <section className="space-y-6">
        {/* Section Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-brand-black pb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-acid mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-acid animate-pulse"></span>
              FLAGSHIP COMMAND MODULE [02]
            </div>
            <h2 className="editorial-headline text-3xl md:text-4xl text-brand-paper">
              LIVE TRAJECTORY &amp; CORRIDOR SURVEILLANCE
            </h2>
          </div>

          <div className="mt-3 md:mt-0 flex items-center gap-2">
            <button
              onClick={scrollToVisionLab}
              className="punch-btn px-3 py-1.5 bg-brand-acid text-brand-black text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-brand-black shadow-[2px_2px_0px_#181818]"
            >
              <span>Scroll to Vision Lab</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            <div className="text-[10px] font-mono font-bold uppercase text-brand-paper bg-brand-black px-3 py-1.5 border border-brand-dark-gray/60 inline-flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-acid mr-2 animate-ping"></span>
              KANATHUR ECR CORRIDOR
            </div>
          </div>
        </div>

        {/* Master Trajectory Grid (8 cols left feeds + GIS, 4 cols right identity + terminal) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 of 12 cols): Dual CCTV Feeds + GIS Map */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            {/* Dual Video Feeds */}
            <div className="bg-brand-paper border border-brand-black p-1 chamfer-card shadow-editorial">
              <VideoSurveillance />
            </div>

            {/* Tactical GIS Map & 3D Spatial Engine */}
            <div className="min-h-[420px] bg-brand-paper border border-brand-black p-1 chamfer-card relative shadow-editorial">
              <TacticalMap />
              <div className="absolute top-0 right-0 bg-brand-black text-brand-paper text-[9px] font-bold px-2 py-1 uppercase tracking-wider font-mono z-[400] border-l border-b border-brand-black">
                SPATIAL ENGINE (EPSG:4326 WGS84)
              </div>
            </div>
          </div>

          {/* Right Column (4 of 12 cols): Target Dossier + Live OCR Terminal + Dispatch */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <DigitalIdentityCard />
            <OcrConsole />
            <div className="min-h-[220px]">
              <NotificationFeed />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION DIVIDER: TACTICAL TRANSITION TO VISION LAB
         ========================================================================= */}
      <div ref={visionLabRef} className="pt-6">
        <div className="relative border-t-2 border-brand-black bg-brand-black p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-brand-acid shadow-[4px_4px_0px_#181818]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-acid text-brand-black font-black">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-brand-acid">
                DEEP COMPUTER VISION LAB &amp; MULTI-ZONE INTERSECTION
              </div>
              <div className="text-xs text-brand-paper font-bold uppercase">
                Roboflow Multi-Zone Supervision • Polygon Density • Directional OD Turning Vectors
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase px-2.5 py-1 bg-brand-acid text-brand-black border border-brand-black">
              YOLOv8 + ByteTrack Active
            </span>
            <span className="text-[9px] font-bold uppercase px-2.5 py-1 bg-brand-dark-gray/60 text-brand-paper border border-brand-dark-gray">
              Adverse Weather ANPR
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SECTION: VISION LAB & 4-WAY INTERSECTION
         ========================================================================= */}
      <section className="space-y-6">
        {/* Camera Selector Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-paper border border-brand-black p-3 chamfer-card shadow-editorial">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-brand-black">Active Camera Node:</span>
            {Object.keys(cameraMeta).map((camKey) => (
              <button
                key={camKey}
                onClick={() => setSelectedCam(camKey)}
                className={`punch-btn px-2.5 py-1 text-[10px] font-bold uppercase border transition-all ${
                  selectedCam === camKey
                    ? 'bg-brand-black text-brand-acid border-brand-black punch-btn-active'
                    : 'bg-white text-brand-black border-brand-dark-gray hover:bg-brand-acid/20'
                }`}
              >
                {cameraMeta[camKey].name.split(' ')[0]} ({camKey})
              </button>
            ))}
          </div>

          <div className="text-[10px] text-brand-gray flex items-center gap-3">
            <span>Model: <strong className="text-brand-black">{camConfig.modelType.split('+')[0]}</strong></span>
            <span>Speed Limit: <strong className="text-brand-black">{camConfig.speedLimit}</strong></span>
          </div>
        </div>

        {/* Video Player + 3D Intersection Twin Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Viewport (7 of 12 cols): CCTV Video Stream with Baked Annotations */}
          <div className="lg:col-span-7 bg-brand-black border border-brand-dark-gray/50 p-3 flex flex-col justify-between shadow-editorial">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-brand-dark-gray/40">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-acid animate-pulse"></span>
                <span className="text-[11px] font-bold text-brand-paper uppercase">
                  {camConfig.name}
                </span>
              </div>
              <span className="text-[9px] text-brand-acid px-2 py-0.5 bg-brand-acid/10 border border-brand-acid/30 uppercase">
                {camConfig.resolution} • {camConfig.fps} FPS
              </span>
            </div>

            <div className="relative aspect-video w-full bg-black overflow-hidden border border-brand-dark-gray/30">
              <video
                ref={videoRef}
                key={selectedCam}
                src={camConfig.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                onTimeUpdate={(e) => setVideoTime(e.target.currentTime)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 surveillance-scanline pointer-events-none opacity-20"></div>
              
              <div className="absolute top-2 left-2 bg-brand-black/90 px-2 py-1 text-[9px] border border-brand-dark-gray/60 text-brand-acid flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-brand-acid animate-pulse" />
                <span>Supervision Polygon Zones Active</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-brand-dark-gray/30 flex items-center justify-between text-[9px] text-brand-gray">
              <span>Timestamp: T+ {videoTime.toFixed(1)}s</span>
              <span className="text-brand-acid">ByteTrack Footprints &amp; Zone Occlusion Active</span>
            </div>
          </div>

          {/* Right Viewport (5 of 12 cols): 3D Digital Twin or Spatial Zone Breakdown */}
          <div className="lg:col-span-5 bg-brand-paper border border-brand-black p-3 chamfer-card shadow-editorial flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-brand-black">
              <span className="text-[11px] font-black uppercase text-brand-black flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-black" />
                {isRoundabout ? '3D Roundabout Digital Twin' : 'Corridor Zone Topology'}
              </span>
              <span className="text-[9px] bg-brand-black text-brand-paper px-2 py-0.5 font-bold uppercase">
                Synchronized Twin
              </span>
            </div>

            <div className="min-h-[320px] flex-1 bg-brand-black border border-brand-dark-gray relative overflow-hidden">
              <IntersectionDigitalTwin3D
                currentTime={videoTime}
                isPlaying={isPlaying}
              />
            </div>

            <div className="mt-3 pt-2 border-t border-brand-black/20 grid grid-cols-3 gap-2 text-center text-[9px]">
              <div className="p-1.5 bg-brand-black text-brand-paper">
                <span className="text-brand-gray block text-[8px]">ACTIVE DENSITY</span>
                <strong className="text-brand-acid text-xs">
                  {backendTelemetry?.metrics?.active_density ?? 4}
                </strong>
              </div>
              <div className="p-1.5 bg-brand-black text-brand-paper">
                <span className="text-brand-gray block text-[8px]">ZONE INFLOW</span>
                <strong className="text-green-400 text-xs">
                  +{backendTelemetry?.metrics?.inflow_count ?? 12}
                </strong>
              </div>
              <div className="p-1.5 bg-brand-black text-brand-paper">
                <span className="text-brand-gray block text-[8px]">TOTAL UNIQUE</span>
                <strong className="text-brand-paper text-xs">
                  {backendTelemetry?.metrics?.unique_count ?? 28}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
        title={actionModal.title}
        message={actionModal.message}
        severity={actionModal.severity}
      />
    </div>
  );
}
