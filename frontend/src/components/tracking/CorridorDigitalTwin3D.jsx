import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Layers, 
  Flame, 
  Activity, 
  Radio, 
  Zap, 
  Maximize2,
  Gauge,
  Navigation,
  Compass
} from 'lucide-react';
import { projectCorridor } from '../../utils/isoProject';

// Curated live vehicles matching 13002160_1920_1080_60fps.mp4 arterial corridor
const CORRIDOR_VEHICLES = [
  { id: 1, type: 'Taxi (Yellow-Green)', plate: '1กท 7115', lane: 1, baseSpeed: 32.5, length: 14, width: 7, height: 6, color: '#FACC15', trailColor: 'rgba(250, 204, 21, 0.4)', initialY: -65 },
  { id: 2, type: 'Sedan (Silver)', plate: '5กฮ 2612', lane: 2, baseSpeed: 38.0, length: 13, width: 7, height: 5.5, color: '#38BDF8', trailColor: 'rgba(56, 189, 248, 0.4)', initialY: -40 },
  { id: 3, type: 'SUV (Mahindra Scorpio)', plate: '3ขข 8819', lane: 2, baseSpeed: 35.2, length: 15, width: 7.5, height: 7, color: '#EF4444', trailColor: 'rgba(239, 68, 68, 0.5)', initialY: 5, isAlert: true },
  { id: 4, type: 'Taxi (Orange)', plate: '9กผ 4402', lane: 1, baseSpeed: 29.8, length: 14, width: 7, height: 6, color: '#FB923C', trailColor: 'rgba(251, 146, 60, 0.4)', initialY: 30 },
  { id: 5, type: 'Minivan (White)', plate: '1มค 3391', lane: 3, baseSpeed: 42.0, length: 17, width: 8, height: 8, color: '#C8E84D', trailColor: 'rgba(200, 232, 77, 0.4)', initialY: -80 },
  { id: 6, type: 'Sedan (Black)', plate: '7กก 9104', lane: 2, baseSpeed: 36.4, length: 14, width: 7, height: 5.5, color: '#A855F7', trailColor: 'rgba(168, 85, 247, 0.4)', initialY: -15 },
  { id: 7, type: 'Motorcycle', plate: '4ขท 5520', lane: 1, baseSpeed: 45.0, length: 8, width: 3.5, height: 5, color: '#4ADE80', trailColor: 'rgba(74, 222, 128, 0.4)', initialY: -5 },
  { id: 8, type: 'Sedan (White)', plate: '2กบ 1840', lane: 3, baseSpeed: 39.5, length: 14, width: 7, height: 5.5, color: '#E2E8F0', trailColor: 'rgba(226, 232, 240, 0.4)', initialY: 50 },
  { id: 9, type: 'Commercial Van', plate: '8ขล 6621', lane: 3, baseSpeed: 34.0, length: 16, width: 8, height: 7.5, color: '#38BDF8', trailColor: 'rgba(56, 189, 248, 0.4)', initialY: -110 },
  { id: 10, type: 'Taxi (Yellow)', plate: '1กง 5201', lane: 1, baseSpeed: 31.0, length: 14, width: 7, height: 6, color: '#FACC15', trailColor: 'rgba(250, 204, 21, 0.4)', initialY: -130 }
];

export default function CorridorDigitalTwin3D({ 
  currentTime = 0, 
  isPlaying = true, 
  onSelectVehicle, 
  selectedVehicleId = null 
}) {
  const canvasRef = useRef(null);
  const [viewMode, setViewMode] = useState('iso'); // 'iso' or 'top'
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showVectors, setShowVectors] = useState(true);

  // Position history for trails
  const trailsRef = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight || 450;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // 3D Isometric Corridor Projection using shared utility
    const project = (x, y, z, w, h) => projectCorridor(viewMode, x, y, z, w, h);

    let tick = 0;

    const render = () => {
      tick += isPlaying ? 1 : 0;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Dark Blueprint Background
      ctx.fillStyle = '#141416';
      ctx.fillRect(0, 0, w, h);

      // 2. Blueprint Subtle Grid
      ctx.strokeStyle = '#222226';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let gx = -120; gx <= 120; gx += gridSize) {
        const p1 = project(gx, -150, 0, w, h);
        const p2 = project(gx, 150, 0, w, h);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // 3. Multi-Lane Urban Arterial Road Corridor
      // Road limits: x from -45 to +45, y from -160 to +160
      const roadCorners = [
        project(-48, -160, 0, w, h),
        project(48, -160, 0, w, h),
        project(48, 160, 0, w, h),
        project(-48, 160, 0, w, h)
      ];

      // Road Asphalt Surface
      ctx.beginPath();
      ctx.moveTo(roadCorners[0].x, roadCorners[0].y);
      roadCorners.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();
      ctx.fillStyle = '#1C1C20';
      ctx.fill();
      ctx.strokeStyle = '#383842';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Curbs & Sidewalks
      const leftSidewalk = [
        project(-58, -160, 1.5, w, h),
        project(-48, -160, 1.5, w, h),
        project(-48, 160, 1.5, w, h),
        project(-58, 160, 1.5, w, h)
      ];
      ctx.beginPath();
      ctx.moveTo(leftSidewalk[0].x, leftSidewalk[0].y);
      leftSidewalk.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();
      ctx.fillStyle = '#26262C';
      ctx.fill();

      const rightSidewalk = [
        project(48, -160, 1.5, w, h),
        project(58, -160, 1.5, w, h),
        project(58, 160, 1.5, w, h),
        project(48, 160, 1.5, w, h)
      ];
      ctx.beginPath();
      ctx.moveTo(rightSidewalk[0].x, rightSidewalk[0].y);
      rightSidewalk.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();
      ctx.fillStyle = '#26262C';
      ctx.fill();

      // Lane Dividers (Lane 1: x in [-45, -15], Lane 2: x in [-15, 15], Lane 3: x in [15, 45])
      // Dashed lane lines at x = -16 and x = 16
      [-16, 16].forEach(lx => {
        ctx.strokeStyle = '#4D4D58';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        const pStart = project(lx, -160, 0.2, w, h);
        const pEnd = project(lx, 160, 0.2, w, h);
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Yellow Median / Outer Curbside Guide
      [-48, 48].forEach(lx => {
        ctx.strokeStyle = '#EAB308';
        ctx.lineWidth = 2;
        const pStart = project(lx, -160, 0.3, w, h);
        const pEnd = project(lx, 160, 0.3, w, h);
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
      });

      // 4. Traffic Density Heat Map Layer (Corridor Concentration Hotspots)
      if (showHeatmap) {
        ctx.save();
        // Two major traffic concentration clusters in corridor (matching Bangkok video slow-down zone)
        const hotspots = [
          { x: -5, y: -20, r: 45, intensity: 0.55 },
          { x: -12, y: 35, r: 50, intensity: 0.65 },
          { x: 18, y: -60, r: 40, intensity: 0.45 }
        ];

        hotspots.forEach(hs => {
          const center = project(hs.x, hs.y, 0.2, w, h);
          const outer = project(hs.x + hs.r, hs.y, 0.2, w, h);
          const rad = Math.abs(outer.x - center.x) || 60;

          const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, rad * 1.5);
          grad.addColorStop(0, `rgba(239, 68, 68, ${hs.intensity * 0.7})`); // Red hot core
          grad.addColorStop(0.35, `rgba(249, 115, 22, ${hs.intensity * 0.5})`); // Orange
          grad.addColorStop(0.65, `rgba(234, 179, 8, ${hs.intensity * 0.3})`); // Yellow
          grad.addColorStop(1, 'rgba(234, 179, 8, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(center.x, center.y, rad * 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 5. Vehicles Simulation Along Corridor
      const laneXCoords = { 1: -30, 2: 0, 3: 30 };

      CORRIDOR_VEHICLES.forEach(v => {
        // Compute position along corridor
        const laneX = laneXCoords[v.lane] || 0;
        const loopRange = 300;
        const progress = ((v.initialY + (tick * (v.baseSpeed / 30.0))) % loopRange) - 150;
        const vehY = progress;
        const vehX = laneX + Math.sin(tick * 0.04 + v.id) * 1.5; // slight realistic lane sway

        // Track trail
        if (!trailsRef.current[v.id]) trailsRef.current[v.id] = [];
        const trails = trailsRef.current[v.id];
        if (isPlaying && tick % 3 === 0) {
          trails.push({ x: vehX, y: vehY });
          if (trails.length > 18) trails.shift();
        }

        // Draw Motion Trail
        if (showTrails && trails.length > 1) {
          ctx.beginPath();
          const firstPt = project(trails[0].x, trails[0].y, 0.5, w, h);
          ctx.moveTo(firstPt.x, firstPt.y);
          trails.forEach((pt, idx) => {
            const screenPt = project(pt.x, pt.y, 0.5, w, h);
            ctx.lineTo(screenPt.x, screenPt.y);
          });
          ctx.strokeStyle = v.trailColor;
          ctx.lineWidth = v.isAlert ? 3 : 2;
          ctx.stroke();
        }

        // Draw 3D Vehicle Cuboid
        if (showVehicles) {
          const l = v.length;
          const bw = v.width;
          const bh = v.height;

          // Cuboid corners (Bottom: z=0, Top: z=bh)
          const b1 = project(vehX - bw/2, vehY - l/2, 0.5, w, h);
          const b2 = project(vehX + bw/2, vehY - l/2, 0.5, w, h);
          const b3 = project(vehX + bw/2, vehY + l/2, 0.5, w, h);
          const b4 = project(vehX - bw/2, vehY + l/2, 0.5, w, h);

          const t1 = project(vehX - bw/2, vehY - l/2, bh, w, h);
          const t2 = project(vehX + bw/2, vehY - l/2, bh, w, h);
          const t3 = project(vehX + bw/2, vehY + l/2, bh, w, h);
          const t4 = project(vehX - bw/2, vehY + l/2, bh, w, h);

          // Top face
          ctx.beginPath();
          ctx.moveTo(t1.x, t1.y);
          ctx.lineTo(t2.x, t2.y);
          ctx.lineTo(t3.x, t3.y);
          ctx.lineTo(t4.x, t4.y);
          ctx.closePath();
          ctx.fillStyle = v.color;
          ctx.fill();
          ctx.strokeStyle = v.isAlert ? '#FFFFFF' : '#141416';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Side faces (Isometric shading)
          if (viewMode === 'iso') {
            // Front face
            ctx.beginPath();
            ctx.moveTo(b3.x, b3.y);
            ctx.lineTo(t3.x, t3.y);
            ctx.lineTo(t4.x, t4.y);
            ctx.lineTo(b4.x, b4.y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fill();

            // Right side face
            ctx.beginPath();
            ctx.moveTo(b2.x, b2.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.lineTo(t3.x, t3.y);
            ctx.lineTo(b3.x, b3.y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fill();
          }

          // Alert Flashing Beacon for wanted target
          if (v.isAlert) {
            const beaconCenter = project(vehX, vehY, bh + 2, w, h);
            const pulse = (Math.sin(tick * 0.2) + 1) / 2;
            ctx.beginPath();
            ctx.arc(beaconCenter.x, beaconCenter.y, 4 + pulse * 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.6})`;
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Velocity Vector Arrow
          if (showVectors) {
            const arrowStart = project(vehX, vehY + l/2, bh/2, w, h);
            const arrowEnd = project(vehX, vehY + l/2 + (v.baseSpeed * 0.4), bh/2, w, h);
            ctx.beginPath();
            ctx.moveTo(arrowStart.x, arrowStart.y);
            ctx.lineTo(arrowEnd.x, arrowEnd.y);
            ctx.strokeStyle = v.isAlert ? '#EF4444' : '#C8E84D';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Tactical HUD Label Badge
          const labelPt = project(vehX, vehY, bh + 4, w, h);
          const isSelected = selectedVehicleId === v.id;
          
          ctx.save();
          ctx.font = 'bold 9px monospace';
          const txt = v.isAlert ? `! TARGET #${v.id} !` : `#${v.id} ${v.plate}`;
          const tm = ctx.measureText(txt);
          const pad = 4;
          
          ctx.fillStyle = isSelected 
            ? '#C8E84D' 
            : v.isAlert 
              ? '#EF4444' 
              : 'rgba(20, 20, 24, 0.9)';
          ctx.fillRect(labelPt.x - tm.width/2 - pad, labelPt.y - 12, tm.width + pad * 2, 14);
          
          ctx.strokeStyle = isSelected ? '#141414' : v.isAlert ? '#FFFFFF' : '#444448';
          ctx.lineWidth = 1;
          ctx.strokeRect(labelPt.x - tm.width/2 - pad, labelPt.y - 12, tm.width + pad * 2, 14);

          ctx.fillStyle = isSelected 
            ? '#141414' 
            : v.isAlert 
              ? '#FFFFFF' 
              : '#E5E5E6';
          ctx.textAlign = 'center';
          ctx.fillText(txt, labelPt.x, labelPt.y - 2);
          ctx.restore();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [viewMode, showHeatmap, showVehicles, showTrails, showVectors, isPlaying, selectedVehicleId]);

  return (
    <div className="border-2 border-brand-black bg-brand-black flex flex-col justify-between shadow-[4px_4px_0px_#181818] h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-3 border-b border-brand-dark-gray/60 bg-brand-black">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-brand-acid animate-pulse" />
          <span className="text-xs uppercase font-extrabold text-brand-paper tracking-wider">
            3D ARTERIAL CORRIDOR DIGITAL TWIN &amp; TRAFFIC HEAT MAP
          </span>
          <span className="bg-brand-acid text-brand-black text-[9px] px-1.5 py-0.5 font-bold uppercase shadow-[1px_1px_0px_#141414]">
            LIVE CORRIDOR TWIN
          </span>
        </div>

        {/* View & Layer Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex border border-brand-dark-gray bg-brand-dark-gray/40 p-0.5">
            <button
              onClick={() => setViewMode('iso')}
              className={`px-2 py-0.5 text-[9px] uppercase font-mono font-bold transition-all ${
                viewMode === 'iso'
                  ? 'bg-brand-acid text-brand-black shadow-[1px_1px_0px_#141414]'
                  : 'text-brand-gray hover:text-brand-paper'
              }`}
            >
              3D Corridor
            </button>
            <button
              onClick={() => setViewMode('top')}
              className={`px-2 py-0.5 text-[9px] uppercase font-mono font-bold transition-all ${
                viewMode === 'top'
                  ? 'bg-brand-purple text-brand-paper shadow-[1px_1px_0px_#141414]'
                  : 'text-brand-gray hover:text-brand-paper'
              }`}
            >
              2D Blueprint
            </button>
          </div>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-1 text-[9px] uppercase font-mono font-bold border transition-all ${
              showHeatmap 
                ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}
          >
            Heatmap
          </button>
          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-2 py-1 text-[9px] uppercase font-mono font-bold border transition-all ${
              showTrails 
                ? 'bg-brand-acid/20 text-brand-acid border-brand-acid/50' 
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}
          >
            Trails
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport - Pristine Full Height */}
      <div className="relative w-full aspect-video min-h-[380px] bg-[#141416] overflow-hidden select-none flex-1">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Live HUD Telemetry Overlay */}
        <div className="absolute bottom-3 left-3 bg-brand-black/95 border border-brand-acid text-brand-acid px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-editorial flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-brand-acid animate-pulse" />
            LIVE TWIN SYNC: <strong className="text-white">10 CORRIDOR TRACKS</strong>
          </span>
          <span className="text-brand-gray">|</span>
          <span className="text-brand-paper">
            CORRIDOR MEAN SPEED: <strong className="text-brand-acid">36.8 KM/H</strong>
          </span>
          <span className="text-brand-gray">|</span>
          <span className="text-brand-paper">
            HOTSPOT DENSITY: <strong className="text-amber-400">HIGH (ARTERIAL)</strong>
          </span>
        </div>

        {/* Corridor Multi-Lane Legend */}
        <div className="absolute top-3 right-3 bg-brand-black/90 border border-brand-black p-2 shadow-editorial space-y-1 text-[8px] font-bold uppercase tracking-wider">
          <div className="text-brand-gray border-b border-zinc-700 pb-0.5 mb-1">
            CORRIDOR LANES (13002160_FEED)
          </div>
          <div className="flex items-center gap-1.5 text-yellow-400">
            <span className="w-2 h-2 bg-yellow-400 rounded-xs"></span>
            <span>LANE 1: CURBSIDE / TAXI (1กท 7115)</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2 h-2 bg-sky-400 rounded-xs"></span>
            <span>LANE 2: THRU-TRAFFIC (3ขข 8819 TARGET)</span>
          </div>
          <div className="flex items-center gap-1.5 text-lime-400">
            <span className="w-2 h-2 bg-lime-400 rounded-xs"></span>
            <span>LANE 3: EXPRESS TRANSIT (VAN / SEDAN)</span>
          </div>
        </div>
      </div>

      {/* Corridor Analytics Footer Ribbon */}
      <div className="px-4 py-2 bg-brand-dark-gray/30 border-t border-brand-dark-gray/50 flex items-center justify-between text-[9px] font-mono text-brand-gray">
        <div className="flex items-center gap-4">
          <span>SPATIAL ALIGNMENT: <strong className="text-brand-paper">CORRIDOR GEO-REFERENCED</strong></span>
          <span>ESTIMATED DENSITY: <strong className="text-amber-400">14 VEH / 100M</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-acid animate-ping"></span>
          <span className="text-brand-paper font-bold">SYNCHRONIZED WITH LEFT CCTV FEED</span>
        </div>
      </div>
    </div>
  );
}
