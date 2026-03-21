import { Camera, Loader2 } from 'lucide-react';
import { useState } from 'react';

import DefaultLoading from '@/components/default-loading';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CameraCaptureDialog } from '@/components/ui/image-capture';
import { CaptureV1Dialog } from '@/components/ui/image-capture-v1';
import { CaptureV2Dialog } from '@/components/ui/image-capture-v2';
import { CaptureV3Dialog } from '@/components/ui/image-capture-v3';
import { CaptureV4Dialog } from '@/components/ui/image-capture-v4';
import { CaptureV5Dialog } from '@/components/ui/image-capture-v5';
import { CaptureV6Dialog } from '@/components/ui/image-capture-v6';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemTitle } from '@/components/ui/item';
import UploadImage from '@/components/upload-image';
import { useAppAuth } from '@/hooks/use-app-auth';
import { compressImageToBase64 } from '@/lib/image-compression';
import { applyDateMask, applyPhoneMask } from '@/lib/masks';
import { useGetAppUser, useGetUserSyncStatus } from '../@hooks/use-access-user-api';
import { useEditProfileForm } from '../@hooks/use-edit-profile-form';

export function EditProfileTab() {
  const { userId } = useAppAuth();
  const { data: user, isLoading, isError } = useGetAppUser();
  const { data: syncStatus } = useGetUserSyncStatus(userId);
  const { form, onSubmit, isPending } = useEditProfileForm(user);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [v1Open, setV1Open] = useState(false);
  const [v2Open, setV2Open] = useState(false);
  const [v3Open, setV3Open] = useState(false);
  const [v4Open, setV4Open] = useState(false);
  const [v5Open, setV5Open] = useState(false);
  const [v6Open, setV6Open] = useState(false);
  const [testImages, setTestImages] = useState<Record<string, string>>({});

  const urlImages = form.watch('url_image');

  function handleAddFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const compressed = await compressImageToBase64(base64);
      form.setValue('url_image', [compressed], { shouldValidate: true });
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
              <Button type="button" variant="outline" onClick={() => setCameraOpen(true)}>
                <Camera className="mr-2 size-4" />
                Câmera Original
              </Button>
            </ItemActions>
          </ItemContent>

          {/* Seção de teste de capturas V1-V6 */}
          <ItemContent className="gap-4">
            <ItemTitle className="text-base">Teste de Capturas</ItemTitle>
            <ItemDescription>Teste cada variação para descobrir qual funciona melhor no app (web, Android, iOS).</ItemDescription>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* V1 — Circle 512 PNG */}
              <ItemContent className="gap-2 rounded-lg border p-3">
                <ItemTitle className="text-sm">V1 — Circle 512 PNG</ItemTitle>
                <ItemDescription>Circle crop, 512x512, PNG, toggle câmera</ItemDescription>
                {testImages.v1 ? (
                  <img src={`data:image/jpeg;base64,${testImages.v1}`} alt="V1" className="h-32 w-full rounded object-contain" />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded border-2 border-dashed">
                    <ItemDescription>Sem captura</ItemDescription>
                  </div>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => setV1Open(true)}>
                  <Camera className="mr-2 size-3" /> Testar V1
                </Button>
              </ItemContent>

              {/* V2 — Circle 1024 JPEG */}
              <ItemContent className="gap-2 rounded-lg border p-3">
                <ItemTitle className="text-sm">V2 — Circle 1024 JPEG</ItemTitle>
                <ItemDescription>Circle crop, 1024x1024, JPEG 0.9, toggle câmera</ItemDescription>
                {testImages.v2 ? (
                  <img src={`data:image/jpeg;base64,${testImages.v2}`} alt="V2" className="h-32 w-full rounded object-contain" />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded border-2 border-dashed">
                    <ItemDescription>Sem captura</ItemDescription>
                  </div>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => setV2Open(true)}>
                  <Camera className="mr-2 size-3" /> Testar V2
                </Button>
              </ItemContent>

              {/* V3 — Square 768 JPEG */}
              <ItemContent className="gap-2 rounded-lg border p-3">
                <ItemTitle className="text-sm">V3 — Square 768 JPEG</ItemTitle>
                <ItemDescription>Quadrado sem circle crop, 768x768, JPEG 0.85</ItemDescription>
                {testImages.v3 ? (
                  <img src={`data:image/jpeg;base64,${testImages.v3}`} alt="V3" className="h-32 w-full rounded object-contain" />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded border-2 border-dashed">
                    <ItemDescription>Sem captura</ItemDescription>
                  </div>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => setV3Open(true)}>
                  <Camera className="mr-2 size-3" /> Testar V3
                </Button>
              </ItemContent>

              {/* V4 — Rect FullRes env */}
              <ItemContent className="gap-2 rounded-lg border p-3">
                <ItemTitle className="text-sm">V4 — Rect FullRes JPEG env</ItemTitle>
                <ItemDescription>Rect overlay, full res, JPEG 0.92, câmera traseira</ItemDescription>
                {testImages.v4 ? (
                  <img src={`data:image/jpeg;base64,${testImages.v4}`} alt="V4" className="h-32 w-full rounded object-contain" />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded border-2 border-dashed">
                    <ItemDescription>Sem captura</ItemDescription>
                  </div>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => setV4Open(true)}>
                  <Camera className="mr-2 size-3" /> Testar V4
                </Button>
              </ItemContent>

              {/* V5 — Rect 3:4 960x1280 */}
              <ItemContent className="gap-2 rounded-lg border p-3">
                <ItemTitle className="text-sm">V5 — Rect 3:4 960x1280</ItemTitle>
                <ItemDescription>Rect 3:4 crop, 960x1280, JPEG 0.9, toggle câmera</ItemDescription>
                {testImages.v5 ? (
                  <img src={`data:image/jpeg;base64,${testImages.v5}`} alt="V5" className="h-32 w-full rounded object-contain" />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded border-2 border-dashed">
                    <ItemDescription>Sem captura</ItemDescription>
                  </div>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => setV5Open(true)}>
                  <Camera className="mr-2 size-3" /> Testar V5
                </Button>
              </ItemContent>

              {/* V6 — Rect FullFrame 1920 */}
              <ItemContent className="gap-2 rounded-lg border p-3">
                <ItemTitle className="text-sm">V6 — Rect FullFrame 1920</ItemTitle>
                <ItemDescription>Rect overlay, full frame, 1920x1080, JPEG 0.85, toggle</ItemDescription>
                {testImages.v6 ? (
                  <img src={`data:image/jpeg;base64,${testImages.v6}`} alt="V6" className="h-32 w-full rounded object-contain" />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded border-2 border-dashed">
                    <ItemDescription>Sem captura</ItemDescription>
                  </div>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => setV6Open(true)}>
                  <Camera className="mr-2 size-3" /> Testar V6
                </Button>
              </ItemContent>
            </div>
          </ItemContent>

          <ItemActions className="justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Salvar
            </Button>
          </ItemActions>
        </form>
      </Form>

      <CameraCaptureDialog open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCameraCapture} />
      <CaptureV1Dialog open={v1Open} onClose={() => setV1Open(false)} onCapture={(img) => setTestImages((p) => ({ ...p, v1: img }))} />
      <CaptureV2Dialog open={v2Open} onClose={() => setV2Open(false)} onCapture={(img) => setTestImages((p) => ({ ...p, v2: img }))} />
      <CaptureV3Dialog open={v3Open} onClose={() => setV3Open(false)} onCapture={(img) => setTestImages((p) => ({ ...p, v3: img }))} />
      <CaptureV4Dialog open={v4Open} onClose={() => setV4Open(false)} onCapture={(img) => setTestImages((p) => ({ ...p, v4: img }))} />
      <CaptureV5Dialog open={v5Open} onClose={() => setV5Open(false)} onCapture={(img) => setTestImages((p) => ({ ...p, v5: img }))} />
      <CaptureV6Dialog open={v6Open} onClose={() => setV6Open(false)} onCapture={(img) => setTestImages((p) => ({ ...p, v6: img }))} />
    </ItemGroup>
  );
}
