import React from 'react';
import { useTracking } from '../context/TrackingContext';
import { Network, Server, HardDrive, Cpu, Wifi, CheckCircle2 } from 'lucide-react';

export default function EdgeNetworkPage() {
  const { cameras } = useTracking();

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-3 mb-2 md:mb-0">
          <Network className="w-6 h-6 text-brand-black" />
          <span className="font-bold text-brand-black uppercase tracking-widest text-[11px] md:text-sm">EDGE AI TOPOLOGY & MESH HEALTH</span>
        </div>
        <div className="flex items-center space-x-2 text-brand-black bg-brand-acid px-3 py-1.5 shadow-editorial border border-brand-black font-bold uppercase tracking-widest text-[10px]">
          <CheckCircle2 className="w-4 h-4" />
          <span>ALL 8 EDGE NODES ACTIVE</span>
        </div>
      </div>

      {/* Network Sizing & Bandwidth Economics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-brand-black p-5 chamfer-card shadow-[4px_4px_0px_#202020] space-y-2 flex flex-col">
          <div className="text-[10px] text-brand-gray font-bold uppercase tracking-widest border-b border-brand-black/20 pb-2 flex items-center gap-2">
            <span className="bg-brand-black text-brand-acid px-1.5 py-0.5 shadow-editorial inline-flex"><HardDrive className="w-3.5 h-3.5" /></span>
            <span>BANDWIDTH REDUCTION</span>
          </div>
          <div className="text-3xl font-black text-brand-black tracking-tighter pt-2">99.82%</div>
          <div className="text-[10px] text-brand-gray font-bold uppercase tracking-widest leading-relaxed mt-auto pt-4">
            4.2 TB raw video avoided &rarr; <strong className="text-brand-black bg-brand-acid px-1 border border-brand-black">84 MB structured JSON</strong> telemetry transmitted across city mesh.
          </div>
        </div>

        <div className="bg-white border-2 border-brand-black p-5 chamfer-card shadow-[4px_4px_0px_#202020] space-y-2 flex flex-col">
          <div className="text-[10px] text-brand-gray font-bold uppercase tracking-widest border-b border-brand-black/20 pb-2 flex items-center gap-2">
            <span className="bg-brand-black text-brand-paper px-1.5 py-0.5 shadow-editorial inline-flex"><Cpu className="w-3.5 h-3.5" /></span>
            <span>EDGE PERCEPTION HARDWARE</span>
          </div>
          <div className="text-[15px] font-black text-brand-black tracking-tighter pt-2 leading-tight uppercase">NVIDIA Jetson Orin Nano</div>
          <div className="text-[10px] text-brand-gray font-bold uppercase tracking-widest leading-relaxed mt-auto pt-4">
            Runs <strong className="text-brand-black">IISc VehicleNet-Y26n TensorRT + PaddleOCR</strong> locally in 14ms per frame.
          </div>
        </div>

        <div className="bg-white border-2 border-brand-black p-5 chamfer-card shadow-[4px_4px_0px_#202020] space-y-2 flex flex-col">
          <div className="text-[10px] text-brand-gray font-bold uppercase tracking-widest border-b border-brand-black/20 pb-2 flex items-center gap-2">
            <span className="bg-brand-black text-brand-purple px-1.5 py-0.5 shadow-editorial inline-flex"><Server className="w-3.5 h-3.5" /></span>
            <span>SCALE CAPACITY</span>
          </div>
          <div className="text-3xl font-black text-brand-purple tracking-tighter pt-2" style={{ textShadow: '2px 2px 0px #202020' }}>10,000+</div>
          <div className="text-[10px] text-brand-gray font-bold uppercase tracking-widest leading-relaxed mt-auto pt-4">
            Horizontal spatial graph architecture scales linearly without <strong className="text-brand-black bg-brand-paper px-1 border border-brand-black shadow-[1px_1px_0px_#202020]">cloud video bottleneck</strong>.
          </div>
        </div>
      </div>

      {/* Node Topology Table */}
      <div className="bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial mt-8">
        <div className="font-bold text-brand-black uppercase tracking-widest text-[11px] mb-4 border-b border-brand-black/20 pb-3 flex items-center justify-between">
          <span>CITY-WIDE CAMERA NODE HEALTH MATRIX</span>
          <span className="text-[9px] text-brand-gray bg-brand-black text-brand-paper px-2 py-1 shadow-editorial">PROTOCOL: REST/MQTT OVER 4G/5G</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] uppercase tracking-widest">
            <thead className="text-[9px] text-brand-gray border-b border-brand-black pb-2 font-bold">
              <tr>
                <th className="pb-2">NODE ID</th>
                <th className="pb-2">LOCATION / CORRIDOR</th>
                <th className="pb-2">ZONE</th>
                <th className="pb-2">STREAM FPS</th>
                <th className="pb-2">BANDWIDTH</th>
                <th className="pb-2 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-black/20">
              {cameras.map((c) => (
                <tr key={c.id} className="hover:bg-brand-acid/30 transition-colors">
                  <td className="py-3 font-bold font-mono">
                    <span className={`px-2 py-1 border border-brand-black shadow-editorial ${c.type === 'physical_demo' ? 'bg-brand-acid text-brand-black rotate-2 inline-block' : 'bg-brand-black text-brand-paper -rotate-1 inline-block'}`}>
                      {c.id}
                    </span>
                  </td>
                  <td className="py-3 text-brand-black font-bold">{c.name}</td>
                  <td className="py-3 text-brand-dark-gray font-bold">{c.zone}</td>
                  <td className="py-3 font-bold text-brand-black bg-white/50">{c.fps} FPS</td>
                  <td className="py-3 font-bold text-brand-gray">{c.bandwidth_usage}</td>
                  <td className="py-3 text-right font-bold text-brand-black">
                    <span className="bg-brand-acid text-brand-black px-2 py-0.5 border border-brand-black shadow-[1px_1px_0px_#202020]">ONLINE</span>
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
