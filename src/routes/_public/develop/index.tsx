import { createFileRoute } from '@tanstack/react-router';
import { Camera, Trash2 } from 'lucide-react';
import { useState } from 'react';

import DefaultFormLayout, { type FormSection } from '@/components/default-form-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CameraCaptureDialog } from '@/components/ui/image-capture';
import { ItemDescription, ItemMedia } from '@/components/ui/item';

export const Route = createFileRoute('/_public/develop/')({
  component: DevelopPage,
  staticData: { title: 'Teste de Captura de Imagem' },
});

function PreviewImage({ src, onClear }: { src?: string; onClear: () => void }) {
  if (!src) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
        <ItemDescription>Nenhuma imagem capturada</ItemDescription>
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

function TestCameraCaptureDialog() {
  const [image, setImage] = useState<string>();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">getUserMedia</Badge>
        <Badge variant="secondary">CameraCaptureDialog</Badge>
      </div>
      <PreviewImage src={image} onClear={() => setImage(undefined)} />
      <Button onClick={() => setOpen(true)} className="w-full gap-2">
        <Camera className="size-4" />
        Abrir Câmera
      </Button>
      <CameraCaptureDialog
        open={open}
        onClose={() => setOpen(false)}
        onCapture={(base64) => {
          setImage(base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`);
        }}
      />
    </div>
  );
}

function DevelopPage() {
  const sections: FormSection[] = [
    {
      title: 'Captura de Imagem — CameraCaptureDialog',
      description: 'Componente de captura via getUserMedia com overlay de posicionamento facial, controles de zoom, brilho e WDR.',
      fields: [<TestCameraCaptureDialog key="t1" />],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl py-10">
        <div className="mb-8 space-y-2 px-6 md:px-10">
          <h1 className="font-bold text-3xl">Teste de Captura de Imagem</h1>
          <p className="text-muted-foreground">Teste do componente CameraCaptureDialog com getUserMedia.</p>
        </div>
        <DefaultFormLayout sections={sections} />
      </div>
    </div>
  );
}
