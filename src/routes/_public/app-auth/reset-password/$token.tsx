import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import DefaultLoading from '@/components/default-loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { applyCpfMask } from '@/lib/masks';
import { useResetPassword, useValidateRecoveryToken } from '../@hooks/use-app-login';
import { type ResetPasswordFormData, resetPasswordSchema } from '../@interface/app-auth.interface';

export const Route = createFileRoute('/_public/app-auth/reset-password/$token')({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: user, isLoading: isVerifying, isError: verifyError } = useValidateRecoveryToken(token);
  const resetPassword = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  function onSubmit(data: ResetPasswordFormData) {
    resetPassword.mutate(
      { token, password: data.password },
      {
        onSuccess: () => {
          toast.success('Senha redefinida com sucesso! Redirecionando...');
          setTimeout(() => {
            navigate({ to: '/app-auth' });
          }, 3000);
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.originalError?.message || err?.response?.data?.message || 'Erro ao redefinir a senha.';
          toast.error(msg);
        },
      },
    );
  }

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1E3A5F] p-2 md:p-4">
        <DefaultLoading />
      </div>
    );
  }

  if (verifyError || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1E3A5F] p-2 md:p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="flex flex-col items-center gap-6 py-8 md:p-8">
              <ItemTitle className="text-destructive text-xl">Link Inválido</ItemTitle>
              <ItemDescription className="text-center">Este link de recuperação expirou ou já foi utilizado. Por favor, solicite a recuperação de senha novamente.</ItemDescription>
              <Button className="h-12! w-full" onClick={() => navigate({ to: '/app-auth' })}>
                Voltar ao Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1E3A5F] p-2 md:p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="flex flex-col gap-6 py-8 md:p-8">
            <img src="/images/logo.svg" alt="Logo" className="h-16 w-auto" />

            <ItemGroup className="gap-6!">
              <ItemContent className="items-center">
                <ItemTitle className="text-2xl">Criar Nova Senha</ItemTitle>
                <ItemDescription>
                  Olá, <strong>{user.name}</strong>
                </ItemDescription>
                <ItemDescription>
                  CPF: <strong>{applyCpfMask(user.cpf)}</strong>
                </ItemDescription>
              </ItemContent>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input className="h-12!" placeholder="Digite a nova senha" type={showPassword ? 'text' : 'password'} {...field} />
                            <button className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)} type="button">
                              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input className="h-12!" placeholder="Confirme a nova senha" type={showConfirmPassword ? 'text' : 'password'} {...field} />
                            <button
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              type="button"
                            >
                              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button className="h-12! w-full" disabled={resetPassword.isPending || resetPassword.isSuccess} type="submit">
                    {resetPassword.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Redefinir Senha
                  </Button>

                  <Button
                    className="w-full"
                    variant="ghost"
                    disabled={resetPassword.isPending || resetPassword.isSuccess}
                    onClick={() => navigate({ to: '/app-auth' })}
                    type="button"
                  >
                    Voltar ao Login
                  </Button>
                </form>
              </Form>
            </ItemGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
