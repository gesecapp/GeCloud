import { z } from 'zod';

export const appAuthSchema = z.object({
  cpf: z.string().min(14, 'CPF inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export type AppAuthFormData = z.infer<typeof appAuthSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface AppLoginResponse {
  data: { token: string; id: string };
  statusCode: number;
  message: string;
}

export interface ValidateTokenResponse {
  name: string;
  cpf: string;
}
