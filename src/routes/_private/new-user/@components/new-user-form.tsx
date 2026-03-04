import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CameraCaptureDialog } from '@/components/ui/image-capture';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent, ItemGroup, ItemHeader, ItemTitle } from '@/components/ui/item';
import UploadImage from '@/components/upload-image';
import { applyCpfMask, applyDateMask, applyPhoneMask } from '@/lib/masks';
import type { GuestProps } from '@/routes/_private/access-user/@interface/access-user.interface';
import { type NewUserFormData, newUserFormSchema } from '../@interface/new-user.interface';

interface NewUserFormProps {
  initialData: Partial<GuestProps> & { parentId?: string };
  guestId: string | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function NewUserForm({ initialData, guestId, onSubmit, isLoading }: NewUserFormProps) {
  const [cameraOpen, setCameraOpen] = useState(false);

  const form = useForm<NewUserFormData>({
    resolver: zodResolver(newUserFormSchema),
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

  useEffect(() => {
    if (initialData) {
      const telephones = initialData.telephones || [];
      const birthDateFormatted = initialData.birthday ? new Date(initialData.birthday).toLocaleDateString('pt-BR') : '';

      form.reset({
        name: initialData.name || '',
        cpf: applyCpfMask(initialData.cpf || ''),
        birthDate: birthDateFormatted,
        email: initialData.email || '',
        primaryPhone: telephones[0] ? applyPhoneMask(telephones[0]) : '',
        secondaryPhone: telephones[1] ? applyPhoneMask(telephones[1]) : '',
        url_image: initialData.url_image || [],
      });
    }
  }, [initialData, form]);

  function formatDateToISO(dateString: string | undefined): string {
    if (!dateString || dateString.length < 10) return '';
    try {
      const [day, month, year] = dateString.split('/');
      return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
    } catch {
      return '';
    }
  }

  function handleFormSubmit(data: NewUserFormData) {
    const telephones: string[] = [];
    if (data.primaryPhone?.trim()) telephones.push(data.primaryPhone.replace(/\D/g, ''));
    if (data.secondaryPhone?.trim()) telephones.push(data.secondaryPhone.replace(/\D/g, ''));

    const payload: any = {
      parentId: initialData.parentId || '',
      user_type: 'dependente',
    };

    if (guestId) {
      payload.id = guestId;

      const originalImages = JSON.stringify(initialData?.url_image || []);
      const currentImages = JSON.stringify(data.url_image || []);
      if (currentImages !== originalImages && data.url_image && data.url_image.length > 0) {
        payload.url_image = data.url_image;
      }

      if (data.name !== (initialData?.name || '')) payload.name = data.name;

      const cpfClean = data.cpf?.replace(/\D/g, '');
      if (cpfClean !== (initialData?.cpf || '')) payload.cpf = cpfClean;

      const isoDate = formatDateToISO(data.birthDate);
      if (isoDate !== (initialData?.birthday || '')) payload.birthday = isoDate;
      if (data.email !== (initialData?.email || '')) payload.email = data.email;

      const originalPhones = JSON.stringify(initialData?.telephones || []);
      const currentPhones = JSON.stringify(telephones);
      if (currentPhones !== originalPhones && telephones.length > 0) {
        payload.telephones = telephones.map((p) => p.replace(/\D/g, ''));
      }
    } else {
      if (data.name) payload.name = data.name;
      const cpfClean = data.cpf?.replace(/\D/g, '');
      if (cpfClean) payload.cpf = cpfClean;
      const isoDate = formatDateToISO(data.birthDate);
      if (isoDate) payload.birthday = isoDate;
      if (data.email) payload.email = data.email;
      if (telephones.length > 0) {
        payload.telephones = telephones.map((p) => p.replace(/\D/g, ''));
      }
      if (data.url_image && data.url_image.length > 0) {
        payload.url_image = data.url_image;
      }
    }

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

  return (
    <ItemGroup className="gap-4">
      <ItemHeader>
        <ItemTitle className="text-lg">Finalizar Cadastro</ItemTitle>
      </ItemHeader>

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
                    <Input {...field} onChange={(e) => form.setValue('cpf', applyCpfMask(e.target.value))} maxLength={14} disabled={!!initialData?.cpf} />
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

          <ItemActions className="justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </ItemActions>
        </form>
      </Form>

      <CameraCaptureDialog open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCameraCapture} />
    </ItemGroup>
  );
}
