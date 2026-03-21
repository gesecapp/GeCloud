import { CameraResultType, CameraSource, Camera as CapacitorCamera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { CameraPreview } from '@capgo/camera-preview';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { createFileRoute } from '@tanstack/react-router';
import { Camera, Circle, FlipHorizontal, ImageIcon, Smartphone, Trash2, Video, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

import DefaultFormLayout, { type FormSection } from '@/components/default-form-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CameraCaptureDialog } from '@/components/ui/image-capture';
import { ItemDescription, ItemMedia } from '@/components/ui/item';
import UploadImage from '@/components/upload-image';
import { cn } from '@/lib/utils';

// PWA Elements (necessário para @capacitor/camera na web)
defineCustomElements(window);

export const Route = createFileRoute('/_public/develop/')({
  component: DevelopPage,
  staticData: { title: 'Teste de Captura de Imagem' },
});

// ============================================================
// Componente auxiliar: Preview da imagem capturada
// ============================================================
function PreviewImage({ src, onClear, label }: { src?: string; onClear: () => void; label?: string }) {
  if (!src) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
        <ItemDescription>{label || 'Nenhuma imagem capturada'}</ItemDescription>
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden rounded-lg border">
      <ItemMedia variant="image" className="h-48 w-full">
        <img src={src} alt="capturada" className="h-full w-full object-contain" />
      </ItemMedia>
      <Button variant="destructive" size="icon" className="absolute top-2 right-2 size-7" onClick={onClear}>
        <Trash2 className="size-3" />
      </Button>
    </div>
  );
}

function StatusBadge({ status }: { status: 'ok' | 'error' | 'idle' }) {
  if (status === 'ok') return <Badge className="bg-green-600">Funcionou</Badge>;
  if (status === 'error') return <Badge variant="error">Erro</Badge>;
  return null;
}

// ============================================================
// 1. CameraCaptureDialog existente (@capgo/camera-preview)
// ============================================================
function Test1_CapgoCameraPreview() {
  const [image, setImage] = useState<string>();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">@capgo/camera-preview</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
        }}
      />
      <Button onClick={() => setOpen(true)} className="w-full gap-2">
        <Camera className="size-4" />
        Abrir Câmera (Componente Existente)
      </Button>
      <CameraCaptureDialog
        open={open}
        onClose={() => setOpen(false)}
        onCapture={(base64) => {
          setImage(`data:image/jpeg;base64,${base64}`);
          setStatus('ok');
        }}
      />
    </div>
  );
}

// ============================================================
// 2. @capacitor/camera — getPhoto (URI)
// ============================================================
function Test2_CapacitorCameraUri() {
  const [image, setImage] = useState<string>();
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const [error, setError] = useState<string>();

  async function takePhoto() {
    try {
      const photo = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      if (photo.webPath) {
        setImage(photo.webPath);
        setStatus('ok');
      }
    } catch (err) {
      setError(String(err));
      setStatus('error');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">@capacitor/camera</Badge>
        <Badge variant="secondary">ResultType.Uri</Badge>
        <Badge variant="secondary">Source.Camera</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
          setError(undefined);
        }}
      />
      {error && <p className="text-destructive text-xs">Erro: {error}</p>}
      <Button onClick={takePhoto} className="w-full gap-2">
        <Camera className="size-4" />
        getPhoto — URI (Câmera)
      </Button>
    </div>
  );
}

// ============================================================
// 3. @capacitor/camera — getPhoto (Base64)
// ============================================================
function Test3_CapacitorCameraBase64() {
  const [image, setImage] = useState<string>();
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const [error, setError] = useState<string>();

  async function takePhoto() {
    try {
      const photo = await CapacitorCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 1024,
        height: 1024,
      });
      if (photo.base64String) {
        setImage(`data:image/jpeg;base64,${photo.base64String}`);
        setStatus('ok');
      }
    } catch (err) {
      setError(String(err));
      setStatus('error');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">@capacitor/camera</Badge>
        <Badge variant="secondary">ResultType.Base64</Badge>
        <Badge variant="secondary">1024x1024</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
          setError(undefined);
        }}
      />
      {error && <p className="text-destructive text-xs">Erro: {error}</p>}
      <Button onClick={takePhoto} variant="secondary" className="w-full gap-2">
        <Camera className="size-4" />
        getPhoto — Base64 (Câmera)
      </Button>
    </div>
  );
}

// ============================================================
// 4. @capacitor/camera — getPhoto com Prompt (câmera ou galeria)
// ============================================================
function Test4_CapacitorCameraPrompt() {
  const [image, setImage] = useState<string>();
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const [error, setError] = useState<string>();

  async function takePhoto() {
    try {
      const photo = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Selecione uma opção',
        promptLabelPhoto: 'Galeria',
        promptLabelPicture: 'Câmera',
      });
      if (photo.dataUrl) {
        setImage(photo.dataUrl);
        setStatus('ok');
      }
    } catch (err) {
      setError(String(err));
      setStatus('error');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">@capacitor/camera</Badge>
        <Badge variant="secondary">ResultType.DataUrl</Badge>
        <Badge variant="secondary">Source.Prompt</Badge>
        <Badge variant="secondary">allowEditing</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
          setError(undefined);
        }}
      />
      {error && <p className="text-destructive text-xs">Erro: {error}</p>}
      <Button onClick={takePhoto} variant="outline" className="w-full gap-2">
        <ImageIcon className="size-4" />
        getPhoto — Prompt (Câmera ou Galeria)
      </Button>
    </div>
  );
}

// ============================================================
// 5. @capacitor/camera — pickImages (galeria multi-select)
// ============================================================
function Test5_CapacitorPickImages() {
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const [error, setError] = useState<string>();

  async function pick() {
    try {
      const result = await CapacitorCamera.pickImages({
        quality: 80,
        limit: 4,
      });
      const urls = result.photos.map((p) => p.webPath).filter(Boolean) as string[];
      setImages(urls);
      setStatus('ok');
    } catch (err) {
      setError(String(err));
      setStatus('error');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">@capacitor/camera</Badge>
        <Badge variant="secondary">pickImages()</Badge>
        <Badge variant="secondary">limit: 4</Badge>
        <StatusBadge status={status} />
      </div>
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {images.map((src, i) => (
            <div key={`pick-${src.slice(-10)}`} className="overflow-hidden rounded-lg border">
              <img src={src} alt={`foto ${i + 1}`} className="h-32 w-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
          <ItemDescription>Nenhuma imagem selecionada</ItemDescription>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={pick} variant="outline" className="flex-1 gap-2">
          <ImageIcon className="size-4" />
          pickImages (Multi-Seleção)
        </Button>
        {images.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setImages([]);
              setStatus('idle');
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
      {error && <p className="text-destructive text-xs">Erro: {error}</p>}
    </div>
  );
}

// ============================================================
// 6. react-webcam — Câmera traseira
// ============================================================
function Test6_ReactWebcamRear() {
  const [image, setImage] = useState<string>();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const webcamRef = useRef<Webcam>(null);

  function capture() {
    const src = webcamRef.current?.getScreenshot();
    if (src) {
      setImage(src);
      setStatus('ok');
    }
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">react-webcam</Badge>
        <Badge variant="secondary">facingMode: environment</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
        }}
      />
      <Button onClick={() => setOpen(true)} className="w-full gap-2">
        <Video className="size-4" />
        react-webcam — Traseira
      </Button>
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="flex h-[85vh] max-w-lg flex-col gap-0 overflow-hidden border-none bg-black p-0" showCloseButton={false}>
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between bg-black/60 px-3 py-2 text-white backdrop-blur-md">
            <DialogTitle className="text-white">react-webcam (Traseira)</DialogTitle>
            <Button className="text-white" onClick={() => setOpen(false)} size="icon" variant="ghost">
              <X />
            </Button>
          </DialogHeader>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
            {open && (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.9}
                videoConstraints={{ facingMode: { ideal: 'environment' }, width: 1280, height: 960 }}
                className="h-full w-full object-cover"
                onUserMediaError={() => {
                  setStatus('error');
                  setOpen(false);
                }}
              />
            )}
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
    </div>
  );
}

// ============================================================
// 7. react-webcam — Câmera frontal (mirrored)
// ============================================================
function Test7_ReactWebcamFront() {
  const [image, setImage] = useState<string>();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const webcamRef = useRef<Webcam>(null);

  function capture() {
    const src = webcamRef.current?.getScreenshot();
    if (src) {
      setImage(src);
      setStatus('ok');
    }
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">react-webcam</Badge>
        <Badge variant="secondary">facingMode: user</Badge>
        <Badge variant="secondary">mirrored</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
        }}
      />
      <Button onClick={() => setOpen(true)} variant="secondary" className="w-full gap-2">
        <Video className="size-4" />
        react-webcam — Frontal
      </Button>
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="flex h-[85vh] max-w-lg flex-col gap-0 overflow-hidden border-none bg-black p-0" showCloseButton={false}>
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between bg-black/60 px-3 py-2 text-white backdrop-blur-md">
            <DialogTitle className="text-white">react-webcam (Frontal)</DialogTitle>
            <Button className="text-white" onClick={() => setOpen(false)} size="icon" variant="ghost">
              <X />
            </Button>
          </DialogHeader>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
            {open && (
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                screenshotFormat="image/jpeg"
                screenshotQuality={0.9}
                videoConstraints={{ facingMode: 'user', width: 1280, height: 960 }}
                className="h-full w-full object-cover"
                onUserMediaError={() => {
                  setStatus('error');
                  setOpen(false);
                }}
              />
            )}
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
    </div>
  );
}

// ============================================================
// 8. react-webcam com overlay circular (foto de perfil)
// ============================================================
function Test8_ReactWebcamCircleOverlay() {
  const [image, setImage] = useState<string>();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const webcamRef = useRef<Webcam>(null);

  function capture() {
    const src = webcamRef.current?.getScreenshot();
    if (src) {
      setImage(src);
      setStatus('ok');
    }
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">react-webcam</Badge>
        <Badge variant="secondary">Circle Overlay SVG</Badge>
        <Badge variant="secondary">Foto de Perfil</Badge>
        <StatusBadge status={status} />
      </div>
      {image ? (
        <div className="flex flex-col items-center gap-2">
          <img src={image} alt="captured" className="size-40 rounded-full border-2 object-cover" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setImage(undefined);
              setStatus('idle');
            }}
          >
            <Trash2 className="mr-1 size-3" /> Limpar
          </Button>
        </div>
      ) : (
        <div className="mx-auto flex size-40 items-center justify-center rounded-full border-2 border-dashed">
          <ItemDescription>Sem foto</ItemDescription>
        </div>
      )}
      <Button onClick={() => setOpen(true)} variant="outline" className="w-full gap-2">
        <Camera className="size-4" />
        react-webcam — Circle Overlay
      </Button>
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="flex h-[85vh] max-w-lg flex-col gap-0 overflow-hidden border-none bg-black p-0" showCloseButton={false}>
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between bg-black/60 px-3 py-2 text-white backdrop-blur-md">
            <DialogTitle className="text-white">Foto de Perfil (react-webcam)</DialogTitle>
            <Button className="text-white" onClick={() => setOpen(false)} size="icon" variant="ghost">
              <X />
            </Button>
          </DialogHeader>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
            {open && (
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                screenshotFormat="image/jpeg"
                screenshotQuality={0.9}
                videoConstraints={{ facingMode: 'user', width: 720, height: 720 }}
                className="h-full w-full object-cover"
              />
            )}
            <div className="pointer-events-none absolute inset-0 z-10">
              <svg width="100%" height="100%" className="absolute inset-0" role="img">
                <title>Overlay circular para foto de perfil</title>
                <defs>
                  <mask id="circle-mask-8">
                    <rect width="100%" height="100%" fill="white" />
                    <circle cx="50%" cy="45%" r="32%" fill="black" />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#circle-mask-8)" />
                <circle cx="50%" cy="45%" r="32%" fill="none" stroke="white" strokeWidth="3" />
              </svg>
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
    </div>
  );
}

// ============================================================
// 9. HTML Input capture="environment" (mais simples)
// ============================================================
function Test9_InputCaptureEnvironment() {
  const [image, setImage] = useState<string>();
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target?.result as string);
      setStatus('ok');
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">HTML input</Badge>
        <Badge variant="secondary">capture="environment"</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
        }}
      />
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
      <Button onClick={() => inputRef.current?.click()} className="w-full gap-2">
        <Smartphone className="size-4" />
        Input capture="environment" (Traseira)
      </Button>
    </div>
  );
}

// ============================================================
// 10. HTML Input capture="user" (câmera frontal)
// ============================================================
function Test10_InputCaptureUser() {
  const [image, setImage] = useState<string>();
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target?.result as string);
      setStatus('ok');
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">HTML input</Badge>
        <Badge variant="secondary">capture="user"</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
        }}
      />
      <input ref={inputRef} type="file" accept="image/*" capture="user" onChange={handleFile} className="hidden" />
      <Button onClick={() => inputRef.current?.click()} variant="secondary" className="w-full gap-2">
        <Smartphone className="size-4" />
        Input capture="user" (Frontal)
      </Button>
    </div>
  );
}

// ============================================================
// 11. HTML Input sem capture (prompt câmera ou galeria)
// ============================================================
function Test11_InputNoCapture() {
  const [image, setImage] = useState<string>();
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target?.result as string);
      setStatus('ok');
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">HTML input</Badge>
        <Badge variant="secondary">accept="image/*"</Badge>
        <Badge variant="secondary">sem capture</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
        }}
      />
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <Button onClick={() => inputRef.current?.click()} variant="outline" className="w-full gap-2">
        <ImageIcon className="size-4" />
        Input sem capture (Câmera ou Galeria)
      </Button>
    </div>
  );
}

// ============================================================
// 12. getUserMedia — Web API (câmera traseira)
// ============================================================
function Test12_GetUserMediaRear() {
  const [image, setImage] = useState<string>();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const [error, setError] = useState<string>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError(String(err));
      setStatus('error');
      setOpen(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setImage(canvas.toDataURL('image/jpeg', 0.9));
    setStatus('ok');
    stopCamera();
    setOpen(false);
  }

  useEffect(() => {
    if (open) startCamera();
    else stopCamera();
    return stopCamera;
  }, [open, startCamera, stopCamera]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">getUserMedia</Badge>
        <Badge variant="secondary">facingMode: environment</Badge>
        <Badge variant="secondary">1280x960</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
          setError(undefined);
        }}
      />
      {error && <p className="text-destructive text-xs">Erro: {error}</p>}
      <Button onClick={() => setOpen(true)} className="w-full gap-2">
        <Video className="size-4" />
        getUserMedia — Traseira
      </Button>
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="flex h-[85vh] max-w-lg flex-col gap-0 overflow-hidden border-none bg-black p-0" showCloseButton={false}>
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between bg-black/60 px-3 py-2 text-white backdrop-blur-md">
            <DialogTitle className="text-white">getUserMedia — Traseira</DialogTitle>
            <Button className="text-white" onClick={() => setOpen(false)} size="icon" variant="ghost">
              <X />
            </Button>
          </DialogHeader>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
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
    </div>
  );
}

// ============================================================
// 13. getUserMedia — Web API (câmera frontal, espelhada)
// ============================================================
function Test13_GetUserMediaFront() {
  const [image, setImage] = useState<string>();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (_err) {
      setStatus('error');
      setOpen(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
    }
    setImage(canvas.toDataURL('image/jpeg', 0.9));
    setStatus('ok');
    stopCamera();
    setOpen(false);
  }

  useEffect(() => {
    if (open) startCamera();
    else stopCamera();
    return stopCamera;
  }, [open, startCamera, stopCamera]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">getUserMedia</Badge>
        <Badge variant="secondary">facingMode: user</Badge>
        <Badge variant="secondary">mirrored</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
        }}
      />
      <Button onClick={() => setOpen(true)} variant="secondary" className="w-full gap-2">
        <Video className="size-4" />
        getUserMedia — Frontal
      </Button>
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="flex h-[85vh] max-w-lg flex-col gap-0 overflow-hidden border-none bg-black p-0" showCloseButton={false}>
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between bg-black/60 px-3 py-2 text-white backdrop-blur-md">
            <DialogTitle className="text-white">getUserMedia — Frontal</DialogTitle>
            <Button className="text-white" onClick={() => setOpen(false)} size="icon" variant="ghost">
              <X />
            </Button>
          </DialogHeader>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full scale-x-[-1] object-cover" />
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
    </div>
  );
}

// ============================================================
// 14. getUserMedia + circle overlay com toggle de câmera
// ============================================================
function Test14_GetUserMediaCircleOverlay() {
  const [image, setImage] = useState<string>();
  const [open, setOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
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
      setStatus('error');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(512, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, sx, sy, size, size, 0, 0, 512, 512);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(256, 256, 256, 0, Math.PI * 2);
      ctx.fill();
    }
    setImage(canvas.toDataURL('image/png'));
    setStatus('ok');
    stopCamera();
    setOpen(false);
  }

  useEffect(() => {
    if (open) startCamera();
    else stopCamera();
    return stopCamera;
  }, [open, startCamera, stopCamera]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">getUserMedia</Badge>
        <Badge variant="secondary">Circle crop + toggle câmera</Badge>
        <StatusBadge status={status} />
      </div>
      {image ? (
        <div className="flex flex-col items-center gap-2">
          <img src={image} alt="captured" className="size-40 rounded-full border-2 object-cover" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setImage(undefined);
              setStatus('idle');
            }}
          >
            <Trash2 className="mr-1 size-3" /> Limpar
          </Button>
        </div>
      ) : (
        <div className="mx-auto flex size-40 items-center justify-center rounded-full border-2 border-dashed">
          <ItemDescription>Sem foto</ItemDescription>
        </div>
      )}
      <Button onClick={() => setOpen(true)} variant="outline" className="w-full gap-2">
        <Camera className="size-4" />
        getUserMedia — Circle Overlay
      </Button>
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="flex h-[85vh] max-w-lg flex-col gap-0 overflow-hidden border-none bg-black p-0" showCloseButton={false}>
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between bg-black/60 px-3 py-2 text-white backdrop-blur-md">
            <DialogTitle className="text-white">getUserMedia — Circle</DialogTitle>
            <Button className="text-white" onClick={() => setOpen(false)} size="icon" variant="ghost">
              <X />
            </Button>
          </DialogHeader>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
            <video ref={videoRef} autoPlay playsInline muted className={cn('h-full w-full object-cover', facingMode === 'user' && 'scale-x-[-1]')} />
            <div className="pointer-events-none absolute inset-0 z-10">
              <svg width="100%" height="100%" className="absolute inset-0" role="img">
                <title>Guia circular</title>
                <defs>
                  <mask id="circle-mask-14">
                    <rect width="100%" height="100%" fill="white" />
                    <circle cx="50%" cy="45%" r="35%" fill="black" />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#circle-mask-14)" />
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
    </div>
  );
}

// ============================================================
// 15. getUserMedia + overlay retangular (documento)
// ============================================================
function Test15_GetUserMediaRectOverlay() {
  const [image, setImage] = useState<string>();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
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
      setStatus('error');
      setOpen(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setImage(canvas.toDataURL('image/jpeg', 0.92));
    setStatus('ok');
    stopCamera();
    setOpen(false);
  }

  useEffect(() => {
    if (open) startCamera();
    else stopCamera();
    return stopCamera;
  }, [open, startCamera, stopCamera]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">getUserMedia</Badge>
        <Badge variant="secondary">Rect overlay (documento)</Badge>
        <Badge variant="secondary">1920x1080</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
        }}
      />
      <Button onClick={() => setOpen(true)} variant="outline" className="w-full gap-2">
        <Camera className="size-4" />
        getUserMedia — Rect Overlay (Doc)
      </Button>
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="flex h-[85vh] max-w-lg flex-col gap-0 overflow-hidden border-none bg-black p-0" showCloseButton={false}>
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between bg-black/60 px-3 py-2 text-white backdrop-blur-md">
            <DialogTitle className="text-white">Captura de Documento</DialogTitle>
            <Button className="text-white" onClick={() => setOpen(false)} size="icon" variant="ghost">
              <X />
            </Button>
          </DialogHeader>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 z-10">
              <svg width="100%" height="100%" className="absolute inset-0" role="img">
                <title>Guia retangular para documento</title>
                <defs>
                  <mask id="rect-mask-15">
                    <rect width="100%" height="100%" fill="white" />
                    <rect x="10%" y="20%" width="80%" height="55%" rx="12" fill="black" />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#rect-mask-15)" />
                <rect x="10%" y="20%" width="80%" height="55%" rx="12" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 4" />
              </svg>
              <span className="absolute top-[76%] left-1/2 -translate-x-1/2 text-sm text-white/80">Posicione o documento dentro da área</span>
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
    </div>
  );
}

// ============================================================
// 16. @capgo/camera-preview — inline (sem dialog)
// ============================================================
function Test16_CapgoInline() {
  const [image, setImage] = useState<string>();
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const [error, setError] = useState<string>();
  const isNative = Capacitor.isNativePlatform();

  async function start() {
    setActive(true);
    try {
      await CameraPreview.start({
        position: 'rear',
        parent: 'capgo-inline-16',
        toBack: isNative,
        enableOpacity: true,
        disableAudio: true,
        width: 400,
        height: 300,
      });
    } catch (err) {
      setError(String(err));
      setStatus('error');
      setActive(false);
    }
  }

  async function stop() {
    try {
      await CameraPreview.stop();
    } catch (_) {
      /* ignore */
    }
    setActive(false);
  }

  async function capture() {
    try {
      const result = await CameraPreview.capture({ quality: 85 });
      setImage(`data:image/jpeg;base64,${result.value}`);
      setStatus('ok');
    } catch (err) {
      setError(String(err));
      setStatus('error');
    }
    stop();
  }

  useEffect(() => {
    return () => {
      CameraPreview.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">@capgo/camera-preview</Badge>
        <Badge variant="secondary">inline (sem dialog)</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
          setError(undefined);
        }}
      />
      {error && <p className="text-destructive text-xs">Erro: {error}</p>}
      {active ? (
        <div className="space-y-3">
          <div id="capgo-inline-16" className="relative mx-auto h-75 w-full max-w-100 overflow-hidden rounded-lg border bg-black" />
          <div className="flex gap-2">
            <Button onClick={capture} className="flex-1 gap-2">
              <Camera className="size-4" /> Capturar
            </Button>
            <Button onClick={stop} variant="destructive" size="icon">
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={start} variant="outline" className="w-full gap-2">
          <Camera className="size-4" /> Capgo Preview Inline (Traseira)
        </Button>
      )}
    </div>
  );
}

// ============================================================
// 17. @capgo/camera-preview — frontal com circle overlay
// ============================================================
function Test17_CapgoFrontCircle() {
  const [image, setImage] = useState<string>();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'ok' | 'error' | 'idle'>('idle');
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (open) {
      document.documentElement.classList.add('capgo-preview-17');
      CameraPreview.start({
        position: 'front',
        parent: 'capgo-front-17',
        toBack: isNative,
        enableOpacity: true,
        disableAudio: true,
        aspectMode: 'cover',
      }).catch(() => setStatus('error'));
    } else {
      document.documentElement.classList.remove('capgo-preview-17');
      CameraPreview.stop().catch(() => {});
    }
    return () => {
      document.documentElement.classList.remove('capgo-preview-17');
      CameraPreview.stop().catch(() => {});
    };
  }, [open, isNative]);

  async function capture() {
    try {
      const result = await CameraPreview.capture({ quality: 90 });
      setImage(`data:image/jpeg;base64,${result.value}`);
      setStatus('ok');
      setOpen(false);
    } catch (_) {
      setStatus('error');
      setOpen(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">@capgo/camera-preview</Badge>
        <Badge variant="secondary">front + circle overlay</Badge>
        <StatusBadge status={status} />
      </div>
      <PreviewImage
        src={image}
        onClear={() => {
          setImage(undefined);
          setStatus('idle');
        }}
      />
      <Button onClick={() => setOpen(true)} variant="secondary" className="w-full gap-2">
        <Camera className="size-4" /> Capgo Frontal + Circle
      </Button>
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        {open && (
          <style>{`
            html.capgo-preview-17, html.capgo-preview-17 body,
            html.capgo-preview-17 [data-slot="dialog-overlay"],
            html.capgo-preview-17 [data-slot="dialog-content"] { background: transparent !important; }
            html.capgo-preview-17 #app { display: none !important; }
          `}</style>
        )}
        <DialogContent
          className={cn('flex h-[90vh] max-w-lg flex-col gap-0 overflow-hidden border-none p-0', isNative ? 'bg-transparent shadow-none' : 'bg-black shadow-lg')}
          showCloseButton={false}
        >
          <DialogHeader className="relative z-30 flex shrink-0 flex-row items-center justify-between bg-black/40 px-3 py-2 text-white backdrop-blur-md">
            <DialogTitle className="text-white">Capgo Frontal + Circle</DialogTitle>
            <Button className="text-white" onClick={() => setOpen(false)} size="icon" variant="ghost">
              <X />
            </Button>
          </DialogHeader>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-transparent">
            <div id="capgo-front-17" className="absolute inset-0 flex items-center justify-center bg-transparent" />
            <div className="pointer-events-none absolute inset-0 z-10">
              <svg width="100%" height="100%" className="absolute inset-0" role="img">
                <title>Guia circular frontal Capgo</title>
                <defs>
                  <mask id="circle-mask-17">
                    <rect width="100%" height="100%" fill="white" />
                    <circle cx="50%" cy="40%" r="30%" fill="black" />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#circle-mask-17)" />
                <circle cx="50%" cy="40%" r="30%" fill="none" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <div className="absolute bottom-10 left-1/2 z-30 -translate-x-1/2">
              <button
                type="button"
                className="flex size-16 cursor-pointer items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-105 active:scale-95"
                onClick={capture}
              >
                <Camera className="size-8 text-black" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// 18. UploadImage component (drag & drop existente)
// ============================================================
function Test18_UploadImageComponent() {
  const [image, setImage] = useState<string>();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">UploadImage</Badge>
        <Badge variant="secondary">Componente existente</Badge>
        <Badge variant="secondary">drag & drop</Badge>
      </div>
      <UploadImage
        value={image}
        height={160}
        onAddFile={(file: File) => {
          const reader = new FileReader();
          reader.onload = (e) => setImage(e.target?.result as string);
          reader.readAsDataURL(file);
        }}
      />
      {image && (
        <Button variant="ghost" size="sm" onClick={() => setImage(undefined)} className="w-full gap-1">
          <Trash2 className="size-3" /> Limpar
        </Button>
      )}
    </div>
  );
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================
function DevelopPage() {
  const sections: FormSection[] = [
    // --- @capgo/camera-preview (já instalado) ---
    {
      title: '1. @capgo/camera-preview — Dialog existente',
      description: 'Plugin Capgo já instalado no projeto. Usa CameraCaptureDialog. Camera traseira, preview nativo com transparência.',
      fields: [<Test1_CapgoCameraPreview key="t1" />],
    },
    {
      title: '16. @capgo/camera-preview — Inline',
      description: 'CameraPreview.start() direto na página sem Dialog. Container fixo 400x300. Testa embed do plugin.',
      fields: [<Test16_CapgoInline key="t16" />],
    },
    {
      title: '17. @capgo/camera-preview — Frontal + Circle',
      description: 'Capgo com câmera frontal e overlay SVG circular. Testa transparência do plugin nativo + overlay.',
      fields: [<Test17_CapgoFrontCircle key="t17" />],
    },

    // --- @capacitor/camera (recém instalado) ---
    {
      title: '2. @capacitor/camera — URI',
      description: 'Plugin oficial Capacitor. getPhoto() retorna URI. Source: Camera. Usa @ionic/pwa-elements na web.',
      fields: [<Test2_CapacitorCameraUri key="t2" />],
    },
    {
      title: '3. @capacitor/camera — Base64',
      description: 'getPhoto() com ResultType.Base64, redimensionado para 1024x1024. Quality 85. Direto câmera.',
      fields: [<Test3_CapacitorCameraBase64 key="t3" />],
    },
    {
      title: '4. @capacitor/camera — Prompt (DataUrl)',
      description: 'getPhoto() com Source.Prompt permite escolher câmera ou galeria. allowEditing: true. Labels em PT.',
      fields: [<Test4_CapacitorCameraPrompt key="t4" />],
    },
    {
      title: '5. @capacitor/camera — pickImages()',
      description: 'pickImages() para seleção múltipla da galeria. Limite de 4 fotos. Não abre câmera.',
      fields: [<Test5_CapacitorPickImages key="t5" />],
    },

    // --- react-webcam (recém instalado) ---
    {
      title: '6. react-webcam — Traseira',
      description: 'Lib react-webcam. facingMode environment. screenshotFormat JPEG quality 0.9. Componente React puro.',
      fields: [<Test6_ReactWebcamRear key="t6" />],
    },
    {
      title: '7. react-webcam — Frontal (mirrored)',
      description: 'react-webcam com prop mirrored. facingMode user. Preview e screenshot espelhados automaticamente.',
      fields: [<Test7_ReactWebcamFront key="t7" />],
    },
    {
      title: '8. react-webcam — Circle Overlay (perfil)',
      description: 'react-webcam com overlay SVG circular. Ideal para foto de perfil. Camera frontal, 720x720.',
      fields: [<Test8_ReactWebcamCircleOverlay key="t8" />],
    },

    // --- HTML Input nativo ---
    {
      title: '9. HTML Input capture="environment"',
      description: 'Abordagem mais simples. O atributo capture abre câmera nativa direto. Sem preview em tempo real. Traseira.',
      fields: [<Test9_InputCaptureEnvironment key="t9" />],
    },
    {
      title: '10. HTML Input capture="user"',
      description: 'Mesmo input mas com capture="user" para câmera frontal. Suporte varia por dispositivo.',
      fields: [<Test10_InputCaptureUser key="t10" />],
    },
    {
      title: '11. HTML Input sem capture (seletor)',
      description: 'Sem atributo capture. Permite escolher câmera ou galeria via seletor nativo do SO.',
      fields: [<Test11_InputNoCapture key="t11" />],
    },

    // --- getUserMedia (Web API) ---
    {
      title: '12. getUserMedia — Traseira',
      description: 'API Web nativa navigator.mediaDevices. Stream vídeo + captura Canvas. Res 1280x960. Câmera traseira.',
      fields: [<Test12_GetUserMediaRear key="t12" />],
    },
    {
      title: '13. getUserMedia — Frontal (espelhada)',
      description: 'getUserMedia facingMode user. Imagem espelhada no preview e na captura via Canvas transform.',
      fields: [<Test13_GetUserMediaFront key="t13" />],
    },
    {
      title: '14. getUserMedia — Circle Overlay + Toggle',
      description: 'getUserMedia com overlay SVG circular e botão para trocar câmera. Crop circular 512x512 PNG.',
      fields: [<Test14_GetUserMediaCircleOverlay key="t14" />],
    },
    {
      title: '15. getUserMedia — Rect Overlay (Documento)',
      description: 'getUserMedia com guia retangular tracejado. Para documentos/crachás. Resolução 1920x1080.',
      fields: [<Test15_GetUserMediaRectOverlay key="t15" />],
    },

    // --- UploadImage existente ---
    {
      title: '18. UploadImage Component',
      description: 'Componente existente do projeto. Drag & drop, sem câmera. Seleção de arquivo via input[type=file].',
      fields: [<Test18_UploadImageComponent key="t18" />],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl py-10">
        <div className="mb-8 space-y-2 px-6 md:px-10">
          <h1 className="font-bold text-3xl">Teste de Captura de Imagem</h1>
          <p className="text-muted-foreground">18 abordagens para captura de imagem. Teste cada uma em Web, iOS e Android.</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge>@capgo/camera-preview (existente)</Badge>
            <Badge>@capacitor/camera (novo)</Badge>
            <Badge variant="secondary">react-webcam (novo)</Badge>
            <Badge variant="secondary">getUserMedia API</Badge>
            <Badge variant="outline">HTML Input capture</Badge>
            <Badge variant="outline">UploadImage</Badge>
          </div>
          <p className="pt-1 text-muted-foreground text-xs">Plataforma detectada: {Capacitor.isNativePlatform() ? `Nativo (${Capacitor.getPlatform()})` : 'Web'}</p>
        </div>
        <DefaultFormLayout sections={sections} />
      </div>
    </div>
  );
}
