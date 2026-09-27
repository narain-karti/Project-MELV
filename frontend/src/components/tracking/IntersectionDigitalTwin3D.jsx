import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Layers, 
  Eye, 
  Flame, 
  Activity, 
  Compass, 
  Radio, 
  Maximize2, 
  ShieldCheck, 
  TrendingUp, 
  Sliders, 
  ArrowUpRight,
  Zap,
  Info
} from 'lucide-react';
import trafficData from '../../data/traffic_analysis_data.json';

export default function IntersectionDigitalTwin3D({ currentTime = 0, isPlaying = true }) {
  const canvasRef = useRef(null);
  const [viewMode, setViewMode] = useState('iso'); // 'iso' (3D isometric) or 'top' (2D CAD blueprint)
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Sync with timeline
  const timeline = trafficData.timeline || [];
  const currentKeyframe = timeline.reduce((prev, curr) => {
    return Math.abs(curr.t - (currentTime % 27.8)) < Math.abs(prev.t - (currentTime % 27.8)) ? curr : prev;
  }, timeline[0] || {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight || 420;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // 3D Projection transformation
    const project = (x, y, z, w, h) => {
      const cx = w / 2;
      const cy = h / 2;

      if (viewMode === 'iso') {
        // Isometric 3D angle (30 deg skew)
        const cosAngle = Math.cos(Math.PI / 6);
        const sinAngle = Math.sin(Math.PI / 6);
        const scale = Math.min(w, h) / 220;

        const screenX = cx + (x - y) * cosAngle * scale;
        const screenY = cy + (x + y) * sinAngle * scale * 0.65 - (z * scale * 0.9);
        return { x: screenX, y: screenY };
      } else {
        // 2D Orthographic Top-Down Blueprint
        const scale = Math.min(w, h) / 210;
        return {
          x: cx + x * scale,
          y: cy + y * scale
        };
      }
    };

    let tick = 0;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Dark Blueprint Cyber Canvas
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, w, h);

      // 2. Blueprint Tactical Grid
      ctx.strokeStyle = '#27272A';
      ctx.lineWidth = 1;
      const gridSize = 20;

      for (let i = -100; i <= 100; i += gridSize) {
        const p1 = project(i, -100, 0, w, h);
        const p2 = project(i, 100, 0, w, h);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const p3 = project(-100, i, 0, w, h);
        const p4 = project(100, i, 0, w, h);
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }

      // 3. Draw 4-Way Road Surfaces (Asphalt Gray)
      // East-West Road
      const ewTL = project(-100, -22, 0, w, h);
      const ewTR = project(100, -22, 0, w, h);
      const ewBR = project(100, 22, 0, w, h);
      const ewBL = project(-100, 22, 0, w, h);

      ctx.fillStyle = '#202020';
      ctx.beginPath();
      ctx.moveTo(ewTL.x, ewTL.y);
      ctx.lineTo(ewTR.x, ewTR.y);
      ctx.lineTo(ewBR.x, ewBR.y);
      ctx.lineTo(ewBL.x, ewBL.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3F3F46';
      ctx.stroke();

      // North-South Road
      const nsTL = project(-22, -100, 0, w, h);
      const nsTR = project(22, -100, 0, w, h);
      const nsBR = project(22, 100, 0, w, h);
      const nsBL = project(-22, 100, 0, w, h);

      ctx.fillStyle = '#202020';
      ctx.beginPath();
      ctx.moveTo(nsTL.x, nsTL.y);
      ctx.lineTo(nsTR.x, nsTR.y);
      ctx.lineTo(nsBR.x, nsBR.y);
      ctx.lineTo(nsBL.x, nsBL.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3F3F46';
      ctx.stroke();

      // 4. Central Roundabout Circulatory Lane
      // Draw outer circle as a 3D isometric polygon
      const numSegments = 36;
      ctx.beginPath();
      for (let s = 0; s <= numSegments; s++) {
        const theta = (s / numSegments) * Math.PI * 2;
        const pt = project(Math.cos(theta) * 38, Math.sin(theta) * 38, 0, w, h);
        if (s === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.fillStyle = '#262626';
      ctx.fill();
      ctx.strokeStyle = '#52525B';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Center Island
      ctx.beginPath();
      for (let s = 0; s <= numSegments; s++) {
        const theta = (s / numSegments) * Math.PI * 2;
        const pt = project(Math.cos(theta) * 16, Math.sin(theta) * 16, 0, w, h);
        if (s === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.fillStyle = '#14532D'; // Lush Central Foliage/Monument
      ctx.fill();
      ctx.strokeStyle = '#C8E84D';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3D Monument cylinder in the center if in 3D isometric
      if (viewMode === 'iso') {
        const topCenter = project(0, 0, 18, w, h);
        const baseCenter = project(0, 0, 0, w, h);

        ctx.fillStyle = '#15803D';
        ctx.beginPath();
        for (let s = 0; s <= numSegments; s++) {
          const theta = (s / numSegments) * Math.PI * 2;
          const pt = project(Math.cos(theta) * 14, Math.sin(theta) * 14, 12, w, h);
          if (s === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.fill();
        ctx.strokeStyle = '#86EFAC';
        ctx.stroke();
      }

      // 5. Draw Thermal Density Heatmap Overlay
      if (showHeatmap) {
        const heatmap = trafficData.heatmap_grid || [];
        const rows = heatmap.length;
        const cols = heatmap[0]?.length || 0;
        const cellW = 200 / cols;
        const cellH = 200 / rows;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const intensity = heatmap[r][c];
            if (intensity > 0.25) {
              const x0 = -100 + c * cellW;
              const y0 = -100 + r * cellH;

              const p = project(x0 + cellW / 2, y0 + cellH / 2, 0.5, w, h);
              const radius = (cellW * Math.min(w, h)) / 180;

              // Glowing radial thermal dot
              const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
              if (intensity > 0.8) {
                radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.7)'); // Red Hot
                radGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.4)');
                radGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
              } else if (intensity > 0.5) {
                radGrad.addColorStop(0, 'rgba(234, 179, 8, 0.55)'); // Amber
                radGrad.addColorStop(0.6, 'rgba(200, 232, 77, 0.25)');
                radGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
              } else {
                radGrad.addColorStop(0, 'rgba(59, 130, 246, 0.35)'); // Blue Flow
                radGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
              }

              ctx.fillStyle = radGrad;
              ctx.beginPath();
              ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // 6. Draw Lane Markings & Turning Direction Vectors
      if (showVectors) {
        const arrowVectors = [
          { from: { x: -80, y: 10 }, to: { x: -45, y: 10 }, color: '#EAB308', label: 'WEST IN' },
          { from: { x: 45, y: 10 }, to: { x: 80, y: 10 }, color: '#3B82F6', label: 'EAST OUT' },
          { from: { x: 80, y: -10 }, to: { x: 45, y: -10 }, color: '#3B82F6', label: 'EAST IN' },
          { from: { x: -45, y: -10 }, to: { x: -80, y: -10 }, color: '#EAB308', label: 'WEST OUT' },
          { from: { x: -10, y: -80 }, to: { x: -10, y: -45 }, color: '#EF4444', label: 'NORTH IN' },
          { from: { x: 10, y: -45 }, to: { x: 10, y: -80 }, color: '#EF4444', label: 'NORTH OUT' },
          { from: { x: 10, y: 80 }, to: { x: 10, y: 45 }, color: '#22C55E', label: 'SOUTH IN' },
          { from: { x: -10, y: 45 }, to: { x: -10, y: 80 }, color: '#22C55E', label: 'SOUTH OUT' }
        ];

        arrowVectors.forEach(vec => {
          const p1 = project(vec.from.x, vec.from.y, 1, w, h);
          const p2 = project(vec.to.x, vec.to.y, 1, w, h);

          ctx.strokeStyle = vec.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Vector arrowhead
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          ctx.fillStyle = vec.color;
          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(p2.x - 6 * Math.cos(angle - Math.PI / 6), p2.y - 6 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(p2.x - 6 * Math.cos(angle + Math.PI / 6), p2.y - 6 * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        });
      }

      // 7. Render Active Vehicle Dots & Digital Footprints
      const vehicles = currentKeyframe.vehicles || [];

      if (showVehicles) {
        vehicles.forEach((veh) => {
          const pos = veh.pos_3d;
          const p = project(pos.x, pos.y, viewMode === 'iso' ? 4 : 0, w, h);

          // Footprint motion trail
          if (showTrails) {
            ctx.strokeStyle = veh.color || '#C8E84D';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const trailSteps = 5;
            for (let step = 0; step < trailSteps; step++) {
              // Backward trail simulation
              const tX = pos.x - (step * 3.5 * (pos.x > 0 ? 1 : -1));
              const tY = pos.y - (step * 1.5 * (pos.y > 0 ? 1 : -1));
              const tp = project(tX, tY, 0.5, w, h);
              if (step === 0) ctx.moveTo(tp.x, tp.y);
              else ctx.lineTo(tp.x, tp.y);
            }
            ctx.stroke();
          }

          // 3D Vehicle Body / Dot
          const isSelected = selectedVehicle?.tracker_id === veh.tracker_id;
          const vColor = veh.color || '#C8E84D';

          if (viewMode === 'iso') {
            // Extruded 3D Vehicle Block
            const pTop = project(pos.x, pos.y, 7, w, h);
            const pBase = project(pos.x, pos.y, 0, w, h);

            ctx.fillStyle = vColor;
            ctx.beginPath();
            ctx.arc(pTop.x, pTop.y, isSelected ? 6 : 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = isSelected ? '#FFFFFF' : '#000000';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.stroke();

            // Height anchor line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pTop.x, pTop.y);
            ctx.lineTo(pBase.x, pBase.y);
            ctx.stroke();
          } else {
            // 2D CAD Top Dot
            ctx.fillStyle = vColor;
            ctx.beginPath();
            ctx.arc(p.x, p.y, isSelected ? 6 : 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.stroke();
          }

          // Small Tracker Badge
          ctx.fillStyle = '#000000';
          ctx.fillRect(p.x + 6, p.y - 10, 22, 12);
          ctx.strokeStyle = vColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(p.x + 6, p.y - 10, 22, 12);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(`#${veh.tracker_id}`, p.x + 8, p.y - 1);
        });
      }

      // Compass Rose in Top Left
      const compOrigin = { x: 35, y: 35 };
      ctx.strokeStyle = '#C8E84D';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(compOrigin.x, compOrigin.y);
      ctx.lineTo(compOrigin.x, compOrigin.y - 20);
      ctx.stroke();

      ctx.fillStyle = '#C8E84D';
      ctx.beginPath();
      ctx.moveTo(compOrigin.x, compOrigin.y - 24);
      ctx.lineTo(compOrigin.x - 4, compOrigin.y - 18);
      ctx.lineTo(compOrigin.x + 4, compOrigin.y - 18);
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 9px monospace';
      ctx.fillText('N', compOrigin.x - 3, compOrigin.y - 26);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [viewMode, showHeatmap, showVehicles, showTrails, showVectors, currentKeyframe, selectedVehicle]);

  return (
    <div className="bg-brand-paper border-2 border-brand-black chamfer-card shadow-editorial overflow-hidden flex flex-col font-mono text-xs">
      
      {/* 3D Blueprint Header */}
      <div className="bg-brand-black text-brand-paper px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand-black">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 bg-brand-acid animate-ping rounded-full"></div>
          <span className="font-bold text-brand-acid tracking-widest text-[11px] uppercase">
            3D DIGITAL TWIN & THERMAL FLOW BLUEPRINT
          </span>
          <span className="text-brand-gray text-[9px] uppercase hidden sm:inline">
            [SUPERVISION ISOMETRIC SPATIAL ENGINE]
          </span>
        </div>

        {/* View Angle & Layer Toggles */}
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase">
          <button
            onClick={() => setViewMode(viewMode === 'iso' ? 'top' : 'iso')}
            className={`px-2 py-1 border transition-all flex items-center gap-1 ${
              viewMode === 'iso' 
                ? 'bg-brand-acid text-brand-black border-brand-acid' 
                : 'bg-zinc-800 text-brand-paper border-zinc-700'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>{viewMode === 'iso' ? '3D ISOMETRIC' : '2D TOP CAD'}</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-1 border transition-all flex items-center gap-1 ${
              showHeatmap 
                ? 'bg-amber-400 text-brand-black border-amber-400' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>HEATMAP</span>
          </button>

          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-2 py-1 border transition-all flex items-center gap-1 ${
              showTrails 
                ? 'bg-brand-purple text-brand-paper border-brand-purple' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>TRAILS</span>
          </button>

          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`px-2 py-1 border transition-all flex items-center gap-1 ${
              showVectors 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>VECTORS</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="relative w-full h-[400px] bg-[#18181B] overflow-hidden select-none">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Live HUD Overlay Badges */}
        <div className="absolute bottom-3 left-3 bg-brand-black/95 border border-brand-acid text-brand-acid px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-editorial flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-brand-acid animate-pulse" />
            LIVE TWIN SYNC: <strong className="text-white">{currentKeyframe.density || 20} ACTIVE TRACKS</strong>
          </span>
          <span className="text-brand-gray">|</span>
          <span className="text-brand-paper">
            MEAN SPEED: <strong className="text-brand-acid">{currentKeyframe.avg_speed || 29.4} KM/H</strong>
          </span>
          <span className="text-brand-gray">|</span>
          <span className="text-brand-paper">
            DELAY: <strong className="text-amber-400">{currentKeyframe.circulation_delay_sec || 4.2}s</strong>
          </span>
        </div>

        {/* 4 Approach Color Legend */}
        <div className="absolute top-3 right-3 bg-brand-black/90 border border-brand-black p-2.5 shadow-editorial space-y-1 text-[8.5px] font-bold uppercase tracking-wider">
          <div className="text-brand-gray text-[8px] border-b border-zinc-700 pb-1 mb-1.5">
            INTERSECTION ARM CODE
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-sm"></span>
            <span>NORTH RADIAL (IN: 14 | OUT: 12)</span>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-sm"></span>
            <span>SOUTH BOULEVARD (IN: 16 | OUT: 15)</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-400">
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></span>
            <span>WEST EXPRESSWAY (IN: 19 | OUT: 18)</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
            <span>EAST DOWNTOWN (IN: 21 | OUT: 20)</span>
          </div>
        </div>
      </div>

      {/* Strategic Digital Twin Use Cases Panel (Directly addressing SIH & User Audio Request) */}
      <div className="p-4 bg-brand-paper border-t-2 border-brand-black space-y-3">
        <div className="flex items-center justify-between border-b border-brand-black/20 pb-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-brand-black bg-brand-acid p-0.5" />
            <span className="font-bold text-brand-black text-[11px] uppercase tracking-widest">
              STRATEGIC SMART CITY USE CASES EMPOWERED BY THIS 3D DIGITAL TWIN
            </span>
          </div>
          <span className="bg-brand-black text-brand-paper px-2 py-0.5 text-[8.5px] font-bold shadow-editorial">
            SIH 26127 ARCHITECTURE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {trafficData.digital_twin_use_cases.map((uc) => (
            <div 
              key={uc.id}
              className="bg-white border-2 border-brand-black p-3 chamfer-card shadow-[2px_2px_0px_#202020] flex flex-col justify-between space-y-2 group hover:border-brand-acid transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="bg-brand-acid text-brand-black text-[8px] font-bold px-1.5 py-0.5 shadow-[1px_1px_0px_#202020]">
                    {uc.badge}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-brand-gray group-hover:text-brand-black transition-colors" />
                </div>
                <h4 className="font-bold text-[10px] text-brand-black uppercase tracking-wider leading-snug">
                  {uc.title}
                </h4>
                <p className="text-[9px] text-brand-gray leading-relaxed font-sans normal-case">
                  {uc.description}
                </p>
              </div>

              <div className="pt-2 border-t border-brand-black/10 flex items-center justify-between text-[8.5px] font-bold">
                <span className="text-brand-gray uppercase">MEASURED IMPACT:</span>
                <span className="text-brand-purple bg-brand-purple/10 px-1 py-0.5 border border-brand-purple/30">
                  {uc.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
