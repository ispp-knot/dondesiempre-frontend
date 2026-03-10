import { GlassCenterCard } from '@/components/dondeSiempre/GlassCenterCard';
import { ServerLoggedOutGuard } from '@/components/guards/ServerLoggedOutGuard';
import { RegisterForm } from './registerForm';

export default function RegisterPage() {
  return (
    <ServerLoggedOutGuard>
      <GlassCenterCard logo>
        <RegisterForm />
      </GlassCenterCard>
    </ServerLoggedOutGuard>
  );
}
