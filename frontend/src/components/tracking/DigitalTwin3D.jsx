import React, { useEffect, useRef, useState } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Box, Compass } from 'lucide-react';
import CameraHoverPreview from '../common/CameraHoverPreview';

export default function DigitalTwin3D() {
  const canvasRef = useRef(null);
  const { currentTime, activeTrajectory, cameras } = useTracking();
  const [hoverPreview, setHoverPreview] = useState(null);
  const hoverTimeoutRef = useRef(null);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 3D Isometric Urban Digital Twin for Kanathur, Chennai
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Dark Void Background
      ctx.fillStyle = '#080B10';
      ctx.fillRect(0, 0, w, h);

      // 2. 3D Isometric Grid Lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;

      const originX = w / 2;
      const originY = h / 2 - 30;
      const gridStep = 45;

      // Draw isometric floor grid
      for (let i = -8; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(originX + (i * gridStep * 1.5) - 400, originY + (i * gridStep * 0.75) + 200);
        ctx.lineTo(originX + (i * gridStep * 1.5) + 400, originY + (i * gridStep * 0.75) - 200);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(originX - (i * gridStep * 1.5) - 400, originY + (i * gridStep * 0.75) - 200);
        ctx.lineTo(originX - (i * gridStep * 1.5) + 400, originY + (i * gridStep * 0.75) + 200);
        ctx.stroke();
      }

      // 3. 3D Extruded Building Blocks along CLV Nagar 1st Street
      const buildings = [
        { x: -160, y: -60, w: 50, h: 40, height3d: 65, label: 'Res-101' },
        { x: -90, y: -80, w: 60, h: 45, height3d: 80, label: 'Res-103' },
        { x: -10, y: -75, w: 55, h: 50, height3d: 70, label: 'Res-105' },
        { x: 70, y: -85, w: 65, h: 45, height3d: 90, label: 'Res-107' },
        { x: 150, y: -65, w: 50, h: 45, height3d: 60, label: 'Res-109' },
        { x: -170, y: 65, w: 55, h: 45, height3d: 70, label: 'Res-102' },
        { x: -95, y: 75, w: 65, h: 50, height3d: 85, label: 'Res-104' },
        { x: -15, y: 70, w: 60, h: 45, height3d: 65, label: 'Res-106' },
        { x: 65, y: 80, w: 55, h: 45, height3d: 75, label: 'Res-108' },
        { x: 145, y: 70, w: 60, h: 45, height3d: 80, label: 'Res-110' }
      ];

      buildings.forEach(b => {
        const bx = originX + b.x;
        const by = originY + b.y;

        // Building base
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(bx, by, b.w, b.h);

        // Building 3D top face (extrusion)
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + 12, by - (b.height3d * 0.35));
        ctx.lineTo(bx + b.w + 12, by - (b.height3d * 0.35));
        ctx.lineTo(bx + b.w, by);
        ctx.closePath();
        ctx.fill();

        // Side extrusion
        ctx.fillStyle = '#131D31';
        ctx.beginPath();
        ctx.moveTo(bx + b.w, by);
        ctx.lineTo(bx + b.w + 12, by - (b.height3d * 0.35));
        ctx.lineTo(bx + b.w + 12, by + b.h - (b.height3d * 0.35));
        ctx.lineTo(bx + b.w, by + b.h);
        ctx.closePath();
        ctx.fill();

        // Building Wireframe edges
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.strokeRect(bx, by, b.w, b.h);
      });

      // 4. CLV Nagar 1st Street Corridor (Primary Vector)
      const cam1X = originX - 180;
      const cam1Y = originY + 10;
      const cam2X = originX + 180;
      const cam2Y = originY + 10;

      // Roadway ribbon
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.lineWidth = 32;
      ctx.beginPath();
      ctx.moveTo(cam1X - 70, cam1Y + 5);
      ctx.lineTo(cam2X + 70, cam2Y + 5);
      ctx.stroke();

      // Road edge lines (Neon Cyan/Blue boundary)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cam1X - 70, cam1Y - 10);
      ctx.lineTo(cam2X + 70, cam2Y - 10);
      ctx.moveTo(cam1X - 70, cam1Y + 20);
      ctx.lineTo(cam2X + 70, cam2Y + 20);
      ctx.stroke();

      // Road Centerline Dashes
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(cam1X - 70, cam1Y + 5);
      ctx.lineTo(cam2X + 70, cam2Y + 5);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // 5. Camera Node Beacons (3D Glowing Pillars)
      const drawBeacon = (x, y, id, label) => {
        // Vertical beam
        const grad = ctx.createLinearGradient(x, y - 80, x, y);
        grad.addColorStop(0, 'rgba(212, 255, 50, 0)');
        grad.addColorStop(1, 'rgba(212, 255, 50, 0.85)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 80);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Base radar ring
        ctx.strokeStyle = '#D4FF32';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(x, y, 16, 8, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Expanding pulse
        const pulse = (currentTime * 2) % 3;
        ctx.strokeStyle = `rgba(212, 255, 50, ${Math.max(0, 1 - pulse / 3)})`;
        ctx.beginPath();
        ctx.ellipse(x, y, 16 + pulse * 10, 8 + pulse * 5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Label Tag Box
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#D4FF32';
        ctx.lineWidth = 1;
        ctx.fillRect(x - 42, y - 98, 84, 20);
        ctx.strokeRect(x - 42, y - 98, 84, 20);

        ctx.fillStyle = '#D4FF32';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(id, x, y - 84);
      };

      drawBeacon(cam1X, cam1Y + 5, 'CAM-01', 'West Gate (ECR)');
      drawBeacon(cam2X, cam2Y + 5, 'CAM-02', 'East Junction');

      // 6. Dynamic Trajectory Ribbons & Moving Vehicle
      let vehProgress = null;
      let vehLabel = '';
      let isViolation = false;

      if (currentTime >= 4.0 && currentTime <= 12.5) {
        // Motorcycle moving CAM-02 -> CAM-01
        vehProgress = 1 - Math.min(1, Math.max(0, (currentTime - 4.0) / 8.0));
        vehLabel = 'TN11AH4920';
        isViolation = false;
      } else if (currentTime >= 16.0 && currentTime <= 20.0) {
        // Wanted SUV moving CAM-01 -> CAM-02
        vehProgress = Math.min(1, Math.max(0, (currentTime - 16.0) / 4.0));
        vehLabel = '⚠ TN07BX8819';
        isViolation = true;
      }

      // Draw Trajectory Trail
      if (activeTrajectory || vehProgress !== null) {
        const color = isViolation ? '#FF3B30' : '#D4FF32';
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(cam1X, cam1Y + 5);
        ctx.lineTo(cam2X, cam2Y + 5);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // Draw Moving Vehicle Marker in 3D
      if (vehProgress !== null) {
        const vx = cam1X + (cam2X - cam1X) * vehProgress;
        const vy = cam1Y + 5;
        const color = isViolation ? '#FF3B30' : '#D4FF32';

        // Vehicle glowing orb
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(vx, vy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Vehicle plate label chip
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.fillRect(vx - 40, vy - 24, 80, 16);
        ctx.strokeRect(vx - 40, vy - 24, 80, 16);

        ctx.fillStyle = color;
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(vehLabel, vx, vy - 13);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentTime, activeTrajectory]);

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const w = canvas.width;
    const h = canvas.height;
    const originX = w / 2;
    const originY = h / 2 - 30;

    const cam1X = originX - 180;
    const cam1Y = originY + 10;
    const cam2X = originX + 180;
    const cam2Y = originY + 10;

    // Check distance to CAM-01 beacon
    const dist1 = Math.hypot(mouseX - cam1X, mouseY - (cam1Y - 40));
    // Check distance to CAM-02 beacon
    const dist2 = Math.hypot(mouseX - cam2X, mouseY - (cam2Y - 40));

    if (dist1 < 50) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setHoverPreview({
        camId: 'CAM-01',
        name: 'CLV Nagar 1st St - West Gate (ECR)',
        zone: 'Kanathur Sector 1',
        x: e.clientX,
        y: e.clientY
      });
      canvas.style.cursor = 'pointer';
    } else if (dist2 < 50) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setHoverPreview({
        camId: 'CAM-02',
        name: 'CLV Nagar 1st St - East Junction',
        zone: 'Kanathur Sector 1',
        x: e.clientX,
        y: e.clientY
      });
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'default';
      if (!hoverTimeoutRef.current) {
        hoverTimeoutRef.current = setTimeout(() => {
          setHoverPreview(null);
          hoverTimeoutRef.current = null;
        }, 80);
      }
    }
  };

  const handleCanvasMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoverPreview(null);
  };

  return (
    <div className="relative w-full h-full min-h-[340px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
      <canvas
        ref={canvasRef}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        className="w-full h-full min-h-[340px] block"
      />

      {/* Street Name Badge */}
      <div className="absolute top-3 left-3 z-10 bg-black/85 border border-slate-800 px-3 py-1.5 rounded text-[11px] font-mono text-slate-300 flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-lime-hud animate-pulse"></span>
        <span className="font-bold text-slate-100">CLV Nagar 1st Street, Kanathur</span>
        <span className="text-slate-500">|</span>
        <span className="text-lime-hud">Chennai 3D Digital Twin</span>
      </div>

      {/* Orientation Compass HUD */}
      <div className="absolute top-3 right-3 z-10 bg-black/80 border border-slate-800 p-2 rounded text-[10px] font-mono text-slate-400 flex items-center space-x-1.5">
        <Compass className="w-3.5 h-3.5 text-lime-hud animate-spin" style={{ animationDuration: '24s' }} />
        <span>CANVAS: ISOMETRIC 3D</span>
      </div>

      {/* Speed & Inter-Node HUD */}
      {activeTrajectory && (
        <div className="absolute bottom-3 left-3 z-10 bg-black/90 border border-lime-hud/50 px-3 py-2 rounded-lg text-xs font-mono shadow-hud-lime flex items-center space-x-4">
          <div>
            <div className="text-[10px] text-slate-400">VEHICLE TRACKED</div>
            <div className="text-lime-hud font-bold text-sm">{activeTrajectory.plate}</div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <div className="text-[10px] text-slate-400">SPEED (INTER-NODE)</div>
            <div className="text-white font-bold text-sm">
              {activeTrajectory.speedKmh} <span className="text-[10px] text-slate-400">km/h</span>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <div className="text-[10px] text-slate-400">STATUS</div>
            <div className={`font-bold ${activeTrajectory.status === 'SPEED_VIOLATION' ? 'text-crimson-alert' : 'text-emerald-400'}`}>
              {activeTrajectory.status}
            </div>
          </div>
        </div>
      )}

      {/* Floating 16:9 Live Camera Hover Preview */}
      <CameraHoverPreview previewData={hoverPreview} />
    </div>
  );
}

