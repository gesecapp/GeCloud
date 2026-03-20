import { Capacitor } from '@capacitor/core';
import type { CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { Camera, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { compressImageToBase64 } from '@/lib/image-compression';
import { cn } from '@/lib/utils';

// --- Unified Camera Capture Dialog using CameraPreview ---

function CameraCaptureDialog({ open, onClose, onCapture }: CameraCaptureDialogProps) {
  const [isStarted, setIsStarted] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (open) {
      const startCamera = async () => {
        try {
          const options: CameraPreviewOptions = {
            position: 'rear',
            parent: 'cameraPreview',
            toBack: true,
            enableZoom: true,
          };
          await CameraPreview.start(options);
          setIsStarted(true);
        } catch (_error) {}
      };

      startCamera();
    } else {
      if (isStarted) {
        CameraPreview.stop().catch(() => {});
        setIsStarted(false);
      }
    }

    return () => {
      // We rely on onClose or unmount to stop
      if (open || isStarted) {
        CameraPreview.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isStarted]); // Intentionally not including isStarted to avoid re-triggering, except during cleanup

  // If on native, make sure the HTML and Dialog Overlay backgrounds are transparent
  useEffect(() => {
    if (open && isStarted && isNative) {
      const style = document.createElement('style');
      style.id = 'camera-preview-style';
      style.innerHTML = `
        body, html, #root, #app { background: transparent !important; }
        [data-slot="dialog-overlay"] { background-color: transparent !important; }
      `;
      document.head.appendChild(style);

      return () => {
        document.getElementById('camera-preview-style')?.remove();
      };
    }
  }, [open, isStarted, isNative]);

  async function handleCapture() {
    try {
      const options: CameraPreviewPictureOptions = {
        quality: 90,
      };

      const result = await CameraPreview.capture(options);

      // result.value is a base64 string.
      // Make sure it has data URL format for compressImageToBase64
      let dataUrl = result.value;
      if (!dataUrl.startsWith('data:')) {
        dataUrl = `data:image/jpeg;base64,${dataUrl}`;
      }

      // Compress and return
      const compressed = await compressImageToBase64(dataUrl);
      onCapture(compressed);

      if (isStarted) {
        await CameraPreview.stop().catch(() => {});
        setIsStarted(false);
      }
      onClose();
    } catch (_e) {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn('flex! h-[min(90vh,800px)] max-w-150 flex-col gap-0 overflow-hidden border-none p-0 sm:min-w-fit!', isNative ? 'bg-transparent' : 'bg-black')}
        showCloseButton={false}
      >
        <DialogHeader
          className={cn(
            'relative z-30 flex shrink-0 flex-row items-center justify-between px-2 py-1 text-white sm:px-3 sm:py-2',
            isNative ? 'bg-black/40 backdrop-blur-md' : 'bg-black',
          )}
        >
          <DialogTitle className="text-sm text-white sm:text-lg">Capturar Foto</DialogTitle>
          <Button className="text-white" onClick={onClose} size="icon-sm" variant="ghost">
            <X />
          </Button>
        </DialogHeader>

        {/* Camera Feed Container */}
        <div id="cameraPreview" className={cn('relative flex min-h-0 flex-1 items-center justify-center overflow-hidden', isNative ? 'bg-transparent' : 'bg-black')}>
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
            <div className="aspect-3/4 w-[min(calc((100%-32px)*0.55),calc((100dvh-100px)*0.75*0.55))] rounded-full border-2 border-white/30 border-dashed transition-colors duration-300" />
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
