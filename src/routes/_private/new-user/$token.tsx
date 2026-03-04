import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { toast } from 'sonner';
import DefaultLoading from '@/components/default-loading';
import { Card, CardContent } from '@/components/ui/card';
import { ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import type { CreateGuestProps } from '@/routes/_private/access-user/@interface/access-user.interface';
import { NewUserForm } from './@components/new-user-form';
import { useFinalizeGuestInvite, useGetGuestByInviteToken } from './@hooks/use-new-user-api';

export const Route = createFileRoute('/_private/new-user/$token')({
  component: NewUserPage,
});

function NewUserPage() {
  const { token } = Route.useParams();
  const [success, setSuccess] = useState(false);

  const { data: guestData, isLoading, isError } = useGetGuestByInviteToken(token);
  const finalizeInvite = useFinalizeGuestInvite();

  const guestId = guestData?.id || null;

  function handleSubmit(data: CreateGuestProps & { id?: string }) {
    if (!guestId && !data.id) {
      toast.error('ID do visitante não encontrado.');
      return;
    }

    const idToUpdate = guestId || data.id!;

    const payload = {
      ...data,
      expires_at: (guestData as any)?.expires_at,
    };

    finalizeInvite.mutate(
      { guestId: idToUpdate, data: payload },
      {
        onSuccess: () => {
          setSuccess(true);
          toast.success('Cadastro finalizado com sucesso!');
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.originalError?.message || err?.response?.data?.message || 'Erro ao finalizar cadastro.';
          toast.error(msg);
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F5F9] p-2 md:p-4">
        <DefaultLoading />
      </div>
    );
  }

  if (isError || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F5F9] p-2 md:p-4">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <ItemTitle className="text-destructive text-xl">{!token ? 'Token não encontrado.' : 'Token inválido ou expirado.'}</ItemTitle>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F5F9] p-2 md:p-4">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <ItemTitle className="text-emerald-600 text-xl">Cadastro Finalizado!</ItemTitle>
            <ItemDescription className="text-center">Seus dados foram atualizados com sucesso.</ItemDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-2 md:p-4">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="py-8 md:p-8">
            {guestData ? (
              <NewUserForm initialData={guestData as any} guestId={guestId} onSubmit={handleSubmit} isLoading={finalizeInvite.isPending} />
            ) : (
              <ItemContent>
                <ItemDescription className="text-destructive">Não foi possível carregar os dados. Token inválido.</ItemDescription>
              </ItemContent>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
