'use client';

import { useNavigate } from '@tanstack/react-router';
import { LogOutIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function EnterpriseSwitcher() {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    clearAuth();
    navigate({ to: '/app-auth' });
  };

  return (
    <Button size="icon" variant="ghost" aria-label={'logout'} onClick={onLogout}>
      <LogOutIcon className="size-4" />
      <span className="sr-only">{'logout'}</span>
    </Button>
  );
}
