import { z } from 'zod';

export const editProfileSchema = z.object({
  fullName: z.string().min(1, 'Campo obrigatório'),
  cpf: z.string(),
  birthDate: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  password: z.string().optional(),
  url_image: z.array(z.string()),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

export interface GuestProps {
  _id?: string;
  id?: string;
  cpf?: string;
  name?: string;
  birthday?: string;
  telephones?: string[];
  email?: string;
  photos?: string[];
  url_image?: string[];
  user_type?: string;
  registration_complete?: boolean;
}

export interface CreateGuestProps {
  cpf?: string;
  name?: string;
  parentId: string;
  birthday?: string;
  telephones?: string[];
  email?: string;
  photos?: string[];
  url_image?: string[];
  user_type: 'visitante' | 'dependente';
}

export interface SensorSyncStatus {
  sensorId: string;
  sensorName: string;
  registered: boolean;
  image_accepted?: boolean;
  image_rejected_reason?: string;
  last_sync_at: string;
}

export interface UserSyncStatus {
  user: { id: string; name: string; cpf: string };
  sync_status: {
    _id: string;
    accessUserId: string;
    entityId: string;
    system_registered: boolean;
    sensors: SensorSyncStatus[];
    synchronized: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  synchronized: boolean;
}

export interface GuestResponse {
  id: string;
  token?: string;
}

export type UserType = 'visitante' | 'dependente';
