import { CameraResultType, CameraSource, Camera as CapacitorCamera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Camera, Contrast, Focus, Lightbulb, MoveVertical, ScanFace, Sun, X, Zap, ZoomIn } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { compressImageToBase64 } from '@/lib/image-compression';
import { cn } from '@/lib/utils';

// --- Slider Control ---

function CaptureSlider({
  icon,
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (_value: number) => void;
}) {
  return (
    <div data-slot="capture-slider" className="flex min-h-0 flex-1 flex-col items-center gap-0.5">
      <div className="text-white [&_svg]:size-3.5 sm:[&_svg]:size-4">{icon}</div>
      <input
        aria-label={label}
        className="min-h-0 w-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/30 accent-white [&::-webkit-slider-thumb]:size-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white sm:[&::-webkit-slider-thumb]:size-3"
        max={max}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        style={{ writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties}
        type="range"
        value={value}
      />
    </div>
  );
}

// --- Status Badge ---

function StatusBadge({ icon, label, variant }: { icon: React.ReactNode; label: string; variant: 'success' | 'warning' | 'info' }) {
  const colors = {
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-amber-500/20 text-amber-400',
    info: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <div data-slot="status-badge" className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-[11px] backdrop-blur-md', colors[variant])}>
      <span className="[&_svg]:size-3.5">{icon}</span>
      {label}
    </div>
  );
}

// --- Native Camera (Capacitor) ---

function NativeCameraCapture({ open, onClose, onCapture }: CameraCaptureDialogProps) {
  useEffect(() => {
    if (!open) return;

    const capture = async () => {
      try {
        const permissions = await CapacitorCamera.checkPermissions();

        if (permissions.camera !== 'granted') {
          const requested = await CapacitorCamera.requestPermissions({ permissions: ['camera'] });
          if (requested.camera !== 'granted') {
            return;
          }
        }

        const photo = await CapacitorCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          correctOrientation: true,
        });

        if (photo.dataUrl) {
          const compressed = await compressImageToBase64(photo.dataUrl);
          onCapture(compressed);
        }
      } catch {
        // User cancelled or permission denied
      } finally {
        onClose();
      }
    };

    capture();
  }, [open, onCapture, onClose]);

  return null;
}

// --- Web Camera Capture Dialog ---

function WebCameraCaptureDialog({ open, onClose, onCapture, onCameraError }: CameraCaptureDialogProps & { onCameraError?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [zoom, setZoom] = useState(1);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const [brightnessFilter, setBrightnessFilter] = useState(100);
  const [wdrLevel, setWdrLevel] = useState(0);
  const [faceDetectorSupported, setFaceDetectorSupported] = useState(false);
  const [faceBounds, setFaceBounds] = useState<FaceBounds | null>(null);
  const [isFocusing, setIsFocusing] = useState(false);
  const [focusSupported, setFocusSupported] = useState(false);
  const [faceQuality, setFaceQuality] = useState({
    isCentered: false,
    hasGoodLighting: true,
    noBacklight: true,
    faceDetected: false,
  });
  const [brightnessValue, setBrightnessValue] = useState(100);
  const faceDetectorRef = useRef<FaceDetectorInstance | null>(null);

  // Initialize FaceDetector if supported
  useEffect(() => {
    const FaceDetectorClass = (window as any).FaceDetector;
    if (FaceDetectorClass) {
      try {
        faceDetectorRef.current = new FaceDetectorClass({ fastMode: true, maxDetectedFaces: 1 });
        setFaceDetectorSupported(true);
      } catch {
        setFaceDetectorSupported(false);
      }
    }
  }, []);

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !stream || !faceDetectorRef.current) return;
    const video = videoRef.current;
    if (video.readyState !== 4) return;

    try {
      const faces = await faceDetectorRef.current.detect(video);
      if (faces.length > 0) {
        const box = faces[0].boundingBox;
        const bounds: FaceBounds = {
          x: (box.x / video.videoWidth) * 100,
          y: (box.y / video.videoHeight) * 100,
          width: (box.width / video.videoWidth) * 100,
          height: (box.height / video.videoHeight) * 100,
        };
        setFaceBounds(bounds);

        const faceCenterX = bounds.x + bounds.width / 2;
        const faceCenterY = bounds.y + bounds.height / 2;
        const isCentered = faceCenterX > 30 && faceCenterX < 70 && faceCenterY > 25 && faceCenterY < 75;
        const faceArea = bounds.width * bounds.height;
        const isGoodSize = faceArea > 200 && faceArea < 4000;

        setFaceQuality((prev) => ({ ...prev, faceDetected: true, isCentered: isCentered && isGoodSize }));
      } else {
        setFaceBounds(null);
        setFaceQuality((prev) => ({ ...prev, faceDetected: false, isCentered: false }));
      }
    } catch {
      // Silently fail face detection
    }
  }, [stream]);

  const analyzeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !stream) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let totalBrightness = 0;
    let centerBrightness = 0;
    let edgeBrightness = 0;
    let centerPixels = 0;
    let edgePixels = 0;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const centerRadius = Math.min(canvas.width, canvas.height) * 0.25;

    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const x = pixelIndex % canvas.width;
      const y = Math.floor(pixelIndex / canvas.width);
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += brightness;

      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      if (distFromCenter < centerRadius) {
        centerBrightness += brightness;
        centerPixels++;
      } else {
        edgeBrightness += brightness;
        edgePixels++;
      }
    }

    const avgBrightness = totalBrightness / (data.length / 4);
    const avgCenterBrightness = centerPixels > 0 ? centerBrightness / centerPixels : 0;
    const avgEdgeBrightness = edgePixels > 0 ? edgeBrightness / edgePixels : 0;

    const hasBacklight = avgEdgeBrightness > avgCenterBrightness * 1.3;
    const hasGoodLighting = avgBrightness > 80 && avgBrightness < 200;

    setFaceQuality((prev) => ({ ...prev, hasGoodLighting, noBacklight: !hasBacklight }));
    setBrightnessValue(Math.round(avgBrightness));

    if (faceDetectorSupported) detectFace();
  }, [stream, faceDetectorSupported, detectFace]);

  const triggerAutoFocus = useCallback(async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const capabilities = (track as any).getCapabilities?.();

    try {
      setIsFocusing(true);
      const supportedFocusModes = capabilities?.focusMode || [];
      if (supportedFocusModes.includes('single-shot')) {
        await (track as any).applyConstraints({ advanced: [{ focusMode: 'single-shot' }] });
      } else if (supportedFocusModes.includes('continuous')) {
        await (track as any).applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
      }
      setTimeout(() => setIsFocusing(false), 1000);
    } catch {
      setIsFocusing(false);
    }
  }, [stream]);

  useEffect(() => {
    if (open && stream) {
      const interval = setInterval(analyzeFrame, 1000);
      return () => clearInterval(interval);
    }
    return () => {};
  }, [open, stream, analyzeFrame]);

  const startCamera = useCallback(async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setStream((prevStream) => {
        if (prevStream) {
          prevStream.getTracks().forEach((track) => {
            track.stop();
          });
        }
        return newStream;
      });

      const track = newStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as any;
      if (capabilities?.focusMode?.includes('single-shot')) setFocusSupported(true);
    } catch {
      onCameraError?.();
    }
  }, [onCameraError]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => videoRef.current?.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      setStream((prevStream) => {
        if (prevStream) {
          prevStream.getTracks().forEach((track) => {
            track.stop();
          });
        }
        return null;
      });
    }
    return () => {
      setStream((prevStream) => {
        if (prevStream) {
          prevStream.getTracks().forEach((track) => {
            track.stop();
          });
        }
        return null;
      });
    };
  }, [open, startCamera]);

  async function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const targetAspectRatio = 1;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const videoAspectRatio = videoWidth / videoHeight;

    let sourceWidth: number;
    let sourceHeight: number;

    if (videoAspectRatio > targetAspectRatio) {
      sourceHeight = videoHeight / zoom;
      sourceWidth = sourceHeight * targetAspectRatio;
    } else {
      sourceWidth = videoWidth / zoom;
      sourceHeight = sourceWidth / targetAspectRatio;
    }

    const sourceX = (videoWidth - sourceWidth) / 2;
    const verticalSlack = videoHeight - sourceHeight;
    const sourceY = verticalSlack / 2 + (verticalOffset / 100) * videoHeight;
    const clampedSourceY = Math.max(0, Math.min(sourceY, videoHeight - sourceHeight));

    canvas.width = 1024;
    canvas.height = 1024;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.filter = `brightness(${brightnessFilter}%) contrast(${100 + wdrLevel * 0.3}%) saturate(${100 + wdrLevel * 0.1}%)`;
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, sourceX, clampedSourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

    const rawDataUrl = canvas.toDataURL('image/jpeg', 1.0);
    const compressed = await compressImageToBase64(rawDataUrl);
    onCapture(compressed);
    onClose();
  }

  const lightingLabel = brightnessValue > 150 ? 'Alta' : brightnessValue > 80 ? 'Boa' : 'Baixa';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex! h-[min(90vh,800px)] max-w-150 flex-col gap-0 overflow-hidden border-none bg-black p-0 sm:min-w-fit!" showCloseButton={false}>
        <DialogHeader className="relative z-30 flex shrink-0 flex-row items-center justify-between bg-black px-2 py-1 text-white sm:px-3 sm:py-2">
          <DialogTitle className="text-sm text-white sm:text-lg">Capturar Foto</DialogTitle>
          <Button className="text-white" onClick={onClose} size="icon-sm" variant="ghost">
            <X />
          </Button>
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
          {/* Video */}
          <video
            autoPlay
            muted
            playsInline
            ref={videoRef}
            className="absolute inset-0"
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              transform: `scaleX(-1) scale(${zoom}) translateY(${-verticalOffset}%)`,
              filter: `brightness(${brightnessFilter}%) contrast(${100 + wdrLevel * 0.3}%) saturate(${100 + wdrLevel * 0.1}%)`,
              transformOrigin: 'center center',
            }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Capture frame 3:4 with corner markers */}
          {/* Capture frame 3:4 with darkened overlay mask */}
          <div className="pointer-events-none absolute inset-0 z-5 flex items-center justify-center overflow-hidden">
            <div
              className="relative aspect-3/4 max-h-[calc(100%-32px)] w-[calc(100%-32px)] rounded-xl border-2 border-white/30"
              style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)' }}
            >
              {/* Corner markers */}
              <div className="absolute -top-px -left-px size-6 rounded-tl-xl border-white/50 border-t-[3px] border-l-[3px]" />
              <div className="absolute -top-px -right-px size-6 rounded-tr-xl border-white/50 border-t-[3px] border-r-[3px]" />
              <div className="absolute -bottom-px -left-px size-6 rounded-bl-xl border-white/50 border-b-[3px] border-l-[3px]" />
              <div className="absolute -right-px -bottom-px size-6 rounded-br-xl border-white/50 border-r-[3px] border-b-[3px]" />
            </div>
          </div>

          {/* Face guide oval */}
          <div className="pointer-events-none absolute inset-0 z-6 flex items-center justify-center">
            <div
              className="aspect-3/4 w-[min(calc((100%-32px)*0.55),calc((100dvh-100px)*0.75*0.55))] rounded-full border-2 border-dashed transition-colors duration-300"
              style={{
                borderColor: faceQuality.isCentered && faceQuality.hasGoodLighting && faceQuality.noBacklight ? '#4caf50' : 'rgba(255, 255, 255, 0.3)',
              }}
            />
          </div>

          {/* Auto-focus button */}
          {focusSupported && (
            <Button
              className={cn(
                'absolute bottom-22.5 left-2 z-20 bg-black/60 text-white backdrop-blur-md hover:bg-black/80 sm:bottom-25 sm:left-3',
                isFocusing && 'animate-pulse text-green-400',
              )}
              disabled={isFocusing}
              onClick={triggerAutoFocus}
              size="icon-sm"
              variant="ghost"
            >
              <Focus />
            </Button>
          )}

          {/* Status indicators */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
            <StatusBadge icon={<Sun />} label={`Iluminação: ${lightingLabel}`} variant={faceQuality.hasGoodLighting ? 'success' : 'warning'} />
            {!faceQuality.noBacklight && <StatusBadge icon={<Zap />} label="Luz de fundo detectada" variant="warning" />}
            {faceDetectorSupported && (
              <StatusBadge
                icon={<ScanFace />}
                label={faceQuality.faceDetected ? (faceQuality.isCentered ? 'Face centralizada ✓' : 'Centralize a face') : 'Procurando face...'}
                variant={faceQuality.faceDetected ? (faceQuality.isCentered ? 'success' : 'info') : 'warning'}
              />
            )}
          </div>

          {/* Auto-detected face box */}
          {faceBounds && faceDetectorSupported && (
            <div
              className={cn(
                'pointer-events-none absolute z-10 rounded-lg border-2 transition-all duration-100',
                faceQuality.isCentered ? 'border-green-500 shadow-[0_0_10px_rgba(76,175,80,0.5)]' : 'border-blue-500 shadow-[0_0_10px_rgba(33,150,243,0.5)]',
              )}
              style={{
                left: `${100 - faceBounds.x - faceBounds.width}%`,
                top: `${faceBounds.y}%`,
                width: `${faceBounds.width}%`,
                height: `${faceBounds.height}%`,
              }}
            />
          )}

          {/* Control Panel */}
          <div className="absolute top-2 right-1 bottom-20 z-20 flex flex-col justify-between gap-1 overflow-hidden rounded-2xl bg-black/60 px-0.5 py-1.5 backdrop-blur-md sm:top-3 sm:right-3 sm:bottom-3 sm:gap-1.5 sm:px-1 sm:py-2">
            <CaptureSlider icon={<ZoomIn />} label="Zoom" max={3} min={1} onChange={setZoom} step={0.1} value={zoom} />
            <CaptureSlider icon={<MoveVertical />} label="Posição" max={50} min={-50} onChange={setVerticalOffset} step={1} value={verticalOffset} />
            <CaptureSlider icon={<Lightbulb />} label="Brilho" max={150} min={50} onChange={setBrightnessFilter} step={5} value={brightnessFilter} />
            <CaptureSlider icon={<Contrast />} label="WDR" max={100} min={0} onChange={setWdrLevel} step={10} value={wdrLevel} />
          </div>

          {/* Capture button */}
          <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 sm:bottom-8">
            <button
              className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 sm:size-16"
              onClick={handleCapture}
              type="button"
            >
              <Camera className="size-7 text-black sm:size-8" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Camera Capture Dialog (platform router) ---

function CameraCaptureDialog(props: CameraCaptureDialogProps) {
  const [useNativeFallback, setUseNativeFallback] = useState(false);

  if (useNativeFallback && Capacitor.isNativePlatform()) {
    return <NativeCameraCapture {...props} />;
  }

  return (
    <WebCameraCaptureDialog
      {...props}
      onCameraError={() => {
        if (Capacitor.isNativePlatform()) {
          setUseNativeFallback(true);
        }
      }}
    />
  );
}

export { CameraCaptureDialog };

// --- Types ---

interface DetectedFace {
  boundingBox: DOMRectReadOnly;
}

interface FaceDetectorInstance {
  detect: (_image: HTMLVideoElement | HTMLCanvasElement | ImageBitmap) => Promise<DetectedFace[]>;
}

interface FaceBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CameraCaptureDialogProps {
  open: boolean;
  onClose: () => void;
  onCapture: (_image: string) => void;
}
