import React from 'react';
import analyticsData from '../data/synthetic_analytics.json';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export default function TrafficAnalyticsPage() {
  const { hourly_volume, modal_split, od_matrix, corridor_hotspots } = analyticsData;

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-mono text-xs">
      {/* Top Title Banner */}
      <div className="bg-surface-card border border-slate-800 p-3.5 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-cyan-hud" />
          <span className="font-bold text-slate-200">[TAB 04] MACRO URBAN TRAFFIC ANALYTICS</span>
        </div>
        <div className="text-[10px] text-slate-400">
          DAILY PASS-THROUGHS: <strong className="text-lime-hud">842,190 VEHICLES</strong>
        </div>
      </div>

      {/* Grid: Hourly Density Curves + Modal Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Hourly Volume Line Chart (8 of 12 cols) */}
        <div className="lg:col-span-8 bg-surface-card border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-bold text-slate-200">HOURLY TRAFFIC DENSITY CURVE</div>
              <div className="text-[10px] text-slate-400 font-sans">Dual peak-hour patterns: 08:30-11:00 AM & 17:30-20:30 PM</div>
            </div>
            <span className="text-[10px] text-lime-hud font-bold">LIVE TELEMETRY</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourly_volume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#00F2FE" tick={{ fontSize: 10 }} domain={[0, 80]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0D12', borderColor: '#334155', fontSize: '11px', color: '#fff' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="volume"
                  stroke="#D4FF32"
                  strokeWidth={2}
                  dot={{ fill: '#D4FF32', r: 3 }}
                  name="Vehicles/Hour"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avg_speed"
                  stroke="#00F2FE"
                  strokeWidth={2}
                  dot={{ fill: '#00F2FE', r: 2 }}
                  name="Avg Speed (km/h)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modal Split Donut (4 of 12 cols) */}
        <div className="lg:col-span-4 bg-surface-card border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
          <div>
            <div className="font-bold text-slate-200">VEHICLE MODAL SPLIT</div>
            <div className="text-[10px] text-slate-400 font-sans">From VehicleNet-Y26n 14 classes</div>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modal_split}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  stroke="#0A0D12"
                  strokeWidth={2}
                >
                  {modal_split.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0D12', borderColor: '#334155', fontSize: '11px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-400 pt-2 border-t border-slate-800">
            {modal_split.slice(0, 4).map((m) => (
              <div key={m.name} className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }}></span>
                <span className="truncate">{m.name}: <strong>{m.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Origin-Destination (OD) Matrix & Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* OD Matrix */}
        <div className="bg-surface-card border border-slate-800 p-4 rounded-lg">
          <div className="font-bold text-slate-200 mb-2">ORIGIN-DESTINATION (OD) TRANSIT MATRIX</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                <tr>
                  <th className="pb-1.5">ORIGIN</th>
                  <th className="pb-1.5">DESTINATION</th>
                  <th className="pb-1.5 text-right">DAILY TRIPS</th>
                  <th className="pb-1.5 text-right">AVG DURATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {od_matrix.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-2 text-slate-200 font-sans">{row.origin}</td>
                    <td className="py-2 text-slate-200 font-sans">{row.destination}</td>
                    <td className="py-2 text-right font-bold text-lime-hud">{row.trips.toLocaleString()}</td>
                    <td className="py-2 text-right text-slate-400">{row.avg_time_mins} mins</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottleneck Hotspots */}
        <div className="bg-surface-card border border-slate-800 p-4 rounded-lg">
          <div className="font-bold text-slate-200 mb-2 flex items-center justify-between">
            <span>CONGESTION BOTTLENECK CORRIDORS</span>
            <span className="text-crimson-alert text-[10px] flex items-center gap-1 font-bold">
              <AlertTriangle className="w-3 h-3" />
              HOTSPOTS
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                <tr>
                  <th className="pb-1.5">RANK</th>
                  <th className="pb-1.5">CORRIDOR</th>
                  <th className="pb-1.5 text-right">SPEED</th>
                  <th className="pb-1.5 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {corridor_hotspots.map((c) => (
                  <tr key={c.rank} className="hover:bg-slate-900/40">
                    <td className="py-2 text-slate-400 font-bold">#{c.rank}</td>
                    <td className="py-2 text-slate-200 font-sans">{c.corridor}</td>
                    <td className="py-2 text-right font-bold text-cyan-hud">{c.current_speed_kmh} km/h</td>
                    <td className="py-2 text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        c.status === 'GRIDLOCK' ? 'bg-crimson-alert/20 text-crimson-alert border border-crimson-alert/30' : 'bg-amber-hazard/20 text-amber-hazard'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
