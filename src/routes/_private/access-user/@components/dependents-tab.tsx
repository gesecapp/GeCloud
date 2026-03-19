import { useState } from 'react';

import { toast } from 'sonner';
import DefaultLoading from '@/components/default-loading';
import { useAppAuth } from '@/hooks/use-app-auth';
import { useAccessUserApi, useGetAllSyncStatuses, useGetGuestsByParent } from '../@hooks/use-access-user-api';
import type { CreateGuestProps } from '../@interface/access-user.interface';
import { DependentForm } from './dependent-form';
import { DependentList } from './dependent-list';

export function DependentsTab() {
  const { userId } = useAppAuth();
  const { data: dependents, isLoading } = useGetGuestsByParent('dependente');
  const { data: syncStatuses } = useGetAllSyncStatuses();
  const { createGuest, updateGuest } = useAccessUserApi();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  function handleSubmit(data: CreateGuestProps & { id?: string }) {
    const payload = { ...data, user_type: 'dependente' as const };

    if (data.id) {
      const { id, parentId, user_type, ...guestData } = payload;
      updateGuest.mutate(
        { id: data.id, guestData },
        {
          onSuccess: () => {
            toast.success('Dependente atualizado! As alterações podem levar alguns instantes para refletirem no sistema.');
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
          toast.success('Dependente cadastrado! Os dados podem levar alguns instantes para refletirem no sistema.');
          setIsFormVisible(false);
          setSelectedGuestId(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Erro ao cadastrar dependente.');
        },
      });
    }
  }

  if (isLoading) return <DefaultLoading />;

  return (
    <>
      {!isFormVisible ? (
        <DependentList
          guests={dependents || []}
          syncStatuses={syncStatuses}
          onAdd={() => setIsFormVisible(true)}
          onEdit={(id) => {
            setSelectedGuestId(id);
            setIsFormVisible(true);
          }}
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
    </>
  );
}
