import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAppAuth } from '@/hooks/use-app-auth';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { isAuthenticated } = useAppAuth.getState();

    throw redirect({
      to: isAuthenticated ? '/access-user' : '/app-auth',
    });
  },
  component: () => null,
});
