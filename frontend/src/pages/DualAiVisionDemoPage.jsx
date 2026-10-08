import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Activity, 
  Clock 
} from 'lucide-react';

const scenarios = [
  {
    title: "Accident Detection",
    description: "Simulate a traffic accident and see real-time AI detection",
    icon: "🚗💥",
  },
  {
    title: "Emergency Vehicle Priority",
    description: "Watch how ambulances get automatic signal clearance",
    icon: "🚑🚦",
  },
  {
    title: "Pothole Detection",
    description: "Infrastructure defect classification with severity levels",
    icon: "🕳️⚠️",
  },
];

const incidents = [
  { time: "00:00:45", type: "Accident", confidence: "94.6%", desc: "2-vehicle collision", frame: 1350 },
  { time: "00:01:32", type: "Emergency", confidence: "98.1%", desc: "Ambulance approaching", frame: 2760 },
  { time: "00:02:13", type: "Defect", confidence: "91.2%", desc: "Pothole - High severity", frame: 3990 },
];

// Module-level model cache to prevent React StrictMode duplicate variable registration
let cachedTmModel = null;
let cachedCocoModel = null;
let modelLoadingPromise = null;

export default function DualAiVisionDemoPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const lastFrameTime = useRef(0);
  const frameCount = useRef(0);

  const [model, setModel] = useState(cachedTmModel);
  const [objectDetectionModel, setObjectDetectionModel] = useState(cachedCocoModel);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState('/demo_video.mp4');
  const [predictions, setPredictions] = useState([]);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [isModelLoading, setIsModelLoading] = useState(!cachedTmModel || !cachedCocoModel);
  const [modelError, setModelError] = useState(null);
  const [showAccidentAlert, setShowAccidentAlert] = useState(false);
  const [alertDetails, setAlertDetails] = useState(null);
  const [emailStatus, setEmailStatus] = useState('idle');
  const [emailCooldownRemaining, setEmailCooldownRemaining] = useState(0);
  const [incidentLogs, setIncidentLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    fps: 0,
    latency: 0,
    totalFrames: 0,
    modelLoadTime: 0
  });

  const lastNotificationTime = useRef(0);
  const lastEmailSentTime = useRef(0);
  const EMAIL_COOLDOWN = 300000; // 5 minutes

  // Cooldown countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, EMAIL_COOLDOWN - (Date.now() - lastEmailSentTime.current));
      setEmailCooldownRemaining(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sendEmailAlert = async (confidence, force = false) => {
    const timeSinceLastEmail = Date.now() - lastEmailSentTime.current;
    if (!force && timeSinceLastEmail < EMAIL_COOLDOWN) {
      console.log(`📧 Email skipped: ${Math.ceil((EMAIL_COOLDOWN - timeSinceLastEmail) / 1000)}s cooldown remaining`);
      return;
    }

    setEmailStatus('sending');
    try {
      const response = await fetch('http://localhost:8000/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'accident',
          confidence: confidence,
          location: 'Video Analysis Feed',
          force: force
        })
      });
      if (response.ok) {
        setEmailStatus('success');
        lastEmailSentTime.current = Date.now();
        console.log('📧 Alert email sent successfully');
      } else {
        setEmailStatus('error');
        console.error(`Failed to send email: ${response.status}`);
      }
    } catch (error) {
      setEmailStatus('error');
      console.error('Failed to send alert email:', error);
    }
  };

  // Load both models (Teachable Machine + Local COCO-SSD) with singleton cache
  useEffect(() => {
    let cancelled = false;

    const waitForGlobals = () => {
      return new Promise((resolve) => {
        if (window.tmImage && window.cocoSsd) {
          resolve();
        } else {
          const interval = setInterval(() => {
            if (window.tmImage && window.cocoSsd) {
              clearInterval(interval);
              resolve();
            }
          }, 50);
        }
      });
    };

    const loadModels = async () => {
      if (cachedTmModel && cachedCocoModel) {
        if (!cancelled) {
          setModel(cachedTmModel);
          setObjectDetectionModel(cachedCocoModel);
          setIsModelLoading(false);
        }
        return;
      }

      if (modelLoadingPromise) {
        try {
          const { tm, coco } = await modelLoadingPromise;
          if (!cancelled) {
            setModel(tm);
            setObjectDetectionModel(coco);
            setIsModelLoading(false);
          }
        } catch (err) {
          if (!cancelled) {
            setModelError("Failed to load ML models. Please check console.");
            setIsModelLoading(false);
          }
        }
        return;
      }

      const startTime = performance.now();
      modelLoadingPromise = (async () => {
        await waitForGlobals();

        // 1. Load Teachable Machine model
        const modelURL = '/my_model/model.json';
        const metadataURL = '/my_model/metadata.json';
        const loadedTm = await window.tmImage.load(modelURL, metadataURL);

        // 2. Load COCO-SSD model (using local model shards)
        let loadedCoco = null;
        try {
          loadedCoco = await window.cocoSsd.load({ modelUrl: '/coco_model/model.json' });
        } catch (e) {
          console.warn('Local coco model failed, trying default load:', e);
          loadedCoco = await window.cocoSsd.load();
        }

        cachedTmModel = loadedTm;
        cachedCocoModel = loadedCoco;
        return { tm: loadedTm, coco: loadedCoco };
      })();

      try {
        const { tm, coco } = await modelLoadingPromise;
        if (!cancelled) {
          setModel(tm);
          setObjectDetectionModel(coco);
          const loadTime = performance.now() - startTime;
          setMetrics(prev => ({ ...prev, modelLoadTime: loadTime }));
          setIsModelLoading(false);

          if (videoRef.current) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }
      } catch (error) {
        console.error("Failed to load models:", error);
        modelLoadingPromise = null;
        if (!cancelled) {
          setModelError("Failed to load ML models. Please check console for details.");
          setIsModelLoading(false);
        }
      }
    };

    loadModels();

    return () => {
      cancelled = true;
    };
  }, [videoSrc]);

  const handleVideoUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setIsPlaying(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(err => console.log('Autoplay prevented:', err));
        }
      }, 100);
    }
  };

  const drawBoundingBoxes = (objects) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
    }

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding boxes
    objects.forEach((obj) => {
      const [x, y, width, height] = obj.bbox;

      // Different colors for different object types
      let color = '#00ff00';
      if (obj.class === 'person') color = '#ff00ff';
      else if (obj.class === 'car' || obj.class === 'truck' || obj.class === 'bus') color = '#00ffff';

      // Draw box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      ctx.fillStyle = color;
      const label = `${obj.class} ${Math.round(obj.score * 100)}%`;
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x, Math.max(0, y - 25), textWidth + 10, 25);

      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(label, x + 5, Math.max(18, y - 7));
    });
  };

  const predict = useCallback(async () => {
    if (model && objectDetectionModel && videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
      const predictionStartTime = performance.now();

      // Run both models
      const [tmPrediction, cocoDetections] = await Promise.all([
        model.predict(videoRef.current),
        objectDetectionModel.detect(videoRef.current)
      ]);

      const predictionEndTime = performance.now();
      const latency = predictionEndTime - predictionStartTime;

      // Update predictions
      setPredictions(tmPrediction);
      setDetectedObjects(cocoDetections);

      // Draw bounding boxes
      drawBoundingBoxes(cocoDetections);

      // Calculate FPS
      frameCount.current++;
      const currentTime = performance.now();
      if (currentTime - lastFrameTime.current >= 1000) {
        const fps = frameCount.current;
        setMetrics(prev => ({
          ...prev,
          fps,
          latency,
          totalFrames: prev.totalFrames + frameCount.current
        }));
        frameCount.current = 0;
        lastFrameTime.current = currentTime;
      }

      // Check for accident detection — threshold raised to 80%
      const accidentPrediction = tmPrediction.find(p =>
        p.className.toLowerCase().includes('accident')
      );

      if (accidentPrediction && accidentPrediction.probability > 0.8) {
        const currTime = Date.now();
        const timeSinceLastNotification = currTime - lastNotificationTime.current;
        const ALERT_COOLDOWN = 4000; // 4 seconds between UI alerts

        if (!showAccidentAlert && timeSinceLastNotification > ALERT_COOLDOWN) {
          setShowAccidentAlert(true);
          setAlertDetails({ confidence: accidentPrediction.probability });
          sendEmailAlert(accidentPrediction.probability);
          lastNotificationTime.current = currTime;

          // ADD TO INCIDENT LOG with 5-minute cooldown check
          const lastLog = incidentLogs.find(log => log.type === 'Accident');
          const LOG_COOLDOWN = 300000;

          if (!lastLog || (currTime - lastLog.timestamp) > LOG_COOLDOWN) {
            const newIncident = {
              id: Math.random().toString(36).substr(2, 9),
              type: 'Accident',
              confidence: accidentPrediction.probability,
              timestamp: currTime,
              location: 'Video Analysis Feed'
            };
            setIncidentLogs(prev => [newIncident, ...prev].slice(0, 50));
          }
        }
      }

      // Control processing rate (throttle to ~15-20 FPS)
      const PROCESSING_INTERVAL = 50; // ms between frames
      setTimeout(() => {
        if (videoRef.current && !videoRef.current.paused) {
          requestRef.current = requestAnimationFrame(predict);
        }
      }, PROCESSING_INTERVAL);
    }
  }, [model, objectDetectionModel, showAccidentAlert, incidentLogs]);

  useEffect(() => {
    if (isPlaying && model && objectDetectionModel) {
      lastFrameTime.current = performance.now();
      requestRef.current = requestAnimationFrame(predict);
    } else if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, model, objectDetectionModel, predict]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(e => console.log('Play prevented:', e));
        setIsPlaying(true);
      }
    }
  };

  return (
    <main className="min-h-screen px-4 md:px-8 pb-12 pt-4 select-none">
      <div className="container mx-auto max-w-7xl">
        {/* Header - Exact Project-K Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 font-mono tracking-tight">
            Live Demo
          </h1>
          <p className="text-gray-400 text-base max-w-2xl mx-auto italic font-mono">
            Experience Project K's AI-powered video analysis in real-time
          </p>
        </div>

        {/* Main Content Card - Video Upload Analysis */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative z-10 bg-white/[0.03] backdrop-blur-xl">
          <div className="p-6 bg-black/30 min-h-[560px]">
            <div className="rounded-2xl p-4 md:p-6 bg-black/40 border border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Video Player with Canvas Overlay - Left Side (2 columns) */}
                <div className="lg:col-span-2">
                  <div className="relative bg-black/60 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-white/5 shadow-inner">
                    {videoSrc ? (
                      <>
                        <video
                          ref={videoRef}
                          src={videoSrc}
                          className="w-full h-full object-contain"
                          loop
                          muted
                          playsInline
                          autoPlay
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                        />
                        {/* Canvas overlay for bounding boxes */}
                        <canvas
                          ref={canvasRef}
                          className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        />
                      </>
                    ) : (
                      <div className="text-center p-8">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">Upload Demo Video</h3>
                        <p className="text-gray-400 mb-6 text-sm">Upload a traffic video to analyze with ML models</p>
                        <label className="bg-[#FF1744] hover:bg-[#FF1744]/80 text-white font-bold py-2 px-6 rounded-lg cursor-pointer transition-colors text-sm">
                          Select Video
                          <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                        </label>
                      </div>
                    )}

                    {/* Overlay Controls */}
                    {videoSrc && (
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <button
                          onClick={togglePlay}
                          className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-colors border border-white/10"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>
                        <label className="bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-md cursor-pointer text-sm transition-colors border border-white/10 font-mono">
                          Change Video
                          <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analysis Panel - Right Side (1 column) */}
                <div className="space-y-6">
                  {/* Performance Metrics */}
                  <div className="rounded-xl p-4 bg-black/40 border border-white/10 shadow-lg">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-white font-mono">
                      <Activity className="w-4 h-4 text-[#FF1744]" />
                      Performance Metrics
                    </h3>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-400">FPS:</span>
                        <span className="font-bold text-[#00F0FF]">{metrics.fps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Latency:</span>
                        <span className="font-bold text-[#FF6D00]">{metrics.latency.toFixed(1)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Frames:</span>
                        <span className="font-bold text-white">{metrics.totalFrames}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Load Time:</span>
                        <span className="font-bold text-[#D500F9]">{(metrics.modelLoadTime / 1000).toFixed(2)}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Classification Results */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white font-mono">Classification</h3>
                      {isModelLoading ? (
                        <span className="text-[#FF6D00] text-sm animate-pulse font-mono">Loading ML Models...</span>
                      ) : modelError ? (
                        <span className="text-red-500 text-sm flex items-center gap-2 font-mono">
                          <AlertTriangle className="w-4 h-4" /> Error
                        </span>
                      ) : (
                        <span className="text-[#00E676] text-sm flex items-center gap-2 font-mono">
                          <CheckCircle className="w-4 h-4" /> Active
                        </span>
                      )}
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-4 font-mono">
                      {predictions.length > 0 ? (
                        predictions.map((pred, idx) => {
                          const isAccident = pred.className.toLowerCase().includes('accident');
                          const isHighConf = pred.probability > 0.8;

                          return (
                            <div key={idx} className={isAccident && isHighConf ? 'animate-pulse' : ''}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="capitalize font-medium text-gray-200">{pred.className}</span>
                                <span className={`font-mono ${isAccident && isHighConf ? 'text-red-500 font-bold' : 'text-gray-300'}`}>
                                  {(pred.probability * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/5">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isAccident && isHighConf
                                      ? 'bg-red-500'
                                      : pred.probability > 0.7
                                      ? 'bg-[#FF1744]'
                                      : 'bg-[#FF6D00]'
                                  }`}
                                  style={{ width: `${pred.probability * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-400 text-sm text-center py-4 font-mono">
                          {videoSrc ? (isPlaying ? "Analyzing frames..." : "Play video to start") : "Upload video"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* INLINE ACCIDENT ALERT — below progress bars */}
                  {showAccidentAlert && alertDetails && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                          </span>
                          <span className="text-red-500 font-bold text-sm uppercase tracking-wide font-mono">Accident Detected</span>
                        </div>
                        <button
                          onClick={() => setShowAccidentAlert(false)}
                          className="text-gray-400 hover:text-white transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono text-2xl font-bold text-red-500">
                          {(alertDetails.confidence * 100).toFixed(1)}%
                        </span>
                        <span className="text-gray-400 text-sm font-mono">confidence</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAccidentAlert(false)}
                          className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10 font-mono"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Test Email Button + Cooldown Status */}
                  <div className="flex items-center gap-2 font-mono">
                    <button
                      onClick={() => {
                        setShowAccidentAlert(true);
                        setAlertDetails({ confidence: 0.94 });
                        sendEmailAlert(0.94, true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#FF1744]/10 hover:bg-[#FF1744]/20 text-[#FF1744] border border-[#FF1744]/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      📧 mailtest
                    </button>
                    {emailCooldownRemaining > 0 && (
                      <span className="text-xs text-gray-400 font-mono">
                        Next auto-email: {Math.ceil(emailCooldownRemaining / 1000)}s
                      </span>
                    )}
                  </div>

                  {/* Email Status */}
                  {emailStatus !== 'idle' && (
                    <div className={`text-xs font-medium px-3 py-1.5 rounded-lg text-center font-mono ${
                      emailStatus === 'sending' ? 'bg-[#FF6D00]/10 text-[#FF6D00]' :
                      emailStatus === 'success' ? 'bg-[#00E676]/10 text-[#00E676]' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {emailStatus === 'sending' ? '⏳ Sending email...' :
                        emailStatus === 'success' ? '✅ Email sent successfully' :
                        '❌ Email endpoint skipped'}
                    </div>
                  )}

                  {modelError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-500 text-xs font-mono">{modelError}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* INCIDENT ACTIVITY LOGS SECTION */}
              <div className="mt-8 font-mono">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#FF1744]" />
                  <h3 className="text-xl font-bold text-white">Incident Activity Log</h3>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                  <div className="max-h-[300px] overflow-y-auto">
                    {incidentLogs.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/10">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Timestamp</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Incident Type</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Confidence</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Location</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {incidentLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                              <td className="px-6 py-4 text-sm font-mono text-gray-400">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className="flex items-center gap-2 text-red-500 font-bold">
                                  <AlertTriangle className="w-4 h-4" />
                                  {log.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-sm text-white font-bold">
                                {(log.confidence * 100).toFixed(1)}%
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-400">
                                {log.location}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center text-gray-400">
                        <div className="mb-4 flex justify-center opacity-30">
                          <Activity className="w-12 h-12" />
                        </div>
                        <p>No critical incidents detected in this session</p>
                        <p className="text-xs mt-1 text-gray-500">Logs will appear here in real-time when incidents are detected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Historical Incident Detection Log (from Project-K demo/page.tsx) */}
        <div className="mt-12 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl font-mono">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#FF1744]/20 flex items-center justify-center border border-[#FF1744]/30">
              <Activity className="w-6 h-6 text-[#FF1744]" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Incident Detection Log</h2>
              <p className="text-gray-400 text-sm">Historical analysis of detected events</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Confidence</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Frame #</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-300">{incident.time}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        incident.type === 'Accident' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                        incident.type === 'Emergency' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                        'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                      }`}>
                        {incident.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-[#00E676]">{incident.confidence}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{incident.desc}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{incident.frame}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scenarios Overview Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {scenarios.map((sc, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-start gap-3">
              <span className="text-2xl">{sc.icon}</span>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">{sc.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{sc.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
