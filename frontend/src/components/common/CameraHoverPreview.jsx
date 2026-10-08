import React, { useState, useEffect, useRef } from 'react';
import { Camera, Radio, Eye } from 'lucide-react';
import { getApiUrl } from '../../utils/apiConfig';

/**

 * CameraHoverPreview
 * Floating 16:9 preview box for camera nodes on maps and dashboards.
 * 
 * Props:
 * - previewData: {
 *     camId: string,
 *     name: string,
 *     zone?: string,
 *     x: number, // clientX
 *     y: number, // clientY
 *     videoSrc?: string // optional local video fallback
 *   } | null
 */
export default function CameraHoverPreview({ previewData }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (previewData) {
      setStreamError(false);
      const boxWidth = 280;
      const boxHeight = 158 + 48; // 16:9 box + header/footer
      const margin = 16;

      // Position offset from cursor
      let posX = previewData.x + 18;
      let posY = previewData.y + 18;

      // Viewport collision detection
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Flip horizontally if overflowing right
      if (posX + boxWidth > viewportWidth - margin) {
        posX = previewData.x - boxWidth - 18;
      }
      // If still negative, pin to margin
      if (posX < margin) posX = margin;

      // Flip vertically if overflowing bottom
      if (posY + boxHeight > viewportHeight - margin) {
        posY = previewData.y - boxHeight - 18;
      }
      if (posY < margin) posY = margin;

      setCoords({ x: posX, y: posY });
      // Short delay for fade-in transition
      const timer = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [previewData]);

  if (!previewData) return null;

  const { camId, name, zone } = previewData;

  // Stream URL or Fallback video source
  const isPhysicalFeed = camId === 'CAM-01' || camId === 'CAM-02';
  const liveStreamUrl = getApiUrl(`/api/stream/cctv?camera=${camId}`);

  const fallbackVideoSrc = camId === 'CAM-02' 
    ? '/videos/cam_02_annotated.mp4' 
    : '/videos/cam_01_annotated.mp4';

  return (
    <div
      ref={boxRef}
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
      }}
      className={`fixed z-[99999] pointer-events-none transition-all duration-200 ease-out select-none transform ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="w-[280px] bg-brand-black border-2 border-brand-black shadow-[6px_6px_0px_#202020] chamfer-card overflow-hidden">
        {/* Header HUD */}
        <div className="bg-brand-paper px-2.5 py-1.5 border-b border-brand-black flex items-center justify-between font-mono text-[9px]">
          <div className="flex items-center space-x-1.5 truncate mr-2">
            <span className="bg-brand-black text-brand-paper font-bold px-1.5 py-0.5 border border-brand-black flex items-center gap-1 shadow-[1px_1px_0px_#202020]">
              <Camera className="w-3 h-3 text-brand-acid" />
              <span>{camId}</span>
            </span>
            <span className="font-bold text-brand-black truncate max-w-[130px]" title={name}>
              {name}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-brand-acid text-brand-black px-1.5 py-0.5 font-bold uppercase tracking-wider border border-brand-black shadow-[1px_1px_0px_#202020]">
            <Radio className="w-2.5 h-2.5 animate-pulse text-red-600" />
            <span>LIVE</span>
          </div>
        </div>

        {/* 16:9 Video Box */}
        <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
          {/* Live Feed / Fallback */}
          {isPhysicalFeed && !streamError ? (
            <img
              src={liveStreamUrl}
              alt={`${camId} Live Feed`}
              onError={() => setStreamError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={fallbackVideoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {/* Scanline overlay for tactical CCTV aesthetic */}
          <div className="absolute inset-0 surveillance-scanline pointer-events-none opacity-40"></div>

          {/* Feed Watermark */}
          <div className="absolute top-1.5 right-1.5 bg-black/80 px-1 py-0.5 text-[8px] font-mono font-bold text-brand-acid border border-brand-acid/40 tracking-wider">
            {isPhysicalFeed && !streamError ? 'RTSP :8000' : 'EDGE-SIM'}
          </div>

          <div className="absolute bottom-1.5 left-1.5 bg-black/80 px-1.5 py-0.5 text-[8px] font-mono font-bold text-brand-paper border border-white/20 tracking-wider flex items-center gap-1">
            <Eye className="w-2.5 h-2.5 text-brand-acid" />
            <span>YOLOv8 + OCR ACTIVE</span>
          </div>
        </div>

        {/* Footer Sub-HUD */}
        <div className="bg-brand-black px-2.5 py-1 text-[8px] font-mono text-brand-gray flex items-center justify-between border-t border-brand-dark-gray">
          <span className="truncate">{zone || 'Kanathur Mesh Zone'}</span>
          <span className="text-brand-acid font-bold">29.9 FPS</span>
        </div>
      </div>
    </div>
  );
}
