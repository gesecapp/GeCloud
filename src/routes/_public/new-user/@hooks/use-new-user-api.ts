import { useMutation, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import type { CreateGuestProps, GuestProps } from '@/routes/_private/access-user/@interface/access-user.interface';

interface GuestInviteData extends Partial<GuestProps> {
  id?: string;
  parentId?: string;
  expires_at?: string;
}

interface FinalizeGuestInviteParams {
  guestId: string;
  data: CreateGuestProps & { id?: string; expires_at?: string };
}

export function useGetGuestByInviteToken(token: string | null) {
  return useQuery({
    queryKey: ['app-guest-invite', token],
    queryFn: async () => {
      const response = await api.get<{ data: GuestInviteData; statusCode: number }>(`/app/guests/invite/${token}`);
      return response.data.data;
    },
    enabled: !!token && typeof token === 'string',
    retry: false,
  });
}

export function useFinalizeGuestInvite() {
  return useMutation({
    mutationFn: async ({ guestId, data }: FinalizeGuestInviteParams) => {
      await api.put(`/app/guests/${guestId}/invite`, data);
    },
  });
}
