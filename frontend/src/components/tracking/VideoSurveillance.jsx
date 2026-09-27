import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Camera, Radio, Eye, Crosshair, ShieldAlert, CheckCircle2 } from 'lucide-react';
import videoDetectionsData from '../../data/video_detections.json';
import { getApiUrl } from '../../utils/apiConfig';


export default function VideoSurveillance() {
  const { currentTime, isPlaying, setDigitalIdentity } = useTracking();
  const [isLiveStream, setIsLiveStream] = useState(false);

  return (
    <div className="space-y-2">
      {/* Stream Mode Switcher */}
      <div className="flex items-center justify-between bg-brand-paper border border-brand-black px-3 py-1.5 chamfer-card shadow-editorial text-[9px] font-mono font-bold uppercase">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-acid animate-ping"></span>
          <span className="text-brand-black tracking-widest">DUAL CCTV CORRIDOR SURVEILLANCE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsLiveStream(false)}
            className={`px-2 py-0.5 border border-brand-black transition-all flex items-center gap-1 ${
              !isLiveStream ? 'bg-brand-acid text-brand-black font-bold' : 'bg-white text-brand-gray hover:text-brand-black'
            }`}
          >
            <Radio className="w-3 h-3 text-brand-black animate-pulse" />
            <span>30 FPS AI BAKE (SMOOTH LOOP)</span>
          </button>
          <button
            onClick={() => setIsLiveStream(true)}
            className={`px-2 py-0.5 border border-brand-black transition-all flex items-center gap-1 ${
              isLiveStream ? 'bg-brand-acid text-brand-black font-bold' : 'bg-white text-brand-gray hover:text-brand-black'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
            <span>LIVE RTSP MESH (:8000)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Camera Feed 01: Upstream (West Gate ECR) */}
        <CameraPanel
          cameraId="CAM-01"
          cameraName="CLV Nagar 1st St - West Gate (ECR)"
          fps="29.9"
          videoSrc="/videos/cam_01_annotated.mp4"
          globalTime={currentTime}
          isPlaying={isPlaying}
          setDigitalIdentity={setDigitalIdentity}
          isLiveStream={isLiveStream}
        />

        {/* Camera Feed 02: Downstream (East Junction) */}
        <CameraPanel
          cameraId="CAM-02"
          cameraName="CLV Nagar 1st St - East Junction"
          fps="29.9"
          videoSrc="/videos/cam_02_annotated.mp4"
          globalTime={currentTime}
          isPlaying={isPlaying}
          setDigitalIdentity={setDigitalIdentity}
          isLiveStream={isLiveStream}
        />
      </div>
    </div>
  );
}

function CameraPanel({ cameraId, cameraName, fps, videoSrc, globalTime, isPlaying, setDigitalIdentity, isLiveStream }) {
  const videoRef = useRef(null);
  const animFrameRef = useRef(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [detections, setDetections] = useState([]);

  // Find detections matching the current video playback timestamp
  const syncDetections = useCallback((vTime) => {
    const keyframes = videoDetectionsData[cameraId] || [];
    if (keyframes.length === 0) {
      setDetections([]);
      return;
    }

    // Find the closest keyframe within 0.65s
    let closest = null;
    let minDiff = 0.65;

    for (let i = 0; i < keyframes.length; i++) {
      const diff = Math.abs(keyframes[i].t - vTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = keyframes[i];
      }
    }

    if (closest && closest.detections && closest.detections.length > 0) {
      setDetections(closest.detections);

      // If a prominent vehicle (e.g. motorcycle or wanted SUV) is tracked, update identity card
      const primary = closest.detections.find(d => d.is_blacklist) || closest.detections[0];
      if (primary && setDigitalIdentity) {
        setDigitalIdentity(prev => {
          if (prev?.plate === primary.plate && prev?.cameraId === cameraId) return prev;
          return {
            plate: primary.plate,
            plateType: primary.plate.startsWith('TN09') ? 'commercial_yellow' : 'standard_private',
            vehicleClass: primary.class,
            color: primary.is_blacklist ? 'White' : primary.class.includes('Motorcycle') ? 'Black-Silver' : 'Silver Metallic',
            confidence: primary.ocr_conf.toFixed(1),
            timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST',
            cameraName,
            cameraId,
            isBlacklist: primary.is_blacklist,
            blacklistInfo: primary.is_blacklist ? {
              category: 'Stolen Vehicle / Alert',
              fir_number: 'FIR-2026-CHN-KAN-0492',
              severity: 'CRITICAL'
            } : null
          };
        });
      }
    } else {
      setDetections([]);
    }
  }, [cameraId, cameraName, setDigitalIdentity]);

  // Video play/pause effect
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // High-frequency requestAnimationFrame loop for fluid, zero-lag frame sync
  useEffect(() => {
    let active = true;

    const tick = () => {
      if (active && videoRef.current) {
        const vTime = videoRef.current.currentTime || (globalTime % 20.2);
        setCurrentVideoTime(vTime);
        syncDetections(vTime);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [globalTime, syncDetections]);

  // Handle native HTML5 video timeupdate as fallback
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const vTime = videoRef.current.currentTime;
    setCurrentVideoTime(vTime);
    syncDetections(vTime);
  };

  return (
    <div className="relative bg-brand-paper border-2 border-brand-black chamfer-card overflow-hidden h-[270px] flex flex-col justify-between group shadow-editorial select-none">
      {/* Video Viewport Container */}
      <div className="absolute inset-0 bg-brand-black flex items-center justify-center overflow-hidden">
        {isLiveStream ? (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <img
              src={getApiUrl(`/api/stream/cctv?camera=${cameraId}`)}
              alt={cameraName}
              className="w-full h-full object-cover"
            />

            <div className="absolute top-2 right-2 bg-brand-black/90 border border-brand-acid text-brand-acid px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest shadow-editorial flex items-center gap-1 z-30">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-acid animate-ping"></span>
              <span>LIVE OPENCV BAKE</span>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              onTimeUpdate={handleTimeUpdate}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </>
        )}
      </div>

      {/* Top HUD Bar */}
      <div className="relative z-20 p-2.5 flex items-center justify-between text-xs font-mono bg-gradient-to-b from-brand-black/90 to-transparent">
        <div className="flex items-center space-x-2">
          <span className="flex items-center gap-1 bg-brand-black px-2 py-1 shadow-editorial text-brand-paper uppercase tracking-widest font-bold border border-brand-black">
            <Camera className="w-3.5 h-3.5 text-brand-acid" />
            <span>{cameraId}</span>
          </span>
          <span className="text-[10px] text-brand-black font-bold uppercase tracking-widest bg-brand-paper px-2 py-1 shadow-editorial truncate max-w-[150px] md:max-w-[190px] border border-brand-black">
            {cameraName}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1 text-brand-black bg-brand-acid px-2 py-1 shadow-editorial border border-brand-black">
            <Radio className="w-3 h-3 animate-pulse" />
            {fps} FPS
          </span>
          <span className="bg-brand-black text-brand-paper px-2 py-1 shadow-editorial border border-brand-black">
            {detections.length > 0 ? (
              <span className="text-brand-acid">{detections.length} TARGET LOCKED</span>
            ) : (
              <span className="text-brand-gray">SEARCHING</span>
            )}
          </span>
        </div>
      </div>

      {/* Bottom HUD Bar */}
      <div className="relative z-20 p-2.5 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest bg-gradient-to-t from-brand-black/90 to-transparent">
        <div className="flex items-center space-x-2 bg-brand-paper text-brand-black px-2 py-1 shadow-editorial border border-brand-black">
          <Eye className="w-3.5 h-3.5 text-brand-purple" />
          <span>AI INGEST: <strong className="text-brand-black">VehicleNet-Y26n</strong></span>
        </div>

        <div className="bg-brand-black text-brand-paper px-2 py-1 shadow-editorial border border-brand-black flex items-center gap-2">
          <span className="text-brand-gray">TIMECODE:</span>
          <span className="text-brand-acid font-bold">{currentVideoTime.toFixed(1)}s / 20.2s</span>
        </div>
      </div>
    </div>
  );
}

