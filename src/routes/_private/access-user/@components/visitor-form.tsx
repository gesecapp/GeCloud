import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Loader2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CameraCaptureDialog } from '@/components/ui/image-capture';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent, ItemGroup, ItemHeader, ItemTitle } from '@/components/ui/item';
import UploadImage from '@/components/upload-image';
import { applyCpfMask, applyDateMask, applyPhoneMask } from '@/lib/masks';
import { useGetGuestById, useGetUserSyncStatus } from '../@hooks/use-access-user-api';
import type { CreateGuestProps } from '../@interface/access-user.interface';

const visitorFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório'),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  url_image: z.array(z.string()),
});

type VisitorFormData = z.infer<typeof visitorFormSchema>;

interface VisitorFormProps {
  parentId: string;
  guestId?: string | null;
  onCancel: () => void;
  onSubmit: (data: CreateGuestProps & { id?: string }) => void;
  isLoading?: boolean;
}

export function VisitorForm({ parentId, guestId, onCancel, onSubmit, isLoading }: VisitorFormProps) {
  const { data: existingGuest } = useGetGuestById(guestId || null);
  const { data: syncStatus } = useGetUserSyncStatus(guestId);
  const [cooldown, setCooldown] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const form = useForm<VisitorFormData>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      name: '',
      cpf: '',
      birthDate: '',
      email: '',
      primaryPhone: '',
      secondaryPhone: '',
      url_image: [],
    },
  });

  const urlImages = form.watch('url_image');
  const isPartialRegistration = !guestId && (!urlImages || urlImages.length === 0);

  useEffect(() => {
    if (existingGuest) {
      const telephones = existingGuest.telephones || [];
      form.reset({
        name: existingGuest.name || '',
        cpf: applyCpfMask(existingGuest.cpf || ''),
        birthDate: existingGuest.birthday
          ? (() => {
              const d = new Date(existingGuest.birthday);
              return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            })()
          : '',
        email: existingGuest.email || '',
        primaryPhone: telephones[0] ? applyPhoneMask(telephones[0]) : '',
        secondaryPhone: telephones[1] ? applyPhoneMask(telephones[1]) : '',
        url_image: existingGuest.url_image || [],
      });
    }
  }, [existingGuest, form]);

  function formatDateToISO(dateString: string | undefined): string {
    if (!dateString || dateString.length < 10) return '';
    try {
      const [day, month, year] = dateString.split('/');
      return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
    } catch {
      return '';
    }
  }

  function handleFormSubmit(data: VisitorFormData) {
    if (cooldown) return;

    const telephones: string[] = [];
    if (data.primaryPhone?.trim()) telephones.push(data.primaryPhone.replace(/\D/g, ''));
    if (data.secondaryPhone?.trim()) telephones.push(data.secondaryPhone.replace(/\D/g, ''));

    const payload: CreateGuestProps & { id?: string } = {
      name: data.name,
      cpf: data.cpf?.replace(/\D/g, ''),
      parentId,
      birthday: formatDateToISO(data.birthDate),
      telephones,
      email: data.email || undefined,
      url_image: data.url_image,
      user_type: 'visitante',
    };

    if (guestId) payload.id = guestId;

    onSubmit(payload);

    setCooldown(true);
    setTimeout(() => setCooldown(false), 5000);
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

  return (
    <ItemGroup className="gap-4">
      <ItemHeader>
        <ItemTitle className="text-lg">{guestId ? 'Editar' : 'Adicionar'} Visitante</ItemTitle>
      </ItemHeader>

      {syncStatus?.sync_status && (
        <div className="rounded-md border bg-muted/50 p-3 text-sm">{syncStatus.synchronized ? 'Cadastro sincronizado com sucesso.' : 'Cadastro pendente de sincronização.'}</div>
      )}

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
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input {...field} onChange={(e) => form.setValue('cpf', applyCpfMask(e.target.value))} maxLength={14} disabled={!!guestId} />
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
            <FormField
              control={form.control}
              name="primaryPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone Primário</FormLabel>
                  <FormControl>
                    <Input {...field} onChange={(e) => form.setValue('primaryPhone', applyPhoneMask(e.target.value))} maxLength={15} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondaryPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone Secundário</FormLabel>
                  <FormControl>
                    <Input {...field} onChange={(e) => form.setValue('secondaryPhone', applyPhoneMask(e.target.value))} maxLength={15} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <ItemContent className="gap-3">
            <FormLabel>Foto</FormLabel>
            <UploadImage value={urlImages[0]} onAddFile={handleAddFile} height={200} />
            <ItemActions>
              <Button type="button" variant="outline" size="sm" onClick={() => setCameraOpen(true)}>
                <Camera className="mr-2 h-4 w-4" />
                Câmera
              </Button>
            </ItemActions>
          </ItemContent>

          <ItemActions className="justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || cooldown} className={isPartialRegistration ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isLoading && isPartialRegistration && <Share2 className="mr-2 h-4 w-4" />}
              {isPartialRegistration ? 'Salvar e Compartilhar Link' : 'Salvar'}
            </Button>
          </ItemActions>
        </form>
      </Form>

      <CameraCaptureDialog open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCameraCapture} />
    </ItemGroup>
  );
}
