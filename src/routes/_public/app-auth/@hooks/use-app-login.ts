import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { toast } from 'sonner';
import { useAppAuth } from '@/hooks/use-app-auth';
import { api } from '@/lib/api/client';
import type { AppLoginResponse, ValidateTokenResponse } from '../@interface/app-auth.interface';

export function useAppLogin() {
  const { setAuth } = useAppAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ cpf, password }: { cpf: string; password: string }) => {
      const response = await api.post<AppLoginResponse>('/app/login', {
        cpf: cpf.replace(/\D/g, ''),
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.data) {
        setAuth(data.data.token, data.data.id, '');
        toast.success('Login realizado com sucesso!');
        navigate({ to: '/access-user' });
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.originalError?.message || err?.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      toast.error(msg);
    },
  });
}

export function useGuestByCpf() {
  return useMutation({
    mutationFn: async (cpf: string) => {
      const response = await api.get<{ data: any; statusCode: number }>('/app/guests/search/cpf', {
        params: { cpf },
      });
      return response.data.data;
    },
  });
}

export function useUpdateGuestImage() {
  return useMutation({
    mutationFn: async ({ id, url_image }: { id: string; url_image: string[] }) => {
      const response = await api.put<{ data: any; statusCode: number }>(`/app/guests/${id}/image`, {
        url_image,
      });
      return response.data.data;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      await api.post('/app/auth/forgot-password', { email });
    },
  });
}

export function useValidateRecoveryToken(token: string) {
  return useQuery({
    queryKey: ['validateRecoveryToken', token],
    queryFn: async () => {
      const response = await api.get<{ data: ValidateTokenResponse; statusCode: number; message: string }>(`/app/auth/reset-password/${token}`);
      return response.data.data;
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      await api.post('/app/auth/reset-password', { token, password });
    },
  });
}
