import { z } from 'zod';

export const newUserFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório'),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  url_image: z.array(z.string()),
});

export type NewUserFormData = z.infer<typeof newUserFormSchema>;
