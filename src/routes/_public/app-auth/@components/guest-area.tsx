import { Camera, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CameraCaptureDialog } from '@/components/ui/image-capture';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import UploadImage from '@/components/upload-image';
import { applyCpfMask } from '@/lib/masks';
import { useGuestByCpf, useUpdateGuestImage } from '../@hooks/use-app-login';

interface Guest {
  id?: string;
  _id?: string;
  name: string;
  cpf: string;
  url_image?: string[];
}

interface GuestAreaProps {
  onClose: () => void;
  onGuestLoaded?: (loaded: boolean) => void;
}

export function GuestArea({ onClose, onGuestLoaded }: GuestAreaProps) {
  const [guestData, setGuestData] = useState<Guest | null>(null);
  const [guestImages, setGuestImages] = useState<string[]>([]);
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);

  const findGuest = useGuestByCpf();
  const updateImage = useUpdateGuestImage();

  const form = useForm<{ cpf: string }>({
    defaultValues: { cpf: '' },
  });

  useEffect(() => {
    onGuestLoaded?.(!!guestData);
  }, [guestData, onGuestLoaded]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (blockedUntil) {
      const updateCountdown = () => {
        const diff = Math.max(0, Math.ceil((blockedUntil.getTime() - Date.now()) / 1000));
        setCountdown(diff);
        if (diff <= 0) setBlockedUntil(null);
      };
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    }
    return () => clearInterval(timer);
  }, [blockedUntil]);

  function handleCpfChange(value: string) {
    form.setValue('cpf', applyCpfMask(value), { shouldValidate: true });
  }

  function onSearchSubmit(data: { cpf: string }) {
    if (blockedUntil) return;
    findGuest.mutate(data.cpf.replace(/\D/g, ''), {
      onSuccess: (result) => {
        setGuestData(result);
        setGuestImages(result.url_image || []);
      },
      onError: (err: any) => {
        if (err?.response?.status === 429) {
          setBlockedUntil(new Date(Date.now() + 10000));
          toast.error('Muitas tentativas. Aguarde...');
          return;
        }
        const msg = err?.response?.data?.originalError?.message || err?.response?.data?.message || 'Erro ao buscar cadastro.';
        toast.error(msg);
      },
    });
  }

  function handleImageUpdate() {
    if (blockedUntil || !guestData) return;
    const id = guestData.id || guestData._id || '';
    updateImage.mutate(
      { id, url_image: guestImages },
      {
        onSuccess: () => {
          toast.success('Imagem atualizada com sucesso!');
          setTimeout(onClose, 2000);
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.originalError?.message || err?.response?.data?.message || 'Erro ao atualizar imagem.';
          toast.error(msg);
        },
      },
    );
  }

  function handleAddFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setGuestImages([base64]);
    };
    reader.readAsDataURL(file);
  }

  function handleCameraCapture(image: string) {
    setGuestImages([image]);
  }

  if (!guestData) {
    return (
      <ItemGroup className="gap-6!">
        <ItemContent>
          <ItemTitle className="text-2xl">Área do Visitante</ItemTitle>
          <ItemDescription>Digite seu CPF para buscar seu cadastro</ItemDescription>
        </ItemContent>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSearchSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="cpf"
              rules={{ required: 'CPF é obrigatório', minLength: { value: 14, message: 'CPF inválido' } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF *</FormLabel>
                  <FormControl>
                    <Input autoFocus className="h-12!" maxLength={14} placeholder="000.000.000-00" {...field} onChange={(e) => handleCpfChange(e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ItemGroup className="gap-2">
              <Button className="h-12! w-full" disabled={findGuest.isPending || !!blockedUntil} type="submit">
                {findGuest.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {blockedUntil ? `Aguarde ${countdown}s` : 'Buscar Cadastro'}
              </Button>
              <Button className="w-full" onClick={onClose} variant="ghost">
                Voltar ao Início
              </Button>
            </ItemGroup>
          </form>
        </Form>
      </ItemGroup>
    );
  }

  return (
    <ItemGroup className="gap-6!">
      <ItemTitle className="text-center text-2xl">Atualizar Foto</ItemTitle>
      <ItemContent>
        <ItemTitle className="text-lg">{guestData.name}</ItemTitle>
        <ItemDescription className="text-lg">{applyCpfMask(guestData.cpf || '')}</ItemDescription>
      </ItemContent>

      <ItemContent className="gap-3">
        <UploadImage value={guestImages[0]} onAddFile={handleAddFile} height={200} />
        <ItemActions>
          <Button type="button" variant="outline" size="sm" onClick={() => setCameraOpen(true)}>
            <Camera className="mr-2 h-4 w-4" />
            Câmera
          </Button>
        </ItemActions>
      </ItemContent>

      <ItemGroup className="gap-2">
        <Button className="h-12! w-full" disabled={updateImage.isPending || !!blockedUntil || guestImages.length === 0} onClick={handleImageUpdate}>
          {updateImage.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {blockedUntil ? `Aguarde ${countdown}s` : 'Salvar Alterações'}
        </Button>
        <Button className="w-full" onClick={onClose} variant="ghost">
          Cancelar
        </Button>
      </ItemGroup>

      <CameraCaptureDialog open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCameraCapture} />
    </ItemGroup>
  );
}
