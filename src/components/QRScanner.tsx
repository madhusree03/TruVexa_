import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  FileImage,
  Eye,
  X,
} from 'lucide-react';

interface QRScannerProps {
  onAnalyzeUrl: (url: string) => void;
  onGoToManualScanner?: () => void;
}

interface QrPreset {
  label: string;
  category: string;
  url: string;
  expectedSafety: string;
  badgeColor: string;
  description: string;
}

const SAMPLE_QR_PRESETS: QrPreset[] = [
  {
    label: 'Verified Bank Portal QR',
    category: 'Legitimate Financial',
    url: 'https://chase.com/personal/banking',
    expectedSafety: '100% Safe',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Clean legitimate banking link using valid HTTPS and authentic domain.',
  },
  {
    label: 'Fake Account Alert QR',
    category: 'Credential Phishing',
    url: 'https://security-notice.chase-login-auth.com/verify-account',
    expectedSafety: '15% Safe',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    description: 'Deceptive subdomain mimicking bank authentication to harvest credentials.',
  },
  {
    label: 'Shortened Link QR (Hidden Destination)',
    category: 'Obfuscated Redirect',
    url: 'https://bit.ly/secure-account-update-2026',
    expectedSafety: '40% Safe',
    badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    description: 'Masked destination hiding the true target server behind a public URL shortener.',
  },
  {
    label: 'Direct Malware Download QR',
    category: 'Malicious Payload',
    url: 'http://system-security-patch.download/critical_fix.exe',
    expectedSafety: '0% Safe',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    description: 'Insecure HTTP link directly triggering an executable binary download.',
  },
];

export const QRScanner: React.FC<QRScannerProps> = ({
  onAnalyzeUrl,
  onGoToManualScanner,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'presets'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [qrNotice, setQrNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when unmounting or switching mode
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setScannedResult(null);
    setQrNotice(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        scanVideoFrame();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or device does not have an active camera. You can upload a QR image directly below.');
      setIsCameraActive(false);
    }
  };

  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        const decoded = code.data.trim();
        setScannedResult(decoded);
        setQrNotice('QR code successfully detected and decoded!');
        stopCamera();
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  // Process uploaded image file
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
          setQrNotice('QR Code decoded successfully from uploaded image.');
        } else {
          setCameraError('No QR code detected in the uploaded image. Please ensure the QR code is clearly visible and well-lit.');
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

  const handleAnalyzeDecoded = () => {
    if (!scannedResult) return;
    onAnalyzeUrl(scannedResult);
  };

  const handleSelectPreset = (preset: QrPreset) => {
    setScannedResult(preset.url);
    setPreviewImage(null);
    setQrNotice(`Loaded test QR link: ${preset.label}`);
    setCameraError(null);
  };

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-2xl relative overflow-hidden card-hover-glow">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>TRUVEXA OPTICAL SCANNER · QR DECODER & THREAT VERIFIER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI-Powered QR Code Security Scanner
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              QR codes often conceal dangerous malicious links and spoofed URLs (Quishing attacks).
              Upload, capture with camera, or select a sample QR code to decode the destination and calculate its exact safety percentage before visiting.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => {
              setActiveMode('upload');
              stopCamera();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
              activeMode === 'upload'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.5)] font-bold'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload QR Image</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('camera');
              startCamera();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
              activeMode === 'camera'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.5)] font-bold'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera Scanner</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('presets');
              stopCamera();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
              activeMode === 'presets'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.8)] font-bold'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.5)]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>Demo QR Samples (Instant Test)</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Capture / Input Zone */}
        <div className="lg:col-span-7 space-y-6">
          {/* UPLOAD MODE */}
          {activeMode === 'upload' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-2xl bg-[#0b1120] border-2 border-dashed border-slate-700/80 hover:border-cyan-400 hover:bg-[#0f172a] transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer group shadow-md hover:shadow-[0_0_0_1px_rgba(34,211,238,0.7)] active:scale-[0.99] glow-complement-click relative overflow-hidden"
            >
              {/* Subtle Scanning Laser Line Animation on Hover */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-laser pointer-events-none" />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] group-hover:text-white transition-all">
                {isScanningImage ? (
                  <RefreshCw className="w-8 h-8 animate-spin text-cyan-300" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                {isScanningImage ? 'Decoding QR Code...' : 'Drop QR Code Image Here or Click to Browse'}
              </h3>
              <p className="mt-2 text-xs text-slate-400 max-w-sm">
                Supports PNG, JPEG, WEBP, and screenshot snips. You can also paste directly from clipboard with Cmd+V / Ctrl+V.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                <FileImage className="w-3.5 h-3.5 text-cyan-400" />
                <span>Drag & Drop File · Instant jsQR Processing</span>
              </div>
            </div>
          )}

          {/* LIVE CAMERA MODE */}
          {activeMode === 'camera' && (
            <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Optical Camera Viewfinder</span>
                </div>
                <div className="flex items-center gap-2">
                  {isCameraActive && (
                    <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Live Feed Active
                    </span>
                  )}
                  <button
                    onClick={isCameraActive ? stopCamera : startCamera}
                    className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition cursor-pointer"
                  >
                    {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                  </button>
                </div>
              </div>

              {/* Viewfinder Frame with Cyber Crosshairs & Laser Sweep */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Laser scan line overlay when camera active */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
                    {/* Viewfinder Target Box */}
                    <div className="w-64 h-64 border-2 border-cyan-400/80 rounded-2xl relative shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                      {/* Corner Accents */}
                      <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-cyan-300" />
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-cyan-300" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-cyan-300" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-cyan-300" />

                      {/* Moving Laser Line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-laser" />
                    </div>
                    <span className="mt-3 text-[11px] font-mono text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur">
                      Align QR code inside target box
                    </span>
                  </div>
                )}

                {!isCameraActive && !cameraError && (
                  <div className="text-center p-6 space-y-3">
                    <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-400">Click &ldquo;Start Camera&rdquo; to begin scanning.</p>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-cyan-500/30 cursor-pointer"
                    >
                      Enable Webcam
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRESETS MODE */}
          {activeMode === 'presets' && (
            <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Instant Competition Evaluation Presets
                </span>
                <span className="text-xs font-mono text-slate-400">Click to test without camera</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_QR_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    onClick={() => handleSelectPreset(preset)}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400 hover:bg-slate-850 transition-all text-left group cursor-pointer active:scale-95 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] glow-complement-click"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {preset.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${preset.badgeColor}`}>
                        {preset.expectedSafety}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 break-all truncate">
                      {preset.url}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-500 leading-tight">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Camera or Upload Error Alert */}
          {cameraError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-3 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-rose-100">QR Scan Notice</div>
                <div>{cameraError}</div>
              </div>
            </div>
          )}

          {/* Success Notice */}
          {qrNotice && (
            <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-200 text-xs flex items-start gap-3 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>{qrNotice}</div>
            </div>
          )}
        </div>

        {/* Right Column: Decoded Payload & Verification Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-2xl space-y-5 card-hover-glow">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Decoded Payload Inspection</span>
              </h3>
              {scannedResult ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Ready to Verify
                </span>
              ) : (
                <span className="text-[11px] font-mono text-slate-500">Awaiting QR input</span>
              )}
            </div>

            {/* Decoded content box */}
            {scannedResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400">
                    Decoded Link / Text Payload
                  </span>
                  <div className="text-xs font-mono text-cyan-300 break-all bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    {scannedResult}
                  </div>
                </div>

                {/* Direct Action: Analyze Safety Percentage */}
                <button
                  onClick={handleAnalyzeDecoded}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:via-blue-400 hover:to-purple-500 text-slate-950 font-extrabold text-sm shadow-md hover:shadow-[0_0_0_1px_rgba(34,211,238,0.8)] active:scale-[0.98] glow-complement-click transition-all flex items-center justify-center gap-2 cursor-pointer btn-glow"
                >
                  <span>Verify Link & Calculate Safety %</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                  <span>Target: TRUVEXA Core Engine</span>
                  <button
                    onClick={() => {
                      setScannedResult(null);
                      setPreviewImage(null);
                      setQrNotice(null);
                    }}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Clear Result
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3 text-slate-500">
                <QrCode className="w-12 h-12 mx-auto text-slate-700 stroke-1" />
                <p className="text-xs">
                  No QR code decoded yet. Use your camera, upload an image, or click one of the competition presets.
                </p>
              </div>
            )}

            {/* Quishing (QR Phishing) Warning Guidance */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                What is &ldquo;Quishing&rdquo;?
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Quishing is QR phishing where threat actors replace physical posters, parking meters, or email attachments with QR codes leading to credential-harvesting phishing portals.
                TRUVEXA resolves and scores the embedded URL safely in a sandbox before your browser ever connects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
