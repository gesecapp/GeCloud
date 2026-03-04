import { Camera, Loader2 } from 'lucide-react';
import { useState } from 'react';

import DefaultLoading from '@/components/default-loading';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CameraCaptureDialog } from '@/components/ui/image-capture';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent, ItemGroup, ItemHeader, ItemTitle } from '@/components/ui/item';
import UploadImage from '@/components/upload-image';
import { useAppAuth } from '@/hooks/use-app-auth';
import { applyDateMask, applyPhoneMask } from '@/lib/masks';
import { useGetAppUser, useGetUserSyncStatus } from '../@hooks/use-access-user-api';
import { useEditProfileForm } from '../@hooks/use-edit-profile-form';

export function EditProfileTab() {
  const { userId } = useAppAuth();
  const { data: user, isLoading, isError } = useGetAppUser();
  const { data: syncStatus } = useGetUserSyncStatus(userId);
  const { form, onSubmit, isPending } = useEditProfileForm(user);
  const [cameraOpen, setCameraOpen] = useState(false);

  const urlImages = form.watch('url_image');

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

  if (isLoading) return <DefaultLoading />;

  return (
    <ItemGroup className="gap-6">
      <ItemHeader>
        <ItemTitle className="text-lg">Editar Perfil</ItemTitle>
      </ItemHeader>

      {syncStatus?.sync_status && (
        <div className="rounded-md border bg-muted/50 p-3 text-sm">{syncStatus.synchronized ? 'Cadastro sincronizado com sucesso.' : 'Cadastro pendente de sincronização.'}</div>
      )}

      {isError && <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">Erro ao carregar seus dados.</div>}

      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
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
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
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
            <FormLabel>Foto de Perfil</FormLabel>
            <UploadImage value={urlImages[0]} onAddFile={handleAddFile} height={200} />
            <ItemActions>
              <Button type="button" variant="outline" size="sm" onClick={() => setCameraOpen(true)}>
                <Camera className="mr-2 h-4 w-4" />
                Câmera
              </Button>
            </ItemActions>
          </ItemContent>

          <ItemActions className="justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </ItemActions>
        </form>
      </Form>

      <CameraCaptureDialog open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCameraCapture} />
    </ItemGroup>
  );
}
