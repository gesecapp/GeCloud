import { Capacitor } from '@capacitor/core';
import { CameraPreview } from '@capgo/camera-preview';
import { Camera, Contrast, Focus, Lightbulb, MoveVertical, X, ZoomIn } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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

// --- Camera Capture Dialog ---

function CameraCaptureDialog({ open, onClose, onCapture }: CameraCaptureDialogProps) {
  const [zoom, setZoom] = useState(1);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const [brightnessFilter, setBrightnessFilter] = useState(100);
  const [wdrLevel, setWdrLevel] = useState(0);
  const [isFocusing, setIsFocusing] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // Initialize and stop camera
  useEffect(() => {
    if (open) {
      document.documentElement.classList.add('camera-preview-active');
      CameraPreview.start({
        position: 'rear',
        parent: 'camera-preview-container',
        toBack: true,
        enableOpacity: true,
        disableAudio: true,
        aspectMode: 'cover',
      }).catch(console.error);
    } else {
      document.documentElement.classList.remove('camera-preview-active');
      CameraPreview.stop().catch(() => {});
    }
    return () => {
      document.documentElement.classList.remove('camera-preview-active');
      CameraPreview.stop().catch(() => {});
    };
  }, [open]);

  // Handle zoom changes natively
  useEffect(() => {
    if (open && isNative) {
      CameraPreview.setZoom({ level: zoom }).catch(() => {});
    }
  }, [zoom, open, isNative]);

  // Apply CSS filters on Web fallback video
  useEffect(() => {
    if (open && !isNative) {
      const container = document.getElementById('camera-preview-container');
      const video = container?.querySelector('video');
      if (video) {
        video.style.filter = `brightness(${brightnessFilter}%) contrast(${100 + wdrLevel * 0.3}%) saturate(${100 + wdrLevel * 0.1}%)`;
        video.style.transform = `scale(${zoom}) translateY(${-verticalOffset}%)`;
      }
    }
  }, [brightnessFilter, wdrLevel, zoom, verticalOffset, open, isNative]);

  const triggerAutoFocus = useCallback(() => {
    setIsFocusing(true);
    CameraPreview.setFocus({ x: 0.5, y: 0.5 }).catch(() => {});
    setTimeout(() => setIsFocusing(false), 1000);
  }, []);

  async function handleCapture() {
    try {
      const result = await CameraPreview.capture({ quality: 90 });
      const img = new window.Image();
      img.src = `data:image/jpeg;base64,${result.value}`;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      const targetAspectRatio = 3 / 4;
      const imgWidth = img.width;
      const imgHeight = img.height;
      const imgAspectRatio = imgWidth / imgHeight;

      let sourceWidth: number;
      let sourceHeight: number;

      let effectiveZoom = 1;
      if (!isNative) {
        effectiveZoom = zoom;
      }

      if (imgAspectRatio > targetAspectRatio) {
        sourceHeight = imgHeight / effectiveZoom;
        sourceWidth = sourceHeight * targetAspectRatio;
      } else {
        sourceWidth = imgWidth / effectiveZoom;
        sourceHeight = sourceWidth / targetAspectRatio;
      }

      const sourceX = (imgWidth - sourceWidth) / 2;
      const verticalSlack = imgHeight - sourceHeight;
      const sourceY = verticalSlack / 2 + (verticalOffset / 100) * imgHeight;
      const clampedSourceY = Math.max(0, Math.min(sourceY, imgHeight - sourceHeight));

      let outputWidth = sourceWidth;
      let outputHeight = sourceHeight;
      const maxDim = 1024;
      if (outputWidth > maxDim || outputHeight > maxDim) {
        if (outputWidth > outputHeight) {
          outputHeight = (outputHeight / outputWidth) * maxDim;
          outputWidth = maxDim;
        } else {
          outputWidth = (outputWidth / outputHeight) * maxDim;
          outputHeight = maxDim;
        }
      }

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      context.filter = `brightness(${brightnessFilter}%) contrast(${100 + wdrLevel * 0.3}%) saturate(${100 + wdrLevel * 0.1}%)`;
      context.drawImage(img, sourceX, clampedSourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const compressed = await compressImageToBase64(rawDataUrl);
      onCapture(compressed);
      onClose();
    } catch (_e) {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {open && isNative && (
        <style>{`
          .camera-preview-active body,
          .camera-preview-active html,
          .camera-preview-active #root,
          .camera-preview-active [data-slot="dialog-overlay"],
          .camera-preview-active [data-slot="dialog-content"] {
            background: transparent !important;
          }
        `}</style>
      )}
      <DialogContent
        className={cn(
          "flex! h-[min(90vh,800px)] max-w-150 flex-col gap-0 overflow-hidden border-none p-0 sm:min-w-fit!",
          isNative ? "bg-transparent shadow-none" : "bg-black shadow-lg"
        )}
        style={isNative ? { boxShadow: '0 0 0 9999px #000' } : {}}
        showCloseButton={false}
      >
        <DialogHeader className="relative z-30 flex shrink-0 flex-row items-center justify-between bg-black/40 px-2 py-1 text-white backdrop-blur-md sm:px-3 sm:py-2">
          <DialogTitle className="text-sm text-white sm:text-lg">Capturar Foto</DialogTitle>
          <Button className="text-white" onClick={onClose} size="icon-sm" variant="ghost">
            <X />
          </Button>
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden border-none bg-transparent">
          <div id="camera-preview-container" className="absolute inset-0 -z-10 flex items-center justify-center bg-transparent" />

          {/* Capture frame 3:4 */}
          <div className="pointer-events-none absolute inset-0 z-5 flex items-center justify-center overflow-hidden">
            <div
              className="relative aspect-3/4 max-h-[calc(100%-32px)] w-[calc(100%-32px)] rounded-xl border-2 border-white/30"
              style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)' }}
            >
              {/* Corner markers */}
              <div className="absolute -top-px -left-px size-6 rounded-tl-xl border-white/50 border-t-[3px] border-l-[3px]" />
              <div className="absolute -top-px -right-px size-6 rounded-tr-xl border-white/50 border-t-[3px] border-r-[3px]" />
              <div className="absolute -bottom-px -left-px size-6 rounded-bl-xl border-white/50 border-b-[3px] border-l-[3px]" />
              <div className="absolute -right-px -bottom-px size-6 rounded-br-xl border-white/50 border-r-[3px] border-b-[3px]" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-6 flex items-center justify-center">
            <div className="aspect-3/4 w-[min(calc((100%-32px)*0.55),calc((100dvh-100px)*0.75*0.55))] rounded-full border-2 border-white/30 border-dashed transition-colors duration-300" />
          </div>

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

          <div className="absolute top-2 right-1 bottom-20 z-20 flex flex-col justify-between gap-1 overflow-hidden rounded-2xl bg-black/60 px-0.5 py-1.5 backdrop-blur-md sm:top-3 sm:right-3 sm:bottom-3 sm:gap-1.5 sm:px-1 sm:py-2">
            <CaptureSlider icon={<ZoomIn />} label="Zoom" max={3} min={1} onChange={setZoom} step={0.1} value={zoom} />
            <CaptureSlider icon={<MoveVertical />} label="Posição" max={50} min={-50} onChange={setVerticalOffset} step={1} value={verticalOffset} />
            <CaptureSlider icon={<Lightbulb />} label="Brilho" max={150} min={50} onChange={setBrightnessFilter} step={5} value={brightnessFilter} />
            <CaptureSlider icon={<Contrast />} label="WDR" max={100} min={0} onChange={setWdrLevel} step={10} value={wdrLevel} />
          </div>

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

export { CameraCaptureDialog };

// --- Types ---

interface CameraCaptureDialogProps {
  open: boolean;
  onClose: () => void;
  onCapture: (_image: string) => void;
}
