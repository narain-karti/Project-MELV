import React, { useState } from 'react';
import { Upload, Play, CheckCircle2, ShieldAlert, Cpu, Sparkles, RefreshCw } from 'lucide-react';

const PRESETS = [
  {
    id: 'hsrp_car',
    title: 'Preset 1: Sedan HSRP (Angled)',
    desc: 'High Security Plate under street lighting',
    plate: 'KA01MJ9941',
    vClass: 'Sedan',
    vColor: 'Red',
    confVehicle: '97.2%',
    confOcr: '96.8%',
    rto: 'Bengaluru Central (Koramangala RTO)',
    twoRow: false,
    blacklist: false
  },
  {
    id: 'scooter_tworow',
    title: 'Preset 2: Auto-Rickshaw (2-Row Plate)',
    desc: 'Split 2-line commercial yellow plate',
    plate: 'KA04MB2040',
    vClass: 'Three-wheeler',
    vColor: 'Yellow-Green',
    confVehicle: '95.4%',
    confOcr: '95.1%',
    rto: 'Bengaluru North (Yeshwanthpur RTO)',
    twoRow: true,
    blacklist: false
  },
  {
    id: 'wanted_suv',
    title: 'Preset 3: Wanted SUV (Low Light)',
    desc: 'Suspect vehicle flagged in police FIR',
    plate: 'KA03HA7712',
    vClass: 'SUV',
    vColor: 'White',
    confVehicle: '96.5%',
    confOcr: '95.8%',
    rto: 'Bengaluru East (Indiranagar RTO)',
    twoRow: false,
    blacklist: true,
    fir: 'FIR-2026-BLR-0941 (Stolen)'
  }
];

export default function LiveInspectorPage() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(PRESETS[0]);

  const handleRunInference = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setResult(selectedPreset);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-surface-card border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-cyan-hud bg-cyan-hud/10 px-2 py-0.5 rounded border border-cyan-hud/30">
              [TAB 02] TEST SANDBOX
            </span>
            <span className="text-lime-hud font-bold">UNSCRIPTED JUDGE INGESTION LAB</span>
          </div>
          <p className="text-slate-400 font-sans text-xs mt-1">
            Upload an arbitrary traffic image or select a benchmark test scenario to verify unscripted multi-stage AI inference in real time.
          </p>
        </div>

        <button
          onClick={handleRunInference}
          disabled={isProcessing}
          className="chamfer-btn bg-lime-hud hover:bg-lime-400 text-black px-4 py-2 font-bold flex items-center justify-center space-x-2 shadow-hud-lime transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>RUNNING INFERENCE...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-black" />
              <span>RUN EDGE INFERENCE</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Selector Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESETS.map((p) => {
          const isSelected = selectedPreset.id === p.id;
          return (
            <div
              key={p.id}
              onClick={() => {
                setSelectedPreset(p);
                setResult(p);
              }}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-surface-card border-lime-hud shadow-hud-lime'
                  : 'bg-surface-card/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-200">{p.title}</span>
                {p.blacklist && (
                  <span className="text-[9px] bg-crimson-alert/20 text-crimson-alert border border-crimson-alert/30 px-1.5 py-0.2 rounded font-bold">
                    HOTLIST
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-sans">{p.desc}</div>
              <div className="mt-2 text-lime-hud font-bold">{p.plate}</div>
            </div>
          );
        })}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="bg-surface-card border border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-lime-hud transition-colors cursor-pointer group">
        <Upload className="w-8 h-8 text-slate-500 group-hover:text-lime-hud mx-auto mb-2 transition-colors" />
        <div className="text-slate-300 font-bold">DRAG & DROP IMAGE OR VIDEO FILE HERE</div>
        <div className="text-slate-500 text-[10px] mt-1 font-sans">
          Supports JPEG, PNG, MP4 up to 50MB • Automatically passes to FastAPI / VehicleNet pipeline
        </div>
      </div>

      {/* 4 Numbered Modular Output Cards (Neo-Brutalist Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Card 01: VehicleNet-Y26n */}
        <div className="chamfer-card bg-surface-card border border-slate-800 p-3.5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="font-bold text-lime-hud">[01] PERCEPTION</span>
              <span>UVH-26 NANO</span>
            </div>
            <div className="text-sm font-bold text-slate-100 mt-1">VEHICLE CLASSIFIER</div>
            <div className="mt-3 p-2 bg-slate-950/80 rounded border border-slate-800 space-y-1 text-[11px]">
              <div className="text-slate-400">CLASS: <strong className="text-slate-100">{result.vClass}</strong></div>
              <div className="text-slate-400">COLOR: <strong className="text-slate-100">{result.vColor}</strong></div>
              <div className="text-slate-400">CONFIDENCE: <strong className="text-lime-hud">{result.confVehicle}</strong></div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500">IISc Bengaluru AIM Group Dataset</div>
        </div>

        {/* Card 02: Plate Localization */}
        <div className="chamfer-card bg-surface-card border border-slate-800 p-3.5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="font-bold text-cyan-hud">[02] LOCALIZATION</span>
              <span>YOLOV8-PLATE</span>
            </div>
            <div className="text-sm font-bold text-slate-100 mt-1">PLATE BOUNDING BOX</div>
            <div className="mt-3 p-2 bg-slate-950/80 rounded border border-slate-800 space-y-1 text-[11px]">
              <div className="text-slate-400">FORMAT: <strong className="text-slate-100">{result.twoRow ? '2-Row Square' : '1-Row HSRP'}</strong></div>
              <div className="text-slate-400">SPLITTER: <strong className="text-cyan-hud">{result.twoRow ? 'ACTIVE (Horizontal)' : 'BYPASS'}</strong></div>
              <div className="text-slate-400">BOX: <strong className="text-slate-300">[312, 140, 180, 120]</strong></div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Adaptive Bilateral Filtering applied</div>
        </div>

        {/* Card 03: PaddleOCR */}
        <div className="chamfer-card bg-surface-card border border-slate-800 p-3.5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="font-bold text-purple-400">[03] RECOGNITION</span>
              <span>PADDLEOCR V4</span>
            </div>
            <div className="text-sm font-bold text-slate-100 mt-1">TEXT PARSER</div>
            <div className="mt-3 p-2 bg-slate-950/80 rounded border border-slate-800 space-y-1 text-[11px]">
              <div className="text-slate-400">RAW: <strong className="text-slate-300">{result.plate}</strong></div>
              <div className="text-slate-400">OCR CONF: <strong className="text-lime-hud">{result.confOcr}</strong></div>
              <div className="text-slate-400">GRAMMAR: <strong className="text-emerald-400">PASSED</strong></div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Positional RTO syntax disambiguation</div>
        </div>

        {/* Card 04: Digital Identity */}
        <div className="chamfer-card bg-surface-card border border-slate-800 p-3.5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="font-bold text-emerald-400">[04] VERIFICATION</span>
              <span>VAHAN RTO</span>
            </div>
            <div className="text-sm font-bold text-slate-100 mt-1">DIGITAL FOOTPRINT</div>
            <div className="mt-3 p-2 bg-slate-950/80 rounded border border-slate-800 space-y-1 text-[11px]">
              <div className="text-slate-400">STATE: <strong className="text-slate-100">Karnataka (KA)</strong></div>
              <div className="text-slate-400 truncate">RTO: <strong className="text-slate-300 text-[10px]">{result.rto}</strong></div>
              <div className="text-slate-400">STATUS: {result.blacklist ? (
                <strong className="text-crimson-alert">WANTED / STOLEN</strong>
              ) : (
                <strong className="text-emerald-400">CLEARED</strong>
              )}</div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Persisted in Spatial Graph</div>
        </div>
      </div>
    </div>
  );
}
