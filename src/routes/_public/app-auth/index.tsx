import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { AuthArea } from './@components/auth-area';
import { ForgotPasswordArea } from './@components/forgot-password-area';
import { GuestArea } from './@components/guest-area';

export const Route = createFileRoute('/_public/app-auth/')({
  component: AppAuthPage,
});

function AppAuthPage() {
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1E3A5F] p-2 md:p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="flex flex-col gap-6 py-8 md:p-8">
            <img src="/images/logo.svg" alt="Logo" className="h-16 w-auto" />
            {isForgotPasswordMode ? (
              <ForgotPasswordArea onClose={() => setIsForgotPasswordMode(false)} />
            ) : isGuestMode ? (
              <GuestArea onClose={() => setIsGuestMode(false)} />
            ) : (
              <AuthArea onGuestMode={() => setIsGuestMode(true)} onForgotPassword={() => setIsForgotPasswordMode(true)} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
