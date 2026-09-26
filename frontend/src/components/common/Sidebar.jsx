import React from 'react';
import { useTracking } from '../../context/TrackingContext';
import { Video, Cpu, Search, BarChart3, AlertOctagon, Network } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'live_tracking', index: '01', label: 'Live Trajectory', icon: Video, badge: 'REC' },
  { id: 'ai_inspector', index: '02', label: 'AI Sandbox Lab', icon: Cpu, badge: 'TEST' },
  { id: 'trajectory_query', index: '03', label: 'Trajectory Query', icon: Search, badge: null },
  { id: 'traffic_analytics', index: '04', label: 'Urban Analytics', icon: BarChart3, badge: null },
  { id: 'alerts', index: '05', label: 'Alerts & Dispatch', icon: AlertOctagon, badge: 'HOT' },
  { id: 'network_status', index: '06', label: 'Edge Topology', icon: Network, badge: 'MESH' },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, blacklist } = useTracking();

  return (
    <aside className="w-64 bg-obsidian border-r border-slate-800/80 flex flex-col justify-between p-3 select-none flex-shrink-0">
      <div className="space-y-6">
        {/* Command Center Title */}
        <div className="px-2 pt-2">
          <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
            URBAN MOBILITY TWIN
          </div>
          <div className="text-lg font-display font-extrabold text-slate-100 flex items-center gap-1.5 mt-0.5">
            C4i COMMAND
            <span className="text-lime-hud text-xs font-mono font-normal">[v2.0]</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1.5 font-mono text-xs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all text-left group ${
                  isActive
                    ? 'bg-surface-card border-l-2 border-lime-hud text-slate-100 font-bold shadow-hud-lime'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`text-[10px] font-bold ${isActive ? 'text-lime-hud' : 'text-slate-400 group-hover:text-slate-300'}`}>
                    [{item.index}]
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-lime-hud' : 'text-slate-400 group-hover:text-slate-300'}`} />
                  <span className="font-sans text-xs font-medium tracking-wide">
                    {item.label}
                  </span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                      item.badge === 'REC'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : item.badge === 'TEST'
                        ? 'bg-cyan-hud/20 text-cyan-hud border border-cyan-hud/30'
                        : 'bg-crimson-alert/20 text-crimson-alert border border-crimson-alert/30'
                    }`}
                  >
                    {item.badge === 'HOT' ? blacklist.length : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Node Health Card */}
      <div className="bg-surface-card border border-slate-800 p-3 rounded-lg text-xs font-mono space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">MESH HEALTH</span>
          <span className="text-[10px] text-lime-hud font-bold">100% OPERATIONAL</span>
        </div>
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
          <div className="bg-lime-hud h-full w-full animate-pulse"></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>UPTIME: 99.8%</span>
          <span>LATENCY: 14ms</span>
        </div>
      </div>
    </aside>
  );
}
