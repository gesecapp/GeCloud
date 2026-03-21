/**
 * Captura V2 — getUserMedia + circle overlay SVG
 * Baseado no componente 14 do develop
 * Config: 1024x1024 JPEG 0.9, facingMode toggle, circle crop no canvas
 */
import { Circle, FlipHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { compressImageToBase64 } from '@/lib/image-compression';
import { cn } from '@/lib/utils';

function CaptureV2Dialog({ open, onClose, onCapture }: { open: boolean; onClose: () => void; onCapture: (_img: string) => void }) {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
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

  async function capture() {
    const video = videoRef.current;
    if (!video) return;
    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(1024, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, sx, sy, size, size, 0, 0, 1024, 1024);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(512, 512, 512, 0, Math.PI * 2);
      ctx.fill();
    }
    const raw = canvas.toDataURL('image/jpeg', 0.9);
    const compressed = await compressImageToBase64(raw);
    onCapture(compressed);
    stopCamera();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex! h-[85vh] max-w-lg flex-col gap-0 overflow-hidden border-none bg-black p-0" showCloseButton={false}>
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between bg-black/60 px-3 py-2 text-white backdrop-blur-md">
          <DialogTitle className="text-white">V2 — Circle 1024 JPEG</DialogTitle>
          <DialogDescription className="sr-only">Captura com circle overlay 1024x1024 JPEG</DialogDescription>
          <Button className="text-white" onClick={onClose} size="icon" variant="ghost">
            <X />
          </Button>
        </DialogHeader>
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
          <video ref={videoRef} autoPlay playsInline muted className={cn('h-full w-full object-cover', facingMode === 'user' && 'scale-x-[-1]')} />
          <div className="pointer-events-none absolute inset-0 z-10">
            <svg width="100%" height="100%" className="absolute inset-0" role="img">
              <title>Guia circular</title>
              <defs>
                <mask id="circle-mask-v2">
                  <rect width="100%" height="100%" fill="white" />
                  <circle cx="50%" cy="45%" r="35%" fill="black" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#circle-mask-v2)" />
              <circle cx="50%" cy="45%" r="35%" fill="none" stroke="white" strokeWidth="3" />
            </svg>
          </div>
          <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-6">
            <button
              type="button"
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-all hover:bg-white/30"
              onClick={() => setFacingMode((p) => (p === 'user' ? 'environment' : 'user'))}
            >
              <FlipHorizontal className="size-5" />
            </button>
            <button
              type="button"
              className="flex size-16 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-white/20 shadow-lg backdrop-blur transition-all hover:scale-105 active:scale-95"
              onClick={capture}
            >
              <Circle className="size-8 fill-white text-white" />
            </button>
            <div className="size-10" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CaptureV2Dialog };
