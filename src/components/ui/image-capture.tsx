import { Camera, Contrast, FlipHorizontal, Lightbulb, MoveVertical, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { compressImageToBase64 } from "@/lib/image-compression";


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
        style={{ writingMode: "vertical-lr", direction: "rtl" } as React.CSSProperties}
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
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (_err) {
      onClose();
    }
  }, [facingMode, onClose]);

  const stopCamera = useCallback(() => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (open) startCamera();
    else stopCamera();
    return stopCamera;
  }, [open, startCamera, stopCamera]);

  async function handleCapture() {
    const video = videoRef.current;
    if (!video) return;

    try {
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      const targetAspectRatio = 3 / 4;
      let sourceWidth: number;
      let sourceHeight: number;

      if (vw / vh > targetAspectRatio) {
        sourceHeight = vh / zoom;
        sourceWidth = sourceHeight * targetAspectRatio;
      } else {
        sourceWidth = vw / zoom;
        sourceHeight = sourceWidth / targetAspectRatio;
      }

      const sourceX = (vw - sourceWidth) / 2;
      const verticalSlack = vh - sourceHeight;
      const sourceY = Math.max(0, Math.min(verticalSlack / 2 + (verticalOffset / 100) * vh, vh - sourceHeight));

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

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.filter = `brightness(${brightnessFilter}%) contrast(${100 + wdrLevel * 0.3}%) saturate(${100 + wdrLevel * 0.1}%)`;

      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

      const rawDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const compressed = await compressImageToBase64(rawDataUrl);
      onCapture(compressed);
      onClose();
    } catch (_e) {
      onClose();
    }
  }

  const isMirrored = facingMode === "user";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="flex! h-[min(90vh,800px)] max-w-150 flex-col gap-0 overflow-hidden border-none bg-black p-0 shadow-lg sm:min-w-fit!"
        showCloseButton={false}
      >
        <DialogHeader className="relative z-30 flex shrink-0 flex-row items-center justify-between bg-black/40 px-2 py-1 text-white backdrop-blur-md sm:px-3 sm:py-2">
          <DialogTitle className="text-sm text-white sm:text-lg">Capturar Foto</DialogTitle>
          <Button className="text-white" onClick={onClose} size="icon-sm" variant="ghost">
            <X />
          </Button>
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{
              transform: `${isMirrored ? "scaleX(-1)" : ""} scale(${zoom}) translateY(${-verticalOffset}%)`,
              filter: `brightness(${brightnessFilter}%) contrast(${100 + wdrLevel * 0.3}%) saturate(${100 + wdrLevel * 0.1}%)`,
            }}
          />

          {/* Capture frame 3:4 */}
          <div className="pointer-events-none absolute inset-0 z-6 flex items-center justify-center overflow-hidden">
            <div className="relative aspect-3/4 max-h-[calc(100%-32px)] w-[calc(100%-32px)] rounded-xl border-2 border-white/30">
              {/* Corner markers */}
              <div className="absolute -top-px -left-px size-6 rounded-tl-xl border-white/50 border-t-[3px] border-l-[3px]" />
              <div className="absolute -top-px -right-px size-6 rounded-tr-xl border-white/50 border-t-[3px] border-r-[3px]" />
              <div className="absolute -bottom-px -left-px size-6 rounded-bl-xl border-white/50 border-b-[3px] border-l-[3px]" />
              <div className="absolute -right-px -bottom-px size-6 rounded-br-xl border-white/50 border-r-[3px] border-b-[3px]" />
            </div>
          </div>

          {/* Oval face guide */}
          <div className="pointer-events-none absolute inset-0 z-5 flex items-center justify-center">
            <div
              className="aspect-3/4 w-[min(calc((100%-32px)*0.55),calc((100dvh-100px)*0.75*0.55))] rounded-[50%] border-2 border-white/30 border-dashed transition-colors duration-300"
              style={{ boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)" }}
            />
          </div>

          {/* Flip camera button */}
          <Button
            className="absolute bottom-22.5 left-2 z-20 bg-black/60 text-white backdrop-blur-md hover:bg-black/80 sm:bottom-25 sm:left-3"
            onClick={() => setFacingMode((p) => (p === "user" ? "environment" : "user"))}
            size="icon-sm"
            variant="ghost"
          >
            <FlipHorizontal />
          </Button>

          {/* Sliders */}
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

export { CameraCaptureDialog };

// --- Types ---

interface CameraCaptureDialogProps {
  open: boolean;
  onClose: () => void;
  onCapture: (_image: string) => void;
}
