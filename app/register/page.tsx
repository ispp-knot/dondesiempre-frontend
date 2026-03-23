'use client';

import { GlassCenterCard } from '@/components/dondeSiempre/GlassCenterCard';
import { LoggedOutGuard } from '@/components/guards/LoggedOutGuard';
import { RegisterForm } from './registerForm';

export default function RegisterPage() {
  return (
    <LoggedOutGuard redirectTo="/profile">
      <GlassCenterCard logo>
        <RegisterForm />
      </GlassCenterCard>
    </LoggedOutGuard>
  );
}
