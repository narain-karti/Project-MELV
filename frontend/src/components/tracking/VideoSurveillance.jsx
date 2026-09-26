import React, { useRef, useEffect } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Camera, Radio, Eye } from 'lucide-react';

export default function VideoSurveillance() {
  const { activeReticles, currentTime, isPlaying } = useTracking();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Camera Feed 01 */}
      <CameraPanel
        cameraId="CAM-01"
        cameraName="MG Road Northbound (Node 1)"
        fps="28.4"
        videoSrc="/videos/cam_01_upstream.mp4"
        reticle={activeReticles['CAM-01']}
        currentTime={currentTime}
        isPlaying={isPlaying}
      />

      {/* Camera Feed 02 */}
      <CameraPanel
        cameraId="CAM-02"
        cameraName="MG Road - Trinity Junction (Node 2)"
        fps="29.1"
        videoSrc="/videos/cam_02_downstream.mp4"
        reticle={activeReticles['CAM-02']}
        currentTime={currentTime}
        isPlaying={isPlaying}
      />
    </div>
  );
}

function CameraPanel({ cameraId, cameraName, fps, videoSrc, reticle, currentTime, isPlaying }) {
  const videoRef = useRef(null);
  const isTargetLocked = Boolean(reticle);
  const isBlacklist = reticle?.isBlacklist;

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div className="relative bg-surface-card border border-slate-800 rounded-lg overflow-hidden h-52 flex flex-col justify-between group shadow-lg">
      {/* Video Layer */}
      <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />

        {/* Subtle CCTV Grid & Scanline */}
        <div className="absolute inset-0 surveillance-scanline opacity-40 pointer-events-none"></div>

        {/* Dynamic Vehicle Targeting Reticle */}
        {isTargetLocked && (
          <div
            className="absolute transition-all duration-300 pointer-events-none z-10"
            style={{
              left: `${reticle.bbox.x}%`,
              top: `${reticle.bbox.y}%`,
              width: `${reticle.bbox.w}%`,
              height: `${reticle.bbox.h}%`,
            }}
          >
            {/* Tactical Corner Bracket Reticle */}
            <div
              className={`w-full h-full relative border-2 ${
                isBlacklist ? 'border-crimson-alert shadow-hud-crimson animate-pulse' : 'border-lime-hud shadow-hud-lime'
              }`}
            >
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white"></div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white"></div>
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white"></div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white"></div>

              {/* Center Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center opacity-60">
                <div className={`w-2 h-2 rounded-full ${isBlacklist ? 'bg-crimson-alert' : 'bg-lime-hud'}`}></div>
              </div>

              {/* Floating Plate Chip */}
              <div
                className={`absolute -top-7 left-0 whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider ${
                  isBlacklist
                    ? 'bg-crimson-alert text-white shadow-hud-crimson'
                    : 'bg-lime-hud text-black shadow-hud-lime'
                }`}
              >
                {reticle.plate} • {reticle.confidence}%
              </div>

              {/* Vehicle Class Badge */}
              <div className="absolute -bottom-6 left-0 bg-slate-900/90 text-slate-200 border border-slate-700 px-1.5 py-0.2 rounded text-[9px] font-mono">
                {reticle.vehicleClass}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top HUD Bar */}
      <div className="relative z-10 p-2.5 flex items-center justify-between text-xs font-mono bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center space-x-2">
          <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-slate-200 border border-slate-800">
            <Camera className="w-3 h-3 text-cyan-hud" />
            <strong className="text-white">{cameraId}</strong>
          </span>
          <span className="text-[11px] text-slate-300 font-sans truncate max-w-[180px]">
            {cameraName}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            {fps} FPS
          </span>
          <span className="bg-black/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
            HD-1080p
          </span>
        </div>
      </div>

      {/* Bottom HUD Bar */}
      <div className="relative z-10 p-2 flex items-center justify-between text-[11px] font-mono bg-gradient-to-t from-black/80 to-transparent text-slate-400">
        <div className="flex items-center space-x-2">
          <Eye className="w-3 h-3 text-slate-400" />
          <span>AI INGEST: <strong className="text-slate-200">VehicleNet-Y26n</strong></span>
        </div>

        <div className="text-slate-400">
          REC TIME: <span className="text-lime-hud font-bold">{(currentTime % 14).toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
}
