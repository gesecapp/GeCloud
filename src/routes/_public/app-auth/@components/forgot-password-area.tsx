import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { useForgotPassword } from '../@hooks/use-app-login';
import { type ForgotPasswordFormData, forgotPasswordSchema } from '../@interface/app-auth.interface';

interface ForgotPasswordAreaProps {
  onClose: () => void;
}

export function ForgotPasswordArea({ onClose }: ForgotPasswordAreaProps) {
  const [emailSent, setEmailSent] = useState(false);
  const forgotPassword = useForgotPassword();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(data: ForgotPasswordFormData) {
    forgotPassword.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          toast.success('E-mail de recuperação enviado com sucesso!');
          setEmailSent(true);
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.originalError?.message || err?.response?.data?.message || 'Erro ao enviar e-mail de recuperação.';
          toast.error(msg);
        },
      },
    );
  }

  return (
    <ItemGroup className="gap-6!">
      <ItemContent>
        <ItemTitle className="text-2xl">Recuperar Senha</ItemTitle>
        <ItemDescription>{emailSent ? 'Verifique sua caixa de entrada para redefinir a senha.' : 'Digite seu e-mail para receber as instruções'}</ItemDescription>
      </ItemContent>

      {!emailSent && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail *</FormLabel>
                  <FormControl>
                    <Input autoFocus className="h-12!" placeholder="seu@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="h-12! w-full" disabled={forgotPassword.isPending} type="submit">
              {forgotPassword.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Enviar E-mail
            </Button>
          </form>
        </Form>
      )}

      <button className="w-full" onClick={onClose} type="button">
        <ItemDescription className="text-muted-foreground underline underline-offset-4 hover:text-foreground">Voltar ao Login</ItemDescription>
      </button>
    </ItemGroup>
  );
}
