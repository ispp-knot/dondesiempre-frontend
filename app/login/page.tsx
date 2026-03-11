import { GlassCenterCard } from '@/components/dondeSiempre/GlassCenterCard';
import { ServerLoggedOutGuard } from '@/components/guards/ServerLoggedOutGuard';
import { LoginForm } from './loginForm';

export default function LoginPage() {
  return (
    <ServerLoggedOutGuard redirectTo="/profile">
      <GlassCenterCard logo>
        <LoginForm />
      </GlassCenterCard>
    </ServerLoggedOutGuard>
  );
}
