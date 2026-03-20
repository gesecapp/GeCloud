import { Capacitor } from '@capacitor/core';
import { CameraPreview } from '@capgo/camera-preview';
import { Camera, X } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// --- Camera Capture Dialog ---

function CameraCaptureDialog({ open, onClose, onCapture }: CameraCaptureDialogProps) {
  const isNative = Capacitor.isNativePlatform();

  // Initialize and stop camera
  useEffect(() => {
    if (open) {
      document.documentElement.classList.add('camera-preview-active');
      CameraPreview.start({
        position: 'rear', // Using rear camera for general testing
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

  async function handleCapture() {
    try {
      const result = await CameraPreview.capture({ quality: 90 });
      // result.value contains the base64 string (or file path if storeToFile is true)
      onCapture(result.value);
      onClose();
    } catch (_error) {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {open && (
        <style>{`
          html.camera-preview-active,
          html.camera-preview-active body,
          html.camera-preview-active [data-slot="dialog-overlay"],
          html.camera-preview-active [data-slot="dialog-content"] {
            background: transparent !important;
          }
          /* Hide the app content when camera is active on native to ensure transparency works */
          html.camera-preview-active #app {
            display: none !important;
          }
        `}</style>
      )}
      <DialogContent
        className={cn('flex h-[90vh] max-w-lg flex-col gap-0 overflow-hidden border-none p-0', isNative ? 'bg-transparent shadow-none' : 'bg-black shadow-lg')}
        showCloseButton={false}
      >
        <DialogHeader className="relative z-30 flex shrink-0 flex-row items-center justify-between bg-black/40 px-3 py-2 text-white backdrop-blur-md">
          <DialogTitle className="text-lg text-white">Capturar Foto (Teste Simples)</DialogTitle>
          <Button className="text-white" onClick={onClose} size="icon" variant="ghost">
            <X />
          </Button>
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-transparent">
          <div id="camera-preview-container" className="absolute inset-0 -z-10 flex items-center justify-center bg-transparent" />

          <div className="absolute bottom-10 left-1/2 z-30 -translate-x-1/2">
            <button
              className="flex size-16 cursor-pointer items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-105 active:scale-95"
              onClick={handleCapture}
              type="button"
            >
              <Camera className="size-8 text-black" />
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
  onCapture: (image: string) => void;
}
