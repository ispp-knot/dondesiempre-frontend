import { ServerLoggedInGuard } from '@/components/guards/ServerLoggedInGuard';
import FollowPage from './followPage';

export default function Page() {
  return (
    <ServerLoggedInGuard>
      <FollowPage />;
    </ServerLoggedInGuard>
  );
}
