import React, { useEffect, useRef } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Box, Compass } from 'lucide-react';

export default function DigitalTwin3D() {
  const canvasRef = useRef(null);
  const { currentTime, activeTrajectory, cameras } = useTracking();

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

    // Simulated 3D Isometric Urban Grid Coordinates
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
      const originY = h / 2 - 40;
      const gridStep = 45;

      // Draw isometric grid
      for (let i = -8; i <= 8; i++) {
        // Line 1 (x-axis tilted)
        ctx.beginPath();
        ctx.moveTo(originX + (i * gridStep * 1.5) - 400, originY + (i * gridStep * 0.75) + 200);
        ctx.lineTo(originX + (i * gridStep * 1.5) + 400, originY + (i * gridStep * 0.75) - 200);
        ctx.stroke();

        // Line 2 (y-axis tilted)
        ctx.beginPath();
        ctx.moveTo(originX - (i * gridStep * 1.5) - 400, originY + (i * gridStep * 0.75) - 200);
        ctx.lineTo(originX - (i * gridStep * 1.5) + 400, originY + (i * gridStep * 0.75) + 200);
        ctx.stroke();
      }

      // 3. 3D Extruded Building Blocks (Simulated Digital Twin City Model)
      const buildings = [
        { x: -140, y: -40, w: 60, h: 50, height3d: 90 },
        { x: -70, y: -90, w: 70, h: 50, height3d: 130 },
        { x: 40, y: -70, w: 80, h: 60, height3d: 110 },
        { x: 140, y: -30, w: 60, h: 70, height3d: 85 },
        { x: -160, y: 70, w: 70, h: 50, height3d: 70 },
        { x: -50, y: 90, w: 80, h: 60, height3d: 120 },
        { x: 70, y: 80, w: 65, h: 50, height3d: 95 }
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
        ctx.lineTo(bx + 15, by - (b.height3d * 0.4));
        ctx.lineTo(bx + b.w + 15, by - (b.height3d * 0.4));
        ctx.lineTo(bx + b.w, by);
        ctx.closePath();
        ctx.fill();

        // Side extrusion
        ctx.fillStyle = '#131D31';
        ctx.beginPath();
        ctx.moveTo(bx + b.w, by);
        ctx.lineTo(bx + b.w + 15, by - (b.height3d * 0.4));
        ctx.lineTo(bx + b.w + 15, by + b.h - (b.height3d * 0.4));
        ctx.lineTo(bx + b.w, by + b.h);
        ctx.closePath();
        ctx.fill();

        // Building Wireframe edges
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.strokeRect(bx, by, b.w, b.h);
      });

      // 4. MG Road Transit Corridor (Primary Vector)
      const cam1X = originX - 160;
      const cam1Y = originY + 20;
      const cam2X = originX + 160;
      const cam2Y = originY + 20;

      // Roadway ribbon
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.lineWidth = 28;
      ctx.beginPath();
      ctx.moveTo(cam1X - 60, cam1Y + 15);
      ctx.quadraticCurveTo(originX, originY - 10, cam2X + 60, cam2Y + 25);
      ctx.stroke();

      // Road edge lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 5. Camera Node Beacons (3D Glowing Pillars)
      const drawBeacon = (x, y, label, isCam1) => {
        // Vertical beam
        const grad = ctx.createLinearGradient(x, y - 80, x, y);
        grad.addColorStop(0, 'rgba(212, 255, 50, 0)');
        grad.addColorStop(1, 'rgba(212, 255, 50, 0.8)');
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

        // Label Tag
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#D4FF32';
        ctx.lineWidth = 1;
        ctx.fillRect(x - 30, y - 95, 60, 18);
        ctx.strokeRect(x - 30, y - 95, 60, 18);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y - 82);
      };

      drawBeacon(cam1X, cam1Y, 'CAM-01', true);
      drawBeacon(cam2X, cam2Y, 'CAM-02', false);

      // 6. Dynamic Trajectory Ribbons (Deck.gl TripsLayer equivalent)
      if (activeTrajectory) {
        const isViolation = activeTrajectory.status === 'SPEED_VIOLATION';
        const color = isViolation ? '#FF3B30' : '#D4FF32';

        // Animated neon trail along the quadratic curve
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(cam1X, cam1Y);
        ctx.quadraticCurveTo(originX, originY - 10, cam2X, cam2Y);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentTime, activeTrajectory]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden border border-slate-800">
      <canvas ref={canvasRef} className="w-full h-full min-h-[300px]" />

      {/* Top 3D Camera Coordinate HUD */}
      <div className="absolute top-3 left-3 z-10 bg-black/80 px-2.5 py-1 rounded text-[10px] font-mono text-slate-300 border border-slate-800 flex items-center space-x-2">
        <Compass className="w-3 h-3 text-cyan-hud" />
        <span>PITCH: 45° | BEARING: -17.6° | ELEVATION: 110m</span>
      </div>

      {/* Trajectory HUD Overlay */}
      {activeTrajectory && (
        <div className="absolute bottom-3 left-3 z-10 bg-black/90 border border-lime-hud/50 px-3 py-2 rounded-lg text-xs font-mono shadow-hud-lime flex items-center space-x-4">
          <div>
            <div className="text-[10px] text-slate-400">3D DIGITAL TWIN TRACE</div>
            <div className="text-lime-hud font-bold text-sm">{activeTrajectory.plate}</div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div className="text-[10px] text-slate-400">CORRIDOR SPEED</div>
            <div className={`font-bold text-sm ${activeTrajectory.status === 'SPEED_VIOLATION' ? 'text-crimson-alert' : 'text-slate-100'}`}>
              {activeTrajectory.speedKmh} km/h
            </div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div className="text-[10px] text-slate-400">DISTANCE</div>
            <div className="text-slate-200 font-semibold">{activeTrajectory.distanceKm} km</div>
          </div>
        </div>
      )}
    </div>
  );
}
