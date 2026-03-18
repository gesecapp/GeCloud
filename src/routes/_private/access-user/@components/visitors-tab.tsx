import { Copy } from 'lucide-react';
import { useState } from 'react';
import QRCode from 'react-qr-code';

import { toast } from 'sonner';
import DefaultLoading from '@/components/default-loading';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ItemDescription } from '@/components/ui/item';
import { useAppAuth } from '@/hooks/use-app-auth';
import { useAccessUserApi, useGetAllSyncStatuses, useGetGuestsByParent } from '../@hooks/use-access-user-api';
import type { CreateGuestProps } from '../@interface/access-user.interface';
import { VisitorForm } from './visitor-form';
import { VisitorList } from './visitor-list';

export function VisitorsTab() {
  const { userId } = useAppAuth();
  const { data: visitors, isLoading } = useGetGuestsByParent('visitante');
  const { data: syncStatuses } = useGetAllSyncStatuses();
  const { createGuest, updateGuest, deleteGuest } = useAccessUserApi();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');

  function handleSubmit(data: CreateGuestProps & { id?: string }) {
    const payload = { ...data, user_type: 'visitante' as const };
    const hasPhoto = payload.url_image && payload.url_image.length > 0 && !!payload.url_image[0];

    if (data.id) {
      const { id, parentId, user_type, ...guestData } = payload;
      updateGuest.mutate(
        { id: data.id, guestData },
        {
          onSuccess: () => {
            toast.success('Visitante atualizado! As alterações podem levar alguns instantes para refletirem no sistema.');
            setIsFormVisible(false);
            setSelectedGuestId(null);
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Erro ao atualizar visitante.');
          },
        },
      );
    } else {
      createGuest.mutate(payload, {
        onSuccess: (responseData) => {
          if (hasPhoto) {
            toast.success('Visitante cadastrado! Os dados podem levar alguns instantes para refletirem no sistema.');
            setIsFormVisible(false);
          } else if (responseData.token) {
            const url = `www.gecloud.com.br/${responseData.token}`;
            setInvitationLink(url);
            setShowInviteModal(true);
            setIsFormVisible(false);
          }
          setSelectedGuestId(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Erro ao cadastrar visitante.');
        },
      });
    }
  }

  function handleConfirmDelete() {
    if (!guestToDelete) return;
    deleteGuest.mutate(guestToDelete.id, {
      onSuccess: () => setGuestToDelete(null),
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Erro ao excluir visitante.');
        setGuestToDelete(null);
      },
    });
  }

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(invitationLink);
    toast.success('Link copiado!');
  }

  function handleShareWhatsApp() {
    const message = encodeURIComponent(`Olá! Finalize seu cadastro pelo link: ${invitationLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  }

  if (isLoading) return <DefaultLoading />;

  return (
    <>
      {!isFormVisible ? (
        <VisitorList
          guests={visitors || []}
          syncStatuses={syncStatuses}
          onAdd={() => setIsFormVisible(true)}
          onEdit={(id) => {
            setSelectedGuestId(id);
            setIsFormVisible(true);
          }}
          onDelete={(id, name) => setGuestToDelete({ id, name })}
        />
      ) : (
        <VisitorForm
          parentId={userId || ''}
          guestId={selectedGuestId}
          onCancel={() => {
            setIsFormVisible(false);
            setSelectedGuestId(null);
          }}
          onSubmit={handleSubmit}
          isLoading={createGuest.isPending || updateGuest.isPending}
        />
      )}

      <AlertDialog open={!!guestToDelete} onOpenChange={() => setGuestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Visitante</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este visitante?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-92 text-center">
          <DialogHeader>
            <DialogTitle>Pré-cadastro realizado com sucesso!</DialogTitle>
          </DialogHeader>
          <ItemDescription>Compartilhe o link abaixo para o visitante finalizar o cadastro e inserir a foto.</ItemDescription>
          <div className="mx-auto my-2 flex justify-center rounded-lg border border-slate-200 bg-white p-4">
            <QRCode value={invitationLink} size={160} />
          </div>
          <Input value={invitationLink} readOnly />
          <div className="flex justify-center gap-2">
            <Button onClick={handleCopyUrl} size="sm">
              <Copy className="mr-2 size-4" />
              Copiar Link
            </Button>
            <Button onClick={handleShareWhatsApp} size="sm" variant="outline" className="bg-[#25D366] text-white hover:bg-[#25D366]/90">
              WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
