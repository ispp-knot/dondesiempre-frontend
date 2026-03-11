import { ServerLoggedInGuard } from '@/components/guards/ServerLoggedInGuard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ServerLoggedInGuard>{children}</ServerLoggedInGuard>;
}
