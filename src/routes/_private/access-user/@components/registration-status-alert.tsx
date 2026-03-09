import { AlertCircle, CheckCircle2, Clock, Info, Loader2 } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { UserSyncStatus } from '../@interface/access-user.interface';

interface RegistrationStatusAlertProps {
  syncStatus?: UserSyncStatus;
  isLoading?: boolean;
}

export function RegistrationStatusAlert({ syncStatus, isLoading }: RegistrationStatusAlertProps) {
  if (isLoading) {
    return (
      <Alert>
        <Loader2 className="size-4 animate-spin" />
        <AlertTitle>Verificando Status de Integração...</AlertTitle>
        <AlertDescription>Consultando o status atual da imagem nos sensores de segurança.</AlertDescription>
      </Alert>
    );
  }

  if (!syncStatus) return null;

  const syncData = syncStatus.sync_status;
  const isFullySynchronized = syncStatus.synchronized;

  if (!syncData) {
    return (
      <Alert>
        <Info className="size-4" />
        <AlertTitle>Integração em Fila</AlertTitle>
        <AlertDescription>Este cadastro foi recebido e aguarda processamento automático para ser enviado aos sensores.</AlertDescription>
      </Alert>
    );
  }

  const { sensors } = syncData;
  const rejectedSensors = sensors?.filter((s) => s.image_accepted === false) || [];
  const pendingSensors = sensors?.filter((s) => !s.registered && s.image_accepted !== false) || [];

  if (rejectedSensors.length > 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Ação Necessária</AlertTitle>
        <AlertDescription>A imagem enviada não se enquadra nos parâmetros aceitos para autenticação nas catracas, por favor envie uma nova imagem.</AlertDescription>
      </Alert>
    );
  }

  if (isFullySynchronized) {
    return (
      <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
        <CheckCircle2 className="size-4" />
        <AlertTitle>Imagem Sincronizada com Sucesso</AlertTitle>
        <AlertDescription>A integração da imagem e os dados do usuário estão 100% operacionais em todos os sensores da unidade.</AlertDescription>
      </Alert>
    );
  }

  if (!isFullySynchronized || pendingSensors.length > 0) {
    return (
      <Alert>
        <Clock className="size-4" />
        <AlertTitle>Sincronização em Andamento</AlertTitle>
        <AlertDescription>O cadastro está sendo enviado para os sensores da unidade. Aguarde a finalização do processo.</AlertDescription>
      </Alert>
    );
  }

  return null;
}
