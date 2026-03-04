import { useState } from 'react';

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
import { useAppAuth } from '@/hooks/use-app-auth';
import { useAccessUserApi, useGetAllSyncStatuses, useGetGuestsByParent } from '../@hooks/use-access-user-api';
import type { CreateGuestProps } from '../@interface/access-user.interface';
import { DependentForm } from './dependent-form';
import { GuestList } from './guest-list';

export function DependentsTab() {
  const { userId } = useAppAuth();
  const { data: dependents, isLoading } = useGetGuestsByParent('dependente');
  const { data: syncStatuses } = useGetAllSyncStatuses();
  const { createGuest, updateGuest, deleteGuest } = useAccessUserApi();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<{ id: string; name: string } | null>(null);

  function handleSubmit(data: CreateGuestProps & { id?: string }) {
    const payload = { ...data, user_type: 'dependente' as const };

    if (data.id) {
      const { id, parentId, user_type, ...guestData } = payload;
      updateGuest.mutate(
        { id: data.id, guestData },
        {
          onSuccess: () => {
            toast.success('Dependente atualizado com sucesso!');
            setIsFormVisible(false);
            setSelectedGuestId(null);
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Erro ao atualizar dependente.');
          },
        },
      );
    } else {
      createGuest.mutate(payload, {
        onSuccess: () => {
          toast.success('Dependente cadastrado com sucesso!');
          setIsFormVisible(false);
          setSelectedGuestId(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Erro ao cadastrar dependente.');
        },
      });
    }
  }

  function handleConfirmDelete() {
    if (!guestToDelete) return;
    deleteGuest.mutate(guestToDelete.id, {
      onSuccess: () => {
        toast.success('Dependente excluído com sucesso!');
        setGuestToDelete(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Erro ao excluir dependente.');
        setGuestToDelete(null);
      },
    });
  }

  if (isLoading) return <DefaultLoading />;

  return (
    <>
      {!isFormVisible ? (
        <GuestList
          guests={dependents || []}
          syncStatuses={syncStatuses}
          onAdd={() => setIsFormVisible(true)}
          onEdit={(id) => {
            setSelectedGuestId(id);
            setIsFormVisible(true);
          }}
          onDelete={(id, name) => setGuestToDelete({ id, name })}
          title="Dependentes"
        />
      ) : (
        <DependentForm
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
            <AlertDialogTitle>Excluir Dependente</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este dependente?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
