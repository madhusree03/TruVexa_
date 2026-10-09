import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import {
  Search,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Lock,
  ExternalLink,
  HelpCircle,
  QrCode,
  Sparkles,
  Zap,
  Camera,
  Upload,
  RefreshCw,
  Layers,
  FileImage,
  CheckCircle2,
  X,
  Activity,
  Radio,
} from 'lucide-react';

interface HeroScannerProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
  onGoToDashboard?: () => void;
}

interface DemoPreset {
  label: string;
  url: string;
  type: 'safe' | 'suspicious' | 'phishing';
  description: string;
  safetyEstimate: number;
}

const PRESET_URLS: DemoPreset[] = [
  {
    label: 'Standard HTTPS Documentation (Safe)',
    url: 'https://example.com/security/docs/v2',
    type: 'safe',
    description: 'Legitimate TLS link with standard domain hierarchy',
    safetyEstimate: 100,
  },
  {
    label: 'Open Source Repository (Safe)',
    url: 'https://github.com/torvalds/linux/releases',
    type: 'safe',
    description: 'Verified top-tier developer domain with clean reputation',
    safetyEstimate: 100,
  },
  {
    label: 'High-Risk TLD & Stacking (Suspicious)',
    url: 'http://secure-verify-account.login-update.xyz/banking/auth',
    type: 'suspicious',
    description: 'Disposable .xyz TLD, insecure HTTP, sub-domain stacking',
    safetyEstimate: 20,
  },
  {
    label: 'IP Host with Executable (Malicious)',
    url: 'http://192.168.1.105:8080/setup-update.exe',
    type: 'phishing',
    description: 'Raw IP address host + dangerous executable download',
    safetyEstimate: 0,
  },
  {
    label: 'PayPal Brand Spoof / Lookalike',
    url: 'https://paypa1-security-verification.com/signin/webapps/mpp/home',
    type: 'phishing',
    description: 'Character homoglyph substitution targeting PayPal credentials',
    safetyEstimate: 0,
  },
];

interface QrPreset {
  label: string;
  url: string;
  type: 'safe' | 'phishing';
  desc: string;
}

const QR_DEMO_PRESETS: QrPreset[] = [
  {
    label: 'Safe Corporate Portal QR',
    url: 'https://example.com/company/guest-wifi',
    type: 'safe',
    desc: 'Legitimate guest WiFi redirect',
  },
  {
    label: 'Fake Banking QR Quishing Attack',
    url: 'http://192.168.1.50/banking-login.exe',
    type: 'phishing',
    desc: 'Malicious QR placed on parking meter or invoice',
  },
  {
    label: 'Typosquatted Brand QR',
    url: 'https://paypa1-security-verification.com/login',
    type: 'phishing',
    desc: 'Lookalike PayPal credentials theft QR',
  },
];

export const HeroScanner: React.FC<HeroScannerProps> = ({
  onAnalyze,
  isLoading,
  errorMessage,
  onClearError,
  onGoToDashboard,
}) => {
  const [activeMode, setActiveMode] = useState<'url' | 'qr'>('url');
  const [inputUrl, setInputUrl] = useState('');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  // QR Scanner specific states
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [qrNotice, setQrNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onClearError();
    onAnalyze(inputUrl.trim());
  };

  const handleSelectPreset = (preset: DemoPreset, index: number) => {
    setInputUrl(preset.url);
    setSelectedPresetIndex(index);
    onClearError();
    onAnalyze(preset.url);
  };

  const handleClear = () => {
    setInputUrl('');
    setSelectedPresetIndex(null);
    onClearError();
  };

  // QR Camera Handling
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setQrNotice(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera stream not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      requestAnimationFrame(tickCamera);
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      setCameraError(
        err instanceof Error
          ? err.message
          : 'Unable to access camera. Please allow camera permissions or upload an image.'
      );
      setIsCameraActive(false);
    }
  };

  const tickCamera = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (canvas) {
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data) {
            const detected = code.data.trim();
            setScannedResult(detected);
            setQrNotice('Decoded QR destination link successfully!');
            stopCamera();
            // Automatically analyze decoded URL
            onAnalyze(detected);
            return;
          }
        }
      }
    }
    if (isCameraActive || streamRef.current) {
      animationFrameId.current = requestAnimationFrame(tickCamera);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // QR File Upload Handling
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCameraError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsScanningImage(true);
    setCameraError(null);
    setQrNotice(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imgUrl = e.target?.result as string;
      setPreviewImage(imgUrl);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          setIsScanningImage(false);
          setCameraError('Failed to initialize canvas context for QR decoding.');
          return;
        }

        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        setIsScanningImage(false);

        if (code && code.data) {
          const decoded = code.data.trim();
          setScannedResult(decoded);
          setQrNotice('QR Code decoded successfully from image!');
          onAnalyze(decoded);
        } else {
          setCameraError('No QR code detected in the uploaded image. Please ensure the QR is clear and well-lit.');
        }
      };
      image.onerror = () => {
        setIsScanningImage(false);
        setCameraError('Failed to load image file.');
      };
      image.src = imgUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <section className="relative overflow-hidden py-8 lg:py-12">
      {/* Background cyber radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* Unified Scanner Header with Segmented Switcher */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1120] border border-slate-800 shadow-2xl relative overflow-hidden card-hover-glow interactive-float">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              {/* Restored Previous Main Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Detect phishing and quishing{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
                  before it reaches you
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Scan suspicious web links or decode hidden QR code destinations. TruVexa analyzes security threat indicators, checks reputation feeds, reveals the exact reason behind the result, and displays <span className="text-white font-bold underline decoration-slate-400 underline-offset-4">what percentage it is safe</span>.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-700/80 shrink-0 self-start lg:self-center shadow-lg">
              <button
                type="button"
                onClick={() => setActiveMode('url')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer glow-complement-click ${
                  activeMode === 'url'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Web URL Scanner</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('qr')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer glow-complement-click ${
                  activeMode === 'qr'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code Scanner</span>
              </button>
            </div>
          </div>
        </div>



        {/* MODE 1: URL SCANNER */}
        {activeMode === 'url' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-6 card-hover-glow interactive-float">
              {/* URL Input Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl opacity-40 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300" />
                  <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-[#0d1527] border border-slate-700/80 group-hover:border-cyan-500/60 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
                    {/* Realistic scanning laser bar overlay when analyzing */}
                    {isLoading && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-laser z-20" />
                    )}

                    <div className="flex items-center flex-1 px-4 py-2 sm:py-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center text-cyan-400 mr-3 shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => {
                          setInputUrl(e.target.value);
                          if (errorMessage) onClearError();
                        }}
                        placeholder="Enter any link to scan (e.g. https://example.com/login.exe)"
                        disabled={isLoading}
                        className="w-full py-4 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm sm:text-base font-mono tracking-tight"
                      />
                      {inputUrl && (
                        <button
                          type="button"
                          onClick={handleClear}
                          disabled={isLoading}
                          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 text-xs shrink-0 cursor-pointer active:scale-95 transition-all"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="p-2 sm:p-2.5 sm:border-l sm:border-slate-800 shrink-0 flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isLoading || !inputUrl.trim()}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:via-blue-400 hover:to-purple-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.7),0_0_50px_rgba(168,85,247,0.5)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-glow glow-complement-click interactive-float"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>Calculating Safety %...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-slate-950" />
                            <span>Analyze URL & Calculate Safe %</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={onClearError}
                      className="text-rose-400 hover:text-rose-100 text-xs font-mono p-1"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </form>

              {/* Preset Test Scenarios */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    1-Click Sample Scenarios (Click any to test):
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                    Click to auto-scroll & view safety percentage
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {PRESET_URLS.map((preset, idx) => {
                    const isSelected = selectedPresetIndex === idx;
                    const typeColor =
                      preset.type === 'safe'
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : preset.type === 'suspicious'
                        ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                        : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset, idx)}
                        disabled={isLoading}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer group active:scale-95 glow-complement-click interactive-float ${
                          isSelected
                            ? 'bg-slate-800/90 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400'
                            : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${typeColor}`}>
                            {preset.safetyEstimate}% Safe
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Preset #{idx + 1}</span>
                        </div>
                        <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition truncate">
                          {preset.label}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                          {preset.url}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: QR SCANNER (IN THE SAME PAGE) */}
        {activeMode === 'qr' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-6 card-hover-glow interactive-float">
              {/* Camera & Upload Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Live Camera Viewfinder */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      Live Optical Camera Scanner
                    </span>
                    {isCameraActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Scanning Active
                      </span>
                    )}
                  </div>

                  {/* Video Viewfinder Container */}
                  <div className="relative aspect-video rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 overflow-hidden flex items-center justify-center shadow-inner group">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {isCameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-cyan-400/80 rounded-2xl relative shadow-[0_0_25px_rgba(34,211,238,0.4)]">
                          <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-laser" />
                        </div>
                      </div>
                    )}

                    {!isCameraActive && (
                      <div className="text-center p-6 space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                          <Camera className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-white">Camera Offline</h4>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            Activate your webcam or mobile camera to scan a QR code in real-time.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition cursor-pointer btn-glow glow-complement-click interactive-float"
                        >
                          Enable Camera Feed
                        </button>
                      </div>
                    )}
                  </div>

                  {isCameraActive && (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500/50 text-slate-300 text-xs font-semibold transition active:scale-95 cursor-pointer glow-complement-click"
                    >
                      Turn Off Camera
                    </button>
                  )}
                </div>

                {/* Right: Drag and Drop Upload */}
                <div className="lg:col-span-6 space-y-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-purple-400" />
                    Upload Image Containing QR Code
                  </span>

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="relative aspect-video rounded-2xl bg-slate-950/80 border-2 border-dashed border-slate-800 hover:border-purple-500/60 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group active:scale-[0.99] interactive-float"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    {previewImage ? (
                      <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                        <img
                          src={previewImage}
                          alt="Uploaded QR Preview"
                          className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                        />
                        {/* Laser scan line while decoding image - identical to URL and optical scanning */}
                        {isScanningImage && (
                          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-laser z-20" />
                        )}
                        {isScanningImage && (
                          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm rounded-lg flex items-center justify-center gap-2 text-cyan-300 text-xs font-mono z-10">
                            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                            <span>Decoding QR Code...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition duration-300">
                          <FileImage className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition">
                            Drop QR Code Image Here
                          </h4>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            Supports PNG, JPG, or WEBP screenshots. Click to browse.
                          </p>
                        </div>
                        <span className="inline-block px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300">
                          Browse Local Files
                        </span>
                      </div>
                    )}
                  </div>

                  {cameraError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  {qrNotice && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{qrNotice}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Decoded Output & Action */}
              {scannedResult && (
                <div className="relative group animate-fadeIn">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl opacity-40 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300" />
                  <div className="relative p-5 sm:p-6 rounded-2xl bg-[#0d1527] border border-slate-700/80 group-hover:border-cyan-500/60 shadow-2xl space-y-4 overflow-hidden">
                    {/* Realistic scanning laser bar overlay when analyzing - identical to URL scanner */}
                    {isLoading && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-laser z-20" />
                    )}

                    <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        Decoded Destination URL:
                      </span>
                      <span className="text-slate-400">Ready to Inspect</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-white break-all select-all flex items-center justify-between gap-3">
                      <span className="truncate">{scannedResult}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setScannedResult(null);
                          setPreviewImage(null);
                          setQrNotice(null);
                        }}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs shrink-0 cursor-pointer active:scale-95 transition-all"
                        title="Clear scanned link"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAnalyze(scannedResult)}
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:via-blue-400 hover:to-purple-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.7),0_0_50px_rgba(168,85,247,0.5)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-glow glow-complement-click interactive-float"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Calculating Safety %...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-slate-950" />
                          <span>Analyze URL & Calculate Safe %</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Sample QR Quishing Presets */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                  Test Sample QR Links:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {QR_DEMO_PRESETS.map((demo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setScannedResult(demo.url);
                        onAnalyze(demo.url);
                      }}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 text-left transition active:scale-95 cursor-pointer glow-complement-click interactive-float"
                    >
                      <div className="text-xs font-bold text-white mb-0.5 truncate">{demo.label}</div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">{demo.url}</div>
                      <div className="text-[10px] text-cyan-400 mt-1 font-mono">{demo.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
