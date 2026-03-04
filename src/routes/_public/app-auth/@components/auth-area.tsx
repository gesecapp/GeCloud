import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { ThemeSwitcher } from '@/components/sidebar/switch-theme';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemTitle } from '@/components/ui/item';
import { applyCpfMask } from '@/lib/masks';
import { useAppLogin } from '../@hooks/use-app-login';
import { type AppAuthFormData, appAuthSchema } from '../@interface/app-auth.interface';

interface AuthAreaProps {
  onGuestMode: () => void;
  onForgotPassword: () => void;
}

export function AuthArea({ onGuestMode, onForgotPassword }: AuthAreaProps) {
  const [showPassword, setShowPassword] = useState(false);
  const login = useAppLogin();

  const form = useForm<AppAuthFormData>({
    resolver: zodResolver(appAuthSchema),
    defaultValues: { cpf: '', password: '' },
  });

  function handleCpfChange(value: string) {
    form.setValue('cpf', applyCpfMask(value), { shouldValidate: true });
  }

  function onSubmit(data: AppAuthFormData) {
    login.mutate({ cpf: data.cpf, password: data.password });
  }

  return (
    <ItemGroup className="gap-6!">
      <ItemContent>
        <ItemHeader className="w-full">
          <ItemTitle className="text-2xl">Acesso do Usuário</ItemTitle>
          <ItemActions>
            <ThemeSwitcher />
          </ItemActions>
        </ItemHeader>
        <ItemDescription>Digite seu CPF e senha para acessar</ItemDescription>
      </ItemContent>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF *</FormLabel>
                <FormControl>
                  <Input autoFocus className="h-12!" maxLength={14} placeholder="000.000.000-00" {...field} onChange={(e) => handleCpfChange(e.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input className="h-12!" placeholder="Digite sua senha" type={showPassword ? 'text' : 'password'} {...field} />
                    <button className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)} type="button">
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="h-12! w-full" disabled={login.isPending} type="submit">
            {login.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Entrar
          </Button>
        </form>
      </Form>

      <button className="w-full" onClick={onGuestMode} type="button">
        <ItemDescription className="text-muted-foreground underline underline-offset-4 hover:text-foreground">Visitante? Clique aqui para atualizar sua imagem</ItemDescription>
      </button>
      <button className="w-full" onClick={onForgotPassword} type="button">
        <ItemDescription className="text-muted-foreground underline underline-offset-4 hover:text-foreground">Esqueceu a senha?</ItemDescription>
      </button>
    </ItemGroup>
  );
}
