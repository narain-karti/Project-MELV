import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Camera, Radio, Eye, Crosshair, ShieldAlert, CheckCircle2 } from 'lucide-react';
import videoDetectionsData from '../../data/video_detections.json';

export default function VideoSurveillance() {
  const { currentTime, isPlaying, setDigitalIdentity } = useTracking();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Camera Feed 01: Upstream (West Gate ECR) */}
      <CameraPanel
        cameraId="CAM-01"
        cameraName="CLV Nagar 1st St - West Gate (ECR)"
        fps="29.9"
        videoSrc="/videos/cam_01_upstream.mp4"
        globalTime={currentTime}
        isPlaying={isPlaying}
        setDigitalIdentity={setDigitalIdentity}
      />

      {/* Camera Feed 02: Downstream (East Junction) */}
      <CameraPanel
        cameraId="CAM-02"
        cameraName="CLV Nagar 1st St - East Junction"
        fps="29.9"
        videoSrc="/videos/cam_02_downstream.mp4"
        globalTime={currentTime}
        isPlaying={isPlaying}
        setDigitalIdentity={setDigitalIdentity}
      />
    </div>
  );
}

function CameraPanel({ cameraId, cameraName, fps, videoSrc, globalTime, isPlaying, setDigitalIdentity }) {
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

        {/* Live Multi-Vehicle Object Detection & ANPR Bounding Box Overlays */}
        {detections.map((det, index) => {
          const isBlacklist = det.is_blacklist;
          return (
            <div
              key={`${det.plate}-${index}`}
              className="absolute transition-all duration-150 pointer-events-none z-20"
              style={{
                left: `${det.bbox.x}%`,
                top: `${det.bbox.y}%`,
                width: `${det.bbox.w}%`,
                height: `${det.bbox.h}%`,
              }}
            >
              {/* Tactical Box Frame */}
              <div
                className={`w-full h-full relative border-2 ${
                  isBlacklist
                    ? 'border-brand-purple shadow-[0_0_12px_rgba(128,80,232,0.8)]'
                    : 'border-brand-acid shadow-[0_0_10px_rgba(200,232,77,0.7)]'
                }`}
              >
                {/* 4 Neo-Brutalist Corner Brackets */}
                <div className={`absolute -top-1.5 -left-1.5 w-3 h-3 border-t-[3px] border-l-[3px] ${isBlacklist ? 'border-brand-purple' : 'border-brand-acid'}`}></div>
                <div className={`absolute -top-1.5 -right-1.5 w-3 h-3 border-t-[3px] border-r-[3px] ${isBlacklist ? 'border-brand-purple' : 'border-brand-acid'}`}></div>
                <div className={`absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-[3px] border-l-[3px] ${isBlacklist ? 'border-brand-purple' : 'border-brand-acid'}`}></div>
                <div className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-[3px] border-r-[3px] ${isBlacklist ? 'border-brand-purple' : 'border-brand-acid'}`}></div>

                {/* Center Targeting Reticle Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`w-1.5 h-1.5 rounded-full ${isBlacklist ? 'bg-brand-purple animate-ping' : 'bg-brand-acid animate-pulse'}`}></div>
                </div>

                {/* Floating Top Chip: ANPR Plate Extraction */}
                <div
                  className={`absolute -top-7 left-0 whitespace-nowrap px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-brand-black shadow-[2px_2px_0px_#202020] flex items-center gap-1.5 ${
                    isBlacklist
                      ? 'bg-brand-purple text-brand-paper animate-pulse'
                      : 'bg-brand-acid text-brand-black'
                  }`}
                >
                  <span>{det.plate}</span>
                  <span className="opacity-75 text-[9px]">[{det.ocr_conf}%]</span>
                  {isBlacklist ? (
                    <span className="bg-brand-black text-brand-paper px-1 py-0.2 text-[8px] tracking-tighter">
                      WANTED
                    </span>
                  ) : (
                    <span className="bg-brand-black text-brand-acid px-1 py-0.2 text-[8px] tracking-tighter">
                      HSRP
                    </span>
                  )}
                </div>

                {/* Floating Bottom Chip: Model Class & Confidence */}
                <div className="absolute -bottom-5 left-0 whitespace-nowrap bg-brand-black text-brand-paper px-1.5 py-0.5 text-[8.5px] font-mono font-bold uppercase tracking-wider shadow-editorial border border-brand-black/40 flex items-center gap-1">
                  <span className="text-brand-acid">YOLOv8</span>
                  <span className="text-brand-gray">•</span>
                  <span>{det.class}</span>
                  <span className="text-brand-acid">[{det.model_conf}%]</span>
                </div>
              </div>
            </div>
          );
        })}
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

