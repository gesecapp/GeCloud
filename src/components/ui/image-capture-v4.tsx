/**
 * Captura V4 — getUserMedia + rect overlay SVG (3:4)
 * Baseado no componente 15 do develop
 * Config: full res JPEG 0.92, environment camera, rect 3:4 overlay
 */
import { Circle, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { compressImageToBase64 } from '@/lib/image-compression';

function CaptureV4Dialog({ open, onClose, onCapture }: { open: boolean; onClose: () => void; onCapture: (_img: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
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
  }, [onClose]);

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
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const raw = canvas.toDataURL('image/jpeg', 0.92);
    const compressed = await compressImageToBase64(raw);
    onCapture(compressed);
    stopCamera();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex! h-[85vh] max-w-lg flex-col gap-0 overflow-hidden border-none bg-black p-0" showCloseButton={false}>
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between bg-black/60 px-3 py-2 text-white backdrop-blur-md">
          <DialogTitle className="text-white">V4 — Rect FullRes JPEG env</DialogTitle>
          <DialogDescription className="sr-only">Captura retangular full res JPEG câmera traseira</DialogDescription>
          <Button className="text-white" onClick={onClose} size="icon" variant="ghost">
            <X />
          </Button>
        </DialogHeader>
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 z-10">
            <svg width="100%" height="100%" className="absolute inset-0" role="img">
              <title>Guia retangular 3:4</title>
              <defs>
                <mask id="rect-mask-v4">
                  <rect width="100%" height="100%" fill="white" />
                  <rect x="10%" y="15%" width="80%" height="65%" rx="12" fill="black" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#rect-mask-v4)" />
              <rect x="10%" y="15%" width="80%" height="65%" rx="12" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 4" />
            </svg>
            <span className="absolute top-[81%] left-1/2 -translate-x-1/2 text-sm text-white/80">Posicione o rosto dentro da área</span>
          </div>
          <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2">
            <button
              type="button"
              className="flex size-16 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-white/20 shadow-lg backdrop-blur transition-all hover:scale-105 active:scale-95"
              onClick={capture}
            >
              <Circle className="size-8 fill-white text-white" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CaptureV4Dialog };
