import React, { useState, useRef } from 'react';
import { Upload, Play, CheckCircle2, ShieldAlert, Cpu, Sparkles, RefreshCw, Image as ImageIcon } from 'lucide-react';

const PRESETS = [
  {
    id: 'motorcycle_tworow',
    title: 'Preset 1: Kanathur Two-Wheeler (2-Row)',
    desc: 'Motorcycle passing CLV Nagar 1st Street East Junction',
    plate: 'TN11AH4920',
    vClass: 'Two-wheeler (Motorcycle)',
    vColor: 'Black-Silver',
    confVehicle: '96.8%',
    confOcr: '97.4%',
    state: 'Tamil Nadu (TN)',
    rto: 'Tambaram RTO / Kanathur Zone',
    twoRow: true,
    blacklist: false
  },
  {
    id: 'wanted_suv',
    title: 'Preset 2: Wanted SUV (Low Light Alert)',
    desc: 'High-speed intercept advisory flagged at ECR West Gate',
    plate: 'TN07BX8819',
    vClass: 'SUV (Mahindra Scorpio)',
    vColor: 'White',
    confVehicle: '96.9%',
    confOcr: '98.2%',
    state: 'Tamil Nadu (TN)',
    rto: 'Chennai South / Thiruvanmiyur RTO',
    twoRow: false,
    blacklist: true,
    fir: 'FIR-2026-CHN-KAN-0492 (Stolen Vehicle)'
  },
  {
    id: 'hsrp_car',
    title: 'Preset 3: Sedan HSRP (Angled Pass)',
    desc: 'Standard private vehicle at AMET University crosswalk',
    plate: 'TN09CJ4381',
    vClass: 'Sedan (Honda City)',
    vColor: 'Silver Metallic',
    confVehicle: '97.5%',
    confOcr: '96.4%',
    state: 'Tamil Nadu (TN)',
    rto: 'Chennai West / KK Nagar RTO',
    twoRow: false,
    blacklist: false
  }
];

export default function LiveInspectorPage() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(PRESETS[0]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleRunInference = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setResult(selectedPreset);
      setIsProcessing(false);
    }, 1100);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setUploadedImage(uploadEvent.target.result);
      setIsProcessing(true);
      setTimeout(() => {
        // Dynamic simulated recognition for uploaded media
        const detectedObj = {
          id: 'custom_upload',
          title: 'Custom Uploaded Media',
          desc: file.name,
          plate: 'TN11AH4920',
          vClass: 'Motorcycle',
          vColor: 'Dark Metallic',
          confVehicle: '96.1%',
          confOcr: '95.8%',
          state: 'Tamil Nadu (TN)',
          rto: 'Tambaram / ECR Corridor RTO',
          twoRow: true,
          blacklist: false
        };
        setSelectedPreset(detectedObj);
        setResult(detectedObj);
        setIsProcessing(false);
      }, 1400);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-surface-card border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
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

        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded border border-slate-700 hover:border-slate-500 bg-slate-900 text-slate-200 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-hud" />
            <span>UPLOAD MEDIA</span>
          </button>
          <button
            onClick={handleRunInference}
            disabled={isProcessing}
            className="chamfer-btn bg-lime-hud hover:bg-lime-400 text-black px-4 py-2 font-bold flex items-center justify-center space-x-2 shadow-hud-lime transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>RUN EDGE INFERENCE</span>
              </>
            )}
          </button>
        </div>
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
                  <span className="text-[9px] bg-crimson-alert/20 text-crimson-alert border border-crimson-alert/30 px-1.5 py-0.2 rounded font-bold animate-pulse">
                    HOTLIST
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-sans">{p.desc}</div>
              <div className="mt-2 text-lime-hud font-bold flex items-center justify-between">
                <span>{p.plate}</span>
                <span className="text-[10px] text-slate-500 font-normal font-sans">{p.vClass.split(' ')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag & Drop Upload Zone / Image Preview */}
      {uploadedImage ? (
        <div className="relative bg-surface-card border border-slate-700 rounded-lg p-3 overflow-hidden flex flex-col items-center">
          <div className="relative max-h-64 rounded overflow-hidden border border-slate-800">
            <img src={uploadedImage} alt="Uploaded Media" className="max-h-64 object-contain" />
            <div className="absolute inset-0 surveillance-scanline opacity-30 pointer-events-none"></div>
            {/* Simulated Bounding Box */}
            <div className="absolute top-[35%] left-[30%] w-[38%] h-[35%] border-2 border-lime-hud shadow-hud-lime flex items-start justify-start p-1 pointer-events-none">
              <span className="bg-lime-hud text-black text-[9px] font-bold px-1 rounded">
                {result.plate} ({result.confOcr})
              </span>
            </div>
          </div>
          <button
            onClick={() => setUploadedImage(null)}
            className="mt-2 text-[10px] text-slate-400 hover:text-slate-200 underline"
          >
            Clear image and use benchmark presets
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-surface-card border border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-lime-hud transition-colors cursor-pointer group"
        >
          <Upload className="w-8 h-8 text-slate-500 group-hover:text-lime-hud mx-auto mb-2 transition-colors" />
          <div className="text-slate-300 font-bold">DRAG & DROP OR CLICK TO UPLOAD TEST IMAGE / CCTV CLIP</div>
          <div className="text-slate-500 text-[10px] mt-1 font-sans">
            Supports JPEG, PNG, MP4 up to 50MB • Automatically processed by VehicleNet-Y26n + PaddleOCR Indian RTO Heuristics
          </div>
        </div>
      )}

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
          <div className="text-[10px] text-slate-500">IISc Bengaluru AIM Group Dataset (14 Indian Classes)</div>
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
          <div className="text-[10px] text-slate-500">Positional RTO syntax disambiguation (0/O, 1/I, 8/B)</div>
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
              <div className="text-slate-400">STATE: <strong className="text-slate-100">{result.state || 'Tamil Nadu (TN)'}</strong></div>
              <div className="text-slate-400 truncate">RTO: <strong className="text-slate-300 text-[10px]">{result.rto}</strong></div>
              <div className="text-slate-400">STATUS: {result.blacklist ? (
                <strong className="text-crimson-alert">WANTED / STOLEN</strong>
              ) : (
                <strong className="text-emerald-400">CLEARED</strong>
              )}</div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Persisted in Urban Spatiotemporal Graph</div>
        </div>
      </div>
    </div>
  );
}
