import React, { useState, useEffect } from 'react';
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
import CityDigitalTwin3D from '../components/analytics/CityDigitalTwin3D';
import { getApiUrl } from '../utils/apiConfig';

export default function TrafficAnalyticsPage() {
  const [data, setData] = useState(analyticsData);

  useEffect(() => {
    fetch(getApiUrl('/api/analytics'))

      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json) {
          setData(prev => ({
            ...prev,
            daily_volume: json.daily_volume ?? prev.daily_volume,
            hourly_volume: json.hourly_volume ?? prev.hourly_volume,
            modal_split: json.modal_split ?? prev.modal_split,
            od_matrix: json.od_matrix ?? prev.od_matrix,
            corridor_hotspots: json.corridor_hotspots ?? prev.corridor_hotspots
          }));
        }
      })
      .catch(err => console.warn('Backend analytics endpoint fallback:', err));
  }, []);

  const hourly_volume = data?.hourly_volume || [];
  const modal_split = data?.modal_split || [];
  const od_matrix = data?.od_matrix || [];
  const corridor_hotspots = data?.corridor_hotspots || [];
  const daily_volume = data?.daily_volume || 842190;

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-mono text-xs select-none">
      {/* Top Title Banner */}
      <div className="bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-3 mb-2 md:mb-0">
          <BarChart3 className="w-6 h-6 text-brand-black" />
          <div>
            <span className="font-bold text-brand-black uppercase tracking-widest text-[11px] md:text-sm block">
              MACRO URBAN TRAFFIC ANALYTICS & DIGITAL TWIN
            </span>
            <span className="text-[9px] text-brand-gray font-sans block mt-0.5">
              SIH Problem Statement 26127: City-Wide ANPR Aggregation & Intelligent Traffic Flow Optimization
            </span>
          </div>
        </div>
        <div className="text-[10px] text-brand-gray font-bold tracking-widest uppercase">
          DAILY PASS-THROUGHS: <strong className="text-brand-acid bg-brand-black px-2 py-1 ml-1 shadow-editorial">{Number(daily_volume).toLocaleString()} VEHICLES</strong>
        </div>
      </div>

      {/* 3D City Digital Twin & Adaptive Traffic Signal Controller */}
      <CityDigitalTwin3D />

      {/* Grid: Hourly Density Curves + Modal Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Volume Line Chart (8 of 12 cols) */}
        <div className="lg:col-span-8 bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-brand-black/20 pb-3">
            <div>
              <div className="font-bold text-brand-black uppercase tracking-widest text-[11px]">HOURLY TRAFFIC DENSITY CURVE</div>
              <div className="text-[9px] text-brand-gray font-sans mt-1">Dual peak-hour patterns: 08:30-11:00 AM & 17:30-20:30 PM</div>
            </div>
            <span className="text-[9px] bg-brand-black text-brand-acid px-2 py-1 uppercase tracking-widest font-bold shadow-editorial">LIVE TELEMETRY</span>
          </div>

          <div className="h-56 w-full pt-2 min-h-[224px]">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={hourly_volume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#202020" strokeOpacity={0.1} />
                <XAxis dataKey="hour" stroke="#777777" tick={{ fontSize: 9, fill: '#777777', fontWeight: 'bold' }} />
                <YAxis yAxisId="left" stroke="#777777" tick={{ fontSize: 9, fill: '#777777', fontWeight: 'bold' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#777777" tick={{ fontSize: 9, fill: '#777777', fontWeight: 'bold' }} domain={[0, 80]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#202020', borderColor: '#202020', fontSize: '10px', color: '#E5E5E6', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="volume"
                  stroke="#202020"
                  strokeWidth={3}
                  dot={{ fill: '#202020', r: 4 }}
                  name="Vehicles/Hour"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avg_speed"
                  stroke="#C8E84D"
                  strokeWidth={3}
                  dot={{ fill: '#C8E84D', r: 3 }}
                  name="Avg Speed (km/h)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modal Split Donut (4 of 12 cols) */}
        <div className="lg:col-span-4 bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial flex flex-col justify-between">
          <div className="mb-4 border-b border-brand-black/20 pb-3">
            <div className="font-bold text-brand-black uppercase tracking-widest text-[11px]">VEHICLE MODAL SPLIT</div>
            <div className="text-[9px] text-brand-gray font-sans mt-1">From VehicleNet-Y26n 14 classes</div>
          </div>

          <div className="h-44 w-full flex items-center justify-center min-h-[176px]">
            <ResponsiveContainer width="100%" height={176}>
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
                  stroke="#E5E5E6"
                  strokeWidth={2}
                >
                  {modal_split.map((entry, index) => {
                    const customColor = entry.color || (entry.name?.includes('Two') ? '#C8E84D' : entry.name?.includes('Commercial') ? '#8050E8' : entry.name?.includes('Car') ? '#202020' : '#777777');
                    return <Cell key={`cell-${index}`} fill={customColor} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#202020', borderColor: '#202020', fontSize: '10px', color: '#E5E5E6', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9px] text-brand-black pt-3 border-t border-brand-black/20 uppercase tracking-widest font-bold">
            {modal_split.slice(0, 4).map((m) => {
              const customColor = m.color || (m.name?.includes('Two') ? '#C8E84D' : m.name?.includes('Commercial') ? '#8050E8' : m.name?.includes('Car') ? '#202020' : '#777777');
              return (
                <div key={m.name} className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 bg-brand-black shadow-editorial transform -rotate-3 border border-brand-black" style={{ backgroundColor: customColor }}></span>
                  <span className="truncate">{m.name}: <strong className="text-brand-acid bg-brand-black px-1 ml-0.5 shadow-editorial">{m.value}%</strong></span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Origin-Destination (OD) Matrix & Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OD Matrix */}
        <div className="bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial">
          <div className="font-bold text-brand-black uppercase tracking-widest text-[11px] mb-4 border-b border-brand-black/20 pb-3">ORIGIN-DESTINATION (OD) TRANSIT MATRIX</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] uppercase tracking-widest">
              <thead className="text-[9px] text-brand-gray border-b border-brand-black pb-2 font-bold">
                <tr>
                  <th className="pb-2">ORIGIN</th>
                  <th className="pb-2">DESTINATION</th>
                  <th className="pb-2 text-right">DAILY TRIPS</th>
                  <th className="pb-2 text-right">AVG DURATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-black/20">
                {od_matrix.map((row, i) => {
                  const trips = row.trips ?? row.transit_count ?? 0;
                  const duration = row.avg_time_mins ?? (row.avg_transit_sec ? (row.avg_transit_sec / 60).toFixed(1) : '—');
                  return (
                    <tr key={i} className="hover:bg-brand-acid/30 transition-colors">
                      <td className="py-2.5 text-brand-black font-bold">{row.origin}</td>
                      <td className="py-2.5 text-brand-black font-bold">{row.destination}</td>
                      <td className="py-2.5 text-right font-bold text-brand-black bg-white/50">{Number(trips).toLocaleString()}</td>
                      <td className="py-2.5 text-right text-brand-dark-gray">{duration} mins</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottleneck Hotspots */}
        <div className="bg-brand-paper border border-brand-black p-5 chamfer-card shadow-editorial">
          <div className="font-bold text-brand-black uppercase tracking-widest text-[11px] mb-4 border-b border-brand-black/20 pb-3 flex items-center justify-between">
            <span>CONGESTION BOTTLENECK CORRIDORS</span>
            <span className="text-brand-paper bg-brand-purple px-2 py-1 text-[9px] flex items-center gap-1 font-bold shadow-editorial -rotate-1">
              <AlertTriangle className="w-3 h-3" />
              HOTSPOTS
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] uppercase tracking-widest">
              <thead className="text-[9px] text-brand-gray border-b border-brand-black pb-2 font-bold">
                <tr>
                  <th className="pb-2">RANK</th>
                  <th className="pb-2">CORRIDOR</th>
                  <th className="pb-2 text-right">SPEED</th>
                  <th className="pb-2 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-black/20">
                {corridor_hotspots.map((c) => (
                  <tr key={c.rank} className="hover:bg-brand-acid/30 transition-colors">
                    <td className="py-2.5 text-brand-gray font-bold">#{c.rank}</td>
                    <td className="py-2.5 text-brand-black font-bold">{c.corridor}</td>
                    <td className="py-2.5 text-right font-bold text-brand-black bg-white/50">{c.current_speed_kmh} km/h</td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2 py-1 text-[9px] font-bold shadow-editorial ${
                        c.status === 'GRIDLOCK' ? 'bg-brand-purple text-brand-paper rotate-1 inline-block' : 'bg-brand-black text-brand-acid -rotate-1 inline-block'
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
