import React from 'react';
import { useTracking } from '../context/TrackingContext';
import { Network, Server, HardDrive, Cpu, Wifi, CheckCircle2 } from 'lucide-react';

export default function EdgeNetworkPage() {
  const { cameras } = useTracking();

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-surface-card border border-slate-800 p-3.5 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">[TAB 06] EDGE AI TOPOLOGY & MESH HEALTH</span>
        </div>
        <div className="flex items-center space-x-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ALL 8 EDGE NODES ACTIVE</span>
        </div>
      </div>

      {/* Network Sizing & Bandwidth Economics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-surface-card border border-slate-800 p-4 rounded-lg space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-lime-hud" />
            <span>BANDWIDTH REDUCTION</span>
          </div>
          <div className="text-2xl font-bold text-lime-hud">99.82%</div>
          <div className="text-[11px] text-slate-400 font-sans">
            4.2 TB raw video avoided &rarr; 84 MB structured JSON telemetry transmitted across city mesh.
          </div>
        </div>

        <div className="bg-surface-card border border-slate-800 p-4 rounded-lg space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-hud" />
            <span>EDGE PERCEPTION HARDWARE</span>
          </div>
          <div className="text-lg font-bold text-slate-100">NVIDIA Jetson Orin Nano</div>
          <div className="text-[11px] text-slate-400 font-sans">
            Runs IISc VehicleNet-Y26n TensorRT + PaddleOCR locally in 14ms per frame.
          </div>
        </div>

        <div className="bg-surface-card border border-slate-800 p-4 rounded-lg space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span>SCALE CAPACITY</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">10,000+ NODES</div>
          <div className="text-[11px] text-slate-400 font-sans">
            Horizontal spatial graph architecture scales linearly without cloud video bottleneck.
          </div>
        </div>
      </div>

      {/* Node Topology Table */}
      <div className="bg-surface-card border border-slate-800 p-4 rounded-lg">
        <div className="font-bold text-slate-200 mb-2 flex items-center justify-between">
          <span>CITY-WIDE CAMERA NODE HEALTH MATRIX</span>
          <span className="text-[10px] text-slate-400">PROTOCOL: REST/MQTT OVER 4G/5G</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="text-[10px] text-slate-400 border-b border-slate-800 pb-1">
              <tr>
                <th className="pb-1.5">NODE ID</th>
                <th className="pb-1.5">LOCATION / CORRIDOR</th>
                <th className="pb-1.5">ZONE</th>
                <th className="pb-1.5">STREAM FPS</th>
                <th className="pb-1.5">BANDWIDTH</th>
                <th className="pb-1.5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cameras.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40">
                  <td className="py-2.5 font-bold font-mono">
                    <span className={`px-1.5 py-0.5 rounded ${c.type === 'physical_demo' ? 'bg-lime-hud/20 text-lime-hud border border-lime-hud/30' : 'bg-slate-800 text-slate-300'}`}>
                      {c.id}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-200 font-sans">{c.name}</td>
                  <td className="py-2.5 text-slate-400 font-sans">{c.zone}</td>
                  <td className="py-2.5 font-mono text-cyan-hud">{c.fps} FPS</td>
                  <td className="py-2.5 font-mono text-slate-400">{c.bandwidth_usage}</td>
                  <td className="py-2.5 text-right font-bold text-emerald-400">
                    ONLINE
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
