'use client';

import { GlassCenterCard } from '@/components/dondeSiempre/GlassCenterCard';
import { LoggedOutGuard } from '@/components/guards/LoggedOutGuard';
import { LoginForm } from './loginForm';

export default function LoginPage() {
  return (
    <LoggedOutGuard redirectTo="/profile">
      <GlassCenterCard logo>
        <LoginForm />
      </GlassCenterCard>
    </LoggedOutGuard>
  );
}
