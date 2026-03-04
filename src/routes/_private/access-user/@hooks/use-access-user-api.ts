import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppAuth } from '@/hooks/use-app-auth';
import { api } from '@/lib/api/client';
import type { CreateGuestProps, GuestProps, GuestResponse, UserSyncStatus, UserType } from '../@interface/access-user.interface';

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const accessUserKeys = {
  all: ['access-user'] as const,
  user: (userId: string) => [...accessUserKeys.all, 'user', userId] as const,
  syncStatus: (userId: string) => [...accessUserKeys.all, 'sync-status', userId] as const,
  allSyncStatuses: () => [...accessUserKeys.all, 'all-sync-statuses'] as const,
  guests: (userId: string, userType?: UserType) => [...accessUserKeys.all, 'guests', userId, userType] as const,
  guestDetail: (id: string) => [...accessUserKeys.all, 'guest-detail', id] as const,
};

export function useGetAppUser() {
  const { token, userId } = useAppAuth();

  return useQuery({
    queryKey: accessUserKeys.user(userId || ''),
    queryFn: async () => {
      const response = await api.get<{ data: GuestProps | { _props: GuestProps }; statusCode: number }>(`/app/user/${userId}`, { headers: authHeaders(token) });
      const rawData = response.data.data;
      const props = (rawData as any)._props || rawData;
      return props as GuestProps;
    },
    enabled: !!token && !!userId,
  });
}

export function useGetUserSyncStatus(userId: string | null | undefined) {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: accessUserKeys.syncStatus(userId || ''),
    queryFn: async () => {
      const response = await api.get<{ data: any; statusCode: number }>(`/access-user/${userId}/sync-status`, { headers: authHeaders(token) });
      return normalizeUserSyncStatus(userId as string, response.data.data);
    },
    enabled: !!token && !!userId,
    refetchInterval: 10000,
  });
}

export function useGetAllSyncStatuses() {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: accessUserKeys.allSyncStatuses(),
    queryFn: async () => {
      const response = await api.get<{ data: UserSyncStatus[]; statusCode: number }>('/access-user/sync-status', { headers: authHeaders(token) });
      return response.data.data || [];
    },
    enabled: !!token,
    refetchInterval: 10000,
  });
}

export function useGetGuestsByParent(userType?: UserType) {
  const { token, userId } = useAppAuth();

  return useQuery({
    queryKey: accessUserKeys.guests(userId || '', userType),
    queryFn: async () => {
      const response = await api.get<{ data: { data: GuestProps[] }; statusCode: number }>(`/app/guests/parent/${userId}`, {
        params: { user_type: userType },
        headers: authHeaders(token),
      });
      return response.data.data.data || [];
    },
    enabled: !!token && !!userId,
  });
}

export function useGetGuestById(id: string | null) {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: accessUserKeys.guestDetail(id || ''),
    queryFn: async () => {
      const response = await api.get<{ data: GuestProps; statusCode: number }>(`/app/guests/${id}`, { headers: authHeaders(token) });
      return response.data.data;
    },
    enabled: !!token && !!id,
  });
}

export function useAccessUserApi() {
  const { token, userId } = useAppAuth();
  const queryClient = useQueryClient();

  const updateUser = useMutation({
    mutationFn: async ({ userData, password }: { userData: Omit<GuestProps, '_id' | 'id'>; password?: string }) => {
      const dataToSave: any = { ...userData };
      if (password) dataToSave.password = password;
      await api.put(`/app/user/${userId}`, dataToSave, { headers: authHeaders(token) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessUserKeys.user(userId || '') });
    },
  });

  const createGuest = useMutation({
    mutationFn: async (guest: CreateGuestProps) => {
      const response = await api.post<{ data: GuestResponse; statusCode: number; message: string }>('/app/guests', guest, { headers: authHeaders(token) });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessUserKeys.guests(userId || '') });
    },
  });

  const updateGuest = useMutation({
    mutationFn: async ({ id, guestData }: { id: string; guestData: Omit<GuestProps, '_id' | 'id'> }) => {
      await api.put(`/app/guests/${id}`, guestData, { headers: authHeaders(token) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessUserKeys.guests(userId || '') });
    },
  });

  const deleteGuest = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/app/guests/${id}`, { headers: authHeaders(token) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessUserKeys.guests(userId || '') });
    },
  });

  return { updateUser, createGuest, updateGuest, deleteGuest };
}

function normalizeUserSyncStatus(userId: string, raw: any): UserSyncStatus {
  if ('message' in raw) {
    return {
      user: { id: userId, name: '', cpf: '' },
      sync_status: null,
      synchronized: false,
    };
  }

  const sensors = (raw.sensors || []).map((s: any) => {
    const imageStatus = s.image_status as { accepted?: boolean; reason?: string; rejected?: boolean } | undefined;
    return {
      sensorId: s.sensorId,
      sensorName: s.sensorName,
      registered: s.registered,
      image_accepted: s.image_accepted ?? imageStatus?.accepted,
      image_rejected_reason: s.image_rejected_reason ?? imageStatus?.reason ?? (imageStatus?.rejected ? 'Rejected' : undefined),
      last_sync_at: s.last_sync_at,
    };
  });

  const synchronized = raw.synchronized ?? (sensors.length > 0 && sensors.every((s: any) => s.registered));

  return {
    user: { id: userId, name: '', cpf: '' },
    sync_status: { ...raw, sensors, synchronized },
    synchronized,
  };
}
