import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { toast } from 'sonner';
import { useAppAuth } from '@/hooks/use-app-auth';
import { applyCpfMask, applyPhoneMask } from '@/lib/masks';
import type { GuestProps } from '../@interface/access-user.interface';
import { type EditProfileFormData, editProfileSchema } from '../@interface/access-user.interface';
import { useAccessUserApi } from './use-access-user-api';

export function useEditProfileForm(user: GuestProps | undefined) {
  const { userId } = useAppAuth();
  const { updateUser } = useAccessUserApi();

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: '',
      cpf: '',
      birthDate: '',
      email: '',
      primaryPhone: '',
      secondaryPhone: '',
      password: '',
      url_image: [],
    },
  });

  const formatDateFromISO = useCallback((isoDate: string | undefined): string => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  }, []);

  useEffect(() => {
    if (user) {
      const telephones = user.telephones || [];
      form.reset({
        fullName: user.name || '',
        cpf: applyCpfMask(user.cpf || ''),
        birthDate: formatDateFromISO(user.birthday),
        email: user.email || '',
        primaryPhone: telephones[0] ? applyPhoneMask(telephones[0]) : '',
        secondaryPhone: telephones[1] ? applyPhoneMask(telephones[1]) : '',
        url_image: user.url_image || [],
        password: '',
      });
    }
  }, [user, form, formatDateFromISO]);

  function formatDateToISO(dateString: string | undefined): string {
    if (!dateString || dateString.length < 10) return '';
    try {
      const [day, month, year] = dateString.split('/');
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return date.toISOString();
    } catch {
      return '';
    }
  }

  const onSubmit = form.handleSubmit(async (data) => {
    if (!userId) {
      toast.error('Usuário não autenticado.');
      return;
    }

    if (!data.url_image || data.url_image.length === 0) {
      toast.error('Pelo menos uma foto é obrigatória.');
      return;
    }

    // Só envia campos que foram alterados em relação ao original
    const changedFields: Record<string, any> = {};

    // url_image sempre deve ser enviada
    changedFields.url_image = data.url_image;

    // CPF sempre precisa estar presente como referência
    changedFields.cpf = user?.cpf || '';

    // Nome
    if (data.fullName !== (user?.name || '')) {
      changedFields.name = data.fullName;
    }

    // Data de nascimento
    const birthdayISO = formatDateToISO(data.birthDate);
    if (birthdayISO !== (user?.birthday || '')) {
      changedFields.birthday = birthdayISO;
    }

    // E-mail
    if ((data.email || '') !== (user?.email || '')) {
      changedFields.email = data.email || undefined;
    }

    // Telefones
    const telephones: string[] = [];
    if (data.primaryPhone?.trim()) {
      telephones.push(data.primaryPhone.replace(/\D/g, ''));
    }
    if (data.secondaryPhone?.trim()) {
      telephones.push(data.secondaryPhone.replace(/\D/g, ''));
    }
    const originalPhones = JSON.stringify(user?.telephones || []);
    const currentPhones = JSON.stringify(telephones);
    if (currentPhones !== originalPhones) {
      changedFields.telephones = telephones;
    }

    // Senha: só envia se o usuário digitou uma senha diferente de vazio
    const password = data.password?.trim() && data.password !== '********' ? data.password.trim() : undefined;

    updateUser.mutate(
      { userData: changedFields, password },
      {
        onSuccess: () => toast.success('Dados salvos com sucesso!'),
        onError: () => toast.error('Erro ao salvar dados.'),
      },
    );
  });

  return { form, onSubmit, isPending: updateUser.isPending };
}
