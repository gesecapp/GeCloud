import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { CircleAlert } from 'lucide-react';

import DefaultEmptyData from '@/components/default-empty-data';
import DefaultLoading from '@/components/default-loading';
import { ThemeSwitcher } from '@/components/sidebar/switch-theme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

export const Route = createRootRoute({
  notFoundComponent: () => {
    return (
      <Card className="m-2">
        <CardHeader title="Página Não Encontrada">
          <div className="flex gap-2">
            <ThemeSwitcher />
          </div>
        </CardHeader>
        <CardContent>
          <DefaultEmptyData />
        </CardContent>
      </Card>
    );
  },
  errorComponent: ({ error }) => {
    return (
      <Card className="m-2">
        <CardHeader title="Erro no Sistema">
          <div className="flex gap-2">
            <ThemeSwitcher />
          </div>
        </CardHeader>
        <CardContent>
          <Empty className="border-2 border-destructive/20 bg-destructive/10">
            <EmptyHeader>
              <CircleAlert className="size-8 animate-pulse text-destructive" />
              <EmptyTitle className="text-destructive">Erro na Página</EmptyTitle>
              <EmptyDescription className="max-w-md break-all rounded-md border bg-background/50 p-4 font-mono text-xs">
                {error instanceof Error ? error.message : String(error)}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  },
  pendingComponent: () => {
    return (
      <Card className="m-2">
        <CardHeader title="Carregando">
          <div className="flex gap-2">
            <ThemeSwitcher />
          </div>
        </CardHeader>
        <CardContent>
          <DefaultLoading />
        </CardContent>
      </Card>
    );
  },
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEV && (
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </>
  ),
});
