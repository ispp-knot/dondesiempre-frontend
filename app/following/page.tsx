import FollowPage from './followPage';
import { ServerClientGuard } from '@/components/guards/ServerClientGuard';

export default function Page() {
  return (
    <ServerClientGuard>
      <FollowPage />;
    </ServerClientGuard>
  );
}
