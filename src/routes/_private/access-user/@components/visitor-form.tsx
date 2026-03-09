import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Loader2, Plus, Share2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { z } from 'zod';
import DefaultLoading from '@/components/default-loading';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CameraCaptureDialog } from '@/components/ui/image-capture';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemTitle } from '@/components/ui/item';
import UploadImage from '@/components/upload-image';
import { applyCpfMask, applyDateMask, applyPhoneMask } from '@/lib/masks';
import { useGetGuestById, useGetUserSyncStatus } from '../@hooks/use-access-user-api';
import type { CreateGuestProps, GuestProps } from '../@interface/access-user.interface';
import { RegistrationStatusAlert } from './registration-status-alert';

const visitorFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório'),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telephones: z.array(z.string()),
  url_image: z.array(z.string()),
});

type VisitorFormData = z.infer<typeof visitorFormSchema>;

interface VisitorFormProps {
  parentId: string;
  guestId?: string | null;
  initialData?: Partial<GuestProps>;
  title?: string;
  onCancel: () => void;
  onSubmit: (data: CreateGuestProps & { id?: string }) => void;
  isLoading?: boolean;
  requireCpfAndImage?: boolean;
}

export function VisitorForm({ parentId, guestId, initialData, title, onCancel, onSubmit, isLoading, requireCpfAndImage = false }: VisitorFormProps) {
  const { data: fetchedGuest, isLoading: isLoadingGuest } = useGetGuestById(guestId || null);
  const { data: syncStatus, isLoading: isLoadingSync } = useGetUserSyncStatus(guestId);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const guestData = fetchedGuest || initialData;

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  const form = useForm<VisitorFormData>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      name: '',
      cpf: '',
      birthDate: '',
      email: '',
      telephones: [],
      url_image: [],
    },
  });

  const urlImages = form.watch('url_image');
  const telephones = form.watch('telephones') || [];
  const isPartialRegistration = !guestId && (!urlImages || urlImages.length === 0);

  useEffect(() => {
    if (guestData) {
      form.reset({
        name: guestData.name || '',
        cpf: applyCpfMask(guestData.cpf || ''),
        birthDate: guestData.birthday
          ? (() => {
              const d = new Date(guestData.birthday);
              return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            })()
          : '',
        email: guestData.email || '',
        telephones: guestData.telephones || [],
        url_image: guestData.url_image || [],
      });
    }
  }, [guestData, form]);

  function formatDateToISO(dateString: string | undefined): string {
    if (!dateString || dateString.length < 10) return '';
    try {
      const [day, month, year] = dateString.split('/');
      return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
    } catch {
      return '';
    }
  }

  function handleAddPhone() {
    if (phoneInput.trim()) {
      form.setValue('telephones', [...telephones, phoneInput.trim()], { shouldValidate: true });
      setPhoneInput('');
    }
  }

  function handleRemovePhone(index: number) {
    form.setValue(
      'telephones',
      telephones.filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  }

  function handleFormSubmit(data: VisitorFormData) {
    if (cooldown > 0) return;

    if (requireCpfAndImage) {
      const cpfClean = data.cpf?.replace(/\D/g, '');
      if (!cpfClean || cpfClean.length !== 11) {
        form.setError('cpf', { type: 'manual', message: 'CPF é obrigatório e deve ter 11 dígitos' });
        return;
      }
      if (!data.url_image || data.url_image.length === 0) {
        form.setError('url_image', { type: 'manual', message: 'Pelo menos uma foto é obrigatória' });
        return;
      }
    }

    const isoDate = formatDateToISO(data.birthDate);

    const payload: CreateGuestProps & { id?: string } = {
      parentId,
      user_type: 'visitante',
    };

    if (guestId) {
      payload.id = guestId;

      const originalImages = JSON.stringify(guestData?.url_image || []);
      const currentImages = JSON.stringify(data.url_image || []);
      if (currentImages !== originalImages && data.url_image && data.url_image.length > 0) {
        payload.url_image = data.url_image;
      }

      if (data.name !== (guestData?.name || '')) payload.name = data.name;

      const cpfClean = data.cpf?.replace(/\D/g, '');
      if (cpfClean !== (guestData?.cpf || '')) payload.cpf = cpfClean;

      if (isoDate !== (guestData?.birthday || '')) payload.birthday = isoDate;
      if (data.email !== (guestData?.email || '')) payload.email = data.email;

      const originalPhones = JSON.stringify(guestData?.telephones || []);
      const currentPhones = JSON.stringify(data.telephones || []);
      if (currentPhones !== originalPhones && data.telephones && data.telephones.length > 0) {
        payload.telephones = data.telephones.map((p) => p.replace(/\D/g, ''));
      }
    } else {
      if (data.name) payload.name = data.name;

      const cpfClean = data.cpf?.replace(/\D/g, '');
      if (cpfClean) payload.cpf = cpfClean;

      if (isoDate) payload.birthday = isoDate;
      if (data.email) payload.email = data.email;

      if (data.telephones && data.telephones.length > 0) {
        payload.telephones = data.telephones.map((p) => p.replace(/\D/g, ''));
      }

      if (data.url_image && data.url_image.length > 0) {
        payload.url_image = data.url_image;
      }
    }

    setCooldown(5);
    onSubmit(payload);
  }

  function handleAddFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      form.setValue('url_image', [base64], { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  }

  function handleCameraCapture(image: string) {
    form.setValue('url_image', [image], { shouldValidate: true });
  }

  if (isLoadingGuest) return <DefaultLoading />;

  return (
    <ItemGroup className="gap-4">
      <ItemHeader>
        <ItemTitle className="text-lg">{title || (guestId ? 'Editar Visitante' : 'Adicionar Visitante')}</ItemTitle>
      </ItemHeader>

      <RegistrationStatusAlert syncStatus={syncStatus} isLoading={isLoadingSync} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF{requireCpfAndImage ? ' *' : ''}</FormLabel>
                  <FormControl>
                    <Input {...field} onChange={(e) => form.setValue('cpf', applyCpfMask(e.target.value))} maxLength={14} disabled={!!guestData?.cpf} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="DD/MM/AAAA" onChange={(e) => form.setValue('birthDate', applyDateMask(e.target.value))} maxLength={10} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <ItemContent className="gap-3">
            <ItemTitle className="font-medium text-sm">Telefones</ItemTitle>
            <div className="flex gap-2">
              <Input value={phoneInput} onChange={(e) => setPhoneInput(applyPhoneMask(e.target.value))} placeholder="Telefone" maxLength={15} className="flex-1" />
              <Button type="button" variant="outline" onClick={handleAddPhone} disabled={!phoneInput.trim()}>
                <Plus className="mr-1 size-4" />
                Adicionar
              </Button>
            </div>
            {telephones.length > 0 ? (
              <ItemContent className="gap-1">
                {telephones.map((phone, index) => (
                  <div key={phone} className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemovePhone(index)}>
                      <Trash2 className="size-4" />
                    </Button>
                    <ItemDescription>{applyPhoneMask(phone)}</ItemDescription>
                  </div>
                ))}
              </ItemContent>
            ) : (
              <ItemDescription>Nenhum telefone adicionado</ItemDescription>
            )}
          </ItemContent>

          <FormField
            control={form.control}
            name="url_image"
            render={({ fieldState }) => (
              <ItemContent className="gap-3">
                <FormLabel>Foto{requireCpfAndImage ? ' *' : ''}</FormLabel>
                <UploadImage value={urlImages[0]} onAddFile={handleAddFile} height={200} />
                <ItemActions>
                  <Button type="button" variant="outline" onClick={() => setCameraOpen(true)}>
                    <Camera className="mr-2 size-4" />
                    Câmera
                  </Button>
                </ItemActions>
                {fieldState.error?.message && <div className="font-medium text-destructive text-sm">{fieldState.error.message}</div>}
              </ItemContent>
            )}
          />

          <ItemActions className="justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || cooldown > 0} className={isPartialRegistration ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {!isLoading && isPartialRegistration && <Share2 className="mr-2 size-4" />}
              {cooldown > 0 ? `Aguarde ${cooldown}s` : isPartialRegistration ? 'Salvar e Compartilhar Link' : 'Salvar'}
            </Button>
          </ItemActions>
        </form>
      </Form>

      <CameraCaptureDialog open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCameraCapture} />
    </ItemGroup>
  );
}
